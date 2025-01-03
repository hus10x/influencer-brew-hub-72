export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "completed";
  business_id: string;
}