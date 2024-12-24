import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CollaborationFormData } from "./types";

interface RequirementsSectionProps {
  form: UseFormReturn<CollaborationFormData>;
  requirements: string[];
  setRequirements: (requirements: string[]) => void;
}

export const RequirementsSection = ({
  form,
  requirements,
  setRequirements,
}: RequirementsSectionProps) => {
  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const removeRequirement = (index: number) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };

  return (
    <div className="space-y-4">
      <FormLabel>Requirements</FormLabel>
      {requirements.map((_, index) => (
        <div key={index} className="flex gap-2">
          <FormField
            control={form.control}
            name={`requirements.${index}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Enter requirement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {index > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeRequirement(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addRequirement} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Requirement
      </Button>
    </div>
  );
};