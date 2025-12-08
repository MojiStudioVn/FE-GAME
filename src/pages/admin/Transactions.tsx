import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/card/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.data) {
          setTransactions(res.data.data.map((tx: any) => ({
            id: tx._id || tx.transId || '',
            user: tx.userId?.username || tx.userId || '',
            type: 'deposit', // CardTransaction is always deposit
            method: tx.telco || 'Card',
            amount: tx.amount || tx.declaredValue || 0,
            coins: tx.value || tx.cardValue || 0,
            status: tx.status === 1 ? 'success' : (tx.status === 99 ? 'pending' : 'failed'),
            time: tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : '',
          })));
        }
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const stats = [
    {
      label: 'Tổng giao dịch hôm nay',
      value: transactions.length,
      icon: <TrendingUp size={20} />,
    },
    {
      label: 'Tổng thu',
      value: '₫' + (transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0) / 1000) + 'K',
      icon: <ArrowUpRight size={20} className="text-green-400" />,
    },
    {
      label: 'Tổng chi',
      value: '₫' + (transactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + t.amount, 0) / 1000) + 'K',
      icon: <ArrowDownLeft size={20} className="text-red-400" />,
    },
    {
      label: 'Chờ xử lý',
      value: transactions.filter(t => t.status === 'pending').length,
      icon: <DollarSign size={20} className="text-yellow-400" />,
    },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Nạp xu';
      case 'withdraw': return 'Rút tiền';
      case 'exchange': return 'Đổi thẻ';
      case 'purchase': return 'Mua hàng';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Thành công';
      case 'pending': return 'Đang xử lý';
      case 'failed': return 'Thất bại';
      default: return status;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Quản lý giao dịch"
        description="Theo dõi và quản lý tất cả giao dịch trong hệ thống"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center gap-3">
              <div className="text-neutral-500">{stat.icon}</div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </div>
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
              placeholder="Tìm kiếm theo ID, người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all">Tất cả loại</option>
            <option value="deposit">Nạp xu</option>
            <option value="withdraw">Rút tiền</option>
            <option value="exchange">Đổi thẻ</option>
            <option value="purchase">Mua hàng</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="pending">Đang xử lý</option>
            <option value="failed">Thất bại</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Calendar size={16} />
            Chọn ngày
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Bộ lọc
          </Button>
          <Button variant="primary" className="gap-2">
            <Download size={16} />
            Xuất Excel
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Mã GD</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Người dùng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Loại</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Phương thức</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Số tiền</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Xu</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Thời gian</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono">{tx.id}</td>
                  <td className="py-3 px-4 text-sm font-medium">{tx.user}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                      tx.type === 'withdraw' ? 'bg-red-500/20 text-red-400' :
                      tx.type === 'exchange' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {getTypeLabel(tx.type)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-400">{tx.method}</td>
                  <td className="py-3 px-4 text-sm font-medium">₫{tx.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-neutral-400">{tx.coins}</td>
                  <td className="py-3 px-4 text-sm text-neutral-400">{tx.time}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'success' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {getStatusLabel(tx.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm">Chi tiết</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-700">
          <p className="text-sm text-neutral-400">Hiển thị 1-8 trong tổng số 8 giao dịch</p>
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
