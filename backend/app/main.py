from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from app.database import supabase


app = FastAPI(
    title="MediaPulse AI API",
    version="1.0.0",
)


class BusinessCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    industry: str = Field(min_length=2, max_length=100)
    brand_tone: str = Field(min_length=2, max_length=100)
    location: str = Field(min_length=2, max_length=100)


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
        business_data = business.model_dump()

        response = (
            supabase.table("businesses")
            .insert(business_data)
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