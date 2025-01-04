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
  const queryClient = useQueryClient();

  // First get the current user
  const { data: userData } = useQuery({
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
    enabled: !!userId, // Only run query when we have a userId
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
    mutationFn: async (values: CampaignFormData) => {
      if (collaborationData) {
        return createCampaignWithCollaboration(values, collaborationData);
      }
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          title: values.title,
          description: values.description,
          business_id: values.business_id,
          start_date: values.start_date,
          end_date: values.end_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(collaborationData 
        ? "Campaign and collaboration created successfully" 
        : "Campaign created successfully"
      );
      form.reset();
      setCollaborationData(null);
      onSuccess();
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to create campaign");
      setCollaborationData(null);
    },
  });

  const handleCollaborationData = (data: any) => {
    setCollaborationData(data);
    form.handleSubmit((values) => mutation.mutate(values))();
  };

  const onSubmit = (values: CampaignFormData, status: 'draft' | 'active' = 'active') => {
    const startDate = new Date(values.start_date);
    const endDate = new Date(values.end_date);
    
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }

    if (endDate < new Date()) {
      toast.error("End date must be in the future");
      return;
    }

    mutation.mutate(values);
  };

  if (isLoadingBusinesses) {
    return <div>Loading businesses...</div>;
  }

  return (
    <div className="space-y-8">
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
            isCreatingCollaboration={!!collaborationData}
            campaign={campaign}
            onSubmit={onSubmit}
          />
        </form>
      </Form>
    </div>
  );
};