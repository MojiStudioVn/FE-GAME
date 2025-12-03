import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function ExchangeAccount() {
  const [selectedGame, setSelectedGame] = useState('');

  const games = ['Liên Quân Mobile', 'Free Fire', 'PUBG Mobile', 'Mobile Legends', 'Genshin Impact'];

  const myAccounts = [
    { id: 1, game: 'Liên Quân Mobile', rank: 'Kim Cương III', heroes: 45, skins: 23, value: 500 },
    { id: 2, game: 'Free Fire', rank: 'Heroic', level: 65, weapons: 30, value: 300 },
  ];

  const availableAccounts = [
    { id: 1, game: 'Liên Quân Mobile', rank: 'Cao Thủ II', heroes: 50, skins: 30, value: 600, user: 'Player123' },
    { id: 2, game: 'Free Fire', rank: 'Grandmaster', level: 70, weapons: 35, value: 400, user: 'GamerXYZ' },
    { id: 3, game: 'PUBG Mobile', rank: 'Ace', level: 80, skins: 25, value: 550, user: 'ProGamer' },
    { id: 4, game: 'Mobile Legends', rank: 'Mythic', heroes: 60, skins: 40, value: 700, user: 'MLPlayer' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Đổi ACC"
        description="Trao đổi tài khoản game với người chơi khác"
      />

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-500 mb-1">Lưu ý quan trọng</p>
          <p className="text-xs text-neutral-300">
            Vui lòng kiểm tra kỹ thông tin tài khoản trước khi đổi. Hệ thống sẽ giữ tài khoản trong 24h để cả hai bên xác nhận.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Tài khoản của tôi</h3>
              <Button variant="outline" size="sm">+ Thêm tài khoản</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {myAccounts.map((account) => (
                <Card key={account.id} className="border-neutral-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm mb-1">{account.game}</p>
                      <p className="text-xs text-neutral-400">Rank: {account.rank}</p>
                    </div>
                    <span className="text-xs bg-neutral-800 px-2 py-1 rounded">{account.value} xu</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-neutral-400">
                    {'heroes' in account && (
                      <>
                        <div>Tướng: {account.heroes}</div>
                        <div>Skin: {account.skins}</div>
                      </>
                    )}
                    {'level' in account && (
                      <>
                        <div>Level: {account.level}</div>
                        <div>Vũ khí: {account.weapons}</div>
                      </>
                    )}
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">Chọn để đổi</Button>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg">Tài khoản có sẵn để đổi</h3>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Tất cả game</option>
                {games.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {availableAccounts
                .filter(acc => !selectedGame || acc.game === selectedGame)
                .map((account) => (
                  <Card key={account.id} className="hover:border-neutral-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm mb-1">{account.game}</p>
                        <p className="text-xs text-neutral-400">Rank: {account.rank}</p>
                      </div>
                      <span className="text-xs bg-neutral-800 px-2 py-1 rounded">{account.value} xu</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-neutral-400">
                      {'heroes' in account && (
                        <>
                          <div>Tướng: {account.heroes}</div>
                          <div>Skin: {account.skins}</div>
                        </>
                      )}
                      {'level' in account && (
                        <>
                          <div>Level: {account.level}</div>
                          <div>Vũ khí: {account.weapons}</div>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mb-3">Chủ sở hữu: {account.user}</p>
                    <Button size="sm" className="w-full">
                      <RefreshCw size={14} className="mr-2" />
                      Đề nghị đổi
                    </Button>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        <div>
          <Card className="mb-4">
            <h3 className="text-lg mb-4">Yêu cầu đổi ACC gần đây</h3>
            <div className="space-y-3">
              <div className="pb-3 border-b border-neutral-800">
                <p className="text-sm mb-1">GamerXYZ → Bạn</p>
                <p className="text-xs text-neutral-400 mb-2">Free Fire Grandmaster</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">Từ chối</Button>
                  <Button size="sm" className="flex-1">Chấp nhận</Button>
                </div>
              </div>
              <div className="pb-3 border-b border-neutral-800">
                <p className="text-sm mb-1">Bạn → ProGamer</p>
                <p className="text-xs text-neutral-400 mb-2">PUBG Mobile Ace</p>
                <span className="text-xs text-yellow-500">Đang chờ phản hồi</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-3">Quy trình đổi ACC</h3>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">1</span>
                <p>Chọn tài khoản của bạn</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">2</span>
                <p>Gửi đề nghị đổi ACC</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">3</span>
                <p>Chờ đối phương chấp nhận</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">4</span>
                <p>Hệ thống giữ ACC trong 24h</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">5</span>
                <p>Xác nhận và hoàn tất giao dịch</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
