import { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Shield,
  Wallet,
  Gift,
  Link2,
  Target,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  user?: {
    role: string;
  };
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show admin menu if user is admin
  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin
    ? [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        {
          label: 'Quản lý ACC',
          icon: Upload,
          children: [
            { path: '/admin/upload-accounts', label: 'Upload ACC' },
            { path: '/admin/accounts', label: 'Danh sách tài khoản' },
          ],
        },
        { path: '/admin/users', icon: Users, label: 'Người dùng' },
        { path: '/admin/transactions', icon: CreditCard, label: 'Giao dịch' },
        { path: '/admin/reports', icon: BarChart3, label: 'Báo cáo' },
        { path: '/admin/payment-settings', icon: Wallet, label: 'Thanh toán' },
        { path: '/admin/missions', icon: Target, label: 'Nhiệm vụ' },
        { path: '/admin/gift-tokens', icon: Gift, label: 'Mã quà tặng' },
        { path: '/admin/api-providers', icon: Link2, label: 'Nhà cung cấp API' },
        { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
      ]
    : [];

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/');
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const item = menuItems.find(m => m.path === path);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 rounded-lg border border-neutral-800"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Breadcrumb - Mobile */}
      <div className="lg:hidden fixed top-4 left-16 right-4 z-40 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Shield size={16} className="text-neutral-400" />
          <ChevronRight size={14} className="text-neutral-600" />
          <span className="text-white truncate">{getBreadcrumbs()}</span>
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${isSidebarOpen ? 'w-64' : 'w-20 lg:w-20'}
          bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex flex-col
          transform
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          {(isSidebarOpen || isMobileMenuOpen) && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:block p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            // If item has children, render a collapsible group
            if ((item as any).children) {
              const children = (item as any).children as Array<any>;
              const Icon = item.icon as any;
              const open = expandedMenu === item.label;

              return (
                <div key={item.label}>
                  <button
                    onClick={() => setExpandedMenu(open ? null : (item.label as string))}
                    className={`flex items-center justify-between gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                      open ? 'bg-white text-black' : 'hover:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={20} />}
                      {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">{item.label}</span>}
                    </div>
                    {(isSidebarOpen || isMobileMenuOpen) && (
                      <ChevronDown size={16} className={`transform transition-transform ${open ? 'rotate-180' : 'rotate-0'}`} />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ease-linear ${
                      open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-6 mt-2 space-y-1 py-1">
                      {children.map((c) => (
                        <NavLink
                          key={c.path}
                          to={c.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-3 py-1 rounded-md text-sm transition-colors ${
                              isActive ? 'bg-white text-black' : 'hover:bg-neutral-800 text-neutral-400'
                            }`
                          }
                        >
                          {(isSidebarOpen || isMobileMenuOpen) && <span>{c.label}</span>}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            const Icon = item.icon as any;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-black'
                      : 'hover:bg-neutral-800 text-neutral-400'
                  }`
                }
              >
                {Icon && <Icon size={20} />}
                {(isSidebarOpen || isMobileMenuOpen) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 text-red-400 transition-colors w-full"
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobileMenuOpen) && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-black pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
