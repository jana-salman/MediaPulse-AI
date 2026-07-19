export type Sentiment = "positive" | "neutral" | "negative";

export type Urgency = "low" | "medium" | "high";
export type CommentStatus =
  | "unanswered"
  | "reply_ready"
  | "sent"
  | "resolved";
export type Category =
  | "delivery"
  | "product_quality"
  | "customer_service"
  | "pricing"
  | "allergy"
  | "general"
  | "other";

export interface Business {
  id: string;
  name: string;
  industry: string;
  brand_tone: string;
  location: string;
  created_at: string;
}

export interface Comment {
  id: string;
  business_id: string;
  text: string;
  sentiment: Sentiment;
  category: Category;
  urgency: Urgency;
  summary: string;
  suggested_reply: string;
  reply_source: string | null;
  status: CommentStatus;
  created_at: string;
}

export interface PolicyDocument {
  id: string;
  business_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Insight {
  id: string;
  business_id: string;
  summary: string;
  created_at: string;
}

export interface ReplySource {
  id: string;
  title: string;
  content: string;
  similarity: number;
}
