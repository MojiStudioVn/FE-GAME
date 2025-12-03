import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  MoreVertical,
  Ban,
  UserCheck,
  Edit2,
  Trash2,
} from 'lucide-react';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const users = [
    {
      id: 1,
      username: 'player123',
      email: 'player123@example.com',
      coins: 1250,
      joinDate: '2024-11-15',
      lastActive: '2 phút trước',
      status: 'active',
      role: 'user',
    },
    {
      id: 2,
      username: 'gamerxyz',
      email: 'gamerxyz@example.com',
      coins: 3420,
      joinDate: '2024-10-20',
      lastActive: '1 giờ trước',
      status: 'active',
      role: 'user',
    },
    {
      id: 3,
      username: 'progamer',
      email: 'progamer@example.com',
      coins: 850,
      joinDate: '2024-11-28',
      lastActive: '5 giờ trước',
      status: 'banned',
      role: 'user',
    },
    {
      id: 4,
      username: 'masterchief',
      email: 'master@example.com',
      coins: 5200,
      joinDate: '2024-09-10',
      lastActive: '10 phút trước',
      status: 'active',
      role: 'vip',
    },
    {
      id: 5,
      username: 'ninjagamer',
      email: 'ninja@example.com',
      coins: 2100,
      joinDate: '2024-11-01',
      lastActive: '1 ngày trước',
      status: 'inactive',
      role: 'user',
    },
    {
      id: 6,
      username: 'dragonslayer',
      email: 'dragon@example.com',
      coins: 980,
      joinDate: '2024-11-22',
      lastActive: '3 giờ trước',
      status: 'active',
      role: 'user',
    },
    {
      id: 7,
      username: 'phoenixrising',
      email: 'phoenix@example.com',
      coins: 4500,
      joinDate: '2024-08-15',
      lastActive: '30 phút trước',
      status: 'active',
      role: 'vip',
    },
    {
      id: 8,
      username: 'thunderstrike',
      email: 'thunder@example.com',
      coins: 320,
      joinDate: '2024-11-30',
      lastActive: '2 ngày trước',
      status: 'pending',
      role: 'user',
    },
  ];

  const stats = [
    { label: 'Tổng người dùng', value: users.length },
    { label: 'Hoạt động', value: users.filter(u => u.status === 'active').length },
    { label: 'Bị khóa', value: users.filter(u => u.status === 'banned').length },
    { label: 'VIP', value: users.filter(u => u.role === 'vip').length },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản và quyền hạn người dùng"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters & Actions */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="banned">Bị khóa</option>
            <option value="pending">Chờ xác nhận</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Bộ lọc
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Xuất Excel
          </Button>
          <Button variant="primary" className="gap-2">
            <UserPlus size={16} />
            Thêm người dùng
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Tên đăng nhập</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Xu</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Ngày tham gia</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Hoạt động</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Vai trò</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm">#{user.id}</td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium">{user.username}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-400">{user.email}</td>
                  <td className="py-3 px-4 text-sm font-medium">{user.coins.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-neutral-400">{user.joinDate}</td>
                  <td className="py-3 px-4 text-sm text-neutral-400">{user.lastActive}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'vip' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-neutral-700 text-neutral-300'
                    }`}>
                      {user.role === 'vip' ? 'VIP' : 'User'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'banned' ? 'bg-red-500/20 text-red-400' :
                      user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-neutral-700 text-neutral-400'
                    }`}>
                      {user.status === 'active' ? 'Hoạt động' :
                       user.status === 'banned' ? 'Bị khóa' :
                       user.status === 'pending' ? 'Chờ' :
                       'Không hoạt động'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-neutral-700 rounded transition-colors" title="Chỉnh sửa">
                        <Edit2 size={16} className="text-neutral-400" />
                      </button>
                      {user.status === 'banned' ? (
                        <button className="p-1 hover:bg-neutral-700 rounded transition-colors" title="Mở khóa">
                          <UserCheck size={16} className="text-green-400" />
                        </button>
                      ) : (
                        <button className="p-1 hover:bg-neutral-700 rounded transition-colors" title="Khóa tài khoản">
                          <Ban size={16} className="text-red-400" />
                        </button>
                      )}
                      <button className="p-1 hover:bg-neutral-700 rounded transition-colors" title="Xóa">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                      <button className="p-1 hover:bg-neutral-700 rounded transition-colors" title="Thêm">
                        <MoreVertical size={16} className="text-neutral-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-700">
          <p className="text-sm text-neutral-400">Hiển thị 1-8 trong tổng số 8 người dùng</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Trước</Button>
            <Button variant="primary" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Sau</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
