import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TrendingUp, Users, Coins, Target } from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'Tổng xu', value: '1,250', icon: <Coins size={24} />, trend: '+12%' },
    { label: 'Nhiệm vụ hoàn thành', value: '24/30', icon: <Target size={24} />, trend: '+5' },
    { label: 'Người dùng online', value: '2,456', icon: <Users size={24} />, trend: '+8%' },
    { label: 'Xếp hạng', value: '#42', icon: <TrendingUp size={24} />, trend: '+3' },
  ];

  const recentActivities = [
    { id: 1, title: 'Hoàn thành nhiệm vụ "Đăng nhập 7 ngày"', time: '5 phút trước', coins: '+50 xu' },
    { id: 2, title: 'Nhận thẻ game Garena 50k', time: '1 giờ trước', coins: '-500 xu' },
    { id: 3, title: 'Mời thành công 1 bạn bè', time: '2 giờ trước', coins: '+100 xu' },
    { id: 4, title: 'Thắng Mini game - Vòng quay may mắn', time: '3 giờ trước', coins: '+30 xu' },
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
                  <p className="text-sm mb-1">{activity.title}</p>
                  <p className="text-xs text-neutral-500">{activity.time}</p>
                </div>
                <span className="text-sm text-green-500">{activity.coins}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
