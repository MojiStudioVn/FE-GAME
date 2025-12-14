import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Coins, Ticket, Shield, Search } from 'lucide-react';

type TabType = 'token' | 'xu' | 'acc' | 'acc-vip' | 'hoat-dong';

export default function History() {
  const [activeTab, setActiveTab] = useState<TabType>('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Array<any>>([]);
  const [error, setError] = useState<string | null>(null);
  const [purchaseModal, setPurchaseModal] = useState<any | null>(null);
  const purchase = purchaseModal?.purchase ?? purchaseModal;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me/dashboard', {
          method: 'GET',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const j = await res.json();
        if (!mounted) return;
        if (res.ok && j.success) {
          const items = j.data?.recentActivities || [];
          setLogs(items);
        } else {
          setError(j?.message || 'Không thể tải lịch sử');
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Lỗi khi tải lịch sử');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Stats data
  const stats = [
    {
      id: 'token',
      label: 'TOKEN',
      value: '0',
      description: 'NV đã nhận token (7 ngày)',
      color: 'border-green-500',
    },
    {
      id: 'xu',
      label: 'XU',
      value: '+0',
      description: 'Tổng biến động xu 7 ngày',
      color: 'border-yellow-500',
    },
    {
      id: 'acc',
      label: 'ACC',
      value: '0',
      description: 'ACC nhận / đổi trong 7 ngày',
      color: 'border-blue-500',
    },
    {
      id: 'acc-vip',
      label: 'ACC VIP',
      value: '0',
      description: 'Mua từ SkinFinder (7 ngày)',
      color: 'border-red-500',
    },
  ];

  const tabs = [
    { id: 'token', label: 'Token' },
    { id: 'xu', label: 'Xu' },
    { id: 'acc', label: 'ACC' },
    { id: 'acc-vip', label: 'ACC VIP (Skin)' },
    { id: 'hoat-dong', label: 'Hoạt động' },
  ];

  // Empty state data
  const emptyMessage = 'Chưa có lịch sử token trong 7 ngày gần nhất.';
  const emptySubMessage = 'Tôi đã 100 bản ghi token gần nhất trong 7 ngày.';

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Lịch sử"
        description="Hệ thống chỉ hiển thị lịch sử trong 7 ngày gần nhất để dễ dữ liệu gọn nhẹ và bảo vệ riêng tư. Bản ghi cũ hơn không còn xuất hiện tại đây."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card
            key={stat.id}
            className={`border-l-4 ${stat.color} hover:bg-neutral-800/50 transition-colors cursor-pointer`}
            onClick={() => setActiveTab(stat.id as TabType)}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">{stat.label}</span>
                {stat.id === 'xu' && <Coins size={16} className="text-yellow-500" />}
                {stat.id === 'token' && <Ticket size={16} className="text-green-500" />}
                {(stat.id === 'acc' || stat.id === 'acc-vip') && <Shield size={16} className={stat.id === 'acc' ? 'text-blue-500' : 'text-red-500'} />}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-neutral-400">
          Lọc & sao chép dữ liệu trong <span className="text-white font-semibold">7 ngày gần nhất</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Tìm nhanh... (token, IP, tiêu đề...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>
              {purchaseModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-neutral-950 p-6 rounded max-w-lg w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Chi tiết ACC đã mua</h3>
                      <button onClick={() => setPurchaseModal(null)} className="text-neutral-400">Đóng</button>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-neutral-400">Username</div>
                      <div className="font-medium">{purchase?.accountSnapshot?.username || '-'}</div>

                      <div className="mt-3 text-xs text-neutral-400">Password</div>
                      <div className="font-medium">{purchase?.accountSnapshot?.password || '-'}</div>

                      <div className="mt-3 text-xs text-neutral-400">Skins</div>
                      <div className="text-sm text-neutral-300">{Array.isArray(purchase?.accountSnapshot?.skins) ? (purchase?.accountSnapshot?.skins || []).join(', ') : String(purchase?.accountSnapshot?.skins ?? '-')}</div>

                      <div className="mt-3 text-xs text-neutral-400">SS</div>
                      <div className="text-sm text-neutral-300">{Array.isArray(purchase?.accountSnapshot?.ssCards) ? (purchase?.accountSnapshot?.ssCards || []).join(', ') : (purchase?.accountSnapshot?.ssCards ? String(purchase?.accountSnapshot?.ssCards) : '-')}</div>

                      <div className="mt-3 text-xs text-neutral-400">Level · Rank</div>
                      <div className="text-sm text-neutral-300">{purchase?.accountSnapshot?.level ?? '-'} · {purchase?.accountSnapshot?.rank ?? '-'}</div>
                    </div>
                  </div>
                </div>
              )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-black rounded-t-lg'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <Card>
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-300">Thời gian</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-300">Nhiệm vụ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-300">Token</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-300">Người / Số tiền</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">Đang tải...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-rose-400">{error}</td>
                </tr>
              )}

              {!loading && !error && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center">
                        <Ticket size={32} className="text-neutral-600" />
                      </div>
                      <p className="text-neutral-400">{emptyMessage}</p>
                      <p className="text-xs text-neutral-600">{emptySubMessage}</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && logs.length > 0 && (
                logs
                  .filter((l) => {
                    // Tab filtering
                    if (activeTab === 'hoat-dong') return true;
                    if (activeTab === 'xu') return Boolean(l.amount && String(l.amount).trim() !== '');
                    if (activeTab === 'token') return String(l.type || '').includes('token') || String(l.action || '').toLowerCase().includes('token');
                    if (activeTab === 'acc') return String(l.action || '').toLowerCase().includes('acc') || String(l.action || '').toLowerCase().includes('mua') || String(l.action || '').toLowerCase().includes('đổi');
                    if (activeTab === 'acc-vip') return String(l.action || '').toLowerCase().includes('skin') || String(l.action || '').toLowerCase().includes('vip');
                    return true;
                  })
                  .filter((l) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      String(l.action || '').toLowerCase().includes(q) ||
                      String(l.user || '').toLowerCase().includes(q) ||
                      String(l.time || '').toLowerCase().includes(q)
                    );
                  })
                  .map((l) => (
                    <tr key={l.id} className="border-b border-neutral-800">
                      <td className="py-3 px-4 text-sm text-neutral-400">{l.time}</td>
                      <td className="py-3 px-4 text-sm">{l.action}</td>
                      <td className="py-3 px-4 text-sm text-neutral-300">{l.amount || '-'}</td>
                      <td className="py-3 px-4 text-sm text-neutral-300">{l.user || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          {l.meta?.purchaseId && (
                            <button
                              className="text-xs bg-blue-600 px-2 py-1 rounded text-black"
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  const token = localStorage.getItem('token');
                                  const res = await fetch(`/api/purchases/${l.meta.purchaseId}`, {
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                                  });
                                  const j = await res.json();
                                  if (res.ok && j.success) {
                                    setPurchaseModal(j.purchase);
                                  } else {
                                    setError(j?.message || 'Không thể tải chi tiết');
                                  }
                                } catch (err: any) {
                                  setError(err?.message || 'Lỗi khi tải');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              Xem ACC
                            </button>
                          )}
                          <button className="text-xs text-neutral-400 hover:text-white" onClick={() => navigator.clipboard?.writeText(JSON.stringify(l))}>Sao chép</button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Fetch logs on mount and when activeTab/search change
// Place effect after component to avoid hoisting issues


