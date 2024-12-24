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
  end_date: z.string().min(1, "End date is required"),
});

interface CampaignFormProps {
  onSuccess: () => void;
}

export const CampaignForm = ({ onSuccess }: CampaignFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      business_id: "",
      start_date: "",
      end_date: "",
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

  const createCampaign = useMutation({
    mutationFn: async ({ values, status }: { values: z.infer<typeof formSchema>, status: 'draft' | 'active' }) => {
      const { data, error } = await supabase.from("campaigns").insert({
        title: values.title,
        description: values.description,
        business_id: values.business_id,
        start_date: values.start_date,
        end_date: values.end_date,
        status
      }).select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    },
  });

  const onSubmit = (values: CampaignFormData, status: 'draft' | 'active' = 'active') => {
    createCampaign.mutate({ values, status });
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
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={createCampaign.isPending}
            >
              Create Campaign
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={createCampaign.isPending}
              onClick={() => form.handleSubmit((values) => onSubmit(values, 'draft'))()}
            >
              Save as Draft
            </Button>
          </div>
        </form>
      </Form>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Add Collaboration Details</h3>
        <CollaborationForm />
      </div>
    </div>
  );
};