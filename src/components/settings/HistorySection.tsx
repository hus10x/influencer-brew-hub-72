import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const HistoryTableSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-full" />
      </div>
    ))}
  </div>
);

export const HistorySection = () => {
  const { data: campaignHistory, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaignHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: collaborationHistory, isLoading: loadingCollaborations } = useQuery({
    queryKey: ["collaborationHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborations")
        .select("*, campaigns(title)")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const formatDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <Tabs defaultValue="campaigns" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
      </TabsList>

      <TabsContent value="campaigns">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Campaign History</h3>
          {loadingCampaigns ? (
            <HistoryTableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignHistory?.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>{formatDate(campaign.created_at)}</TableCell>
                    <TableCell>{formatDate(campaign.updated_at)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{campaign.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="collaborations">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Collaboration History</h3>
          {loadingCollaborations ? (
            <HistoryTableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborationHistory?.map((collab) => (
                  <TableRow key={collab.id}>
                    <TableCell className="font-medium">{collab.title}</TableCell>
                    <TableCell>{collab.campaigns?.title}</TableCell>
                    <TableCell>{formatDate(collab.created_at)}</TableCell>
                    <TableCell>{formatDate(collab.updated_at)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{collab.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
};