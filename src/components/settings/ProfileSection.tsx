
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { extendedSupabase } from "@/integrations/supabase/client-extension";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/integrations/supabase/client-extension";
import { useEffect } from "react";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  last_name: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  country_code: z.string().optional(),
});

interface ProfileSectionProps {
  profileData: Profile | null;
}

export function ProfileSection({ profileData }: ProfileSectionProps) {
  const { toast } = useToast();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      last_name: "",
      designation: "",
      phone: "",
      country_code: "",
    },
  });

  useEffect(() => {
    if (profileData) {
      profileForm.reset({
        full_name: profileData.full_name || "",
        last_name: profileData.last_name || "",
        designation: profileData.designation || "",
        phone: profileData.phone || "",
        country_code: profileData.country_code || "",
      });
    }
  }, [profileData, profileForm]);

  const updateProfile = useMutation({
    mutationFn: async (values: any) => {
      if (!profileData?.id) throw new Error("Profile not found");
      
      const { error } = await extendedSupabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          last_name: values.last_name,
          designation: values.designation,
          phone: values.phone,
          country_code: values.country_code,
        })
        .eq('id', profileData.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
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
    updateProfile.mutate(values);
  };

  return (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-6">
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="US" {...field} />
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
          {updateProfile.isPending ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
