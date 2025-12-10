import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Crown, Lightbulb, Lock, Copy, Home, Target, Clock, Users } from 'lucide-react';

export default function Leaderboard() {
  const [loadingLb, setLoadingLb] = useState(false);
  const [remoteLeaderboard, setRemoteLeaderboard] = useState<Array<any>>([]);
  const [lbError, setLbError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'history'>('leaderboard');
  const [timeLeft, setTimeLeft] = useState({
    days: 29,
    hours: 43,
    minutes: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes } = prev;

        if (minutes > 0) {
          minutes--;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
        }

        return { days, hours, minutes };
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const leaderboardData = remoteLeaderboard.length
    ? remoteLeaderboard.map((r, i) => ({
        rank: i + 1,
        username: r.username || (`#${String(r.userId).slice(-6)}`),
        badge: `BXH tuần • Hạng ${i + 1}`,
        missions: r.missions || 0,
        lastActive: r.lastClaim ? new Date(r.lastClaim).toLocaleString() : '-',
        coins: r.totalCoins || 0,
      }))
    : [];

  useEffect(() => {
    const fetchLb = async () => {
      setLoadingLb(true);
      setLbError(null);
      try {
        const res = await fetch('/api/public/leaderboard?period=week&limit=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && data.leaderboard) {
          setRemoteLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        setLbError('Không thể tải bảng xếp hạng');
      } finally {
        setLoadingLb(false);
      }
    };

    fetchLb();
  }, []);

  const topRewards = [
    {
      rank: 1,
      title: 'Top 1: 5000 xu',
      description: 'Phần thưởng cao nhất tuần',
      color: 'bg-yellow-500',
      icon: Crown,
      coins: '+5000 xu',
    },
    {
      rank: 2,
      title: 'Top 2: 4000 xu',
      description: 'Bám sát ngôi đầu bảng',
      color: 'bg-gray-400',
      icon: Lightbulb,
      coins: '+4000 xu',
    },
    {
      rank: 3,
      title: 'Top 3: 3000 xu',
      description: 'Giữ vững vị trí Top 3',
      color: 'bg-orange-500',
      icon: Lock,
      coins: '+3000 xu',
    },
  ];

  const getRankBadge = (rank: number) => {
    const badges = {
      1: { bg: 'bg-yellow-500', text: 'text-black', icon: '1' },
      2: { bg: 'bg-gray-400', text: 'text-black', icon: '2' },
      3: { bg: 'bg-orange-500', text: 'text-black', icon: '3' },
    };

    return badges[rank as keyof typeof badges] || { bg: 'bg-neutral-700', text: 'text-white', icon: rank.toString() };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      {/* Header Info Card */}
      <Card className="mb-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Bảng xếp hạng tuần</h2>
            <p className="text-sm text-neutral-300">
              Dựa nhiệm vụ mỗi tuần, chốt thưởng từ <span className="text-white font-semibold">đứng lúc Thứ Hai 00:05 (giờ VN)</span>.
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-neutral-400">Tính từ:</span>
                <span className="text-white font-semibold">2025-12-01 00:00:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-400" />
                <span className="text-neutral-400">10 người đang đua</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Nếu bảng số nhiệm vụ, sẽ chấm một điểm hiện tại sớm hơn để quyết định thứ hạng cao hơn.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm border border-neutral-700">
              <Copy size={16} />
              Copy Top 3
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm border border-neutral-700">
              <Home size={16} />
              Trang chủ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg text-sm">
              <Target size={16} />
              Làm nhiệm vụ ngay
            </button>
          </div>
        </div>
      </Card>

      {/* Top 3 Rewards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Crown size={24} className="text-yellow-500" />
            <h3 className="text-xl font-bold">DỰA TOP NHẬN THƯỞNG TUẦN</h3>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
            <Clock size={16} className="text-neutral-400" />
            <span className="text-sm font-semibold">{timeLeft.days}d:{timeLeft.hours}h:{timeLeft.minutes}m</span>
            <span className="text-xs text-neutral-500">đến giờ reset</span>
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-black font-semibold rounded-lg text-sm">
            Đua ngay
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {topRewards.map((reward) => {
            const Icon = reward.icon;
            const badge = getRankBadge(reward.rank);

            return (
              <Card key={reward.rank} className="border-neutral-700 hover:border-neutral-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${reward.color} rounded-lg flex items-center justify-center`}>
                      <Icon size={20} className="text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{reward.title}</h4>
                      <p className="text-xs text-neutral-400">{reward.description}</p>
                    </div>
                  </div>
                  <div className={`${badge.bg} ${badge.text} w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold`}>
                    {reward.rank}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{reward.coins}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-cyan-500 text-black'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          Đang diễn ra
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-cyan-500 text-black'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          Tuần trước
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {loadingLb ? (
          <div className="text-center text-neutral-400">Đang tải bảng xếp hạng...</div>
        ) : lbError ? (
          <div className="text-center text-yellow-300">{lbError}</div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center text-neutral-400">Không có dữ liệu bảng xếp hạng.</div>
        ) : (
          leaderboardData.map((player) => {
          const badge = getRankBadge(player.rank);

          return (
            <Card
              key={player.rank}
              className={`border-neutral-700 ${
                player.rank <= 3 ? 'bg-neutral-800/50' : 'hover:bg-neutral-800/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`${badge.bg} ${badge.text} w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0`}>
                  {badge.icon}
                </div>

                <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">
                    {player.username.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">{player.username}</p>
                  <p className="text-xs text-neutral-500">{player.badge}</p>
                </div>

                {player.rank <= 3 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-neutral-700/50 rounded-full">
                    <Crown size={14} className="text-yellow-500" />
                    <span className="text-sm font-semibold">
                      {player.rank === 1 ? '+5000 xu' : player.rank === 2 ? '+4000 xu' : '+3000 xu'}
                    </span>
                  </div>
                )}

                <div className="text-right">
                  <p className="text-lg font-bold mb-1">{player.missions} nhiệm vụ</p>
                  <p className="text-xs text-neutral-500">Chặm mốc hiện tại lúc {player.lastActive}</p>
                </div>
              </div>
            </Card>
          );
          }))}
      </div>
    </div>
  );
}
