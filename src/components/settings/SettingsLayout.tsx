
import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface SettingsLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: ReactNode;
}

export function SettingsLayout({ 
  activeTab, 
  setActiveTab,
  children 
}: SettingsLayoutProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your company and profile settings</p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 bg-background border-b border-border rounded-none p-0 w-full max-w-md">
          <TabsTrigger 
            value="company-details" 
            className={`px-6 py-3 rounded-none ${activeTab === 'company-details' ? 'border-b-2 border-primary' : ''}`}
          >
            Company Details
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className={`px-6 py-3 rounded-none ${activeTab === 'billing' ? 'border-b-2 border-primary' : ''}`}
          >
            Billing
          </TabsTrigger>
          <TabsTrigger 
            value="my-investors" 
            className={`px-6 py-3 rounded-none ${activeTab === 'my-investors' ? 'border-b-2 border-primary' : ''}`}
          >
            My Investors
          </TabsTrigger>
          <TabsTrigger 
            value="potential-investors" 
            className={`px-6 py-3 rounded-none ${activeTab === 'potential-investors' ? 'border-b-2 border-primary' : ''}`}
          >
            Potential Investors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company-details">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
                {children}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Billing Information</h3>
              
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Billing settings coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-investors">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">My Investors</h3>
              
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Investor management coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="potential-investors">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Potential Investors</h3>
              
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Potential investor management coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
