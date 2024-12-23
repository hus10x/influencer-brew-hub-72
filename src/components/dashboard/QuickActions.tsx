import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  return (
    <div className="space-y-4 animate-fade-up">
      <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <Button
          variant="secondary"
          size="lg"
          className="gap-2"
          onClick={() => {
            // TODO: Open collaboration creation modal
            console.log("Create collaboration clicked");
          }}
        >
          <Users className="w-4 h-4" />
          New Collaboration
        </Button>
      </div>
    </div>
  );
};