import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Image, Upload, User, Plus } from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  business_activity: z.string().optional(),
  stage: z.string().optional(),
  founded_year: z.number().optional(),
  website_url: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  sector: z.string().optional(),
  company_series: z.string().optional(),
});

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  last_name: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  country_code: z.string().optional(),
});

const additionalQuestionsSchema = z.object({
  problem_solving: z.string().max(400, "Maximum 400 characters allowed").optional(),
  solution: z.string().max(400, "Maximum 400 characters allowed").optional(),
  why_now: z.string().max(400, "Maximum 400 characters allowed").optional(),
  business_model: z.string().max(400, "Maximum 400 characters allowed").optional(),
  founding_team_gender: z.string().optional(),
});

const socialMediaSchema = z.object({
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  crunchbase: z.string().optional(),
  twitter: z.string().optional(),
});

export default function Settings() {
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("company-details");
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile-details");

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      business_activity: "",
      stage: "",
      founded_year: 2025,
      website_url: "",
      country: "",
      currency: "",
      sector: "",
      company_series: "",
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      last_name: "",
      designation: "",
      phone: "",
      email: user?.email || "",
      country_code: "",
    },
  });

  const additionalQuestionsForm = useForm({
    resolver: zodResolver(additionalQuestionsSchema),
    defaultValues: {
      problem_solving: "",
      solution: "",
      why_now: "",
      business_model: "",
      founding_team_gender: "",
    },
  });

  const socialMediaForm = useForm({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      linkedin: "",
      instagram: "",
      crunchbase: "",
      twitter: "",
    },
  });

  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
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
      
      return data;
    }
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
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
      
      return data;
    },
    enabled: !!user?.id
  });

  const { data: questionsData } = useQuery({
    queryKey: ['business-questions'],
    queryFn: async () => {
      if (!companyData?.id) return null;

      const { data, error } = await supabase
        .from('business_questions')
        .select('*')
        .eq('company_id', companyData.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not found is okay
        toast({
          title: "Error loading additional questions",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return data || null;
    },
    enabled: !!companyData?.id
  });

  const { data: socialMediaData } = useQuery({
    queryKey: ['social-media'],
    queryFn: async () => {
      if (!companyData?.id) return null;

      const { data, error } = await supabase
        .from('social_media')
        .select('*')
        .eq('company_id', companyData.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not found is okay
        toast({
          title: "Error loading social media data",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return data || null;
    },
    enabled: !!companyData?.id
  });

  const { data: appUsersData } = useQuery({
    queryKey: ['app-users'],
    queryFn: async () => {
      if (!companyData?.id) return [];

      const { data, error } = await supabase
        .from('app_users')
        .select(`
          id,
          user_type,
          status,
          role,
          user_id,
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
        user: user.profiles?.full_name && user.profiles?.last_name 
          ? `${user.profiles.full_name} ${user.profiles.last_name}`
          : user.profiles?.full_name || 'Unknown',
        user_type: user.user_type,
        status: user.status,
        role: user.role,
        email: user.profiles?.email?.email || 'N/A',
      }));
    },
    enabled: !!companyData?.id
  });

  useEffect(() => {
    if (companyData) {
      companyForm.reset({
        name: companyData.name || "",
        industry: companyData.industry || "",
        business_activity: companyData.business_activity || "",
        stage: companyData.stage || "",
        founded_year: companyData.founded_year || 2025,
        website_url: companyData.website_url || "",
        country: companyData.country || "",
        currency: companyData.currency || "",
        sector: companyData.sector || "",
        company_series: companyData.company_series || "",
      });
    }
  }, [companyData, companyForm]);

  useEffect(() => {
    if (profileData) {
      profileForm.reset({
        full_name: profileData.full_name || "",
        last_name: profileData.last_name || "",
        designation: profileData.designation || "",
        phone: profileData.phone || "",
        email: user?.email || "",
        country_code: profileData.country_code || "",
      });
    }
  }, [profileData, profileForm, user]);

  useEffect(() => {
    if (questionsData) {
      additionalQuestionsForm.reset({
        problem_solving: questionsData.problem_solving || "",
        solution: questionsData.solution || "",
        why_now: questionsData.why_now || "",
        business_model: questionsData.business_model || "",
        founding_team_gender: questionsData.founding_team_gender || "",
      });
    }
  }, [questionsData, additionalQuestionsForm]);

  useEffect(() => {
    if (socialMediaData) {
      socialMediaForm.reset({
        linkedin: socialMediaData.linkedin || "",
        instagram: socialMediaData.instagram || "",
        crunchbase: socialMediaData.crunchbase || "",
        twitter: socialMediaData.twitter || "",
      });
    }
  }, [socialMediaData, socialMediaForm]);

  const updateCompany = useMutation({
    mutationFn: async (values) => {
      if (!companyData?.id) throw new Error("Company ID not found");
      
      const { error } = await supabase
        .from('companies')
        .update(values)
        .eq('id', companyData.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Company updated",
        description: "Your company details have been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (values) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          last_name: values.last_name,
          designation: values.designation,
          phone: values.phone,
          country_code: values.country_code,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      refreshProfile();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateAdditionalQuestions = useMutation({
    mutationFn: async (values) => {
      if (!companyData?.id) throw new Error("Company ID not found");
      
      if (questionsData?.id) {
        const { error } = await supabase
          .from('business_questions')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', questionsData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_questions')
          .insert({
            ...values,
            company_id: companyData.id
          });
        
        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Questions updated",
        description: "Your answers have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['business-questions'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSocialMedia = useMutation({
    mutationFn: async (values) => {
      if (!companyData?.id) throw new Error("Company ID not found");
      
      if (socialMediaData?.id) {
        const { error } = await supabase
          .from('social_media')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', socialMediaData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('social_media')
          .insert({
            ...values,
            company_id: companyData.id
          });
        
        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Social Media updated",
        description: "Your social media links have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['social-media'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addNewUser = useMutation({
    mutationFn: async (values) => {
      if (!companyData?.id) throw new Error("Company ID not found");
      
      const { error } = await supabase
        .from('app_users')
        .insert({
          company_id: companyData.id,
          user_type: values.user_type,
          role: values.role,
        });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "User invited",
        description: "Invitation has been sent successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
    },
    onError: (error) => {
      toast({
        title: "Invitation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onCompanySubmit = (values) => {
    updateCompany.mutate(values);
  };

  const onProfileSubmit = (values) => {
    updateProfile.mutate(values);
  };

  const onAdditionalQuestionsSubmit = (values) => {
    updateAdditionalQuestions.mutate(values);
  };

  const onSocialMediaSubmit = (values) => {
    updateSocialMedia.mutate(values);
  };

  const industryOptions = [
    "Business Support Services",
    "Software & IT Services",
    "Healthcare",
    "Financial Services",
    "E-commerce",
    "Education",
    "Manufacturing",
    "Transportation",
    "IT Services & Consulting"
  ];

  const stageOptions = [
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C",
    "Series D",
    "Growth",
  ];

  const seriesOptions = [
    "Series A",
    "Series B",
    "Series C",
    "Series D",
    "Series E",
    "Not applicable"
  ];

  const countryOptions = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Singapore",
    "India"
  ];

  const currencyOptions = [
    "USD - $",
    "EUR - €",
    "GBP - £",
    "CAD - C$",
    "AUD - A$",
    "SGD - S$",
    "INR - ₹"
  ];

  const sectorOptions = [
    "Software & IT Services",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail"
  ];

  const genderOptions = [
    "Male",
    "Female",
    "Mixed",
    "Non-binary",
    "Prefer not to say"
  ];

  const userColumns = [
    {
      key: "user",
      header: "Users",
      className: "font-medium"
    },
    {
      key: "user_type",
      header: "User Type"
    },
    {
      key: "status",
      header: "Status"
    },
    {
      key: "role",
      header: "Role"
    },
    {
      key: "email",
      header: "Email"
    },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )
    }
  ];

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
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-24 h-24 rounded-full border flex items-center justify-center bg-muted">
                        <User className="text-muted-foreground" size={32} />
                      </div>
                      <Button variant="outline" size="sm" className="h-9">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Profile Picture
                      </Button>
                    </div>

                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="full_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="last_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="designation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl>
                                  <Input placeholder="CEO" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" {...field} disabled />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1">You cannot change your email address</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="country_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country Code</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select country code" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="+1">+1 (US/Canada)</SelectItem>
                                    <SelectItem value="+44">+44 (UK)</SelectItem>
                                    <SelectItem value="+61">+61 (Australia)</SelectItem>
                                    <SelectItem value="+49">+49 (Germany)</SelectItem>
                                    <SelectItem value="+91">+91 (India)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="555-123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="mt-6"
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? "Updating..." : "Update Profile Details"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="company-info">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted">
                        <Image className="text-muted-foreground" size={32} />
                      </div>
                      <Button variant="outline" size="sm" className="h-9">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Company Logo
                      </Button>
                    </div>

                    <Form {...companyForm}>
                      <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={companyForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter company name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="website_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Website URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="founded_year"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Incorporation</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="2025" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registered Country</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {countryOptions.map((country) => (
                                      <SelectItem key={country} value={country}>
                                        {country}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {currencyOptions.map((currency) => (
                                      <SelectItem key={currency} value={currency}>
                                        {currency}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="company_series"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Series</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select series" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {seriesOptions.map((series) => (
                                      <SelectItem key={series} value={series}>
                                        {series}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="stage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Stage</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {stageOptions.map((stage) => (
                                      <SelectItem key={stage} value={stage}>
                                        {stage}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="sector"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Sector</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sector" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {sectorOptions.map((sector) => (
                                      <SelectItem key={sector} value={sector}>
                                        {sector}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Industry</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {industryOptions.map((industry) => (
                                      <SelectItem key={industry} value={industry}>
                                        {industry}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="business_activity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Activity</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. IT Testing Services" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="mt-6"
                          disabled={updateCompany.isPending}
                        >
                          {updateCompany.isPending ? "Updating..." : "Update Company Details"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="additional-questions">
                    <Form {...additionalQuestionsForm}>
                      <form onSubmit={additionalQuestionsForm.handleSubmit(onAdditionalQuestionsSubmit)} className="space-y-6">
                        <div className="space-y-6">
                          <FormField
                            control={additionalQuestionsForm.control}
                            name="problem_solving"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What problems are you solving?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tip: This field has a limit of 400 characters. Be concise and make every word count!"
                                    className="min-h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={additionalQuestionsForm.control}
                            name="solution"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What is your solution?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tip: This field has a limit of 400 characters. Be concise and make every word count!"
                                    className="min-h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={additionalQuestionsForm.control}
                            name="why_now"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Why Now?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tip: This field has a limit of 400 characters. Be concise and make every word count!"
                                    className="min-h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={additionalQuestionsForm.control}
                            name="business_model"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What is your Business Model?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tip: This field has a limit of 400 characters. Be concise and make every word count!"
                                    className="min-h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={additionalQuestionsForm.control}
                            name="founding_team_gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Founding Team Gender?</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {genderOptions.map((gender) => (
                                      <SelectItem key={gender} value={gender}>
                                        {gender}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="mt-6"
                          disabled={updateAdditionalQuestions.isPending}
                        >
                          {updateAdditionalQuestions.isPending ? "Submitting..." : "Submit your answers"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="social-media">
                    <Form {...socialMediaForm}>
                      <form onSubmit={socialMediaForm.handleSubmit(onSocialMediaSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={socialMediaForm.control}
                            name="linkedin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn</FormLabel>
                                <FormControl>
                                  <Input placeholder="Company LinkedIn Page URL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={socialMediaForm.control}
                            name="crunchbase"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Crunchbase</FormLabel>
                                <FormControl>
                                  <Input placeholder="Company Crunchbase URL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={socialMediaForm.control}
                            name="instagram"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram</FormLabel>
                                <FormControl>
                                  <Input placeholder="Company Instagram Page URL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={socialMediaForm.control}
                            name="twitter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Twitter</FormLabel>
                                <FormControl>
                                  <Input placeholder="Company Twitter Page URL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="mt-6"
                          disabled={updateSocialMedia.isPending}
                        >
                          {updateSocialMedia.isPending ? "Updating..." : "Update Socials"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="users">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Users</h3>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New User
                      </Button>
                    </div>
                    
                    <DataTable 
                      columns={userColumns} 
                      data={appUsersData || []}
                      emptyState={
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground mb-4">No users found</p>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New User
                          </Button>
                        </div>
                      }
                    />
                  </TabsContent>
                </Tabs>
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
