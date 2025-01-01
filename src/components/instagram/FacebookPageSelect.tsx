import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Facebook, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

interface FacebookPageSelectProps {
  onPageSelected: (page: FacebookPage) => void;
  userAccessToken: string;
}

export const FacebookPageSelect = ({ onPageSelected, userAccessToken }: FacebookPageSelectProps) => {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=name,access_token,instagram_business_account&access_token=${userAccessToken}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Facebook pages");
        }

        const data = await response.json();
        const pagesWithInstagram = data.data.filter(
          (page: FacebookPage) => page.instagram_business_account
        );
        setPages(pagesWithInstagram);
      } catch (error) {
        console.error("Error fetching pages:", error);
        toast.error("Failed to fetch Facebook pages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, [userAccessToken]);

  const handlePageSelection = async () => {
    try {
      setIsFetching(true);
      const selectedPage = pages.find((page) => page.id === selectedPageId);
      if (!selectedPage) {
        throw new Error("No page selected");
      }

      onPageSelected(selectedPage);
    } catch (error) {
      console.error("Error selecting page:", error);
      toast.error("Failed to select Facebook page");
    } finally {
      setIsFetching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Instagram Business Account Found</CardTitle>
          <CardDescription>
            Please make sure you have connected an Instagram Business account to one of your Facebook
            Pages.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5" />
          Select a Facebook Page
        </CardTitle>
        <CardDescription>
          Choose the Facebook Page connected to your Instagram Business account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedPageId}
          onValueChange={setSelectedPageId}
          className="space-y-4"
        >
          {pages.map((page) => (
            <div key={page.id} className="flex items-center space-x-2">
              <RadioGroupItem value={page.id} id={page.id} />
              <Label htmlFor={page.id}>{page.name}</Label>
            </div>
          ))}
        </RadioGroup>
        <Button
          onClick={handlePageSelection}
          disabled={!selectedPageId || isFetching}
          className="mt-4 w-full"
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Selected Page"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};