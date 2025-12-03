import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

export default function History() {
  const [filterType, setFilterType] = useState<string>('all');

  const transactions = [
    { id: 1, type: 'earn', description: 'Hoàn thành nhiệm vụ đăng nhập', amount: 50, date: '2024-12-02 09:30', category: 'mission' },
    { id: 2, type: 'spend', description: 'Đổi thẻ Garena 50k', amount: -500, date: '2024-12-01 15:20', category: 'exchange' },
    { id: 3, type: 'earn', description: 'Mời bạn bè thành công', amount: 100, date: '2024-12-01 12:45', category: 'referral' },
    { id: 4, type: 'earn', description: 'Thắng Mini game - Vòng quay', amount: 30, date: '2024-12-01 10:15', category: 'game' },
    { id: 5, type: 'spend', description: 'Mua ACC Liên Quân', amount: -1200, date: '2024-11-30 16:30', category: 'account' },
    { id: 6, type: 'earn', description: 'Điểm danh ngày 7', amount: 100, date: '2024-11-30 08:00', category: 'checkin' },
    { id: 7, type: 'earn', description: 'Hoàn thành nhiệm vụ tuần', amount: 200, date: '2024-11-29 20:00', category: 'mission' },
    { id: 8, type: 'spend', description: 'Đổi thẻ Vcoin 100k', amount: -1000, date: '2024-11-28 14:25', category: 'exchange' },
    { id: 9, type: 'earn', description: 'Đạt Top 10 bảng xếp hạng', amount: 300, date: '2024-11-27 18:00', category: 'leaderboard' },
    { id: 10, type: 'earn', description: 'Điểm danh ngày 3', amount: 20, date: '2024-11-26 07:45', category: 'checkin' },
  ];

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'mission', label: 'Nhiệm vụ' },
    { value: 'exchange', label: 'Đổi thẻ' },
    { value: 'referral', label: 'Giới thiệu' },
    { value: 'game', label: 'Mini game' },
    { value: 'account', label: 'Tài khoản' },
    { value: 'checkin', label: 'Điểm danh' },
    { value: 'leaderboard', label: 'Xếp hạng' },
  ];

  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.category === filterType);

  const totalEarned = transactions.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(transactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Lịch sử"
        description="Theo dõi lịch sử giao dịch và hoạt động"
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ArrowDownLeft size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl">{totalEarned} xu</p>
              <p className="text-xs text-neutral-400">Tổng thu nhập</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <ArrowUpRight size={24} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl">{totalSpent} xu</p>
              <p className="text-xs text-neutral-400">Tổng chi tiêu</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-800 rounded-lg">
              <Filter size={24} />
            </div>
            <div>
              <p className="text-2xl">{filteredTransactions.length}</p>
              <p className="text-xs text-neutral-400">Giao dịch</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              size="sm"
              variant={filterType === cat.value ? 'primary' : 'outline'}
              onClick={() => setFilterType(cat.value)}
              className="whitespace-nowrap"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg mb-4">Lịch sử giao dịch</h3>
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-start justify-between pb-3 border-b border-neutral-800 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg mt-1 ${
                  transaction.type === 'earn' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {transaction.type === 'earn' ? (
                    <ArrowDownLeft size={16} className="text-green-500" />
                  ) : (
                    <ArrowUpRight size={16} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-1">{transaction.description}</p>
                  <p className="text-xs text-neutral-500">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm ${
                  transaction.type === 'earn' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} xu
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
