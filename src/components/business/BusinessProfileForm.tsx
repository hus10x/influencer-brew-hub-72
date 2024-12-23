import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { BusinessLogoUpload } from "./profile/BusinessLogoUpload";
import { IndustrySelect } from "./profile/IndustrySelect";
import { businessFormSchema, BusinessFormData } from "./profile/types";

export const BusinessProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data;
    },
  });

  const userId = userData?.user?.id;

  // Get business data
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
      website: business?.website || "",
    },
  });

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('business-logos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('business-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const mutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      setIsLoading(true);
      let logoUrl = business?.logo_url;

      // Handle logo upload if a new file is selected
      if (data.logo && data.logo.length > 0) {
        logoUrl = await uploadLogo(data.logo[0]);
      }

      const { error } = await supabase
        .from("businesses")
        .upsert({
          id: userId,
          business_name: data.business_name,
          industry: data.industry,
          website: data.website,
          logo_url: logoUrl,
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

          <IndustrySelect form={form} />

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

          <BusinessLogoUpload form={form} currentLogo={business?.logo_url} />

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={true}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Connect Instagram
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};