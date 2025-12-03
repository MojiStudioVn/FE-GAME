import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Dices, Target, Gamepad2, Trophy } from 'lucide-react';

export default function MiniGame() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const games = [
    { id: 1, name: 'Vòng quay may mắn', icon: <Dices size={32} />, cost: 10, plays: 156 },
    { id: 2, name: 'Đoán số', icon: <Target size={32} />, cost: 20, plays: 89 },
    { id: 3, name: 'Tài xỉu', icon: <Gamepad2 size={32} />, cost: 15, plays: 234 },
    { id: 4, name: 'Xổ số may mắn', icon: <Trophy size={32} />, cost: 50, plays: 45 },
  ];

  const recentWins = [
    { id: 1, user: 'Player123', game: 'Vòng quay may mắn', prize: 100, time: '2 phút trước' },
    { id: 2, user: 'GamerXYZ', game: 'Tài xỉu', prize: 50, time: '5 phút trước' },
    { id: 3, user: 'ProGamer', game: 'Đoán số', prize: 150, time: '8 phút trước' },
    { id: 4, user: 'MasterChief', game: 'Xổ số may mắn', prize: 500, time: '10 phút trước' },
    { id: 5, user: 'NinjaGamer', game: 'Vòng quay may mắn', prize: 75, time: '15 phút trước' },
  ];

  const prizes = [10, 20, 30, 50, 100, 0, 15, 25];

  const handleSpin = () => {
    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setResult(randomPrize);
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Mini game"
        description="Chơi game để kiếm thêm xu và giải trí"
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg mb-4">Vòng quay may mắn</h3>
          <div className="bg-neutral-800 rounded-lg p-8 mb-4">
            <div className="max-w-md mx-auto">
              <div className="relative aspect-square bg-neutral-900 rounded-full border-4 border-neutral-700 flex items-center justify-center mb-6">
                <div className={`text-center ${spinning ? 'animate-spin' : ''}`}>
                  <Dices size={64} className="mx-auto mb-4 text-neutral-400" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
              </div>

              {result !== null && !spinning && (
                <div className="text-center mb-4 p-4 bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Kết quả</p>
                  <p className="text-3xl text-green-500">
                    {result > 0 ? `+${result} xu` : 'Chúc bạn may mắn lần sau!'}
                  </p>
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-sm text-neutral-400 mb-2">Chi phí: 10 xu mỗi lượt</p>
                <div className="grid grid-cols-4 gap-2 text-xs text-neutral-500">
                  {prizes.map((prize, idx) => (
                    <div key={idx} className="bg-neutral-900 rounded py-1">
                      {prize > 0 ? `${prize} xu` : 'Trượt'}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSpin}
                disabled={spinning}
                className="w-full"
              >
                {spinning ? 'Đang quay...' : 'Quay ngay (10 xu)'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.slice(1).map((game) => (
              <Card key={game.id} className="text-center cursor-pointer hover:bg-neutral-800">
                <div className="text-neutral-400 mb-3 flex justify-center">
                  {game.icon}
                </div>
                <p className="text-sm mb-2">{game.name}</p>
                <p className="text-xs text-neutral-500 mb-2">{game.plays} lượt chơi</p>
                <p className="text-xs text-neutral-400">{game.cost} xu/lượt</p>
              </Card>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg mb-4">Thống kê của bạn</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Tổng lượt chơi</p>
                <p className="text-2xl">45</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Tổng thắng</p>
                <p className="text-2xl text-green-500">32</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Xu kiếm được</p>
                <p className="text-2xl">+650 xu</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Tỷ lệ thắng</p>
                <p className="text-2xl">71%</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-4">Người thắng gần đây</h3>
            <div className="space-y-3">
              {recentWins.map((win) => (
                <div key={win.id} className="pb-3 border-b border-neutral-800 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm">{win.user}</p>
                    <span className="text-sm text-green-500">+{win.prize} xu</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">{win.game}</p>
                    <p className="text-xs text-neutral-500">{win.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-3">Lưu ý</h3>
            <div className="space-y-2 text-xs text-neutral-400">
              <p>• Mỗi game có xác suất thắng khác nhau</p>
              <p>• Chơi có trách nhiệm, đừng chi quá nhiều xu</p>
              <p>• Hoàn thành nhiệm vụ để có thêm xu chơi game</p>
              <p>• Giải thưởng được cộng ngay vào tài khoản</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
