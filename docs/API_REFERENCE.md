# MediaPulse AI — API Reference

This document explains how the mobile application communicates with the MediaPulse AI FastAPI backend.

## Running the backend

Open a terminal in the `backend` folder:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

Local API address:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

> Important: `127.0.0.1` works only on the computer running the backend.  
> When testing from a physical phone, use the computer's local network IP instead.

---

# Health Endpoints

## GET `/`

Checks whether the backend is running.

### Response

```json
{
  "message": "MediaPulse AI backend is running",
  "status": "success"
}
```

---

## GET `/health`

### Response

```json
{
  "status": "healthy"
}
```

---

## GET `/health/database`

Checks the connection between FastAPI and Supabase.

### Response

```json
{
  "status": "connected",
  "database": "Supabase",
  "rows_found": 1
}
```

---

# Business Endpoints

## POST `/businesses`

Creates a new business profile.

### Request body

```json
{
  "name": "Sweet Corner Bakery",
  "industry": "Bakery",
  "brand_tone": "Friendly and warm",
  "location": "Beirut, Lebanon"
}
```

### Successful response — `201`

```json
{
  "message": "Business created successfully",
  "business": {
    "id": "BUSINESS_UUID",
    "name": "Sweet Corner Bakery",
    "industry": "Bakery",
    "brand_tone": "Friendly and warm",
    "location": "Beirut, Lebanon",
    "created_at": "2026-07-17T12:00:00+00:00"
  }
}
```

---

## GET `/businesses/{business_id}`

Returns one business profile.

### Path parameter

```text
business_id = Business UUID
```

### Successful response — `200`

```json
{
  "business": {
    "id": "BUSINESS_UUID",
    "name": "Sweet Corner Bakery",
    "industry": "Bakery",
    "brand_tone": "Friendly and warm",
    "location": "Beirut, Lebanon",
    "created_at": "2026-07-17T12:00:00+00:00"
  }
}
```

---

# Comment Endpoints

## POST `/comments/analyze`

Uses Gemini AI to analyze a customer comment and saves the result in Supabase.

### Request body

```json
{
  "business_id": "BUSINESS_UUID",
  "text": "My cake arrived two hours late and the box was damaged."
}
```

### Successful response — `201`

```json
{
  "message": "Comment analyzed successfully",
  "comment": {
    "id": "COMMENT_UUID",
    "business_id": "BUSINESS_UUID",
    "text": "My cake arrived two hours late and the box was damaged.",
    "sentiment": "negative",
    "category": "delivery",
    "urgency": "high",
    "summary": "The customer reports a delayed delivery and damaged packaging.",
    "suggested_reply": "We are sorry to hear about the delay and the condition of your order.",
    "reply_source": null,
    "status": "unanswered",
    "created_at": "2026-07-17T12:00:00+00:00"
  }
}
```

### Possible sentiment values

```text
positive
neutral
negative
```

### Possible urgency values

```text
low
medium
high
```

### Possible category values

```text
delivery
product_quality
customer_service
pricing
allergy
general
other
```

---

## GET `/businesses/{business_id}/comments`

Returns the latest comments for a business.

### Successful response — `200`

```json
{
  "count": 1,
  "comments": [
    {
      "id": "COMMENT_UUID",
      "business_id": "BUSINESS_UUID",
      "text": "My cake arrived two hours late.",
      "sentiment": "negative",
      "category": "delivery",
      "urgency": "medium",
      "summary": "The customer reports a late delivery.",
      "suggested_reply": "We are sorry about the delay.",
      "reply_source": "Delivery Policy",
      "status": "unanswered",
      "created_at": "2026-07-17T12:00:00+00:00"
    }
  ]
}
```

---

## GET `/comments/{comment_id}`

Returns the complete details for one comment.

### Successful response — `200`

```json
{
  "comment": {
    "id": "COMMENT_UUID",
    "business_id": "BUSINESS_UUID",
    "text": "My cake arrived two hours late.",
    "sentiment": "negative",
    "category": "delivery",
    "urgency": "medium",
    "summary": "The customer reports a late delivery.",
    "suggested_reply": "We are sorry about the delay.",
    "reply_source": "Delivery Policy",
    "status": "unanswered",
    "created_at": "2026-07-17T12:00:00+00:00"
  }
}
```

