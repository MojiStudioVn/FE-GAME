import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Users,
  Coins,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Trophy,
  Shield,
  FileText,
  Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Stats {
  totalUsers: {
    value: number;
    change: number;
    changePercent: string;
  };
  totalCoins: {
    value: number;
    change: number;
    changePercent: string;
  };
  coinsDistributed24h: {
    value: number;
    change: number;
    changePercent: string;
  };
}

interface TopUser {
  _id: string;
  username: string;
  email: string;
  coins: number;
  rank: number;
  missions: number;
  lastActive: string;
  badge: string | null;
}

interface ActivityLog {
  id: string;
  type: string;
  user: string;
  action: string;
  amount: string;
  time: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel
      const [statsRes, usersRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard/stats`, { headers, credentials: 'include' }),
        fetch(`${API_URL}/admin/top-users?limit=5`, { headers, credentials: 'include' }),
        fetch(`${API_URL}/admin/recent-logs?limit=20`, { headers, credentials: 'include' }),
      ]);

      if (!statsRes.ok || !usersRes.ok || !logsRes.ok) {
        throw new Error('Không thể tải dữ liệu');
      }

      const [statsData, usersData, logsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        logsRes.json(),
      ]);

      setStats(statsData.data);
      setTopUsers(usersData.data);
      setRecentLogs(logsData.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = stats ? [
    {
      label: 'Tổng users',
      value: stats.totalUsers.value.toLocaleString(),
      description: 'Người dùng đã đăng ký',
      change: `+${stats.totalUsers.change}`,
      icon: <Users size={24} />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Tổng xu trong hệ thống',
      value: stats.totalCoins.value.toLocaleString(),
      description: 'Tổng xu của tất cả users',
      change: `+${stats.totalCoins.change.toLocaleString()}`,
      icon: <Coins size={24} />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Xu được phát trong 24h',
      value: stats.coinsDistributed24h.value.toLocaleString(),
      description: 'Xu phát qua nhiệm vụ & sự kiện',
      change: `+${stats.coinsDistributed24h.change.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ] : [];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'mission':
        return <Activity size={16} className="text-blue-400" />;
      case 'exchange':
        return <ArrowUpRight size={16} className="text-orange-400" />;
      case 'referral':
        return <Users size={16} className="text-purple-400" />;
      case 'checkin':
        return <Shield size={16} className="text-green-400" />;
      case 'purchase':
        return <Coins size={16} className="text-yellow-400" />;
      case 'game':
        return <Trophy size={16} className="text-pink-400" />;
      case 'admin':
        return <FileText size={16} className="text-cyan-400" />;
      default:
        return <Activity size={16} className="text-neutral-400" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-yellow-500', text: 'text-black', label: '#1' };
    if (rank === 2) return { bg: 'bg-gray-400', text: 'text-black', label: '#2' };
    if (rank === 3) return { bg: 'bg-orange-500', text: 'text-black', label: '#3' };
    return { bg: 'bg-neutral-700', text: 'text-white', label: `#${rank}` };
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
        <PageHeader
          title="Admin Dashboard"
          description="Thống kê tổng quan hệ thống"
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
        <PageHeader
          title="Admin Dashboard"
          description="Thống kê tổng quan hệ thống"
        />
        <Card className="border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-2">{error}</p>
          {error.includes('403') || error.includes('Forbidden') ? (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm mb-2">
                ⚠️ Bạn không có quyền truy cập trang này. Chỉ admin mới có thể xem.
              </p>
              <p className="text-neutral-400 text-xs">
                Nếu bạn là admin, vui lòng đăng xuất và đăng nhập lại để cập nhật quyền.
              </p>
            </div>
          ) : null}
          <Button onClick={fetchDashboardData} className="mt-4">Thử lại</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Admin Dashboard"
        description="Thống kê tổng quan hệ thống"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsConfig && statsConfig.length > 0 ? statsConfig.map((stat, index) => (
          <Card key={index} className="border-neutral-700">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <ArrowUpRight size={14} />
                <span className="text-xs">{stat.change}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.description}</p>
            </div>
          </Card>
        )) : (
          <div className="col-span-3 text-center py-8 text-neutral-500">
            Đang tải dữ liệu thống kê...
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top Users */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" />
              Top users có nhiều xu nhất
            </h3>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </div>
          <div className="space-y-3">
            {topUsers.map((user) => {
              const badge = getRankBadge(user.rank);
              return (
                <div key={user._id} className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                  <div className={`w-10 h-10 ${badge.bg} ${badge.text} rounded-lg flex items-center justify-center font-bold flex-shrink-0`}>
                    {badge.label}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      {user.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.badge === 'VIP' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{user.missions} nhiệm vụ • {user.lastActive}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400">{user.coins.toLocaleString()} xu</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity Logs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText size={20} className="text-cyan-400" />
              Logs hoạt động gần đây
            </h3>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors">
                <div className="mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-medium text-neutral-300">{log.user}</p>
                    <span className={`text-xs font-semibold ${
                      log.amount.startsWith('+') ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {log.amount}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-1">{log.action}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-600">{log.time}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                      log.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {log.status === 'success' ? 'Thành công' : log.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full Activity Logs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            Tất cả logs hoạt động
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Xuất CSV</Button>
            <Button variant="outline" size="sm">Lọc</Button>
          </div>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
              <div className="mt-0.5">
                {getLogIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{log.user}</p>
                    <span className="text-xs text-neutral-600">•</span>
                    <span className="text-xs text-neutral-500 capitalize">{log.type}</span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    log.amount.startsWith('+') ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {log.amount}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 mb-1">{log.action}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">{log.time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    log.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {log.status === 'success' ? 'Thành công' : log.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
