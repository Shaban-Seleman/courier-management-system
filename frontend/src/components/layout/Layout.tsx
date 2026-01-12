import React, { useState, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Search, 
  Bell, 
  Menu, 
  X,
  Settings,
  CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Shipments', href: '/shipments', icon: Package },
  { name: 'Couriers', href: '/couriers', icon: Truck },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar component */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-logistics-600 rounded-lg">
                    <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">Courier<span className="text-logistics-600">CMS</span></span>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="ml-auto lg:hidden text-slate-500 hover:text-slate-700"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                  isActive
                    ? "bg-logistics-50 text-logistics-700 dark:bg-logistics-900/20 dark:text-logistics-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive 
                      ? "text-logistics-600 dark:text-logistics-400" 
                      : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              className="w-10 h-10 rounded-full bg-slate-100"
              src="https://ui-avatars.com/api/?name=Alex+Dispatcher&background=0ea5e9&color=fff"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                Alex Dispatcher
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                alex@couriercms.com
              </p>
            </div>
            <Link to="/settings" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
            type="button" 
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Global Search */}
        <div className="relative hidden md:block w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
                type="text"
                className="block w-full py-2 pl-10 pr-3 text-sm placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-logistics-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Search shipments, drivers, or customers..." 
            />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2 cursor-pointer">
             <div className="h-8 w-8 rounded-full bg-logistics-100 flex items-center justify-center text-logistics-700 font-semibold text-sm">
                AD
             </div>
        </div>
      </div>
    </header>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
