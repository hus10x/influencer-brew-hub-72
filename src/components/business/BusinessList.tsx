import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard } from "./BusinessCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BusinessProfileForm } from "./BusinessProfileForm";

export const BusinessList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Tables<"businesses"> | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("businesses")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (business: Tables<"businesses">) => {
    setEditingBusiness(business);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingBusiness(null);
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!businesses || businesses.length === 0) {
    return <BusinessProfileForm />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Businesses</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Business
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBusiness ? "Edit Business" : "Create New Business"}
              </DialogTitle>
              <DialogDescription>
                {editingBusiness
                  ? "Update your business information below"
                  : "Add a new business to your profile"}
              </DialogDescription>
            </DialogHeader>
            <BusinessProfileForm
              business={editingBusiness}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canDelete={businesses.length > 1}
          />
        ))}
      </div>
    </div>
  );
};