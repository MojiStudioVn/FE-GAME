import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TrendingUp, Users, Coins, Target, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  amount: string;
  time: string;
  status: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(0);
  const [totalMissions, setTotalMissions] = useState<number>(0);
  const [usersOnline, setUsersOnline] = useState<number>(0);
  const [rank, setRank] = useState<number | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchUserDashboard();
  }, []);

  const fetchUserDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem dashboard');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/auth/me/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Không thể tải dữ liệu');
      }

      const data = await res.json();
      const d = data.data;

      setCoins(d.coins || 0);
      setMissionsCompleted(d.missionsCompleted || 0);
      setTotalMissions(d.totalMissions || 0);
      setUsersOnline(d.usersOnline || 0);
      setRank(d.rank || null);
      setRecentActivities(d.recentActivities || []);
    } catch (err) {
      console.error('Error fetching user dashboard:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
        <PageHeader title="Trang chủ" description="Chào mừng bạn trở lại!" />
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-blue-500" size={36} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
        <PageHeader title="Trang chủ" description="Chào mừng bạn trở lại!" />
        <Card className="border-red-500/20 bg-red-500/10">
          <p className="text-red-400">{error}</p>
          <Button className="mt-4" onClick={fetchUserDashboard}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: 'Tổng xu', value: coins.toLocaleString(), icon: <Coins size={24} />, trend: '' },
    { label: 'Nhiệm vụ đã hoàn thành', value: (missionsCompleted || 0).toLocaleString(), icon: <Target size={24} />, trend: '' },
    { label: 'Người dùng online', value: usersOnline.toLocaleString(), icon: <Users size={24} />, trend: '' },
    { label: 'Xếp hạng', value: rank ? `#${rank}` : '-', icon: <TrendingUp size={24} />, trend: '' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Trang chủ"
        description="Chào mừng bạn trở lại!"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                <p className="text-2xl mb-1">{stat.value}</p>
                <p className="text-xs text-green-500">{stat.trend}</p>
              </div>
              <div className="text-neutral-600">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="secondary" className="w-full justify-center">Điểm danh</Button>
          <Button variant="secondary" className="w-full justify-center">Nhận thẻ</Button>
          <Button variant="secondary" className="w-full justify-center">Nhiệm vụ</Button>
          <Button variant="secondary" className="w-full justify-center">Mini game</Button>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg mb-4">Hoạt động gần đây</h2>
        <Card>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between pb-4 border-b border-neutral-800 last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm mb-1">{activity.action}</p>
                  <p className="text-xs text-neutral-500">{activity.time}</p>
                </div>
                <span className={`text-sm ${activity.amount.startsWith('+') ? 'text-green-500' : 'text-orange-400'}`}>{activity.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
