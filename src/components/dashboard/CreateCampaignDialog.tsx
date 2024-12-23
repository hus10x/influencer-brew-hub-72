import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CampaignFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export const CreateCampaignDialog = ({
  open,
  onOpenChange,
}: CreateCampaignDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<CampaignFormData>();

  const onSubmit = async (data: CampaignFormData) => {
    try {
      setIsLoading(true);
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error("Not authenticated");
      }

      // First ensure profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: (await supabase.auth.getUser()).data.user?.email,
            user_type: 'business'
          });

        if (profileError) {
          throw profileError;
        }
      }

      // Then check if business exists
      const { data: businessData } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      // If no business exists, create one
      if (!businessData) {
        const { error: createError } = await supabase
          .from("businesses")
          .insert({
            id: userId, // Use userId instead of random UUID to match profile ID
            business_name: (await supabase.auth.getUser()).data.user?.email?.split("@")[0] || "My Business",
            user_id: userId
          });

        if (createError) {
          throw createError;
        }
      }

      // Finally create the campaign
      const { error: campaignError } = await supabase.from("campaigns").insert({
        business_id: userId,
        title: data.title,
        description: data.description,
        start_date: new Date(data.startDate).toISOString(),
        end_date: new Date(data.endDate).toISOString(),
        status: "draft",
      });

      if (campaignError) {
        throw campaignError;
      }

      toast.success("Campaign created successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create a new campaign to organize your collaborations
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Collection 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Campaign details..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};