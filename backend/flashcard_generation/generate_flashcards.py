import json
import os
import numpy as np
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from openai import OpenAI
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def generate_flashcard_prompt(chunk_text):
    """Generate a prompt that asks the LLM to create structured, high-quality flashcards from a text chunk"""
    prompt = f"""
Based on the following text, generate AT MOST ONE flashcard PER TYPE, and ONLY if the information is genuinely important.

Allowed flashcard types:
- definition
- principle (lesson, rule, or key takeaway)
- context (background, usage, or circumstance)
- tarkeeb (Arabic grammar or structure)
- arabic_term (key Arabic word or short phrase with important meaning)

General rules:
- Do NOT force all types — only generate what truly applies
- Focus on the most important concepts, not trivial details
- Questions must be clear, specific, and self-contained
- Answers should be concise but complete
- Do NOT rely on information from other chunks to answer
- If the text does not contain meaningful content for flashcards, respond with ONLY: SKIP

Arabic-specific rules:
- IGNORE Arabic text EXCEPT when generating:
  - tarkeeb flashcards
  - arabic_term flashcards
- Arabic Term flashcards must:
  - Use short Arabic terms or phrases (MAX 5 words)
  - Represent a key concept, not a full sentence or quotation
  - Include enough English context in the question
  - NOT require memorization of long Arabic passages

Output format (EXACT — use JSON per flashcard, one per line):

{{
  "type": "<definition | principle | context | tarkeeb | arabic_term>",
  "question": "<question text>",
  "answer": "<answer text>",
  "context": "<brief context or explanation of where/why this applies>",
  "arabic": "<arabic term if applicable, otherwise null>",
  "transliteration": "<transliteration if applicable, otherwise null>"
}}

Rules for fields:
- context: short explanation of relevance (1 sentence)
- arabic + transliteration: ONLY for arabic_term or tarkeeb, otherwise null
- Do NOT include extra text outside the JSON objects
- If no suitable flashcards can be created, respond with ONLY: SKIP

TEXT:
{chunk_text}
"""
    return prompt


def generate_flashcards_from_chunk(chunk_text):
    """Use OpenAI to generate flashcards from a text chunk"""
    client = OpenAI(api_key=OPENAI_API_KEY)


    prompt = generate_flashcard_prompt(chunk_text)


    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates educational flashcards."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        return "SKIP"


def parse_flashcards(llm_output):
    """Parse the LLM output into structured flashcard data"""
    flashcards = []


    if llm_output.strip() == "SKIP":
        return flashcards


    cleaned = llm_output.strip()

    # Remove fenced code blocks if present
    if cleaned.startswith("```") and cleaned.endswith("```"):
        cleaned = "\n".join(cleaned.splitlines()[1:-1]).strip()

    # If the model returned a JSON array, parse it directly
    if cleaned.startswith("[") and cleaned.endswith("]"):
        try:
            parsed = json.loads(cleaned)
            if isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, dict) and item.get("question") and item.get("answer"):
                        flashcards.append(item)
                return flashcards
        except json.JSONDecodeError:
            pass

    # Parse multiple JSON objects from a single string (pretty-printed, separated by blank lines)
    decoder = json.JSONDecoder()
    idx = 0
    length = len(cleaned)
    while idx < length:
        # Skip whitespace between objects
        while idx < length and cleaned[idx].isspace():
            idx += 1
        if idx >= length:
            break
        if cleaned[idx] == "{":
            try:
                item, next_idx = decoder.raw_decode(cleaned, idx)
                idx = next_idx
                if isinstance(item, dict) and item.get("question") and item.get("answer"):
                    flashcards.append(item)
                continue
            except json.JSONDecodeError:
                # Fall back to line parsing below
                break
        else:
            break

    # Backwards-compatible line parsing (Q/A format or JSON-per-line)
    lines = cleaned.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith("{") and line.endswith("}"):
            try:
                item = json.loads(line)
                if isinstance(item, dict) and item.get("question") and item.get("answer"):
                    flashcards.append(item)
                continue
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON line: {line} - {e}")
                continue
        if line.startswith('Q:') and '|' in line and 'A:' in line:
            try:
                parts = line.split('|', 1)
                question = parts[0].replace('Q:', '').strip()
                answer = parts[1].replace('A:', '').strip()
                if question and answer:
                    flashcards.append({'question': question, 'answer': answer})
            except Exception as e:
                print(f"Error parsing line: {line} - {e}")
                continue


    return flashcards


