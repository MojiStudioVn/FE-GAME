import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Users, Gift, Sparkles, Link2, UserPlus, TrendingUp, Clock } from 'lucide-react';

export default function InviteFriends() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate ref code from user ID or username
  const refCode = user?.id?.toString().slice(-6) || '092922';
  const inviteLink = `${window.location.origin}/register?ref=${refCode}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats
  const stats = {
    totalInvited: 0,
    totalCommission: 0,
    bonusReward: 200
  };

  // Recent commissions
  const recentCommissions: any[] = [];

  // Top referrers (30 days)
  const topReferrers: any[] = [];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Mời bạn bè, nhận xu cùng nhau ✨"
        description="Bạn nhận 20% hoa hồng từ xu nhiệm vụ của bạn bè. Người được mời nhận thêm 200 xu sau khi hoàn thành 1 trong 9 nhiệm vụ đầu (áp dụng 1 lần, nếu có người mời)."
      />

      {/* Ref Link Section */}
      <Card className="mb-6 bg-neutral-900 border-purple-800/30">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Link2 size={20} className="text-blue-400" />
          Link mời của bạn
        </h3>

        <div className="mb-4">
          <label className="text-xs text-neutral-400 mb-2 block">Ref Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-neutral-300"
            />
            <Button
              variant="outline"
              onClick={() => handleCopy(inviteLink)}
              className="px-6"
            >
              {copied ? 'Đã copy!' : <><Copy size={16} /> Copy</>}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-blue-400">1</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Copy & gửi cho bạn bè</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-green-400">2</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Bạn bè đăng ký & làm nhiệm vụ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-yellow-400">3</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Bạn nhận hoa hồng tự động</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-blue-800/30">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-blue-400" />
            <h3 className="text-sm font-semibold">Số người đã mời</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalInvited}</p>
          <p className="text-xs text-neutral-400">Tổng số tài khoản đã đăng ký qua link của bạn.</p>
        </Card>

        <Card className="border-green-800/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-green-400" />
            <h3 className="text-sm font-semibold">Tổng hoa hồng</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalCommission} xu</p>
          <p className="text-xs text-neutral-400">Hoa hồng cộng dồn từ nhiệm vụ của người được mời.</p>
        </Card>

        <Card className="border-yellow-800/30">
          <div className="flex items-center gap-3 mb-2">
            <Gift size={20} className="text-yellow-400" />
            <h3 className="text-sm font-semibold">Ưu đãi người được mời</h3>
          </div>
          <p className="text-3xl font-bold mb-1">+{stats.bonusReward} xu</p>
          <p className="text-xs text-neutral-400">Nhận 1 lần sau khi hoàn thành 1 trong 9 nhiệm vụ đầu.</p>
        </Card>
      </div>

      {/* Recent Commissions */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-green-400" />
          Hoa hồng gần đây
        </h3>
        <p className="text-sm text-neutral-400 mb-4">
          Danh sách những lần bạn nhận hoa hồng từ nhiệm vụ của bạn bè.
        </p>

        {recentCommissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left text-xs text-neutral-400 py-3 px-2">Thời gian</th>
                  <th className="text-left text-xs text-neutral-400 py-3 px-2">User</th>
                  <th className="text-left text-xs text-neutral-400 py-3 px-2">NV</th>
                  <th className="text-right text-xs text-neutral-400 py-3 px-2">Gốc</th>
                  <th className="text-right text-xs text-neutral-400 py-3 px-2">Hoa hồng</th>
                </tr>
              </thead>
              <tbody>
                {recentCommissions.map((commission, index) => (
                  <tr key={index} className="border-b border-neutral-800/50">
                    <td className="py-3 px-2 text-sm">{commission.time}</td>
                    <td className="py-3 px-2 text-sm">{commission.user}</td>
                    <td className="py-3 px-2 text-sm">{commission.mission}</td>
                    <td className="py-3 px-2 text-sm text-right">{commission.original} xu</td>
                    <td className="py-3 px-2 text-sm text-right text-green-400">+{commission.commission} xu</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <UserPlus size={48} className="mx-auto mb-3 text-neutral-600" />
            <p className="text-neutral-400">Chưa có hoa hồng nào. Bắt đầu mời bạn bè để nhận thưởng nhé!</p>
          </div>
        )}
      </Card>

      {/* Top Referrers Leaderboard */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-400" />
          Top giới thiệu (30 ngày)
        </h3>
        <p className="text-sm text-neutral-400 mb-4">
          Xếp hạng theo tổng hoa hồng nhận được trong 30 ngày gần nhất.
        </p>

        {topReferrers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left text-xs text-neutral-400 py-3 px-2">Hạng</th>
                  <th className="text-left text-xs text-neutral-400 py-3 px-2">User</th>
                  <th className="text-right text-xs text-neutral-400 py-3 px-2">Số lần</th>
                  <th className="text-right text-xs text-neutral-400 py-3 px-2">Tổng hoa hồng</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((referrer, index) => (
                  <tr key={index} className="border-b border-neutral-800/50">
                    <td className="py-3 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-500 text-black' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm">{referrer.user}</td>
                    <td className="py-3 px-2 text-sm text-right">{referrer.count}</td>
                    <td className="py-3 px-2 text-sm text-right text-green-400">{referrer.total} xu</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <TrendingUp size={48} className="mx-auto mb-3 text-neutral-600" />
            <p className="text-neutral-400">Chưa có dữ liệu leaderboard.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
