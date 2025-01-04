import { z } from "zod";

export const collaborationFormSchema = z.object({
  campaignId: z.string().min(1, "Campaign is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  compensation: z.number().min(1, "Compensation must be greater than 0"),
  deadline: z.date(),
  maxSpots: z.number().min(1, "Number of spots must be at least 1"),
  image: z.instanceof(FileList).optional(),
});

export type CollaborationFormData = z.infer<typeof collaborationFormSchema>;

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