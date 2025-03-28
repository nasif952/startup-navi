
import { useState } from 'react';
import { Bell } from 'lucide-react';

export function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);

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

        <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors duration-200">
          Upgrade Now
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            N
          </div>
          <span className="font-medium hidden sm:block">NASIF AHMED</span>
        </div>
      </div>
    </div>
  );
}
