import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Dices, Target, Gamepad2, Trophy } from 'lucide-react';
import { useEffect } from 'react';

export default function MiniGame() {
  const [spinning, setSpinning] = useState(false);
  const [dice, setDice] = useState<number[] | null>(null);
  const [choice, setChoice] = useState<'tai' | 'xiu'>('tai');
  const [bet, setBet] = useState<number>(10);
  const [recentWins, setRecentWins] = useState<Array<any>>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/public/minigame/recent-winners');
        const j = await res.json();
        if (j && j.success && Array.isArray(j.winners) && mounted) {
          setRecentWins(j.winners);
        }
      } catch (e) {
        console.error('Failed to load recent winners', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const [coins, setCoins] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const rollDice = async () => {
    setSpinning(true);
    setDice(null);
    setLastWin(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/public/minigame/tai-xiu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ choice, bet }),
      });
      let j = null;
      try {
        j = await res.json();
      } catch (e) {
        console.error('Failed to parse minigame response as JSON', e, await res.text());
        alert('Lỗi khi nhận phản hồi từ server');
        setSpinning(false);
        return;
      }

      if (!j || !j.success) {
        console.warn('Minigame returned error', j);
        alert((j && j.message) || 'Lỗi khi chơi');
        setSpinning(false);
        return;
      }

      // reveal with animation delay to match client animation
      setTimeout(() => {
        const result = j.result || {};
        if (Array.isArray(result.dice)) setDice(result.dice);
        setLastWin(result.winAmount || 0);
        if (typeof j.coins === 'number') setCoins(j.coins);
        setSpinning(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      alert('Lỗi mạng khi chơi');
      setSpinning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Mini game"
        description="Chơi game để kiếm thêm xu và giải trí"
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg mb-4">Tài Xỉu</h3>
          <div className="bg-neutral-800 rounded-lg p-8 mb-4">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-neutral-400 mb-2">Lựa chọn</div>
                  <div className="flex gap-2">
                    <button onClick={() => setChoice('tai')} className={`px-4 py-2 rounded ${choice === 'tai' ? 'bg-green-500 text-black' : 'bg-neutral-900'}`}>
                      Tài
                    </button>
                    <button onClick={() => setChoice('xiu')} className={`px-4 py-2 rounded ${choice === 'xiu' ? 'bg-yellow-500 text-black' : 'bg-neutral-900'}`}>
                      Xỉu
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-neutral-400 mb-2">Cược (xu)</div>
                  <input type="number" value={bet} min={1} onChange={e => setBet(Number(e.target.value) || 1)} className="w-24 px-3 py-2 rounded bg-neutral-900 text-white text-center" />
                </div>
              </div>

              <style>{`
                @keyframes diceThrow {
                  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                  30% { transform: translateY(-40px) rotate(380deg); }
                  70% { transform: translateY(-10px) rotate(720deg); }
                  100% { transform: translateY(0) rotate(900deg); }
                }
                .dice {
                  width: 64px; height: 64px; display:flex; align-items:center; justify-content:center; border-radius:8px;
                }
                .diceAnimate { animation-name: diceThrow; animation-duration: 1.2s; animation-timing-function: cubic-bezier(.2,.8,.2,1); }
              `}</style>

              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3">
                  {[0,1,2].map(i => (
                    <div key={i} className={`dice ${spinning ? 'diceAnimate' : ''} bg-neutral-900 flex items-center justify-center text-2xl font-bold`} style={{ animationDelay: `${i * 80}ms` }}>
                      {!spinning && dice ? dice[i] : ''}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={rollDice} disabled={spinning} className="w-full">
                {spinning ? 'Đang gieo...' : 'Gieo xí ngầu'}
              </Button>

              {dice && !spinning && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-neutral-400 mb-1">Kết quả</div>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const s = dice.reduce((a,b) => a+b, 0);
                      return `${dice.join(' + ')} = ${s} → ${s >= 11 ? 'Tài' : 'Xỉu'}`;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg mb-4">Thống kê của bạn</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Số xu hiện có</p>
                <p className="text-2xl">{coins !== null ? `${coins} xu` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Lần chơi gần nhất</p>
                <p className="text-2xl text-green-500">{lastWin !== null ? (lastWin > 0 ? `Thắng +${lastWin} xu` : `Thua`) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Tổng lượt chơi (tạm)</p>
                <p className="text-2xl">45</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Tỷ lệ thắng (tạm)</p>
                <p className="text-2xl">71%</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-4">Người thắng gần đây (Tài Xỉu)</h3>
            <div className="space-y-3">
              {recentWins.length === 0 && (
                <div className="text-sm text-neutral-500">Chưa có người thắng gần đây</div>
              )}
              {recentWins.map((win) => (
                <div key={win.id} className="pb-3 border-b border-neutral-800 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm">{win.username}</p>
                    <span className="text-sm text-green-500">+{win.prize} xu</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">Tài xỉu</p>
                    <p className="text-xs text-neutral-500">{new Date(win.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-3">Lưu ý</h3>
            <div className="space-y-2 text-xs text-neutral-400">
              <p>• Tài xỉu là game gieo 3 xí ngầu, tổng 11-18 là Tài, 3-10 là Xỉu</p>
              <p>• Chơi có trách nhiệm, đừng chi quá nhiều xu</p>
              <p>• Giải thưởng được cộng ngay vào tài khoản</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
