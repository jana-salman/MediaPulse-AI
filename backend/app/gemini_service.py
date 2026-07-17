import os
from typing import Literal

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
gemini_model = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.1-flash-lite",
)

if not gemini_api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing from the .env file."
    )

client = genai.Client(api_key=gemini_api_key)


class CommentAIResult(BaseModel):
    sentiment: Literal[
        "positive",
        "neutral",
        "negative",
    ]

    category: Literal[
        "delivery",
        "product_quality",
        "customer_service",
        "pricing",
        "allergy",
        "general",
        "other",
    ]

    urgency: Literal[
        "low",
        "medium",
        "high",
    ]

    summary: str = Field(
        description="A short one-sentence summary."
    )

    suggested_reply: str = Field(
        description=(
            "A polite reply matching the business brand tone."
        )
    )


def analyze_comment_with_gemini(
    comment_text: str,
    business_name: str,
    industry: str,
    brand_tone: str,
    location: str,
) -> CommentAIResult:

    prompt = f"""
You are the customer-support assistant for MediaPulse AI.

Business:
- Name: {business_name}
- Industry: {industry}
- Brand tone: {brand_tone}
- Location: {location}

Customer comment:
"{comment_text}"

Analyze the comment.

Sentiment must be:
positive, neutral, or negative.

Category must be:
delivery, product_quality, customer_service,
pricing, allergy, general, or other.

Urgency must be:
low, medium, or high.

Write:
- A one-sentence summary.
- A helpful suggested reply of one to three sentences.

Match the business brand tone.
Do not invent refunds, discounts, policies,
guarantees, or compensation.
"""

    response = client.models.generate_content(
        model=gemini_model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema":
                CommentAIResult.model_json_schema(),
        },
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return CommentAIResult.model_validate_json(
        response.text
    )