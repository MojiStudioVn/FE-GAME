import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Plus,
  Download,
  Search,
  Coins,
  ToggleLeft,
  ToggleRight,
  Trash2,
  History,
  Loader2,
  X,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GiftToken {
  _id: string;
  code: string;
  coins: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isEnabled: boolean;
  createdBy: {
    username: string;
  };
  createdAt: string;
}

interface TokenUsage {
  _id: string;
  user: {
    username: string;
    email: string;
  };
  coinsReceived: number;
  createdAt: string;
}

export function GiftTokens() {
  const [tokens, setTokens] = useState<GiftToken[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<GiftToken | null>(null);
  const [usageHistory, setUsageHistory] = useState<TokenUsage[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Create form state
  const [formData, setFormData] = useState({
    code: '',
    coins: '',
    maxUses: '1',
    expiresAt: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/gift-tokens`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.giftTokens || []);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/gift-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Tạo mã quà tặng thành công!');
        setShowCreateModal(false);
        setFormData({ code: '', coins: '', maxUses: '1', expiresAt: '' });
        fetchTokens();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Có lỗi xảy ra khi tạo mã quà tặng');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleToken = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/admin/gift-tokens/${id}/toggle`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchTokens();
      }
    } catch (error) {
      console.error('Error toggling token:', error);
    }
  };

  const handleDeleteToken = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa mã ${code}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/admin/gift-tokens/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert('Xóa mã quà tặng thành công');
        fetchTokens();
      }
    } catch (error) {
      console.error('Error deleting token:', error);
      alert('Có lỗi xảy ra khi xóa mã quà tặng');
    }
  };

  const handleViewUsage = async (token: GiftToken) => {
    setSelectedToken(token);
    setShowUsageModal(true);
    setLoadingUsage(true);

    try {
      const authToken = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/admin/gift-tokens/${token._id}/usage`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsageHistory(data.usageHistory || []);
      }
    } catch (error) {
      console.error('Error fetching usage history:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/admin/gift-tokens/export/csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gift-tokens-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const filteredTokens = tokens.filter((token) =>
    token.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const isValid = (token: GiftToken) =>
    token.isEnabled && token.usedCount < token.maxUses && !isExpired(token.expiresAt);

  const statsData = [
    { label: 'Tổng mã', value: tokens.length },
    { label: 'Đang hoạt động', value: tokens.filter((t) => isValid(t)).length },
    { label: 'Đã hết hạn', value: tokens.filter((t) => isExpired(t.expiresAt)).length },
    { label: 'Lượt sử dụng', value: tokens.reduce((sum, t) => sum + t.usedCount, 0) },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Quản lý Mã quà tặng"
        description="Tạo và quản lý các mã quà tặng cho người dùng"
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
              placeholder="Tìm kiếm theo mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={tokens.length === 0}
          >
            <Download size={16} />
            Xuất CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus size={16} />
            Tạo mã mới
          </Button>
        </div>
      </Card>

      {/* Tokens Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Mã</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Số xu</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Sử dụng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Hết hạn</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Người tạo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((token) => (
                <tr key={token._id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-medium text-purple-400">{token.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-yellow-400">{token.coins.toLocaleString()}</span>
                      <Coins size={14} className="text-yellow-400" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-400">
                    {token.usedCount} / {token.maxUses}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-400">
                    <span className={isExpired(token.expiresAt) ? 'text-red-400' : ''}>
                      {new Date(token.expiresAt).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {isValid(token) ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Hoạt động
                      </span>
                    ) : isExpired(token.expiresAt) ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                        Hết hạn
                      </span>
                    ) : token.usedCount >= token.maxUses ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                        Đã hết
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300">
                        Tắt
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-400">
                    {token.createdBy?.username || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUsage(token)}
                        className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        title="Xem lịch sử"
                      >
                        <History size={16} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleToggleToken(token._id)}
                        className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        title={token.isEnabled ? 'Tắt' : 'Bật'}
                      >
                        {token.isEnabled ? (
                          <ToggleRight size={16} className="text-green-400" />
                        ) : (
                          <ToggleLeft size={16} className="text-neutral-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteToken(token._id, token.code)}
                        className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        title="Xóa"
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

        {filteredTokens.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            {searchTerm ? 'Không tìm thấy mã quà tặng nào' : 'Chưa có mã quà tặng nào'}
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowCreateModal(false)}>
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-md border border-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Tạo mã quà tặng mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-neutral-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">
                  Mã token <span className="text-neutral-500">(để trống để tự sinh)</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="VD: SUMMER2025"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Số xu tặng *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.coins}
                  onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Số lượt nhập tối đa *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="50"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">
                  Hết hạn <span className="text-neutral-500">(tùy chọn)</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-1">YYYY-mm-dd hoặc YYYY-mm-dd HH:ii</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo mã'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageModal && selectedToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowUsageModal(false)}>
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-2xl border border-neutral-700 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">Lịch sử sử dụng</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Mã: <span className="font-mono font-medium text-purple-400">{selectedToken.code}</span>
                </p>
              </div>
              <button
                onClick={() => setShowUsageModal(false)}
                className="p-1 hover:bg-neutral-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {loadingUsage ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={48} />
              </div>
            ) : usageHistory.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                Chưa có ai sử dụng mã này
              </div>
            ) : (
              <div className="space-y-3">
                {usageHistory.map((usage) => (
                  <div
                    key={usage._id}
                    className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg hover:bg-neutral-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{usage.user.username}</p>
                      <p className="text-sm text-neutral-400">{usage.user.email}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(usage.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-yellow-400">+{usage.coinsReceived.toLocaleString()}</span>
                      <Coins size={14} className="text-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GiftTokens;
