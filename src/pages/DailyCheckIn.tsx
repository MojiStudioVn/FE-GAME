import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Check, Lock } from 'lucide-react';

export default function DailyCheckIn() {
  const [checkedDays, setCheckedDays] = useState([1, 2, 3]);
  const currentDay = 4;

  const rewards = [
    { day: 1, coins: 10, bonus: false },
    { day: 2, coins: 15, bonus: false },
    { day: 3, coins: 20, bonus: false },
    { day: 4, coins: 25, bonus: false },
    { day: 5, coins: 30, bonus: false },
    { day: 6, coins: 40, bonus: false },
    { day: 7, coins: 100, bonus: true },
    { day: 8, coins: 15, bonus: false },
    { day: 9, coins: 20, bonus: false },
    { day: 10, coins: 25, bonus: false },
    { day: 11, coins: 30, bonus: false },
    { day: 12, coins: 35, bonus: false },
    { day: 13, coins: 45, bonus: false },
    { day: 14, coins: 150, bonus: true },
  ];

  const handleCheckIn = () => {
    if (!checkedDays.includes(currentDay)) {
      setCheckedDays([...checkedDays, currentDay]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Điểm danh mỗi ngày"
        description="Điểm danh hàng ngày để nhận xu miễn phí"
      />

      <Card className="mb-6">
        <div className="text-center py-6">
          <p className="text-sm text-neutral-400 mb-2">Chuỗi điểm danh hiện tại</p>
          <p className="text-4xl mb-4">{checkedDays.length} ngày</p>
          <Button onClick={handleCheckIn} disabled={checkedDays.includes(currentDay)}>
            {checkedDays.includes(currentDay) ? 'Đã điểm danh hôm nay' : 'Điểm danh ngay'}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg mb-4">Phần thưởng điểm danh</h3>
        <div className="grid grid-cols-7 gap-3">
          {rewards.map((reward) => {
            const isChecked = checkedDays.includes(reward.day);
            const isCurrent = reward.day === currentDay;
            const isLocked = reward.day > currentDay;

            return (
              <div
                key={reward.day}
                className={`
                  relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                  ${isCurrent ? 'border-white bg-neutral-800' : 'border-neutral-800'}
                  ${isChecked ? 'bg-neutral-800' : 'bg-neutral-900'}
                  ${reward.bonus ? 'border-yellow-500' : ''}
                `}
              >
                {isChecked && (
                  <div className="absolute top-1 right-1">
                    <Check size={16} className="text-green-500" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Lock size={20} className="text-neutral-600" />
                  </div>
                )}
                <p className="text-xs text-neutral-500 mb-1">Ngày {reward.day}</p>
                <p className="text-sm">{reward.coins} xu</p>
                {reward.bonus && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded">
                    x2
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
