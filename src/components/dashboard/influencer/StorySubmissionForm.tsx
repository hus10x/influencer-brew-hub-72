import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StorySubmissionFormProps {
  collaborationSubmissionId: string;
  onSuccess?: () => void;
}

export const StorySubmissionForm = ({ 
  collaborationSubmissionId,
  onSuccess 
}: StorySubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storyUrl, setStoryUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storyUrl.trim()) {
      toast.error("Please enter a story URL");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update the collaboration submission with the story URL
      const { error: submissionError } = await supabase
        .from("collaboration_submissions")
        .update({ 
          story_url: storyUrl,
          status: "pending_verification" 
        })
        .eq("id", collaborationSubmissionId);

      if (submissionError) throw submissionError;

      // Create a story verification record
      const { error: verificationError } = await supabase
        .from("story_verifications")
        .insert({
          collaboration_submission_id: collaborationSubmissionId,
          story_url: storyUrl,
          verification_status: "pending"
        });

      if (verificationError) throw verificationError;

      toast.success("Story URL submitted successfully!");
      setStoryUrl("");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting story:", error);
      toast.error("Failed to submit story URL. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="storyUrl" className="text-sm font-medium">
          Story URL
        </label>
        <Input
          id="storyUrl"
          type="url"
          placeholder="Enter your Instagram story URL"
          value={storyUrl}
          onChange={(e) => setStoryUrl(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Story"}
      </Button>
    </form>
  );
};