
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { extendedSupabase } from "@/integrations/supabase/client-extension";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { CompanyInfoSection } from "@/components/settings/CompanyInfoSection";
import { AdditionalQuestionsSection } from "@/components/settings/AdditionalQuestionsSection";
import { SocialMediaSection } from "@/components/settings/SocialMediaSection";
import { UsersSection } from "@/components/settings/UsersSection";
import { Company, BusinessQuestion, SocialMedia, Profile } from "@/integrations/supabase/client-extension";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("company-details");
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile-details");

  // Fetch company data
  const { data: companyData, isLoading: isCompanyLoading } = useQuery<Company | null>({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await extendedSupabase
        .from('companies')
        .select('*')
        .limit(1)
        .single();
        
      if (error) {
        toast({
          title: "Error loading company data",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return data as Company;
    }
  });

  // Fetch profile data
  const { data: profileData } = useQuery<Profile | null>({
    queryKey: ['profile-settings'],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await extendedSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        toast({
          title: "Error loading profile data",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return data as Profile;
    },
    enabled: !!user?.id
  });

  // Fetch business questions data
  const { data: questionsData } = useQuery<BusinessQuestion | null>({
    queryKey: ['business-questions'],
    queryFn: async () => {
      if (!companyData?.id) return null;

      const { data, error } = await extendedSupabase
        .from('business_questions')
        .select('*')
        .eq('company_id', companyData.id)
        .maybeSingle();
        
      if (error) {
        toast({
          title: "Error loading additional questions",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return data as BusinessQuestion;
    },
    enabled: !!companyData?.id
  });

  // Fetch social media data
  const { data: socialMediaData } = useQuery<SocialMedia | null>({
    queryKey: ['social-media'],
    queryFn: async () => {
      if (!companyData?.id) return null;

      const { data, error } = await extendedSupabase
        .from('social_media')
        .select('*')
        .eq('company_id', companyData.id)
        .maybeSingle();
        
      if (error) {
        toast({
          title: "Error loading social media data",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return data as SocialMedia;
    },
    enabled: !!companyData?.id
  });

  // Fetch app users data
  const { data: appUsersData } = useQuery<any[]>({
    queryKey: ['app-users'],
    queryFn: async () => {
      if (!companyData?.id) return [];

      const { data, error } = await extendedSupabase
        .from('app_users')
        .select(`
          id,
          user_id,
          user_type,
          status,
          role,
          profiles:user_id (
            full_name,
            last_name,
            email:id (
              email
            )
          )
        `)
        .eq('company_id', companyData.id);
        
      if (error) {
        toast({
          title: "Error loading users data",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      
      return data.map(user => ({
        id: user.id,
        user: user.profiles?.full_name || 'Unknown',
        user_type: user.user_type,
        status: user.status,
        role: user.role,
        email: user.profiles?.email?.email || 'N/A',
      }));
    },
    enabled: !!companyData?.id
  });

  return (
    <SettingsLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Tabs 
        value={activeSettingsTab} 
        onValueChange={setActiveSettingsTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="profile-details">Profile Details</TabsTrigger>
          <TabsTrigger value="company-info">Company Info</TabsTrigger>
          <TabsTrigger value="additional-questions">Additional Questions</TabsTrigger>
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="profile-details">
          <ProfileSection profileData={profileData} />
        </TabsContent>

        <TabsContent value="company-info">
          <CompanyInfoSection companyData={companyData} />
        </TabsContent>

        <TabsContent value="additional-questions">
          <AdditionalQuestionsSection questionsData={questionsData} companyData={companyData} />
        </TabsContent>

        <TabsContent value="social-media">
          <SocialMediaSection socialMediaData={socialMediaData} companyData={companyData} />
        </TabsContent>

        <TabsContent value="users">
          <UsersSection appUsersData={appUsersData} />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}
