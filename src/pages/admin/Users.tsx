import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Search,
  Filter,
  Download,
  Ban,
  Edit2,
  Plus,
  Minus,
  Loader2,
  X,
  Coins,
  DollarSign,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  _id: string;
  username: string;
  email: string;
  coins: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  totalCoins: number;
  byRole: Array<{ _id: string; count: number }>;
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [coinReason, setCoinReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [editFormData, setEditFormData] = useState({ username: '', email: '', role: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (searchQuery) params.append('search', searchQuery);
      if (filterRole !== 'all') params.append('role', filterRole);

      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.data);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, filterRole]);

  const handleAdjustCoins = async (type: 'add' | 'subtract') => {
    if (!selectedUser || !coinAmount) return;

    try {
      setAdjusting(true);
      const token = localStorage.getItem('token');
      const amount = type === 'add' ? Number(coinAmount) : -Number(coinAmount);

      const response = await fetch(`${API_URL}/admin/users/${selectedUser._id}/adjust-coins`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason: coinReason || 'Admin điều chỉnh thủ công',
        }),
      });

      if (!response.ok) throw new Error('Failed to adjust coins');

      await fetchUsers();
      setShowCoinModal(false);
      setCoinAmount('');
      setCoinReason('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error adjusting coins:', error);
    } finally {
      setAdjusting(false);
    }
  };

  const openCoinModal = (user: User) => {
    console.log('Opening modal for user:', user.username); // Debug log
    setSelectedUser(user);
    setShowCoinModal(true);
    setCoinAmount('');
    setCoinReason('');
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      newPassword: '',
    });
    setShowEditModal(true);
  };

  const handleBanUser = async (user: User) => {
    const isBanned = user.role === 'banned';
    setConfirmAction({
      title: isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      message: `Bạn có chắc muốn ${isBanned ? 'mở khóa' : 'khóa'} tài khoản ${user.username}?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const newStatus = isBanned ? 'active' : 'banned';

          const response = await fetch(`${API_URL}/admin/users/${user._id}/status`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          });

          if (!response.ok) throw new Error('Failed to update user status');

          await fetchUsers();
          setShowConfirmModal(false);
        } catch (error) {
          console.error('Error updating user status:', error);
          alert('Có lỗi xảy ra!');
        }
      },
    });
    setShowConfirmModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      // Update user info
      const response = await fetch(`${API_URL}/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editFormData.username,
          email: editFormData.email,
          role: editFormData.role,
        }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      // Reset password if provided
      if (editFormData.newPassword) {
        const pwdResponse = await fetch(`${API_URL}/admin/users/${selectedUser._id}/reset-password`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPassword: editFormData.newPassword }),
        });

        if (!pwdResponse.ok) throw new Error('Failed to reset password');
      }

      await fetchUsers();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setConfirmAction({
      title: 'Xóa tài khoản',
      message: `Bạn có chắc muốn xóa vĩnh viễn tài khoản ${user.username}? Hành động này không thể hoàn tác!`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');

          const response = await fetch(`${API_URL}/admin/users/${user._id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error('Failed to delete user');

          await fetchUsers();
          setShowConfirmModal(false);
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Có lỗi xảy ra!');
        }
      },
    });
    setShowConfirmModal(true);
  };

  const handleExportExcel = () => {
    // Tạo CSV content từ users data
    const headers = ['ID', 'Username', 'Email', 'Xu', 'Vai trò', 'Ngày tạo', 'Cập nhật'];
    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user._id,
        user.username,
        user.email,
        user.coins,
        user.role === 'admin' ? 'Admin' : 'User',
        new Date(user.createdAt).toLocaleDateString('vi-VN'),
        new Date(user.updatedAt).toLocaleDateString('vi-VN'),
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statsData = stats ? [
    { label: 'Tổng người dùng', value: stats.total },
    { label: 'Tổng xu hệ thống', value: stats.totalCoins.toLocaleString() },
    { label: 'Admin', value: stats.byRole.find(r => r._id === 'admin')?.count || 0 },
    { label: 'User', value: stats.byRole.find(r => r._id === 'user')?.count || 0 },
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản và quyền hạn người dùng"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
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
              placeholder="Tìm kiếm theo username, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Bộ lọc
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportExcel}
            disabled={users.length === 0}
          >
            <Download size={16} />
            Xuất Excel
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Username</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Xu</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Vai trò</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Ngày tạo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium">{user.username}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-yellow-400">{user.coins.toLocaleString()}</span>
                          <Coins size={14} className="text-yellow-400" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-700 text-neutral-300'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 size={16} className="text-neutral-400" />
                          </button>
                          <button
                            onClick={() => openCoinModal(user)}
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                            title="Điều chỉnh xu"
                          >
                            <DollarSign size={16} className="text-green-400" />
                          </button>
                          <button
                            onClick={() => handleBanUser(user)}
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                            title={user.role === 'banned' ? 'Mở khóa' : 'Khóa tài khoản'}
                          >
                            <Ban size={16} className="text-red-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={16} className="text-red-600" />
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
              <p className="text-sm text-neutral-400">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trước
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Coin Adjustment Modal */}
      {showCoinModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowCoinModal(false)}>
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-md border border-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Điều chỉnh xu - {selectedUser.username}</h3>
              <button
                onClick={() => setShowCoinModal(false)}
                className="p-1 hover:bg-neutral-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-neutral-400 mb-2">Số xu hiện tại:</p>
              <p className="text-2xl font-bold text-yellow-400">{selectedUser.coins.toLocaleString()} xu</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">Số xu điều chỉnh:</label>
              <input
                type="number"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                placeholder="Nhập số xu..."
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-neutral-400 mb-2">Lý do (tùy chọn):</label>
              <textarea
                value={coinReason}
                onChange={(e) => setCoinReason(e.target.value)}
                placeholder="Nhập lý do điều chỉnh..."
                rows={3}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleAdjustCoins('add')}
                disabled={!coinAmount || adjusting}
                className="flex-1 bg-green-500 hover:bg-green-600 gap-2"
              >
                {adjusting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Cộng xu
              </Button>
              <Button
                onClick={() => handleAdjustCoins('subtract')}
                disabled={!coinAmount || adjusting}
                className="flex-1 bg-red-500 hover:bg-red-600 gap-2"
              >
                {adjusting ? <Loader2 className="animate-spin" size={16} /> : <Minus size={16} />}
                Trừ xu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowEditModal(false)}>
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-2xl border border-neutral-700 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Thông tin người dùng</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-neutral-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">ID</label>
                  <input
                    type="text"
                    value={selectedUser._id}
                    disabled
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Mật khẩu mới (tùy chọn)</label>
                <input
                  type="password"
                  value={editFormData.newPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                  placeholder="Để trống nếu không muốn thay đổi"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Số xu</label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
                    <Coins size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{selectedUser.coins.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Vai trò</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Ngày tạo</label>
                  <input
                    type="text"
                    value={new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
                    disabled
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Cập nhật lần cuối</label>
                  <input
                    type="text"
                    value={new Date(selectedUser.updatedAt).toLocaleString('vi-VN')}
                    disabled
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="pt-4 border-t border-neutral-700">
                <h4 className="text-sm font-semibold mb-3">Thông tin bổ sung</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-neutral-400 mb-1">Tổng nạp</p>
                    <p className="text-lg font-semibold text-green-400">0 xu</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-neutral-400 mb-1">Tổng chi tiêu</p>
                    <p className="text-lg font-semibold text-red-400">0 xu</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-neutral-400 mb-1">Số lần check-in</p>
                    <p className="text-lg font-semibold">0 lần</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-neutral-400 mb-1">Streak hiện tại</p>
                    <p className="text-lg font-semibold">0 ngày</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-700">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]" onClick={() => setShowConfirmModal(false)}>
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-md border border-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">{confirmAction.title}</h3>
            </div>

            <p className="text-neutral-300 mb-6">{confirmAction.message}</p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={confirmAction.onConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
