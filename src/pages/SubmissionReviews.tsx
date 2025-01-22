import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export default function SubmissionReviews() {
  const [submissions, setSubmissions] = useState<Tables<"collaboration_submissions">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("collaboration_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (submissionId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from("collaboration_submissions")
        .update({ verified, verification_date: new Date().toISOString() })
        .eq("id", submissionId);

      if (error) throw error;

      setSubmissions(submissions.map(sub => 
        sub.id === submissionId 
          ? { ...sub, verified, verification_date: new Date().toISOString() } 
          : sub
      ));

      toast.success(`Submission ${verified ? "verified" : "rejected"} successfully`);
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission");
    }
  };

  const getStatusBadge = (submission: Tables<"collaboration_submissions">) => {
    if (submission.verified === true) {
      return <Badge variant="secondary">Verified</Badge>;
    }
    if (submission.verified === false) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Submission Reviews</h1>
      <div className="grid gap-6">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Submission {submission.id}</span>
                {getStatusBadge(submission)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Story URL</p>
                  <p className="font-medium">{submission.story_url || "No story URL provided"}</p>
                </div>
                {submission.verified === null && (
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleVerification(submission.id, true)}
                      variant="outline"
                    >
                      Verify
                    </Button>
                    <Button
                      onClick={() => handleVerification(submission.id, false)}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}