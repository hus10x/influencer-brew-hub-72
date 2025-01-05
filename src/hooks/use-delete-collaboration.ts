import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteCollaboration = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collaborationId: string) => {
      const { error } = await supabase
        .from("collaborations")
        .delete()
        .eq("id", collaborationId);

      if (error) throw error;
      return collaborationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
      toast.success("Collaboration deleted successfully");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error deleting collaboration:", error);
      toast.error("Failed to delete collaboration");
    },
  });
};