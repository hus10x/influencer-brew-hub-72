export interface CollaborationFormData {
  campaignId?: string;
  title: string;
  description: string;
  requirements: string[];
  compensation: number;
  deadline: Date;
  imageUrl?: string;
  maxSpots?: number;
}

export interface CollaborationFormProps {
  campaignId?: string;
  onSuccess?: () => void;
  isStandalone?: boolean;
  onCollaborationData?: (data: any) => void;
  initialData?: CollaborationFormData & { id: string };
  campaigns?: Array<{
    id: string;
    title: string;
    business_id: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
}