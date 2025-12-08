import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Trophy, Zap, Lock, Shield, Flame } from 'lucide-react';

export default function Missions() {
  const [activeTab, setActiveTab] = useState('top3');

  // Thống kê header
  const stats = {
    currentMissions: 20,
    totalMissions: 20,
    ipLocked: 0,
    vpnLocked: 0,
    totalReward: 5250
  };

  // Top 3 nhiệm vụ nhiều xu nhất
  const topMissions = [
    {
      id: 9,
      title: 'NV 9 — Nhiệm vụ 9',
      reward: 350,
      type: 'XU CAO',
      status: 'active',
      resetTime: '00:00',
      antiBot: true,
      description: 'Sau khi nhập token, nhiệm vụ sẽ mở lại lúc 00:00 (giờ VN).',
      rank: 1
    },
    {
      id: 10,
      title: 'NV 10 — Nhiệm vụ 10',
      reward: 350,
      type: 'XU CAO',
      status: 'active',
      resetTime: '00:00',
      antiBot: true,
      description: 'Sau khi nhập token, nhiệm vụ sẽ mở lại lúc 00:00 (giờ VN).',
      rank: 2
    },
    {
      id: 1,
      title: 'NV 1 — Nhiệm vụ 1',
      reward: 300,
      type: 'XU CAO',
      status: 'active',
      resetTime: '00:00',
      antiBot: true,
      description: 'Sau khi nhập token, nhiệm vụ sẽ mở lại lúc 00:00 (giờ VN).',
      rank: 3
    }
  ];

  // Tất cả nhiệm vụ
  const allMissions = [
    ...topMissions,
    { id: 3, title: 'NV 3 — Nhiệm vụ 3', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 4, title: 'NV 4 — Nhiệm vụ 4', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 5, title: 'NV 5 — Nhiệm vụ 5', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 6, title: 'NV 6 — Nhiệm vụ 6', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 11, title: 'NV 11 — Nhiệm vụ 11', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 13, title: 'NV 13 — Nhiệm vụ 13', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 14, title: 'NV 14 — Nhiệm vụ 14', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 18, title: 'NV 18 — Nhiệm vụ 18', reward: 300, type: 'XU CAO', status: 'active', resetTime: '00:00', antiBot: true },
    { id: 7, title: 'NV 7 — Nhiệm vụ 7', reward: 250, type: 'XU NGON', status: 'active', resetTime: '00:00', antiBot: true },
  ];

  const MissionCard = ({ mission, showRank = false }: { mission: typeof allMissions[0], showRank?: boolean }) => (
    <Card className="bg-neutral-900 border-neutral-700">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold">{mission.title}</h3>
        <div className="flex items-center gap-1 px-2 py-1 bg-green-900/30 rounded text-green-400 text-sm">
          <Flame size={14} />
          <span className="font-bold">{mission.reward} xu</span>
        </div>
      </div>

      <p className="text-xs text-neutral-400 mb-4">{mission.description || 'Sau khi nhập token, nhiệm vụ sẽ mở lại lúc 00:00 (giờ VN).'}</p>

      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-black font-semibold">
          Bắt đầu
        </Button>
        <Button size="sm" variant="outline" className="flex-1 border-neutral-600 text-neutral-400">
          <Shield size={16} />
          Hướng dẫn
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-blue-400">
            <Shield size={14} />
            <span>Anti-bot</span>
          </div>
          <span className="text-green-400">
            Đang mở • Làm xong sẽ khoá tới 00:00
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Bảng nhiệm vụ hôm nay"
        description="Hệ thống tự động đẩy nhiệm vụ nhiều xu lên đầu & khoá lại tối 00:00 sau khi hoàn thành."
      />

      {/* Header Stats */}
      <Card className="mb-6 bg-neutral-900 border-purple-800/30">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-900/30 rounded-lg border border-green-800/50">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-neutral-300">Đang mở:</span>
            <span className="text-white font-bold">{stats.currentMissions} / {stats.totalMissions} NV</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <Lock size={16} className="text-neutral-400" />
            <span className="text-sm text-neutral-300">Đã khoá tối 00:00:</span>
            <span className="text-white font-bold">{stats.ipLocked} NV</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <Shield size={16} className="text-red-400" />
            <span className="text-sm text-neutral-300">Khoá tạm thời (VPN):</span>
            <span className="text-white font-bold">{stats.vpnLocked} NV</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-sm text-neutral-300">Khoá theo IP (trong ngày):</span>
            <span className="text-white font-bold">{stats.ipLocked} NV</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 rounded-lg border border-yellow-800/50 ml-auto">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-sm text-neutral-300">Tổng thưởng tối đa:</span>
            <span className="text-yellow-400 font-bold">{stats.totalReward.toLocaleString()} xu</span>
          </div>
        </div>
      </Card>

      {/* Top 3 Missions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold">Top 3 nhiệm vụ nhiều xu nhất</h2>
          </div>
          <button
            onClick={() => setActiveTab('sort')}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Flame size={16} />
            Tự sắp xếp theo xu
          </button>
        </div>
        <p className="text-sm text-neutral-400 mb-4">Ưu tiên nhiệm vụ đang mở, sẵn sẵng làm ngay.</p>

        <div className="space-y-3">
          {topMissions.map((mission) => (
            <div key={mission.id} className="relative">
              <div className="absolute -left-3 top-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10"
                style={{
                  background: mission.rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                             mission.rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #808080)' :
                             'linear-gradient(135deg, #CD7F32, #8B4513)',
                  color: '#000'
                }}
              >
                {mission.rank}
              </div>
              <div className="pl-4">
                <MissionCard mission={mission} showRank />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMissions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}