def sample_diverse_chunks(documents, embeddings, target_count=100):
    """Sample diverse chunks from the database to reduce redundancy"""
    if len(documents) <= target_count:
        return list(range(len(documents)))


    print(f"  Sampling {target_count} diverse chunks from {len(documents)} total chunks...")


    embeddings_array = np.array(embeddings)


    # Normalize embeddings
    norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
    normalized_embeddings = embeddings_array / norms


    # Start with a random chunk
    selected_indices = [np.random.randint(0, len(documents))]
    remaining_indices = set(range(len(documents))) - set(selected_indices)


    # Greedily select chunks that are most dissimilar to already selected ones
    while len(selected_indices) < target_count and remaining_indices:
        # Calculate max similarity of each remaining chunk to any selected chunk
        selected_embeddings = normalized_embeddings[selected_indices]
        remaining_list = list(remaining_indices)
        remaining_embeddings = normalized_embeddings[remaining_list]


        # Compute similarity matrix
        similarities = np.dot(remaining_embeddings, selected_embeddings.T)
        max_similarities = np.max(similarities, axis=1)


        # Select the chunk with lowest max similarity (most diverse)
        min_idx = np.argmin(max_similarities)
        selected_chunk_idx = remaining_list[min_idx]


        selected_indices.append(selected_chunk_idx)
        remaining_indices.remove(selected_chunk_idx)


    return sorted(selected_indices)


def deduplicate_flashcards(flashcards, embedding_function, similarity_threshold=0.80):
    """Remove duplicate or very similar flashcards using fast vectorized operations"""
    if not flashcards or len(flashcards) <= 1:
        return flashcards


    print("  Pre-computing embeddings for all questions...")


    # Pre-compute all embeddings at once
    questions = [card['question'].lower() for card in flashcards]
    embeddings = embedding_function.embed_documents(questions)
    embeddings_array = np.array(embeddings)


    # Normalize embeddings for cosine similarity
    norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
    normalized_embeddings = embeddings_array / norms


    print("  Computing similarity matrix...")


    # Compute all pairwise similarities at once (vectorized)
    similarity_matrix = np.dot(normalized_embeddings, normalized_embeddings.T)


    print("  Identifying duplicates...")


    # Track which flashcards to keep
    keep_indices = []
    skip_indices = set()


    for i in range(len(flashcards)):
        if i in skip_indices:
            continue


        # Find all flashcards similar to this one
        similar_indices = np.where(similarity_matrix[i] >= similarity_threshold)[0]
        similar_indices = [idx for idx in similar_indices if idx > i and idx not in skip_indices]


        if similar_indices:
            # Among all similar flashcards, keep the one with the longest answer
            all_similar = [i] + similar_indices
            best_idx = max(all_similar, key=lambda idx: len(flashcards[idx]['answer']))


            # Mark others as duplicates to skip
            for idx in all_similar:
                if idx != best_idx:
                    skip_indices.add(idx)


            # Keep the best one if not already added
            if best_idx not in keep_indices:
                keep_indices.append(best_idx)
        else:
            # No duplicates found, keep this one
            keep_indices.append(i)


    unique_flashcards = [flashcards[i] for i in sorted(keep_indices)]


    return unique_flashcards


