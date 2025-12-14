import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, Filter, Star } from 'lucide-react';

export default function FindAccountBySkin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const games = ['Liên Quân Mobile', 'Free Fire', 'PUBG Mobile', 'Mobile Legends', 'Genshin Impact'];

  // debounce input
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); // reset page on new search
      fetchAccounts(1);
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGame, priceRange]);

  const buildPriceParams = () => {
    if (priceRange === 'low') return { maxPrice: 499 };
    if (priceRange === 'mid') return { minPrice: 500, maxPrice: 999 };
    if (priceRange === 'high') return { minPrice: 1000 };
    return {};
  };

  const fetchAccounts = async (p = page) => {
    if (!searchQuery) {
      setAccounts([]);
      setTotalCount(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('skin', searchQuery);
      if (selectedGame) params.set('game', selectedGame);
      const priceParams = buildPriceParams();
      if (priceParams.minPrice) params.set('minPrice', String(priceParams.minPrice));
      if (priceParams.maxPrice) params.set('maxPrice', String(priceParams.maxPrice));
      params.set('page', String(p));
      params.set('limit', '20');

      const res = await fetch(`/api/public/find-account?${params.toString()}`);
      const j = await res.json();
      if (res.ok && j.success) {
        setAccounts(j.accounts || []);
        setTotalCount(j.pagination?.total || 0);
        setTotalPages(j.pagination?.pages || 1);
      } else {
        setAccounts([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      setAccounts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Tìm ACC theo Skin"
        description="Tìm kiếm tài khoản game theo skin yêu thích"
      />

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <Filter size={20} />
              Bộ lọc
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 mb-2 block">Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tất cả game</option>
                  {games.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-2 block">Khoảng giá</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="all"
                      checked={priceRange === 'all'}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-white"
                    />
                    <span className="text-sm">Tất cả</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="low"
                      checked={priceRange === 'low'}
                      onChange={(e) => setPriceRange(e.target.value)}
                    />
                    <span className="text-sm">Dưới 500 xu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="mid"
                      checked={priceRange === 'mid'}
                      onChange={(e) => setPriceRange(e.target.value)}
                    />
                    <span className="text-sm">500 - 1000 xu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="high"
                      checked={priceRange === 'high'}
                      onChange={(e) => setPriceRange(e.target.value)}
                    />
                    <span className="text-sm">Trên 1000 xu</span>
                  </label>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedGame('');
                  setPriceRange('all');
                  setSearchQuery('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Tìm theo tên skin hoặc game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-neutral-400">Tìm thấy {totalCount} tài khoản</p>
            <div className="text-xs text-neutral-500">Trang {page} / {totalPages}</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {loading && (
              <div className="col-span-2 py-8 text-center text-neutral-400">Đang tìm kiếm...</div>
            )}

            {!loading && !searchQuery && (
              <div className="col-span-2 py-8 text-center text-neutral-400">Nhập tên skin để bắt đầu tìm kiếm</div>
            )}

            {!loading && searchQuery && accounts.length === 0 && (
              <div className="col-span-2 py-8 text-center text-neutral-400">Không tìm thấy tài khoản phù hợp</div>
            )}

            {!loading && accounts.map((account: any) => (
              <Card key={account._id || account.username} className="hover:border-neutral-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm mb-1">{account.game || account.saleType || 'Game'}</p>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-neutral-400">{account.rating ?? '-'}</span>
                    </div>
                  </div>
                  <span className="text-lg">{account.price ?? '-'} xu</span>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-neutral-400 mb-2">Skin nổi bật:</p>
                  <div className="flex flex-wrap gap-1">
                    {(account.skins || account.skins === 0 ? account.skins : []).slice(0, 2).map((skin: string, idx: number) => (
                      <span key={idx} className="text-xs bg-neutral-800 px-2 py-1 rounded">{skin}</span>
                    ))}
                    {(account.skins || []).length > 2 && (
                      <span className="text-xs bg-neutral-800 px-2 py-1 rounded">+{(account.skins || []).length - 2} khác</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-neutral-400">
                  <div>
                    <p className="text-neutral-500">Rank</p>
                    <p className="text-white">{account.rank ?? '-'}</p>
                  </div>
                  {account.heroes !== undefined && (
                    <div>
                      <p className="text-neutral-500">Tướng</p>
                      <p className="text-white">{account.heroes ?? account.heroesCount ?? '-'}</p>
                    </div>
                  )}
                  {account.level !== undefined && (
                    <div>
                      <p className="text-neutral-500">Level</p>
                      <p className="text-white">{account.level ?? '-'}</p>
                    </div>
                  )}
                  {account.characters && (
                    <div>
                      <p className="text-neutral-500">Nhân vật</p>
                      <p className="text-white">{account.characters}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-neutral-500">Tổng skin</p>
                    <p className="text-white">{account.totalSkins ?? account.skins?.length ?? account.skinsCount ?? '-'}</p>
                  </div>
                </div>

                <Button size="sm" className="w-full">Xem chi tiết</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
