import {
  Business,
  Comment,
  CommentStatus,
  Insight,
  PolicyDocument,
  ReplySource,
} from "../types";



const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

if (!API_URL) {
  console.warn(
    "Missing EXPO_PUBLIC_API_URL. Copy .env.example to .env and point it at the FastAPI backend."
  );
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message =
      (body && (body.detail || body.message)) || `Request failed (${res.status})`;
    throw new ApiError(String(message), res.status);
  }

  return body as T;
}

// ---- Businesses ----

export function createBusiness(input: {
  name: string;
  industry: string;
  brand_tone: string;
  location: string;
}) {
  return request<{ message: string; business: Business }>("/businesses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getBusiness(businessId: string) {
  return request<{ business: Business }>(`/businesses/${businessId}`);
}

// ---- Comments ----

export function analyzeComment(input: { business_id: string; text: string }) {
  return request<{ message: string; comment: Comment }>("/comments/analyze", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getComments(businessId: string) {
  return request<{ count: number; comments: Comment[] }>(
    `/businesses/${businessId}/comments`
  );
}

export function getComment(commentId: string) {
  return request<{ comment: Comment }>(`/comments/${commentId}`);
}

export function generateReply(commentId: string) {
  return request<{
    message: string;
    reply: string;
    sources: ReplySource[];
    comment: Partial<Comment>;
  }>(`/comments/${commentId}/reply`, { method: "POST" });
}

export function updateCommentStatus(
  commentId: string,
  status: CommentStatus
) {
  return request<{
    message: string;
    comment: Comment;
  }>(`/comments/${commentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---- Business knowledge (documents) ----

export function createDocument(input: {
  business_id: string;
  title: string;
  content: string;
}) {
  return request<{
    message: string;
    chunks_created: number;
    documents: PolicyDocument[];
  }>("/documents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getDocuments(businessId: string) {
  return request<{ count: number; documents: PolicyDocument[] }>(
    `/businesses/${businessId}/documents`
  );
}

// ---- Insights ----

export function generateInsight(businessId: string) {
  return request<{
    message: string;
    comments_analyzed: number;
    insight: Insight;
  }>("/insights/generate", {
    method: "POST",
    body: JSON.stringify({ business_id: businessId }),
  });
}

export function getInsights(businessId: string) {
  return request<{ count: number; insights: Insight[] }>(
    `/businesses/${businessId}/insights`
  );
}

export { ApiError };
