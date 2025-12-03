import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Clock, Flame, TrendingUp, Gavel } from 'lucide-react';

export default function BuyAuctionAccount() {
  const [activeTab, setActiveTab] = useState<'buy' | 'auction'>('buy');

  const buyNowAccounts = [
    {
      id: 1,
      game: 'Liên Quân Mobile',
      rank: 'Cao Thủ I',
      heroes: 58,
      skins: 35,
      price: 1200,
      type: 'hot',
      seller: 'ProGamer123'
    },
    {
      id: 2,
      game: 'Free Fire',
      rank: 'Heroic',
      level: 72,
      weapons: 45,
      price: 800,
      type: 'normal',
      seller: 'FFMaster'
    },
    {
      id: 3,
      game: 'PUBG Mobile',
      rank: 'Ace Dominator',
      level: 80,
      skins: 50,
      price: 1500,
      type: 'vip',
      seller: 'PUBGKing'
    },
    {
      id: 4,
      game: 'Mobile Legends',
      rank: 'Mythical Glory',
      heroes: 70,
      skins: 45,
      price: 1800,
      type: 'hot',
      seller: 'MLPro'
    },
  ];

  const auctionAccounts = [
    {
      id: 1,
      game: 'Liên Quân Mobile',
      rank: 'Vinh Quang Huyền Thoại',
      heroes: 65,
      skins: 48,
      currentBid: 2500,
      startPrice: 2000,
      bidders: 12,
      timeLeft: '2 giờ 35 phút',
      seller: 'TopPlayer'
    },
    {
      id: 2,
      game: 'Genshin Impact',
      characters: 35,
      level: 60,
      weapons: 28,
      currentBid: 3200,
      startPrice: 2500,
      bidders: 18,
      timeLeft: '5 giờ 12 phút',
      seller: 'GenshinWhale'
    },
    {
      id: 3,
      game: 'Free Fire',
      rank: 'Grandmaster',
      level: 75,
      weapons: 52,
      currentBid: 1500,
      startPrice: 1000,
      bidders: 8,
      timeLeft: '1 giờ 20 phút',
      seller: 'FFCollector'
    },
  ];

  const myBids = [
    { id: 1, game: 'Liên Quân Mobile', myBid: 2500, currentBid: 2500, status: 'Đang dẫn đầu' },
    { id: 2, game: 'PUBG Mobile', myBid: 1800, currentBid: 2000, status: 'Bị vượt' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Mua/Đấu giá ACC"
        description="Mua ngay hoặc tham gia đấu giá tài khoản game"
      />

      <div className="flex gap-3 mb-6">
        <Button
          variant={activeTab === 'buy' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('buy')}
        >
          Mua ngay
        </Button>
        <Button
          variant={activeTab === 'auction' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('auction')}
        >
          Đấu giá
        </Button>
      </div>

      {activeTab === 'buy' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg mb-4">Tài khoản có sẵn</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {buyNowAccounts.map((account) => (
                <Card key={account.id} className="relative hover:border-neutral-600">
                  {account.type === 'hot' && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Flame size={12} />
                        HOT
                      </div>
                    </div>
                  )}
                  {account.type === 'vip' && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        ⭐ VIP
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-sm mb-1">{account.game}</p>
                    <p className="text-xs text-neutral-400">Rank: {account.rank}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    {account.heroes && (
                      <>
                        <div>
                          <p className="text-neutral-500">Tướng</p>
                          <p>{account.heroes}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Skin</p>
                          <p>{account.skins}</p>
                        </div>
                      </>
                    )}
                    {account.level && (
                      <>
                        <div>
                          <p className="text-neutral-500">Level</p>
                          <p>{account.level}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Vũ khí</p>
                          <p>{account.weapons}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3 pt-3 border-t border-neutral-800">
                    <p className="text-xs text-neutral-400">Người bán: {account.seller}</p>
                    <p className="text-lg">{account.price} xu</p>
                  </div>

                  <Button size="sm" className="w-full">Mua ngay</Button>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-lg mb-4">Hướng dẫn mua ACC</h3>
              <div className="space-y-3 text-sm text-neutral-400">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">1</span>
                  <p>Chọn tài khoản phù hợp</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">2</span>
                  <p>Kiểm tra thông tin chi tiết</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">3</span>
                  <p>Thanh toán bằng xu</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">4</span>
                  <p>Nhận thông tin tài khoản</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg mb-3">Chính sách</h3>
              <div className="space-y-2 text-xs text-neutral-400">
                <p>• Kiểm tra kỹ thông tin trước khi mua</p>
                <p>• Bảo hành 7 ngày đổi trả</p>
                <p>• Hỗ trợ 24/7 khi gặp vấn đề</p>
                <p>• Thanh toán an toàn, bảo mật</p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg mb-4">Phiên đấu giá đang diễn ra</h3>
            <div className="space-y-4 mb-6">
              {auctionAccounts.map((account) => (
                <Card key={account.id} className="hover:border-neutral-600">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm mb-1">{account.game}</p>
                          {account.rank && (
                            <p className="text-xs text-neutral-400">Rank: {account.rank}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                          <Clock size={16} />
                          {account.timeLeft}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        {account.heroes && (
                          <>
                            <div>
                              <p className="text-neutral-500">Tướng</p>
                              <p>{account.heroes}</p>
                            </div>
                            <div>
                              <p className="text-neutral-500">Skin</p>
                              <p>{account.skins}</p>
                            </div>
                          </>
                        )}
                        {account.characters && (
                          <div>
                            <p className="text-neutral-500">Nhân vật</p>
                            <p>{account.characters}</p>
                          </div>
                        )}
                        {account.level && (
                          <div>
                            <p className="text-neutral-500">Level</p>
                            <p>{account.level}</p>
                          </div>
                        )}
                        {account.weapons && (
                          <div>
                            <p className="text-neutral-500">Vũ khí</p>
                            <p>{account.weapons}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
                        <span>Giá khởi điểm: {account.startPrice} xu</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          {account.bidders} người đấu giá
                        </span>
                      </div>
                    </div>

                    <div className="md:w-48 flex flex-col justify-between">
                      <div className="text-center mb-3">
                        <p className="text-xs text-neutral-400 mb-1">Giá hiện tại</p>
                        <p className="text-2xl text-green-500">{account.currentBid} xu</p>
                      </div>
                      <Button size="sm" className="w-full">
                        <Gavel size={14} className="mr-2" />
                        Đấu giá
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-lg mb-4">Phiên đấu giá của tôi</h3>
              <div className="space-y-3">
                {myBids.map((bid) => (
                  <div key={bid.id} className="pb-3 border-b border-neutral-800 last:border-0 last:pb-0">
                    <p className="text-sm mb-2">{bid.game}</p>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-neutral-400">Giá của bạn</span>
                      <span>{bid.myBid} xu</span>
                    </div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-neutral-400">Giá hiện tại</span>
                      <span>{bid.currentBid} xu</span>
                    </div>
                    <span className={`text-xs ${
                      bid.status === 'Đang dẫn đầu' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg mb-4">Quy tắc đấu giá</h3>
              <div className="space-y-3 text-sm text-neutral-400">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">1</span>
                  <p>Đặt giá cao hơn giá hiện tại</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">2</span>
                  <p>Bước giá tối thiểu: 50 xu</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">3</span>
                  <p>Người trả giá cao nhất thắng</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">4</span>
                  <p>Xu được giữ tới khi hết hạn</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg mb-3">Lưu ý</h3>
              <div className="space-y-2 text-xs text-neutral-400">
                <p>• Chỉ người thắng mới bị trừ xu</p>
                <p>• Không thể hủy sau khi đặt giá</p>
                <p>• Nhận ACC ngay khi phiên kết thúc</p>
                <p>• Liên hệ CSKH nếu có vấn đề</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
