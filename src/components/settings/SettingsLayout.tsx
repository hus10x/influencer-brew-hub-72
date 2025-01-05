import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { HistorySection } from "./HistorySection";

export const SettingsLayout = () => {
  return (
    <div className="container max-w-5xl py-8 animate-fade-up">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>
      
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="security" className="space-y-6">
          <PasswordChangeForm />
        </TabsContent>
        
        <TabsContent value="history">
          <HistorySection />
        </TabsContent>
      </Tabs>
    </div>
  );
};