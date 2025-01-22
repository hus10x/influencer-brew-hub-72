import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SubmissionReviews = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions", selectedBusiness],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("collaboration_submissions")
        .select(`
          *,
          collaboration:collaborations(
            *,
            campaign:campaigns(
              *,
              business:businesses(*)
            )
          ),
          influencer:influencers(
            *,
            profile:profiles(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (selectedBusiness) {
        query = query.eq("collaboration.campaign.business_id", selectedBusiness);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }

      return data;
    },
    meta: {
      error: (error: Error) => {
        toast.error(error.message);
      }
    }
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ["user-businesses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    }
  });

  const handleVerification = async (submissionId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from("collaboration_submissions")
        .update({
          verified,
          verification_date: new Date().toISOString(),
          status: verified ? "approved" : "rejected"
        })
        .eq("id", submissionId);

      if (error) throw error;
      toast.success(`Submission ${verified ? "approved" : "rejected"} successfully`);
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-6 px-4 space-y-6 pt-24">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 px-4 space-y-6 pt-24">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Submission Reviews</h1>
          <p className="text-muted-foreground">
            Review and verify collaboration submissions from influencers
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={selectedBusiness === null ? "default" : "outline"}
            onClick={() => setSelectedBusiness(null)}
          >
            All Businesses
          </Button>
          {businesses.map((business) => (
            <Button
              key={business.id}
              variant={selectedBusiness === business.id ? "default" : "outline"}
              onClick={() => setSelectedBusiness(business.id)}
            >
              {business.business_name}
            </Button>
          ))}
        </div>

        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {submission.collaboration?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {submission.collaboration?.campaign?.business?.business_name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={submission.verified ? "success" : submission.status === "rejected" ? "destructive" : "secondary"}>
                      {submission.verified ? "Verified" : submission.status === "rejected" ? "Rejected" : "Pending"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Submitted by {submission.influencer?.profile?.full_name || "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600"
                    onClick={() => handleVerification(submission.id, true)}
                    disabled={submission.verified || submission.status === "rejected"}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleVerification(submission.id, false)}
                    disabled={submission.verified || submission.status === "rejected"}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {submissions.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No submissions to review</h3>
              <p className="text-muted-foreground">
                When influencers submit their collaborations, they'll appear here
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubmissionReviews;