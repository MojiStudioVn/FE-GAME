import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Trophy, Zap, Lock, Shield, Flame } from 'lucide-react';

export default function Missions() {
  const [activeTab, setActiveTab] = useState('top3');
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState<Record<string, boolean>>({});
  const [startedIds, setStartedIds] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [modalMissionId, setModalMissionId] = useState<string | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [antiBotModalVisible, setAntiBotModalVisible] = useState(false);
  const [antiBotIp, setAntiBotIp] = useState<string | null>(null);
  const [antiBotUrl, setAntiBotUrl] = useState<string | null>(null);
  const [antiBotMissionId, setAntiBotMissionId] = useState<string | null>(null);
  const [antiBotCountdown, setAntiBotCountdown] = useState<number>(5);

  // Thống kê header (computed from missions)
  const stats = {
    currentMissions: missions.filter(m => m.status === 'active').length || 0,
    totalMissions: missions.length || 0,
    ipLocked: 0,
    vpnLocked: 0,
    totalReward: missions.reduce((s, m) => s + (Number(m.reward) || 0), 0) || 0,
  };

  // Top 3 nhiệm vụ nhiều xu nhất (computed)
  const topMissions = missions
    .filter(m => m.status === 'active')
    .sort((a, b) => (Number(b.reward) || 0) - (Number(a.reward) || 0))
    .slice(0, 3)
    .map((m, idx) => ({ ...m, rank: idx + 1, title: m.name || m.title || `NV ${m._id}` }));

  // All missions (fetched)
  const allMissions = missions.map(m => ({
    id: m._id,
    title: m.name || m.title || `NV ${m._id}`,
    description: m.description,
    reward: m.reward,
    status: m.status,
    provider: m.provider,
    url: m.url,
    shortcut: m.shortcut,
    requiresCode: !!m.requiresCode,
    uses: m.uses,
    maxUses: m.maxUses,
  }));

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/missions');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.missions)) {
          setMissions(data.missions);
        } else {
          setMissions([]);
        }
        // if user is logged in, fetch statuses
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const sres = await fetch('/api/missions/status', { headers: { Authorization: `Bearer ${token}` } });
            if (sres.ok) {
              const sd = await sres.json();
              const statuses = sd.statuses || {};
              const startedMap: Record<string, boolean> = {};
              const completedMap: Record<string, boolean> = {};
              Object.keys(statuses).forEach(k => {
                if (statuses[k] === 'started') startedMap[k] = true;
                if (statuses[k] === 'completed') completedMap[k] = true;
              });
              setStartedIds(prev => ({ ...prev, ...startedMap }));
              setCompletedIds(prev => ({ ...prev, ...completedMap }));
            }
          } catch (e) {
            console.warn('Failed to fetch mission statuses', e);
          }
        }
      } catch (err) {
        console.error('Failed to load missions:', err);
        setMissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
    // refresh statuses when window gains focus
    const onFocus = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch('/api/missions/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(sd => {
          if (!sd) return;
          const statuses = sd.statuses || {};
          const startedMap: Record<string, boolean> = {};
          const completedMap: Record<string, boolean> = {};
          Object.keys(statuses).forEach(k => {
            if (statuses[k] === 'started') startedMap[k] = true;
            if (statuses[k] === 'completed') completedMap[k] = true;
          });
          setStartedIds(prev => ({ ...prev, ...startedMap }));
          setCompletedIds(prev => ({ ...prev, ...completedMap }));
        })
        .catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const closeModal = () => {
    setShowCodeModal(false);
    setModalMissionId(null);
    setModalCode('');
    setModalMessage('');
    setModalLoading(false);
  };

  // Helper: fetch client IP (tries ipify.org)
  const fetchClientIp = async () => {
    try {
      const r = await fetch('https://api.ipify.org?format=json');
      if (!r.ok) return null;
      const j = await r.json();
      return j.ip || null;
    } catch (e) {
      return null;
    }
  };

  const handleStart = async (mission: any) => {
    const id = mission.id || mission._id;
    if (starting[id]) return;
    setStarting(prev => ({ ...prev, [id]: true }));
    setAntiBotMissionId(id);
    setAntiBotUrl(mission.shortcut || mission.url || null);
    setAntiBotModalVisible(true);
    setAntiBotCountdown(5);

    // fetch IP for display
    const ip = await fetchClientIp();
    setAntiBotIp(ip);

    // call start API immediately to reserve IP
    const token = localStorage.getItem('token');
    let res = null;
    try {
      res = await fetch(`/api/missions/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data && data.message ? data.message : `Lỗi: ${res.status}`;
        alert(msg);
        setAntiBotModalVisible(false);
        setStarting(prev => ({ ...prev, [id]: false }));
        return;
      }
      // server responded OK; do not change "started" UI state — keep button as 'Bắt đầu' unless completed
      try {
        const j = await res.json().catch(() => null);
        if (j && j.message && j.message.includes('hoàn thành')) {
          setCompletedIds(prev => ({ ...prev, [id]: true }));
        }
      } catch {}
    } catch (err) {
      console.error('Start mission failed', err);
      alert('Không thể bắt đầu nhiệm vụ');
      setAntiBotModalVisible(false);
      setStarting(prev => ({ ...prev, [id]: false }));
      return;
    }

    // countdown visuals for 5s then open mission URL
    let sec = 5;
    setAntiBotCountdown(sec);
    const iv = setInterval(() => {
      sec -= 1;
      setAntiBotCountdown(sec);
      if (sec <= 0) {
        clearInterval(iv);
        try {
          if (antiBotUrl) window.open(antiBotUrl, '_blank');
        } catch (e) {}
        setTimeout(() => {
          setAntiBotModalVisible(false);
        }, 400);
        setStarting(prev => ({ ...prev, [id]: false }));
      }
    }, 1000);
  };

  const handleConfirmCode = async () => {
    if (!modalMissionId) return;
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/missions/${modalMissionId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ code: modalCode })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModalMessage(data && data.message ? data.message : `Lỗi: ${res.status}`);
      } else {
        setModalMessage('Claim thành công!');
        // mark mission as completed in UI
        setCompletedIds(prev => ({ ...prev, [modalMissionId]: true }));
        // close after short delay
        setTimeout(() => closeModal(), 900);
      }
    } catch (err) {
      console.error('Verify code failed', err);
      setModalMessage('Có lỗi khi xác thực mã');
    } finally {
      setModalLoading(false);
    }
  };

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
        <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-black font-semibold" disabled={completedIds[mission.id || mission._id]} onClick={() => handleStart(mission)}>
          {completedIds[mission.id || mission._id] ? 'Đã hoàn thành' : (starting[mission.id || mission._id] ? 'Đang bắt đầu...' : 'Bắt đầu')}
        </Button>
        <Button size="sm" variant="outline" className="flex-1 border-neutral-600 text-neutral-400">
          <Shield size={16} />
          Hướng dẫn
        </Button>
        {mission.requiresCode ? (
          <Button size="sm" variant="ghost" className="border-neutral-700 text-neutral-300" onClick={() => {
            const id = mission.id || mission._id;
            setModalMissionId(id);
            setModalCode('');
            setModalMessage('');
            setShowCodeModal(true);
          }}>
            Nhập mã
          </Button>
        ) : null}
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
            <div key={mission.id || mission._id} className="relative">
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
        {loading ? (
          <div className="col-span-full text-center text-neutral-400">Đang tải nhiệm vụ...</div>
        ) : allMissions.length === 0 ? (
          <div className="col-span-full text-center text-neutral-400">Không có nhiệm vụ nào.</div>
        ) : (
          allMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))
        )}
      </div>

      {/* Code entry modal */}
      {/* Anti-bot loading modal */}
      {antiBotModalVisible && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => {}}></div>
          <div className="relative w-full max-w-lg p-6 bg-neutral-900 border border-neutral-700 rounded-lg z-10 text-center">
            <h3 className="text-xl font-bold uppercase text-red-400 mb-4">HỆ THỐNG ANTI BOT</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-white/20 animate-spin inline-block" style={{ borderTopColor: '#60A5FA' }}></div>
              <div className="text-lg font-mono tracking-wider text-white">{antiBotCountdown > 0 ? '' : '...'} </div>
              <div className="text-sm text-neutral-300">IP của bạn là: <span className="font-semibold text-yellow-300">{antiBotIp || 'Đang lấy...'}</span></div>
              <div className="text-sm text-neutral-400">VUI LÒNG CHỜ TRONG GIÂY LÁT VÀ NHIỆM VỤ SẼ ĐƯỢC BẮT ĐẦU</div>
              <div className="text-xs text-neutral-500 mt-2">Chuyển tiếp sau: <span className="font-bold text-white">{antiBotCountdown}s</span></div>
            </div>
          </div>
        </div>
      )}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal}></div>
          <div className="relative w-full max-w-md p-6 bg-neutral-900 border border-neutral-700 rounded-lg z-10">
            <h3 className="text-lg font-semibold mb-3">Nhập mã xác nhận</h3>
            <p className="text-sm text-neutral-400 mb-3">Nhập mã bạn nhận được từ nhà cung cấp để xác nhận nhiệm vụ.</p>
            <label className="block text-sm mb-2">Mã xác nhận</label>
            <input value={modalCode} onChange={e => setModalCode(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white mb-3" />
            {modalMessage && <div className="text-sm text-yellow-300 mb-3">{modalMessage}</div>}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={closeModal} disabled={modalLoading}>Hủy</Button>
              <Button onClick={handleConfirmCode} disabled={modalLoading}>{modalLoading ? 'Đang xử lý...' : 'Xác nhận'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
