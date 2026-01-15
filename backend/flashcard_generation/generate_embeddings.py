# Vector database that sotres embeddings
from langchain_chroma import Chroma

# Wrapper for HuggingFace transformer models to convert text into numerical vector representations
from langchain_huggingface import HuggingFaceEmbeddings

# Splits docs into smaller chunks while perserving context
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Loads and extract
from langchain_community.document_loaders import PyPDFLoader

import re

# multiple pdfs can be stored in this list
loaders = [PyPDFLoader('./fortyHadiths.pdf')]
print(len(loaders))

docs = []
for file in loaders:
    docs.extend(file.load())

print(len(docs))

def contains_arabic(text):
    """Check if text contains Arabic characters"""
    arabic_pattern = re.compile(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]')
    return bool(arabic_pattern.search(text))

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

docs = text_splitter.split_documents(docs)

# Filter out documents containing Arabic text
print(f"Total documents before filtering: {len(docs)}")
filtered_docs = [doc for doc in docs if not contains_arabic(doc.page_content)]
print(f"Documents after removing Arabic text: {len(filtered_docs)}")
print(f"Filtered out {len(docs) - len(filtered_docs)} documents with Arabic content")

# model_kwargs ensures that this system runs on all sys, regardless of gpu presence
embedding_function = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2', model_kwargs={'device': 'cpu'})

vectorstore = Chroma.from_documents(filtered_docs, embedding_function, persist_directory='./chroma_db_nccn')

# how many embeddings in our chroma db
print(vectorstore._collection.count())

