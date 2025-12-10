import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Calendar,
  CreditCard,
  Target,
  Users,
  RefreshCw,
  History,
  Trophy,
  Gamepad2,
  DollarSign,
  Search,
  ShoppingCart,
  MessageCircle,
  User,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Trang chủ', icon: <Home size={20} /> },
  { path: '/dashboard/profile', label: 'Hồ sơ', icon: <User size={20} /> },
  { path: '/dashboard/daily-checkin', label: 'Điểm danh mỗi ngày', icon: <Calendar size={20} /> },
  { path: '/dashboard/missions', label: 'Nhiệm vụ', icon: <Target size={20} /> },
  { path: '/dashboard/invite-friends', label: 'Mời bạn bè', icon: <Users size={20} /> },
  { path: '/dashboard/exchange-account', label: 'Đổi ACC', icon: <RefreshCw size={20} /> },
  { path: '/dashboard/history', label: 'Lịch sử', icon: <History size={20} /> },
  { path: '/dashboard/leaderboard', label: 'Bảng xếp hạng', icon: <Trophy size={20} /> },
  { path: '/dashboard/minigame', label: 'Mini game', icon: <Gamepad2 size={20} /> },
  { path: '/dashboard/buy-coins', label: 'Mua xu', icon: <DollarSign size={20} /> },
  { path: '/dashboard/find-account', label: 'Tìm ACC theo Skin', icon: <Search size={20} /> },
  { path: '/dashboard/buy-auction', label: 'Mua/Đấu giá ACC', icon: <ShoppingCart size={20} /> },
  { path: '/dashboard/chat', label: 'Box chat cộng đồng', icon: <MessageCircle size={20} /> },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const item = menuItems.find(m => m.path === path);
    return item ? item.label : 'Trang chủ';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 rounded-lg border border-neutral-800"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Breadcrumb - Mobile */}
      <div className="lg:hidden fixed top-4 left-16 right-4 z-40 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Home size={16} className="text-neutral-400" />
          <ChevronRight size={14} className="text-neutral-600" />
          <span className="text-white truncate">{getBreadcrumbs()}</span>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl tracking-tight">Game Platform</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-black'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <NavLink
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm">{user?.username || 'Guest'}</p>
              <p className="text-xs text-neutral-500">{user?.coins?.toLocaleString() || 0} xu</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
