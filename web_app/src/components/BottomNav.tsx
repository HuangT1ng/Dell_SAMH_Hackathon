import React from 'react';
import { Home, MessageCircle, Gamepad2, Calendar, BarChart3, User, LogOut } from 'lucide-react';
import { useSession } from '../utils/sessionContext';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useSession();

  // Define navigation items based on account type
  const getNavItems = () => {
    const commonItems = [
      { id: 'home', label: 'Home', icon: Home },
    ];

    if (user?.accountType === 'admin') {
      return [
        ...commonItems,
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
      ];
    } else if (user?.accountType === 'user') {
      return [
        ...commonItems,
        { id: 'gaming', label: 'Games', icon: Gamepad2 },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'community', label: 'Community', icon: Calendar },
      ];
    } else {
      // Default items for non-logged-in users
      return [
        ...commonItems,
        { id: 'gaming', label: 'Games', icon: Gamepad2 },
        { id: 'community', label: 'Community', icon: Calendar },
        { id: 'login', label: 'Login', icon: User },
      ];
    }
  };

  const navItems = getNavItems();

  if (!user) {
    // Don't show bottom nav if user is not logged in
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-between py-2 px-4">
        {/* Navigation Items */}
        <div className="flex items-center justify-around flex-1 max-w-md mx-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                currentView === id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${
                currentView === id ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className={`text-xs font-medium ${
                currentView === id ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-200 text-red-600 ml-4"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
