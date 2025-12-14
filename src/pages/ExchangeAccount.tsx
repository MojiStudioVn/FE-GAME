import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Shield, Sparkles, ShoppingBag, Zap, Activity, Circle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function ExchangeAccount() {
  const [selectedPackage, setSelectedPackage] = useState<'ss' | 'sss' | null>(null);

  // API base (local backend)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // If you previously used an iframe for remote debugging, it's removed when fetching local API.

  // Package data (fallback static)
  const staticPackages = [
    {
      id: 'ss',
      name: 'ACC SS',
      label: 'GÓI PHỔ THÔNG',
      price: 300,
      limit: 199725,
      icon: Shield,
      features: [
        'Gói acc giá mềm, ưu tiên nhiều skin & lịch sử sạch.',
        'Acc random từ file admin up, ưu tiên acc sạch & ít tranh chấp.',
        'Chi tiết TK/MK hiện thị ngay, kèm nút Check Acc để hệ thống test giúp.',
        'Tất cả giao dịch được ghi log để hỗ trợ khi cần.'
      ],
      description: 'Thanh toán thẳng từ số xu trong ví của bạn.',
      tradeDelay: 'Trừ xu xong hệ thống trả ACC ngay tại đây.'
    },
    {
      id: 'sss',
      name: 'ACC SSS',
      label: 'SIÊU VIP',
      price: 5000,
      limit: null,
      icon: Sparkles,
      features: [
        'Acc SSS được quản lý tách riêng tại shop chính thức.',
        'Xem trước skin / thông tin acc rõi mới quyết định.',
        'Khuyến nghị chỉ dùng link chính thức bên dưới để tránh giả mạo.'
      ],
      description: 'Acc SSS / Anime, chọn trực tiếp tại shop chính thức.',
      tradeDelay: 'Thanh toán và chọn ACC ngay trên trang shop riêng.',
      shopUrl: 'buiducthuan.pro',
      shopNote: 'Shop hiện thị rõ rank / skin SSS để bạn lựa chọn.',
      actionLabel: 'Mở shop ACC SSS',
      actionNote: 'Shop sẽ mở trong tab mới để bạn tham khảo thoải mái.'
    }
  ];

  // Community activity feed
  const communityActivity = [
    { id: 1, user: 'songdeptraivclhaha', type: 'ss', time: '17:34', status: 'verified' },
    { id: 2, user: 'trongnguyenhikihiki', type: 'ss', time: '17:34', status: 'pending' },
    { id: 3, user: 'binbebongkihi', type: 'ss', time: '17:34', status: 'pending' },
  ];

  // Recent exchanges
  const recentExchanges = [
    {
      id: 1,
      user: 'HIEUTHUHAIcool',
      type: 'sss',
      badge: 'NỔ SSS',
      skins: 'Skin: Tulen Thần Sư STL-79, Ájri Thứ Nguyên Về Thần, Murad Zenitsu Agatsuma, Nakroth Thứ Nguyên Về Thần, Tulen Chỉ Tôn Kiếm Tiên',
      time: '17:34',
      status: 'verified'
    },
    {
      id: 2,
      user: 'Duadenodua',
      type: 'sss',
      badge: 'NỔ SSS',
      skins: 'Skin: Butterfly Bình Minh Tận Thế (EVO), Richter Kiếm Thần Susanoo, Murad Tuyết Thể Thần Binh, Nakroth Killua, Tel\'Annas Lẫn Quang Thành Điệu',
      time: '17:34',
      status: 'verified'
    },
    {
      id: 3,
      user: 'qqtuan',
      type: 'ss',
      badge: '100 SKIN',
      skins: 'Skin: Charlotte Hexsword, Ryoma Ultraman',
      time: '17:34',
      status: 'verified'
    },
    {
      id: 4,
      user: 'trongdeptraivclhaha',
      type: 'ss',
      badge: '100 SKIN',
      skins: '',
      time: '17:31',
      status: 'verified'
    },
    {
      id: 5,
      user: 'Ducchi',
      type: 'ss',
      badge: '100 SKIN',
      skins: '',
      time: '17:28',
      status: 'verified'
    }
  ];

  // Fetched data state
  const [fetchedPackages, setFetchedPackages] = useState<any[] | null>(null);
  const [userCoins, setUserCoins] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [boughtAccount, setBoughtAccount] = useState<any | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const packageCandidates = ['/exchange/packages', '/packages', '/shop/packages', '/exchange'];
    // Prefer the auth-prefixed endpoints first (backend exposes /api/auth/me)
    const userCandidates = ['/auth/me', '/me', '/profile'];

    const tryFetchPackages = async () => {
      for (const path of packageCandidates) {
        try {
          const res = await fetch(`${API_URL}${path}`, { headers });
          if (!res.ok) continue;
          const j = await res.json();
          // Accept either an array or { packages: [...] }
          if (Array.isArray(j)) return j;
          if (Array.isArray(j.packages)) return j.packages;
          if (Array.isArray(j.data)) return j.data;
        } catch (e) {
          // try next
        }
      }
      return null;
    };

    const tryFetchUser = async () => {
      for (const path of userCandidates) {
        try {
          const res = await fetch(`${API_URL}${path}`, { headers });
          if (!res.ok) continue;
          const j = await res.json();
          // common shapes: { coins: number } or { data: { coins } } or { user: { coins } }
          if (typeof j.coins === 'number') return j.coins;
          if (j.data && typeof j.data.coins === 'number') return j.data.coins;
          if (j.user && typeof j.user.coins === 'number') return j.user.coins;
          if (j.balance && typeof j.balance.coins === 'number') return j.balance.coins;
        } catch (e) {
          // try next
        }
      }
      return null;
    };

    const normalizePkg = (p: any) => {
      // try multiple possible property names
      const id = p.id || p._id || p.key || p.name?.toLowerCase?.() || 'unknown';
      const name = p.name || p.title || p.label || id;
      const price = Number(p.price ?? p.cost ?? p.amount ?? p.reward ?? 0);
      const limit = Number(p.limit ?? p.stock ?? p.quantity ?? p.kho ?? null) || null;
      const description = p.description || p.desc || p.note || '';
      const tradeDelay = p.tradeDelay || p.delay || p.note || '';
      const features = Array.isArray(p.features) ? p.features : (p.featuresText ? [p.featuresText] : []);
      return { id, name, price, limit, description, tradeDelay, features, shopUrl: p.shopUrl, actionLabel: p.actionLabel, actionNote: p.actionNote };
    };

    (async () => {
      setLoadingData(true);
      setFetchError(null);
      try {
        const [pkgs, coins] = await Promise.all([tryFetchPackages(), tryFetchUser()]);
        if (pkgs) {
          const normalized = (pkgs as any[]).map(normalizePkg);
          setFetchedPackages(normalized);
        }
        if (typeof coins === 'number') setUserCoins(coins);
      } catch (err: any) {
        setFetchError(err?.message || 'Failed to fetch data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const handleBuy = async (pkgId: string) => {
    setBuyError(null);
    setBoughtAccount(null);
    const token = localStorage.getItem('token');
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      setBuying(true);
      const res = await fetch(`${API_URL}/exchange/buy`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ packageId: pkgId }),
      });
      const j = await res.json();
      if (!res.ok) {
        const msg = j?.message || 'Lỗi mua hàng';
        setBuyError(msg);
        showToast({ type: 'error', title: 'Lỗi mua hàng', message: msg, duration: 6000 });
        return;
      }

      // success
      setBoughtAccount(j.account || null);
      if (typeof j.remainingCoins === 'number') setUserCoins(j.remainingCoins);
      // show global toast success
      showToast({ type: 'success', title: 'Đã mua hàng thành công', message: 'Vui lòng kiểm tra lịch sử giao dịch', duration: 8000 });

      // decrement local package stock if we have fetchedPackages
      if (fetchedPackages && Array.isArray(fetchedPackages)) {
        setFetchedPackages((prev) => {
          if (!prev) return prev;
          return prev.map((p) => {
            if (p.id === pkgId) {
              const newLimit = (typeof p.limit === 'number' ? p.limit : 0) - 1;
              return { ...p, limit: newLimit };
            }
            return p;
          });
        });
      }
    } catch (e: any) {
      const msg = e?.message || 'Lỗi mạng';
      setBuyError(msg);
      showToast({ type: 'error', title: 'Lỗi mua hàng', message: msg, duration: 6000 });
    } finally {
      setBuying(false);
    }
  };

  const navigate = useNavigate();
  const packagesToRender = fetchedPackages && fetchedPackages.length ? fetchedPackages : staticPackages;

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Đổi ACC: VIP Pro"
        description="Hệ thống đổi ACC tự động, log đầy đủ để tránh tranh chấp. Sau khi trừ xu xong, tài khoản sẽ hiện thị ngay và bạn có thể bấm Check Acc để hệ thống kiểm tra giúp."
      />

      {/* Debug: show fetched data shapes for verification */}
      {(fetchedPackages || userCoins !== null) && (
        <div className="mb-4 p-3 bg-neutral-900/40 rounded border border-neutral-800 text-xs text-neutral-300">
          <div className="mb-2 font-semibold">Debug: fetched data</div>
          <pre className="whitespace-pre-wrap max-h-40 overflow-auto">{JSON.stringify({ packages: fetchedPackages, userCoins }, null, 2)}</pre>
        </div>
      )}

      {/* Info badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <Shield size={16} className="text-blue-400" />
          <span className="text-sm text-neutral-300">Anti-scam • Có log hỗ trợ tranh chấp</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-sm text-neutral-300">Random nhiều skin ngon dễ leo rank</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <Activity size={16} className="text-green-400" />
          <span className="text-sm text-neutral-300">Kho cập nhật mỗi ngày</span>
        </div>
      </div>
        {/* Slide-in error modal (local) */}
        {/* error modal replaced by global Toast */}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {loadingData ? (
          <div className="col-span-2 text-center text-neutral-400">Đang tải dữ liệu...</div>
        ) : fetchError ? (
          <div className="col-span-2 text-center text-red-400">Lỗi tải dữ liệu: {fetchError}</div>
        ) : (
          packagesToRender.map((pkg: any) => {
            // some package objects (from normalized fetched data) may not include
            // an `icon` property or `features` array. Provide safe fallbacks so
            // React never tries to render `undefined` as a component.
            const Icon = pkg.icon || Shield;
            const features = Array.isArray(pkg.features) ? pkg.features : [];
            // numeric stock for display/logic (treat null/undefined as 0)
            const stock = Number(pkg.limit ?? 0);
            return (
              <Card key={pkg.id} className="border-neutral-700 hover:border-neutral-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Icon size={24} className={pkg.id === 'ss' ? 'text-blue-400' : 'text-purple-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{pkg.name}</h3>
                      {stock <= 0 && (
                        <span title="Hết hàng" className="ml-2 inline-block px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                          Hết hàng
                        </span>
                      )}
                      {pkg.id === 'sss' && (
                        <span className="px-2 py-0.5 bg-orange-500 text-black text-xs font-bold rounded">
                          {pkg.label}
                        </span>
                      )}
                    </div>
                    {pkg.id === 'ss' && (
                      <span className="text-xs text-neutral-400">{pkg.label}</span>
                    )}
                  </div>
                </div>
                <Sparkles size={20} className="text-neutral-600" />
              </div>

                <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">{pkg.price}</span>
                  <span className="text-neutral-400">xu</span>
                </div>
                {
                  // Always show stock. If backend returns null/undefined, treat as 0 for display.
                }
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingBag size={14} className="text-green-400" />
                  <span className="text-neutral-400">Kho:</span>
                  <span className="text-white font-semibold">{Number(pkg.limit ?? 0).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-neutral-300 mb-4">{pkg.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Zap size={12} className="text-yellow-400" />
                  <span>{pkg.tradeDelay}</span>
                </div>
              </div>

              {pkg.shopUrl && (
                <div className="mb-4 p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink size={14} className="text-purple-400" />
                    <span className="text-sm font-semibold">Mua tại: {pkg.shopUrl}</span>
                  </div>
                  <p className="text-xs text-neutral-400">{pkg.shopNote}</p>
                </div>
              )}

              <div className="mb-4">
                <div className="text-xs text-neutral-400 mb-2">Số xu hiện tại</div>
                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <span className="text-sm">{(userCoins ?? 0).toLocaleString()} xu / {pkg.price} xu</span>
                </div>
              </div>

              <ul className="space-y-2 mb-4 text-sm">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Circle size={6} className="mt-1.5 flex-shrink-0 fill-current text-neutral-500" />
                    <span className="text-neutral-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${pkg.id === 'ss' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'} text-black font-semibold`}
                onClick={() => {
                  // If package provides an actionLabel + shopUrl (SSS), open internal shop page
                  if (pkg.id === 'sss' && pkg.shopUrl) {
                    navigate('/dashboard/shop-acc');
                    return;
                  }
                  handleBuy(pkg.id);
                }}
                disabled={stock <= 0 || buying}
              >
                {stock <= 0 ? 'Hết hàng' : (buying ? 'Đang xử lý...' : (pkg.actionLabel || `Đổi ACC ${pkg.name} ngay`))}
              </Button>

              {pkg.actionNote && (
                <p className="text-xs text-neutral-500 text-center mt-2">{pkg.actionNote}</p>
              )}

              {pkg.id === 'ss' && (
                <p className="text-xs text-center text-neutral-500 mt-3">
                  Không đủ xu – vào mục <span className="text-blue-400">Mua xu</span> để nạp thêm.
                </p>
              )}
              </Card>
            );
          })
        )}
      </div>

      {/* Purchase result (removed inline error box - errors show as slide-in modal) */}

      {boughtAccount && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded">
          <h4 className="font-semibold mb-2">Mua thành công — thông tin tài khoản</h4>
          <div className="text-sm">
            <div><strong>Username:</strong> {boughtAccount.username}</div>
            <div><strong>Password:</strong> {boughtAccount.password}</div>
            {Array.isArray(boughtAccount.ssCards) && boughtAccount.ssCards.length > 0 && (
              <div><strong>SS Cards:</strong> {boughtAccount.ssCards.join(', ')}</div>
            )}
            {Array.isArray(boughtAccount.sssCards) && boughtAccount.sssCards.length > 0 && (
              <div><strong>SSS Cards:</strong> {boughtAccount.sssCards.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {/* success modal replaced by global Toast */}

      {/* Community Activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity size={20} className="text-green-400" />
              Tin nóng cộng đồng
            </h3>
            <div className="space-y-2">
              {communityActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 px-3 py-2 bg-neutral-900/50 rounded-lg border border-neutral-800"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {activity.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.user}</p>
                      <p className="text-xs text-neutral-500">• nỗ {activity.type.toUpperCase()}</p>
                    </div>
                  </div>
                  {activity.status === 'verified' && (
                    <Shield size={14} className="text-green-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="space-y-3">
              {recentExchanges.map((exchange) => (
                <div
                  key={exchange.id}
                  className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {exchange.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{exchange.user} đã nổ acc {exchange.type.toUpperCase()}</p>
                        <p className="text-xs text-neutral-500">{exchange.time} • Hệ thống xác nhận</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      exchange.badge === 'NỔ SSS'
                        ? 'bg-purple-500 text-black'
                        : 'bg-yellow-500 text-black'
                    }`}>
                      {exchange.badge}
                    </span>
                  </div>
                  {exchange.skins && (
                    <p className="text-xs text-neutral-400 mt-2">{exchange.skins}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
