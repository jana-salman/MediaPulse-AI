from uuid import UUID

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from app.database import supabase
from app.gemini_service import (
    analyze_comment_with_gemini,
    generate_business_insight,
    generate_grounded_reply,
)
from app.embedding_service import (
    create_document_embedding,
    create_query_embedding,
    split_into_chunks,
)
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

class DocumentCreateRequest(BaseModel):
    business_id: UUID
    title: str = Field(min_length=2, max_length=150)
    content: str = Field(min_length=20, max_length=50000)

class InsightGenerateRequest(BaseModel):
    business_id: UUID

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
@app.post(
    "/documents",
    status_code=status.HTTP_201_CREATED,
)
def create_document(request: DocumentCreateRequest):
    try:
        business_id = str(request.business_id)

        business_response = (
            supabase.table("businesses")
            .select("id")
            .eq("id", business_id)
            .limit(1)
            .execute()
        )

        if not business_response.data:
            raise HTTPException(
                status_code=404,
                detail="Business not found.",
            )

        chunks = split_into_chunks(request.content)

        document_rows = []

        for index, chunk in enumerate(chunks, start=1):
            embedding = create_document_embedding(
                text=chunk,
                title=request.title,
            )

            document_rows.append(
                {
                    "business_id": business_id,
                    "title": request.title,
                    "content": chunk,
                    "embedding": embedding,
                }
            )

        response = (
            supabase.table("documents")
            .insert(document_rows)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Document could not be saved.",
            )

        saved_chunks = [
            {
                "id": document["id"],
                "title": document["title"],
                "content": document["content"],
            }
            for document in response.data
        ]

        return {
            "message": "Document processed successfully",
            "chunks_created": len(saved_chunks),
            "documents": saved_chunks,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(error)}",
        )
@app.post("/comments/{comment_id}/reply")
def create_grounded_comment_reply(comment_id: UUID):
    try:
        comment_response = (
            supabase.table("comments")
            .select("*")
            .eq("id", str(comment_id))
            .limit(1)
            .execute()
        )

        if not comment_response.data:
            raise HTTPException(
                status_code=404,
                detail="Comment not found.",
            )

        comment = comment_response.data[0]

        business_response = (
            supabase.table("businesses")
            .select("*")
            .eq("id", comment["business_id"])
            .limit(1)
            .execute()
        )

        if not business_response.data:
            raise HTTPException(
                status_code=404,
                detail="Business not found.",
            )

        business = business_response.data[0]

        query_embedding = create_query_embedding(
            comment["text"]
        )

        matches_response = supabase.rpc(
            "match_documents",
            {
                "p_business_id": comment["business_id"],
                "query_embedding": query_embedding,
                "match_threshold": 0.30,
                "match_count": 3,
            },
        ).execute()

        matched_documents = matches_response.data or []

        if not matched_documents:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No relevant policy document was found "
                    "for this comment."
                ),
            )

        policy_context = "\n\n".join(
            (
                f"Policy title: {document['title']}\n"
                f"Policy content: {document['content']}"
            )
            for document in matched_documents
        )

        grounded_reply = generate_grounded_reply(
            comment_text=comment["text"],
            business_name=business["name"],
            brand_tone=business["brand_tone"],
            policy_context=policy_context,
        )

        source_titles = list(
            dict.fromkeys(
                document["title"]
                for document in matched_documents
            )
        )

        update_response = (
            supabase.table("comments")
            .update(
                {
                    "suggested_reply": grounded_reply,
                    "reply_source": ", ".join(source_titles),
                }
            )
            .eq("id", str(comment_id))
            .execute()
        )

        if not update_response.data:
            raise HTTPException(
                status_code=500,
                detail="The grounded reply could not be saved.",
            )

        return {
            "message": "Grounded reply generated successfully",
            "reply": grounded_reply,
            "sources": matched_documents,
            "comment": update_response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Grounded reply generation failed: {str(error)}",
        )
@app.post(
    "/insights/generate",
    status_code=status.HTTP_201_CREATED,
)
def generate_insights(request: InsightGenerateRequest):
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

        comments_response = (
            supabase.table("comments")
            .select(
                "text,sentiment,category,urgency,summary"
            )
            .eq("business_id", business_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )

        comments = comments_response.data or []

        if not comments:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No comments are available to generate insights."
                ),
            )

        insight_summary = generate_business_insight(
            business_name=business["name"],
            comments=comments,
        )

        insight_response = (
            supabase.table("insights")
            .insert(
                {
                    "business_id": business_id,
                    "summary": insight_summary,
                }
            )
            .execute()
        )

        if not insight_response.data:
            raise HTTPException(
                status_code=500,
                detail="The insight could not be saved.",
            )

        return {
            "message": "Insight generated successfully",
            "comments_analyzed": len(comments),
            "insight": insight_response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Insight generation failed: {str(error)}",
        )
@app.get("/businesses/{business_id}")
def get_business(business_id: UUID):
    try:
        response = (
            supabase.table("businesses")
            .select("*")
            .eq("id", str(business_id))
            .limit(1)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Business not found.",
            )

        return {"business": response.data[0]}

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve business: {str(error)}",
        )


@app.get("/businesses/{business_id}/comments")
def get_business_comments(business_id: UUID):
    try:
        response = (
            supabase.table("comments")
            .select("*")
            .eq("business_id", str(business_id))
            .order("created_at", desc=True)
            .limit(100)
            .execute()
        )

        comments = response.data or []

        return {
            "count": len(comments),
            "comments": comments,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve comments: {str(error)}",
        )


@app.get("/comments/{comment_id}")
def get_comment(comment_id: UUID):
    try:
        response = (
            supabase.table("comments")
            .select("*")
            .eq("id", str(comment_id))
            .limit(1)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Comment not found.",
            )

        return {"comment": response.data[0]}

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve comment: {str(error)}",
        )


@app.get("/businesses/{business_id}/documents")
def get_business_documents(business_id: UUID):
    try:
        response = (
            supabase.table("documents")
            .select("id,business_id,title,content,created_at")
            .eq("business_id", str(business_id))
            .order("created_at", desc=True)
            .execute()
        )

        documents = response.data or []

        return {
            "count": len(documents),
            "documents": documents,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve documents: {str(error)}",
        )


@app.get("/businesses/{business_id}/insights")
def get_business_insights(business_id: UUID):
    try:
        response = (
            supabase.table("insights")
            .select("*")
            .eq("business_id", str(business_id))
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )

        insights = response.data or []

        return {
            "count": len(insights),
            "insights": insights,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve insights: {str(error)}",
        )