import re
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
def generate_grounded_reply(
    comment_text: str,
    business_name: str,
    brand_tone: str,
    policy_context: str,
) -> str:
    prompt = f"""
You are the customer-support assistant for MediaPulse AI.

Business name: {business_name}
Brand tone: {brand_tone}

Customer comment:
"{comment_text}"

Relevant business policies:
{policy_context}

Write a helpful reply to the customer.

Rules:
- Use only the supplied business policies.
- Match the business brand tone.
- Keep the reply between one and three sentences.
- Do not invent refunds, discounts, guarantees, or policies.
- If the policy does not fully answer the issue, ask the customer
  to contact the business for further assistance.
"""

    response = client.models.generate_content(
        model=gemini_model,
        contents=prompt,
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty grounded reply."
        )

    return response.text.strip()
def generate_business_insight(
    business_name: str,
    comments: list[dict],
) -> str:
    comment_details = "\n".join(
        [
            (
                f"- Comment: {comment.get('text', '')}\n"
                f"  Sentiment: {comment.get('sentiment', 'unknown')}\n"
                f"  Category: {comment.get('category', 'unknown')}\n"
                f"  Urgency: {comment.get('urgency', 'unknown')}\n"
                f"  Summary: {comment.get('summary', '')}"
            )
            for comment in comments
        ]
    )

    prompt = f"""
You are an AI business analyst for MediaPulse AI.

Business name: {business_name}

Recent customer comments:
{comment_details}

Create a concise dashboard insight summary.

Include:
- The overall customer mood.
- The most common complaint or praise.
- Any urgent issue requiring attention.
- Three practical recommendations for the business.

Rules:
- Use only the provided comment information.
- Do not invent statistics or facts.
- Keep the summary under 180 words.
- Make it easy for a small-business owner to understand.
- Return plain text only.
- Do not use Markdown formatting.
- Do not use #, *, **, bullet symbols, or Markdown-numbered lists.
- Use simple section headings followed by normal sentences.
"""

    response = client.models.generate_content(
        model=gemini_model,
        contents=prompt,
    )

    
    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty insight summary."
        )

    insight_text = response.text.strip()

    # Remove Markdown headings such as ### Title
    insight_text = re.sub(
        r"^#{1,6}\s*",
        "",
        insight_text,
        flags=re.MULTILINE,
    )

    # Remove bold and italic Markdown symbols
    insight_text = insight_text.replace("**", "")
    insight_text = insight_text.replace("__", "")

    # Remove bullet symbols at the beginning of lines
    insight_text = re.sub(
        r"^\s*[-*•]\s+",
        "",
        insight_text,
        flags=re.MULTILINE,
    )

    return insight_text