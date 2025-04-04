
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { extendedSupabase } from "@/integrations/supabase/client-extension";
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/integrations/supabase/client-extension";
import { useEffect } from "react";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  business_activity: z.string().optional(),
  industry: z.string().optional(),
  stage: z.string().optional(),
  total_employees: z.coerce.number().optional(),
  founded_year: z.coerce.number().optional(),
  website_url: z.string().url("Invalid URL").optional().or(z.literal('')),
  country: z.string().optional(),
  currency: z.string().optional(),
  sector: z.string().optional(),
  company_series: z.string().optional(),
});

interface CompanyInfoSectionProps {
  companyData: Company | null;
}

export function CompanyInfoSection({ companyData }: CompanyInfoSectionProps) {
  const { toast } = useToast();

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      business_activity: "",
      industry: "",
      stage: "",
      total_employees: 0,
      founded_year: 0,
      website_url: "",
      country: "",
      currency: "",
      sector: "",
      company_series: "",
    },
  });

  useEffect(() => {
    if (companyData) {
      companyForm.reset({
        name: companyData.name || "",
        business_activity: companyData.business_activity || "",
        industry: companyData.industry || "",
        stage: companyData.stage || "",
        total_employees: companyData.total_employees || 0,
        founded_year: companyData.founded_year || 0,
        website_url: companyData.website_url || "",
        country: companyData.country || "",
        currency: companyData.currency || "",
        sector: companyData.sector || "",
        company_series: companyData.company_series || "",
      });
    }
  }, [companyData, companyForm]);

  const updateCompany = useMutation({
    mutationFn: async (values: any) => {
      if (!companyData?.id) throw new Error("Company not found");
      
      const { error } = await extendedSupabase
        .from('companies')
        .update({
          name: values.name,
          business_activity: values.business_activity,
          industry: values.industry,
          stage: values.stage,
          total_employees: values.total_employees,
          founded_year: values.founded_year,
          website_url: values.website_url,
          country: values.country,
          currency: values.currency,
          sector: values.sector,
          company_series: values.company_series,
        })
        .eq('id', companyData.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Company updated",
        description: "Your company information has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: any) => {
    updateCompany.mutate(values);
  };

  return (
    <Form {...companyForm}>
      <form onSubmit={companyForm.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={companyForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
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
                <FormLabel>Business Activity</FormLabel>
                <FormControl>
                  <Input placeholder="Software Development" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={companyForm.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
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
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
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
                    <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={companyForm.control}
            name="total_employees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Employees</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
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
                  <Input type="number" placeholder="2020" {...field} />
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
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
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
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="United States" {...field} />
                </FormControl>
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
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
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
                <FormLabel>Sector</FormLabel>
                <FormControl>
                  <Input placeholder="SaaS" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="Series A" {...field} />
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
  );
}
