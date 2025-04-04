
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Upload } from 'lucide-react';
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { extendedSupabase } from "@/integrations/supabase/client-extension";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  last_name: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  country_code: z.string().optional(),
});

interface ProfileSectionProps {
  profileData: any;
}

export function ProfileSection({ profileData }: ProfileSectionProps) {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();

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

  const updateProfile = useMutation({
    mutationFn: async (values) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await extendedSupabase
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
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onProfileSubmit = (values: any) => {
    updateProfile.mutate(values);
  };

  return (
    <>
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
    </>
  );
}
