
import { useState } from 'react';
import { Bell, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  // Get user initials or default to "N"
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase();
    }
    return user ? user.email?.[0].toUpperCase() : 'N';
  };

  return (
    <div className="h-16 bg-white border-b border-border flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center">
        <h2 className="text-lg font-bold text-primary">Diamond AI</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className="text-gray-600" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-border z-50 animate-scale-in">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="p-2 text-sm text-center text-muted-foreground py-8">
                No new notifications
              </div>
            </div>
          )}
        </div>

        <Button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors duration-200">
          Upgrade Now
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  {getInitials()}
                </div>
                <span className="font-medium hidden sm:block">
                  {profile?.full_name || user.email}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNavigateToSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleLogin}>
            Log In
          </Button>
        )}
      </div>
    </div>
  );
}