def save_flashcards(flashcards, output_format='json'):
    """Save flashcards to file in specified format"""
    if output_format == 'json':
        with open('flashcards.json', 'w', encoding='utf-8') as f:
            json.dump(flashcards, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(flashcards)} flashcards to flashcards.json")


    elif output_format == 'csv':
        import csv
        with open('flashcards.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['type', 'question', 'answer', 'context', 'arabic', 'transliteration']
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(flashcards)
        print(f"Saved {len(flashcards)} flashcards to flashcards.csv")


    elif output_format == 'markdown':
        with open('flashcards.md', 'w', encoding='utf-8') as f:
            f.write("# Flashcards\n\n")
            for i, card in enumerate(flashcards, 1):
                f.write(f"## Card {i}\n\n")
                f.write(f"**Type:** {card.get('type', '')}\n\n")
                f.write(f"**Q:** {card.get('question', '')}\n\n")
                f.write(f"**A:** {card.get('answer', '')}\n\n")
                if card.get('context'):
                    f.write(f"**Context:** {card.get('context')}\n\n")
                if card.get('arabic'):
                    f.write(f"**Arabic:** {card.get('arabic')}\n\n")
                if card.get('transliteration'):
                    f.write(f"**Transliteration:** {card.get('transliteration')}\n\n")
                f.write("---\n\n")
        print(f"Saved {len(flashcards)} flashcards to flashcards.md")


def main():
    # Configuration
    TARGET_CHUNKS = 100  # Process only this many diverse chunks
    MAX_FLASHCARDS = 100  # Target maximum number of flashcards


    print("Loading vector database and retrieving all chunks...")


    # Initialize embedding function
    embedding_function = HuggingFaceEmbeddings(
        model_name='sentence-transformers/all-MiniLM-L6-v2',
        model_kwargs={'device': 'cpu'}
    )


    # Load the vector database
    vector_db = Chroma(
        persist_directory='./chroma_db_nccn',
        embedding_function=embedding_function
    )


    # Get all documents from the database
    all_docs = vector_db.get(include=['documents', 'embeddings'])


    print(f"Found {len(all_docs['documents'])} chunks in the database")


    # Sample diverse chunks to process
    print("\nSelecting diverse chunks to process...")

    # Check if embeddings are available, if not compute them
    if all_docs['embeddings'] is None or any(e is None for e in all_docs['embeddings']):
        print("  Computing embeddings for chunk selection...")
        computed_embeddings = embedding_function.embed_documents(all_docs['documents'])
        selected_indices = sample_diverse_chunks(
            all_docs['documents'],
            computed_embeddings,
            target_count=TARGET_CHUNKS
        )
    else:
        selected_indices = sample_diverse_chunks(
            all_docs['documents'],
            all_docs['embeddings'],
            target_count=TARGET_CHUNKS
        )


    print(f"Selected {len(selected_indices)} chunks for flashcard generation\n")


    all_flashcards = []


    # Process only the selected chunks
    for idx, chunk_idx in enumerate(selected_indices, 1):
        doc_text = all_docs['documents'][chunk_idx]
        print(f"Processing chunk {idx}/{len(selected_indices)}...")


        # Generate flashcards for this chunk
        llm_output = generate_flashcards_from_chunk(doc_text)


        # Parse the output
        chunk_flashcards = parse_flashcards(llm_output)


        if chunk_flashcards:
            print(f"  Generated {len(chunk_flashcards)} flashcards")
            all_flashcards.extend(chunk_flashcards)
        else:
            print(f"  Skipped (no suitable content)")


    print(f"\nTotal flashcards generated: {len(all_flashcards)}")


    # Deduplicate flashcards (with more aggressive threshold)
    print("\nRemoving duplicate flashcards...")
    unique_flashcards = deduplicate_flashcards(all_flashcards, embedding_function)
    print(f"Flashcards after deduplication: {len(unique_flashcards)}")


    # If still too many, keep the best ones based on answer length (proxy for quality)
    if len(unique_flashcards) > MAX_FLASHCARDS:
        print(f"\nLimiting to top {MAX_FLASHCARDS} flashcards (by answer quality)...")
        # Sort by answer length and keep the most detailed ones
        unique_flashcards = sorted(
            unique_flashcards,
            key=lambda x: len(x['answer']),
            reverse=True
        )[:MAX_FLASHCARDS]
        print(f"Final flashcard count: {len(unique_flashcards)}")


    # Save in multiple formats
    print("\nSaving flashcards...")
    save_flashcards(unique_flashcards, 'json')
    save_flashcards(unique_flashcards, 'csv')
    save_flashcards(unique_flashcards, 'markdown')


    print("\nDone! Your flashcards are ready.")
    print("Files created:")
    print("  - flashcards.json (for programming)")
    print("  - flashcards.csv (for spreadsheets)")
    print("  - flashcards.md (for reading)")


if __name__ == "__main__":
    main()
