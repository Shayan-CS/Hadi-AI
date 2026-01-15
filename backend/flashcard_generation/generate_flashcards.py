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
    """Generate a prompt that asks the LLM to create flashcards from a text chunk"""
    prompt = f"""
Based on the following text, generate 1-2 high-quality flashcards.
Each flashcard should test key concepts, definitions, or important facts.

Guidelines:
- IGNORE any Arabic text in the content - do not create flashcards from Arabic text
- Only create flashcards from English text
- Questions should be clear and specific
- Answers should be concise but complete
- Focus on the most important information
- Don't create flashcards for trivial details
- If the text doesn't contain meaningful English information for flashcards, return "SKIP"

TEXT:
{chunk_text}

Format your response EXACTLY like this (one flashcard per line):
Q: [question] | A: [answer]
Q: [question] | A: [answer]

If the text isn't suitable for flashcards, respond with only: SKIP
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

    if "SKIP" in llm_output.strip():
        return flashcards

    lines = llm_output.strip().split('\n')

    for line in lines:
        line = line.strip()
        if line.startswith('Q:') and '|' in line and 'A:' in line:
            try:
                # Split on | to separate question and answer
                parts = line.split('|')
                question = parts[0].replace('Q:', '').strip()
                answer = parts[1].replace('A:', '').strip()

                if question and answer:
                    flashcards.append({
                        'question': question,
                        'answer': answer
                    })
            except Exception as e:
                print(f"Error parsing line: {line} - {e}")
                continue

    return flashcards

def deduplicate_flashcards(flashcards, embedding_function, similarity_threshold=0.85):
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
            writer = csv.DictWriter(f, fieldnames=['question', 'answer'])
            writer.writeheader()
            writer.writerows(flashcards)
        print(f"Saved {len(flashcards)} flashcards to flashcards.csv")

    elif output_format == 'markdown':
        with open('flashcards.md', 'w', encoding='utf-8') as f:
            f.write("# Flashcards\n\n")
            for i, card in enumerate(flashcards, 1):
                f.write(f"## Card {i}\n\n")
                f.write(f"**Q:** {card['question']}\n\n")
                f.write(f"**A:** {card['answer']}\n\n")
                f.write("---\n\n")
        print(f"Saved {len(flashcards)} flashcards to flashcards.md")

def main():
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
    # We'll retrieve more than we need and process all of them
    all_docs = vector_db.get()

    print(f"Found {len(all_docs['documents'])} chunks in the database")
    print("Generating flashcards from each chunk...\n")

    all_flashcards = []

    # Process each chunk
    for i, doc_text in enumerate(all_docs['documents'], 1):
        print(f"Processing chunk {i}/{len(all_docs['documents'])}...")

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

    # Deduplicate flashcards
    print("\nRemoving duplicate flashcards...")
    unique_flashcards = deduplicate_flashcards(all_flashcards, embedding_function)
    print(f"Flashcards after deduplication: {len(unique_flashcards)}")

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
