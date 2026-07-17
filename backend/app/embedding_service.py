import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing from the .env file."
    )

client = genai.Client(api_key=gemini_api_key)


def split_into_chunks(
    text: str,
    max_words: int = 160,
    overlap_words: int = 30,
) -> list[str]:
    words = text.split()

    if not words:
        raise ValueError("Document content cannot be empty.")

    chunks: list[str] = []
    start = 0

    while start < len(words):
        end = min(start + max_words, len(words))
        chunks.append(" ".join(words[start:end]))

        if end == len(words):
            break

        start = end - overlap_words

    return chunks


def create_document_embedding(
    text: str,
    title: str,
) -> list[float]:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            title=title,
            output_dimensionality=768,
        ),
    )

    if not result.embeddings:
        raise RuntimeError(
            "Gemini did not return an embedding."
        )

    return [
        float(value)
        for value in result.embeddings[0].values
    ]
def create_query_embedding(text: str) -> list[float]:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=768,
        ),
    )

    if not result.embeddings:
        raise RuntimeError(
            "Gemini did not return a query embedding."
        )

    return [
        float(value)
        for value in result.embeddings[0].values
    ]