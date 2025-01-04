import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { BusinessSelect } from "./campaign-form/BusinessSelect";
import { CampaignDetails } from "./campaign-form/CampaignDetails";
import { DateFields } from "./campaign-form/DateFields";
import { CollaborationForm } from "./collaboration-form/CollaborationForm";
import type { CampaignFormData } from "./campaign-form/types";

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
  const queryClient = useQueryClient();
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: campaign?.title || "",
      description: campaign?.description || "",
      business_id: campaign?.business_id || "",
      start_date: campaign?.start_date.split('T')[0] || "",
      end_date: campaign?.end_date.split('T')[0] || "",
    },
  });

  const { data: businesses, isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Error fetching businesses:", error);
        throw error;
      }
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ values, status }: { values: z.infer<typeof formSchema>, status: 'draft' | 'active' }) => {
      if (campaign) {
        // Update existing campaign
        const { data, error } = await supabase
          .from("campaigns")
          .update({
            title: values.title,
            description: values.description,
            start_date: values.start_date,
            end_date: values.end_date,
            business_id: values.business_id,
          })
          .eq('id', campaign.id)
          .select();
        
        if (error) throw error;
        return data[0];
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from("campaigns")
          .insert({
            title: values.title,
            description: values.description,
            business_id: values.business_id,
            start_date: values.start_date,
            end_date: values.end_date,
            status
          })
          .select();
        
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(campaign ? "Campaign updated successfully" : "Campaign created successfully");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error with campaign:", error);
      toast.error(campaign ? "Failed to update campaign" : "Failed to create campaign");
    },
  });

  const onSubmit = (values: CampaignFormData, status: 'draft' | 'active' = 'active') => {
    // Validate dates
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

    mutation.mutate({ values, status });
  };

  if (isLoadingBusinesses) {
    return <div>Loading...</div>;
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          You need to create a business first before creating a campaign.
        </p>
      </div>
    );
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
                campaignId={mutation.data?.id} 
                businessId={form.getValues().business_id}
                isStandalone={false}
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {campaign ? "Update Campaign" : "Create Campaign & Collaboration"}
            </Button>
            {!campaign && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={mutation.isPending}
                onClick={() => form.handleSubmit((values) => onSubmit(values, 'draft'))()}
              >
                Save as Draft
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};