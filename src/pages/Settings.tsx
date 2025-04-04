
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { CompanyInfoSection } from "@/components/settings/CompanyInfoSection";
import { AdditionalQuestionsSection } from "@/components/settings/AdditionalQuestionsSection";
import { SocialMediaSection } from "@/components/settings/SocialMediaSection";
import { UsersSection } from "@/components/settings/UsersSection";
import { useSettingsData } from "@/hooks/useSettingsData";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("company-details");
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile-details");
  
  const {
    companyData,
    profileData,
    questionsData,
    socialMediaData,
    appUsersData
  } = useSettingsData();

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
