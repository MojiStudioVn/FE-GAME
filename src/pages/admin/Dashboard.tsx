import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Tổng người dùng',
      value: '12,456',
      change: '+12.5%',
      trend: 'up',
      icon: <Users size={24} />,
    },
    {
      label: 'Doanh thu tháng',
      value: '₫245M',
      change: '+18.2%',
      trend: 'up',
      icon: <DollarSign size={24} />,
    },
    {
      label: 'Giao dịch hôm nay',
      value: '1,234',
      change: '+8.1%',
      trend: 'up',
      icon: <ShoppingCart size={24} />,
    },
    {
      label: 'Tỷ lệ hoạt động',
      value: '94.2%',
      change: '-2.3%',
      trend: 'down',
      icon: <Activity size={24} />,
    },
  ];

  const recentUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', joined: '2 phút trước', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', joined: '15 phút trước', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', joined: '1 giờ trước', status: 'pending' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', joined: '2 giờ trước', status: 'active' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', joined: '3 giờ trước', status: 'active' },
  ];

  const recentTransactions = [
    { id: 1, user: 'Player123', type: 'Nạp xu', amount: '+50,000đ', status: 'success', time: '5 phút trước' },
    { id: 2, user: 'GamerXYZ', type: 'Rút xu', amount: '-30,000đ', status: 'success', time: '12 phút trước' },
    { id: 3, user: 'ProGamer', type: 'Nạp xu', amount: '+100,000đ', status: 'pending', time: '25 phút trước' },
    { id: 4, user: 'MasterChief', type: 'Đổi thẻ', amount: '-50,000đ', status: 'success', time: '45 phút trước' },
    { id: 5, user: 'NinjaGamer', type: 'Nạp xu', amount: '+20,000đ', status: 'failed', time: '1 giờ trước' },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'Server load cao hơn bình thường (85%)', time: '10 phút trước' },
    { id: 2, type: 'info', message: 'Bảo trì hệ thống đã hoàn thành', time: '2 giờ trước' },
    { id: 3, type: 'error', message: '3 giao dịch thất bại cần xem xét', time: '3 giờ trước' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Admin Dashboard"
        description="Tổng quan quản trị hệ thống"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                <p className="text-2xl mb-1">{stat.value}</p>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={14} className="text-green-500" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-500" />
                  )}
                  <p className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
              <div className="text-neutral-600">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Users */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Người dùng mới</h3>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-neutral-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400 mb-1">{user.joined}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Chờ xác nhận'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Giao dịch gần đây</h3>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{tx.user}</p>
                  <p className="text-xs text-neutral-400">{tx.type}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium mb-1 ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-orange-400'}`}>
                    {tx.amount}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status === 'success' ? 'Thành công' : tx.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock size={18} />
            Cảnh báo hệ thống
          </h3>
          <Button variant="outline" size="sm">Xóa tất cả</Button>
        </div>
        <div className="space-y-3">
          {systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.type === 'error' ? 'bg-red-500/10 border-red-500/20' :
                alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                'bg-blue-500/10 border-blue-500/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <p className={`text-sm ${
                  alert.type === 'error' ? 'text-red-400' :
                  alert.type === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {alert.message}
                </p>
                <p className="text-xs text-neutral-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
