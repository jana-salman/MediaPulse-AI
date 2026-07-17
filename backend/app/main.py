from uuid import UUID

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from app.database import supabase
from app.gemini_service import analyze_comment_with_gemini


app = FastAPI(
    title="MediaPulse AI API",
    description="AI-powered social media intelligence backend",
    version="1.0.0",
)


class BusinessCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    industry: str = Field(min_length=2, max_length=100)
    brand_tone: str = Field(min_length=2, max_length=100)
    location: str = Field(min_length=2, max_length=100)


class CommentAnalyzeRequest(BaseModel):
    business_id: UUID
    text: str = Field(min_length=2, max_length=3000)


@app.get("/")
def root():
    return {
        "message": "MediaPulse AI backend is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/health/database")
def database_health_check():
    try:
        response = (
            supabase.table("businesses")
            .select("id")
            .limit(1)
            .execute()
        )

        return {
            "status": "connected",
            "database": "Supabase",
            "rows_found": len(response.data),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(error)}",
        )


@app.post("/businesses", status_code=status.HTTP_201_CREATED)
def create_business(business: BusinessCreate):
    try:
        response = (
            supabase.table("businesses")
            .insert(business.model_dump())
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="The business could not be created.",
            )

        return {
            "message": "Business created successfully",
            "business": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create business: {str(error)}",
        )


@app.post(
    "/comments/analyze",
    status_code=status.HTTP_201_CREATED,
)
def analyze_comment(request: CommentAnalyzeRequest):
    try:
        business_id = str(request.business_id)

        business_response = (
            supabase.table("businesses")
            .select("*")
            .eq("id", business_id)
            .limit(1)
            .execute()
        )

        if not business_response.data:
            raise HTTPException(
                status_code=404,
                detail="Business not found.",
            )

        business = business_response.data[0]

        ai_result = analyze_comment_with_gemini(
            comment_text=request.text,
            business_name=business["name"],
            industry=business["industry"],
            brand_tone=business["brand_tone"],
            location=business["location"],
        )

        comment_data = {
            "business_id": business_id,
            "text": request.text,
            **ai_result.model_dump(),
        }

        comment_response = (
            supabase.table("comments")
            .insert(comment_data)
            .execute()
        )

        if not comment_response.data:
            raise HTTPException(
                status_code=500,
                detail="The analyzed comment could not be saved.",
            )

        return {
            "message": "Comment analyzed successfully",
            "comment": comment_response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Comment analysis failed: {str(error)}",
        )