import { z } from "zod";

export const collaborationFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  compensation: z.number().min(1, "Compensation must be greater than 0"),
  deadline: z.string().min(1, "Deadline is required"),
  max_spots: z.number().min(1, "Number of spots must be at least 1"),
  campaign_id: z.string().optional(),
  business_id: z.string().min(1, "Business is required"),
  image: z.instanceof(FileList).optional(),
});

export type CollaborationFormData = z.infer<typeof collaborationFormSchema>;