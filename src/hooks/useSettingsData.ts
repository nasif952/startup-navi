
import { useQuery } from "@tanstack/react-query";
import { extendedSupabase } from "@/integrations/supabase/client-extension";
import { useToast } from "@/hooks/use-toast";
import { Company, BusinessQuestion, SocialMedia, Profile, AppUser } from "@/integrations/supabase/client-extension";
import { useAuth } from "@/contexts/AuthContext";

export function useSettingsData() {
  const { toast } = useToast();
  const { user } = useAuth();

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
            email
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
      
      // Fix: properly map the data from the profiles nested object
      return data.map(user => ({
        id: user.id,
        user: user.profiles ? user.profiles.full_name || 'Unknown' : 'Unknown',
        user_type: user.user_type,
        status: user.status,
        role: user.role,
        email: user.profiles ? user.profiles.email || 'N/A' : 'N/A',
      }));
    },
    enabled: !!companyData?.id
  });

  return {
    companyData,
    isCompanyLoading,
    profileData,
    questionsData,
    socialMediaData,
    appUsersData
  };
}
