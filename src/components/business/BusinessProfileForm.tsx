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
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { BusinessLogoUpload } from "./profile/BusinessLogoUpload";
import { IndustrySelect } from "./profile/IndustrySelect";
import { businessFormSchema, BusinessFormData } from "./profile/types";
import { Tables } from "@/integrations/supabase/types";

interface BusinessProfileFormProps {
  business?: Tables<"businesses"> | null;
  onSuccess?: () => void;
}

export const BusinessProfileForm = ({ business, onSuccess }: BusinessProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data;
    },
  });

  const userId = userData?.user?.id;

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
      if (!userId) throw new Error("Not authenticated");
      setIsLoading(true);
      let logoUrl = business?.logo_url;

      // Handle logo upload if a new file is selected
      if (data.logo && data.logo.length > 0) {
        logoUrl = await uploadLogo(data.logo[0]);
      }

      const businessData = {
        business_name: data.business_name,
        industry: data.industry,
        website: data.website,
        logo_url: logoUrl,
        user_id: userId,
      };

      const { error } = business
        ? await supabase
            .from("businesses")
            .update(businessData)
            .eq('id', business.id)
            .select()
            .single()
        : await supabase
            .from("businesses")
            .insert({ ...businessData, id: crypto.randomUUID() })
            .select()
            .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(business ? "Business updated successfully" : "Business created successfully");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error updating business profile:", error);
      toast.error(business ? "Failed to update business" : "Failed to create business");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    mutation.mutate(data);
  };

  return (
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
            {isLoading ? "Saving..." : business ? "Update" : "Create"}
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
  );
};