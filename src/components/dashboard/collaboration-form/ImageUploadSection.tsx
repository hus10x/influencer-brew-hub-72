import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CollaborationFormData } from "./types";

interface ImageUploadSectionProps {
  form: UseFormReturn<CollaborationFormData>;
}

export const ImageUploadSection = ({ form }: ImageUploadSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Collaboration Image</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                onChange(e.target.files);
              }}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};