import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { BusinessSelect } from "./campaign-form/BusinessSelect";
import { CampaignDetails } from "./campaign-form/CampaignDetails";
import { DateFields } from "./campaign-form/DateFields";
import { CollaborationForm } from "./collaboration-form/CollaborationForm";
import { FormActions } from "./campaign-form/FormActions";
import type { CampaignFormData } from "./campaign-form/types";
import { createCampaignWithCollaboration } from "@/services/campaign";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  business_id: z.string().min(1, "Business is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string()
    .min(1, "End date is required")
    .refine((date) => new Date(date) > new Date(), {
      message: "End date must be in the future",
    }),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

interface CampaignFormProps {
  onSuccess: () => void;
  campaign?: {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    business_id: string;
  };
}

export const CampaignForm = ({ onSuccess, campaign }: CampaignFormProps) => {
  const [collaborationData, setCollaborationData] = useState(null);
  const [isProcessingCollaboration, setIsProcessingCollaboration] = useState(false);
  const queryClient = useQueryClient();

  // First get the current user
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data;
    },
  });

  const userId = userData?.user?.id;

  // Then fetch only the businesses owned by this user
  const { data: businesses = [], isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ["businesses", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error fetching businesses:", error);
        toast.error("Failed to load businesses");
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: campaign?.title || "",
      description: campaign?.description || "",
      business_id: campaign?.business_id || "",
      start_date: campaign?.start_date?.split('T')[0] || "",
      end_date: campaign?.end_date?.split('T')[0] || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CampaignFormData & { status?: 'draft' | 'active' }) => {
      try {
        if (collaborationData) {
          return await createCampaignWithCollaboration(values, collaborationData);
        }

        const { data, error } = await supabase
          .from("campaigns")
          .insert({
            title: values.title,
            description: values.description,
            business_id: values.business_id,
            start_date: values.start_date,
            end_date: values.end_date,
            status: values.status || 'active', // Default to active if not specified
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(collaborationData 
        ? "Campaign and collaboration created successfully" 
        : "Campaign created successfully"
      );
      form.reset();
      setCollaborationData(null);
      setIsProcessingCollaboration(false);
      onSuccess();
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to create campaign. Please try again.");
      setCollaborationData(null);
      setIsProcessingCollaboration(false);
    },
  });

  const handleCollaborationData = async (data: any) => {
    try {
      setIsProcessingCollaboration(true);
      setCollaborationData(data);
      await form.handleSubmit(async (values) => {
        await mutation.mutateAsync({ ...values, status: 'active' });
      })();
    } catch (error) {
      console.error("Error handling collaboration data:", error);
      setIsProcessingCollaboration(false);
      setCollaborationData(null);
      toast.error("Failed to process collaboration data");
    }
  };

  const onSubmit = async (values: CampaignFormData, status: 'draft' | 'active' = 'active') => {
    try {
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);
      
      if (startDate > endDate) {
        toast.error("Start date cannot be after end date");
        return;
      }

      await mutation.mutateAsync({ ...values, status });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    }
  };

  if (isLoadingUser || isLoadingBusinesses) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-6">
          <BusinessSelect form={form} businesses={businesses} />
          <CampaignDetails form={form} />
          <DateFields form={form} />
          
          {!campaign && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Add Collaboration Details</h3>
              <CollaborationForm 
                onCollaborationData={handleCollaborationData}
                isStandalone={false}
              />
            </div>
          )}

          <FormActions 
            form={form}
            mutation={mutation}
            isCreatingCollaboration={isProcessingCollaboration}
            campaign={campaign}
            onSubmit={onSubmit}
          />
        </form>
      </Form>
    </div>
  );
};