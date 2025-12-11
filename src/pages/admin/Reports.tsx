import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
} from 'lucide-react';

export default function AdminReports() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Dashboard stats
        const statsRes = await axios.get('/api/admin/dashboard/stats', {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.data && statsRes.data.data) {
          const s = statsRes.data.data;
          setStats([
            { label: 'Tổng người dùng', value: s.totalUsers.value, change: `+${s.totalUsers.change}`, trend: 'up' },
            { label: 'Tổng xu', value: s.totalCoins.value, change: `+${s.totalCoins.change}`, trend: 'up' },
            { label: 'Xu phát 24h', value: s.coinsDistributed24h.value, change: `+${s.coinsDistributed24h.change}`, trend: 'up' },
          ]);
          setRevenueData([
            { month: '24h', revenue: s.coinsDistributed24h.value },
            { month: 'Tổng', revenue: s.totalCoins.value },
          ]);
        }
        // Top users
        const usersRes = await axios.get('/api/admin/top-users', {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });
        if (usersRes.data && usersRes.data.data) {
          setTopUsers(usersRes.data.data.map((u: any) => ({
            username: u.username,
            spent: `${u.coins.toLocaleString()} xu`,
            transactions: u.missions || 0,
          })));
        }
        // Recent logs (mock topProducts from logs)
        const logsRes = await axios.get('/api/admin/recent-logs', {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });
        if (logsRes.data && logsRes.data.data) {
          // Group by action for topProducts (demo)
          const productMap: Record<string, { name: string; sales: number; revenue: string }> = {};
          logsRes.data.data.forEach((log: any) => {
            if (log.action && log.amount) {
              if (!productMap[log.action]) {
                productMap[log.action] = { name: log.action, sales: 0, revenue: '0 xu' };
              }
              productMap[log.action].sales += 1;
              // Parse revenue from amount string
              const match = /([+-]?\d+)/.exec(log.amount);
              if (match) {
                const rev = parseInt(match[1], 10);
                productMap[log.action].revenue = `${rev.toLocaleString()} xu`;
              }
            }
          });
          setTopProducts(Object.values(productMap).slice(0, 5));
        }
      } catch (err) {
        setStats([]);
        setRevenueData([]);
        setTopProducts([]);
        setTopUsers([]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Báo cáo & Thống kê"
        description="Phân tích dữ liệu và báo cáo tổng quan"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold mb-1">{stat.value}</p>
            <p className={`text-xs flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp size={14} />
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      {/* Period Selector & Export */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={period === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Tuần
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Tháng
          </Button>
          <Button
            variant={period === 'year' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod('year')}
          >
            Năm
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar size={16} />
            Tùy chỉnh
          </Button>
          <Button variant="primary" className="gap-2">
            <Download size={16} />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign size={18} />
              Biểu đồ doanh thu
            </h3>
            <BarChart3 size={18} className="text-neutral-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.length > 0 ? revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-pink-500 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(data.revenue / (revenueData[0]?.revenue || 1)) * 100}%` }}
                />
                <p className="text-xs text-neutral-400">{data.month}</p>
              </div>
            )) : <p className="text-neutral-400">Không có dữ liệu doanh thu</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-700">
            <p className="text-sm text-neutral-400">Doanh thu trung bình: <span className="text-white font-semibold">{revenueData.length > 0 ? `${Math.round(revenueData.reduce((sum, d) => sum + d.revenue, 0) / revenueData.length).toLocaleString()} xu/tháng` : 'Không có dữ liệu'}</span></p>
          </div>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={18} />
              Tăng trưởng người dùng
            </h3>
            <BarChart3 size={18} className="text-neutral-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.length > 0 ? [stats[0]].map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `100%` }}
                />
                <p className="text-xs text-neutral-400">Tăng trưởng</p>
              </div>
            )) : <p className="text-neutral-400">Không có dữ liệu tăng trưởng</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-700">
            <p className="text-sm text-neutral-400">Tăng trưởng trung bình: <span className="text-white font-semibold">{stats.length > 0 ? `+${stats[0].change} user/tháng` : 'Không có dữ liệu'}</span></p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <h3 className="font-semibold mb-4">Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-neutral-400">{product.sales} lượt bán</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{product.revenue}</p>
              </div>
            )) : <p className="text-neutral-400">Không có dữ liệu sản phẩm</p>}
          </div>
        </Card>

        {/* Top Users */}
        <Card>
          <h3 className="font-semibold mb-4">Người dùng chi tiêu nhiều nhất</h3>
          <div className="space-y-3">
            {topUsers.length > 0 ? topUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-neutral-600 text-neutral-300' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-neutral-700 text-neutral-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-neutral-400">{user.transactions} giao dịch</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{user.spent}</p>
              </div>
            )) : <p className="text-neutral-400">Không có dữ liệu người dùng</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
