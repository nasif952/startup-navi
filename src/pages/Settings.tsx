
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Image, Upload, User } from 'lucide-react';

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
});

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  designation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  country_code: z.string().optional(),
});

export default function Settings() {
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("company-details");

  // Company form
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
    },
  });

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      designation: "",
      phone: "",
      email: user?.email || "",
      country_code: "",
    },
  });

  // Fetch company data
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

  // Update company form when data is loaded
  if (companyData && !isCompanyLoading) {
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
    });
  }

  // Update company mutation
  const updateCompany = useMutation({
    mutationFn: async (values) => {
      const { error } = await supabase
        .from('companies')
        .update(values)
        .eq('id', companyData?.id);
      
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

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
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

  const onCompanySubmit = (values) => {
    updateCompany.mutate(values);
  };

  const onProfileSubmit = (values) => {
    updateProfile.mutate(values);
  };

  // Industry options
  const industryOptions = [
    "Business Support Services",
    "Software & IT Services",
    "Healthcare",
    "Financial Services",
    "E-commerce",
    "Education",
    "Manufacturing",
    "Transportation",
  ];

  // Stage options
  const stageOptions = [
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C",
    "Series D",
    "Growth",
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
            value="profile-details" 
            className={`px-6 py-3 rounded-none ${activeTab === 'profile-details' ? 'border-b-2 border-primary' : ''}`}
          >
            Profile Details
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className={`px-6 py-3 rounded-none ${activeTab === 'billing' ? 'border-b-2 border-primary' : ''}`}
          >
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company-details">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registered Country</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
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
                            <FormLabel>Founded Year</FormLabel>
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
                        name="sector"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Sector</FormLabel>
                            <FormControl>
                              <Input placeholder="Software & IT Services" {...field} />
                            </FormControl>
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
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Additional Questions</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What problems are you solving?
                    </label>
                    <textarea 
                      className="w-full border rounded-md h-32 p-2 text-sm"
                      placeholder="Tip: This field has a limit of 400 characters. Be concise and make every word count!"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What is your solution?
                    </label>
                    <textarea 
                      className="w-full border rounded-md h-32 p-2 text-sm"
                      placeholder="Tip: This field has a limit of 400 characters. Be concise and make every word count!"
                    />
                  </div>
                </div>
                
                <Button className="mt-6">
                  Update Additional Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile-details">
          <Card>
            <CardContent className="pt-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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

                    <div className="grid grid-cols-4 gap-2">
                      <FormField
                        control={profileForm.control}
                        name="country_code"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input placeholder="+1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="555-123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  );
}
