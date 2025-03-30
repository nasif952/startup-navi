
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Users, 
  FileText, 
  FolderClosed, 
  Menu, 
  X,
  Presentation,
  ClipboardCheck,
  PieChart
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Valuation', path: '/valuation', icon: TrendingUp },
  { name: 'Financial Overview', path: '/financial-overview', icon: FileText },
  { name: 'Performance', path: '/performance', icon: BarChart3 },
  { name: 'Cap Table', path: '/cap-table', icon: Users },
  { name: 'Data Room', path: '/data-room', icon: FolderClosed },
  { name: 'Pitch Deck Analysis', path: '/pitch-deck-analysis', icon: Presentation },
  { name: 'Due Diligence', path: '/due-diligence', icon: ClipboardCheck },
  { name: 'Investor Dashboard', path: '/investor-dashboard', icon: PieChart },
];

export function SidebarNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar text-white"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out overflow-y-auto",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen && isMobile,
          }
        )}
      >
        <div className="p-5">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold">StartupHub</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group",
                    isActive
                      ? "bg-sidebar-active text-sidebar-active-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-white/10"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "mr-3 transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-sidebar-active-foreground" : "text-sidebar-foreground"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
