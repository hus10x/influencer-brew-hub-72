import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const businessFormSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  description: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type BusinessFormData = z.infer<typeof businessFormSchema>;

export const BusinessProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id;

  const { data: business, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ["business"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      business_name: business?.business_name || "",
      industry: business?.industry || "",
      description: business?.description || "",
      website: business?.website || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      setIsLoading(true);
      const { error } = await supabase
        .from("businesses")
        .upsert({
          id: userId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Business profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
    onError: (error) => {
      console.error("Error updating business profile:", error);
      toast.error("Failed to update business profile");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    mutation.mutate(data);
  };

  if (isLoadingBusiness) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Business Profile</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your industry" {...field} />
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
                    placeholder="Tell us about your business"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};