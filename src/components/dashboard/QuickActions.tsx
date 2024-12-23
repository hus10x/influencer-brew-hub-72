import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCampaignDialog } from "./CreateCampaignDialog";

export const QuickActions = () => {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  return (
    <div className="space-y-4 animate-fade-up">
      <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <Button
          size="lg"
          className="gap-2"
          onClick={() => setShowCreateCampaign(true)}
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
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

      <CreateCampaignDialog
        open={showCreateCampaign}
        onOpenChange={setShowCreateCampaign}
      />
    </div>
  );
};