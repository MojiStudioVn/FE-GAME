import { useState } from 'react';
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

  const stats = [
    { label: 'Doanh thu tháng này', value: '₫245M', change: '+18.2%', trend: 'up' },
    { label: 'Người dùng mới', value: '1,234', change: '+12.5%', trend: 'up' },
    { label: 'Tổng giao dịch', value: '5,678', change: '+8.1%', trend: 'up' },
    { label: 'Tỷ lệ chuyển đổi', value: '3.2%', change: '+0.5%', trend: 'up' },
  ];

  const revenueData = [
    { month: 'T1', revenue: 180 },
    { month: 'T2', revenue: 195 },
    { month: 'T3', revenue: 210 },
    { month: 'T4', revenue: 185 },
    { month: 'T5', revenue: 220 },
    { month: 'T6', revenue: 245 },
  ];

  const topProducts = [
    { name: 'Gói 1000 xu', sales: 234, revenue: '₫22.2M' },
    { name: 'Gói 500 xu', sales: 189, revenue: '₫9.5M' },
    { name: 'Thẻ Garena 100k', sales: 156, revenue: '₫15.6M' },
    { name: 'Gói 2000 xu', sales: 98, revenue: '₫17.6M' },
    { name: 'Thẻ Vcoin 50k', sales: 87, revenue: '₫4.4M' },
  ];

  const topUsers = [
    { username: 'phoenixrising', spent: '₫1.2M', transactions: 45 },
    { username: 'masterchief', spent: '₫980K', transactions: 38 },
    { username: 'dragonslayer', spent: '₫850K', transactions: 32 },
    { username: 'gamerxyz', spent: '₫720K', transactions: 28 },
    { username: 'thunderstrike', spent: '₫650K', transactions: 25 },
  ];

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
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-pink-500 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(data.revenue / 245) * 100}%` }}
                />
                <p className="text-xs text-neutral-400">{data.month}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-700">
            <p className="text-sm text-neutral-400">Doanh thu trung bình: <span className="text-white font-semibold">₫205M/tháng</span></p>
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
            {[120, 145, 168, 152, 189, 210].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(value / 210) * 100}%` }}
                />
                <p className="text-xs text-neutral-400">T{index + 1}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-700">
            <p className="text-sm text-neutral-400">Tăng trưởng trung bình: <span className="text-white font-semibold">+164 user/tháng</span></p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <h3 className="font-semibold mb-4">Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
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
            ))}
          </div>
        </Card>

        {/* Top Users */}
        <Card>
          <h3 className="font-semibold mb-4">Người dùng chi tiêu nhiều nhất</h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
