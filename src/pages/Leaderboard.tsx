import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  const leaderboardData = [
    { rank: 1, username: 'ProGamer2024', coins: 15420, missions: 156, trend: 0 },
    { rank: 2, username: 'GameMaster99', coins: 14230, missions: 148, trend: 1 },
    { rank: 3, username: 'TopPlayer88', coins: 13890, missions: 142, trend: -1 },
    { rank: 4, username: 'SuperGamer', coins: 12560, missions: 135, trend: 2 },
    { rank: 5, username: 'ElitePlayer', coins: 11890, missions: 128, trend: -1 },
    { rank: 6, username: 'MasterChief', coins: 10920, missions: 120, trend: 0 },
    { rank: 7, username: 'NinjaGamer', coins: 10450, missions: 115, trend: 3 },
    { rank: 8, username: 'DragonSlayer', coins: 9870, missions: 108, trend: -2 },
    { rank: 9, username: 'PhoenixRising', coins: 9320, missions: 102, trend: 1 },
    { rank: 10, username: 'ThunderStrike', coins: 8950, missions: 98, trend: -1 },
    { rank: 11, username: 'ShadowHunter', coins: 8560, missions: 92, trend: 0 },
    { rank: 12, username: 'IronFist', coins: 8120, missions: 88, trend: 2 },
  ];

  const myRank = { rank: 42, username: 'User Name', coins: 1250, missions: 24, trend: 5 };

  const topRewards = [
    { rank: '1', reward: '5,000 xu + Huy hiệu Vàng' },
    { rank: '2-3', reward: '3,000 xu + Huy hiệu Bạc' },
    { rank: '4-10', reward: '1,000 xu + Huy hiệu Đồng' },
    { rank: '11-50', reward: '500 xu' },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={20} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={20} className="text-gray-400" />;
    if (rank === 3) return <Award size={20} className="text-orange-600" />;
    return null;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp size={14} className="text-green-500" />;
    if (trend < 0) return <TrendingUp size={14} className="text-red-500 rotate-180" />;
    return <span className="text-xs text-neutral-500">-</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Bảng xếp hạng"
        description="Cạnh tranh với người chơi khác để lên top"
      />

      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            period === 'week' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'
          }`}
          onClick={() => setPeriod('week')}
        >
          Tuần này
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            period === 'month' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'
          }`}
          onClick={() => setPeriod('month')}
        >
          Tháng này
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            period === 'all' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'
          }`}
          onClick={() => setPeriod('all')}
        >
          Mọi lúc
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg mb-4">Top người chơi</h3>
          <div className="space-y-2">
            {leaderboardData.map((player) => (
              <div
                key={player.rank}
                className={`
                  flex items-center gap-4 p-3 rounded-lg transition-colors
                  ${player.rank <= 3 ? 'bg-neutral-800' : 'hover:bg-neutral-800'}
                `}
              >
                <div className="w-12 text-center">
                  {getRankIcon(player.rank) || (
                    <span className="text-sm text-neutral-400">#{player.rank}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">{player.username.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-0.5">{player.username}</p>
                  <p className="text-xs text-neutral-500">{player.missions} nhiệm vụ</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm">{player.coins.toLocaleString()} xu</p>
                    <div className="flex items-center justify-end gap-1 text-xs">
                      {getTrendIcon(player.trend)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-2 border-white">
            <h3 className="text-lg mb-4">Xếp hạng của bạn</h3>
            <div className="text-center py-4">
              <p className="text-4xl mb-2">#{myRank.rank}</p>
              <p className="text-sm text-neutral-400 mb-4">{myRank.username}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Tổng xu</p>
                  <p className="text-lg">{myRank.coins}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Nhiệm vụ</p>
                  <p className="text-lg">{myRank.missions}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-green-500">
                <TrendingUp size={16} />
                <span className="text-sm">Tăng {myRank.trend} hạng</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-4">Phần thưởng</h3>
            <div className="space-y-3">
              {topRewards.map((reward, index) => (
                <div key={index} className="pb-3 border-b border-neutral-800 last:border-0 last:pb-0">
                  <p className="text-sm mb-1">Top {reward.rank}</p>
                  <p className="text-xs text-neutral-400">{reward.reward}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-3">Cách tăng hạng</h3>
            <div className="space-y-2 text-xs text-neutral-400">
              <p>• Hoàn thành nhiệm vụ hàng ngày</p>
              <p>• Điểm danh liên tục</p>
              <p>• Tham gia mini game</p>
              <p>• Mời bạn bè tham gia</p>
              <p>• Tích lũy xu từ các hoạt động</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
