import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, Filter, Star } from 'lucide-react';

export default function FindAccountBySkin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  const games = ['Liên Quân Mobile', 'Free Fire', 'PUBG Mobile', 'Mobile Legends', 'Genshin Impact'];

  const accounts = [
    {
      id: 1,
      game: 'Liên Quân Mobile',
      skins: ['Nakroth Rồng Băng', 'Violet Thiên Hà', 'Superman Siêu Anh Hùng'],
      rank: 'Cao Thủ',
      heroes: 52,
      totalSkins: 28,
      price: 800,
      rating: 4.8
    },
    {
      id: 2,
      game: 'Liên Quân Mobile',
      skins: ['Quillen Tử Thần', 'Murad Hắc Ảnh', 'Raz Siêu Sao'],
      rank: 'Kim Cương',
      heroes: 48,
      totalSkins: 25,
      price: 650,
      rating: 4.5
    },
    {
      id: 3,
      game: 'Free Fire',
      skins: ['AK47 Dragon', 'M1014 Galaxy', 'AWM Scorpion'],
      rank: 'Heroic',
      level: 68,
      totalSkins: 35,
      price: 500,
      rating: 4.7
    },
    {
      id: 4,
      game: 'PUBG Mobile',
      skins: ['M416 Glacier', 'AKM Golden', 'Set Pharaoh'],
      rank: 'Conqueror',
      level: 75,
      totalSkins: 42,
      price: 1200,
      rating: 4.9
    },
    {
      id: 5,
      game: 'Mobile Legends',
      skins: ['Fanny Lightborn', 'Gusion Cosmic Gleam', 'Kagura Cherry Witch'],
      rank: 'Mythic',
      heroes: 65,
      totalSkins: 38,
      price: 900,
      rating: 4.6
    },
    {
      id: 6,
      game: 'Genshin Impact',
      skins: ['Raiden Shogun', 'Zhongli', 'Kazuha'],
      level: 58,
      characters: 25,
      totalSkins: 15,
      price: 1500,
      rating: 5.0
    },
  ];

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchQuery === '' ||
      account.skins.some(skin => skin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      account.game.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGame = selectedGame === '' || account.game === selectedGame;

    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'low' && account.price < 500) ||
      (priceRange === 'mid' && account.price >= 500 && account.price < 1000) ||
      (priceRange === 'high' && account.price >= 1000);

    return matchesSearch && matchesGame && matchesPrice;
  });

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
            <p className="text-sm text-neutral-400">
              Tìm thấy {filteredAccounts.length} tài khoản
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredAccounts.map((account) => (
              <Card key={account.id} className="hover:border-neutral-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm mb-1">{account.game}</p>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-neutral-400">{account.rating}</span>
                    </div>
                  </div>
                  <span className="text-lg">{account.price} xu</span>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-neutral-400 mb-2">Skin nổi bật:</p>
                  <div className="flex flex-wrap gap-1">
                    {account.skins.slice(0, 2).map((skin, idx) => (
                      <span key={idx} className="text-xs bg-neutral-800 px-2 py-1 rounded">
                        {skin}
                      </span>
                    ))}
                    {account.skins.length > 2 && (
                      <span className="text-xs bg-neutral-800 px-2 py-1 rounded">
                        +{account.skins.length - 2} khác
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-neutral-400">
                  <div>
                    <p className="text-neutral-500">Rank</p>
                    <p className="text-white">{account.rank}</p>
                  </div>
                  {account.heroes && (
                    <div>
                      <p className="text-neutral-500">Tướng</p>
                      <p className="text-white">{account.heroes}</p>
                    </div>
                  )}
                  {account.level && (
                    <div>
                      <p className="text-neutral-500">Level</p>
                      <p className="text-white">{account.level}</p>
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
                    <p className="text-white">{account.totalSkins}</p>
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
