import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { BusinessFormData } from "./types";

interface BusinessLogoUploadProps {
  form: UseFormReturn<BusinessFormData>;
  currentLogo?: string | null;
}

export const BusinessLogoUpload = ({ form, currentLogo }: BusinessLogoUploadProps) => {
  return (
    <FormField
      control={form.control}
      name="logo"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Business Logo</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                  className="h-auto py-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              {currentLogo && (
                <img
                  src={currentLogo}
                  alt="Current logo"
                  className="h-10 w-10 rounded-md object-cover"
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};