---

## POST `/comments/{comment_id}/reply`

Generates a RAG-grounded reply using the business policy documents.

### Path parameter

```text
comment_id = Comment UUID
```

No request body is required.

### Successful response — `200`

```json
{
  "message": "Grounded reply generated successfully",
  "reply": "Hello! We are sorry about the delay. Please contact the bakery with your order number so we can review the delivery.",
  "sources": [
    {
      "id": "DOCUMENT_UUID",
      "title": "Delivery Policy",
      "content": "Orders are delivered within 60 minutes.",
      "similarity": 0.89
    }
  ],
  "comment": {
    "id": "COMMENT_UUID",
    "business_id": "BUSINESS_UUID",
    "text": "My cake arrived two hours late.",
    "suggested_reply": "Hello! We are sorry about the delay.",
    "reply_source": "Delivery Policy"
  }
}
```

---

# Business Knowledge Endpoints

## POST `/documents`

Uploads policy content, divides it into chunks, generates embeddings, and saves it in Supabase.

### Request body

```json
{
  "business_id": "BUSINESS_UUID",
  "title": "Delivery Policy",
  "content": "Orders are delivered within 60 minutes. If an order is delayed, customers should contact the bakery with their order number."
}
```

### Successful response — `201`

```json
{
  "message": "Document processed successfully",
  "chunks_created": 1,
  "documents": [
    {
      "id": "DOCUMENT_UUID",
      "title": "Delivery Policy",
      "content": "Orders are delivered within 60 minutes."
    }
  ]
}
```

---

## GET `/businesses/{business_id}/documents`

Returns the business policy documents.

The embedding values are intentionally excluded from the response because the mobile app does not need them.

### Successful response — `200`

```json
{
  "count": 1,
  "documents": [
    {
      "id": "DOCUMENT_UUID",
      "business_id": "BUSINESS_UUID",
      "title": "Delivery Policy",
      "content": "Orders are delivered within 60 minutes.",
      "created_at": "2026-07-17T12:00:00+00:00"
    }
  ]
}
```

---

# Insight Endpoints

## POST `/insights/generate`

Analyzes the business’s recent comments and generates an AI dashboard summary.

### Request body

```json
{
  "business_id": "BUSINESS_UUID"
}
```

### Successful response — `201`

```json
{
  "message": "Insight generated successfully",
  "comments_analyzed": 5,
  "insight": {
    "id": "INSIGHT_UUID",
    "business_id": "BUSINESS_UUID",
    "summary": "Customer feedback is mixed. Delivery delays are the most frequent issue. The business should review delivery procedures and respond quickly to urgent complaints.",
    "created_at": "2026-07-17T12:00:00+00:00"
  }
}
```

---

## GET `/businesses/{business_id}/insights`

Returns previously generated insights, with the newest first.

### Successful response — `200`

```json
{
  "count": 1,
  "insights": [
    {
      "id": "INSIGHT_UUID",
      "business_id": "BUSINESS_UUID",
      "summary": "Customer feedback is mixed, with delivery being the main concern.",
      "created_at": "2026-07-17T12:00:00+00:00"
    }
  ]
}
```

---

# Common Errors

## `404 Business not found`

The supplied `business_id` does not exist in the `businesses` table.

## `404 Comment not found`

The supplied `comment_id` does not exist in the `comments` table.

## `404 No relevant policy document was found`

No uploaded document was sufficiently related to the customer comment.

## `422 Validation Error`

The request is missing a required field, contains text that is too short, or uses an invalid UUID.

## `500 Internal Server Error`

An external service such as Gemini or Supabase failed, or the backend encountered an unexpected error.

---

# Recommended Mobile App Flow

```text
Create or select business
        ↓
Upload business policies
        ↓
Submit customer comment
        ↓
Display AI classification
        ↓
Generate grounded reply
        ↓
Load comments into dashboard
        ↓
Generate and display insights
```