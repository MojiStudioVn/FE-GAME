import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Check, Gift, Target, Calendar, Trophy, ArrowRight, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const { token, user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkedDays, setCheckedDays] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [hasCompletedMissionToday, setHasCompletedMissionToday] = useState(false);
  const [todayChecked, setTodayChecked] = useState(false);
  const [resetTime, setResetTime] = useState('06:58:51');
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');

  // Fetch check-in status
  const fetchCheckInStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/checkin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCanCheckIn(data.data.canCheckIn);
        setHasCompletedMissionToday(!!data.data.hasCompletedMissionToday);
        setTodayChecked(!!data.data.todayCheckIn);
        setCurrentStreak(data.data.currentStreak);
        setTotalCoins(data.data.totalCoins);

        // Set checked days from week check-ins
        const checkedDaysOfWeek = data.data.weekCheckIns.map((ci: any) => ci.dayOfWeek);
        setCheckedDays(checkedDaysOfWeek);

        // Format week dates
        const start = new Date(data.data.weekStart);
        const end = new Date(data.data.weekEnd);
        end.setDate(end.getDate() - 1);
        setWeekStart(formatDate(start));
        setWeekEnd(formatDate(end));
      }
    } catch (error) {
      console.error('Error fetching check-in status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
  };

  const handleCheckIn = async () => {
    if (!token || !canCheckIn) return;

    setChecking(true);
    try {
      const response = await fetch(`${API_URL}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        showToast({
          type: 'success',
          title: 'Điểm danh thành công!',
          message: data.message,
          duration: 3000,
        });

        // Refresh status and user data
        await Promise.all([fetchCheckInStatus(), refreshUser()]);
      } else {
        showToast({
          type: 'error',
          title: 'Lỗi!',
          message: data.message,
          duration: 3000,
        });
      }
    } catch (error: unknown) {
      showToast({
        type: 'error',
        title: 'Lỗi!',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại',
        duration: 3000,
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchCheckInStatus();
  }, [token]);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setResetTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate next milestone
  const getNextMilestone = () => {
    const milestones = [3, 7, 14, 30];
    for (const m of milestones) {
      if (currentStreak < m) return m;
    }
    return 30;
  };

  const nextMilestone = getNextMilestone();

  // Weekly rewards based on day of week (Monday=1, Sunday=0)
  const weeklyRewards = [
    { day: 1, coins: 200, label: 'T2' },
    { day: 2, coins: 100, label: 'T3' },
    { day: 3, coins: 100, label: 'T4' },
    { day: 4, coins: 100, label: 'T5' },
    { day: 5, coins: 150, label: 'T6' },
    { day: 6, coins: 300, label: 'T7' },
    { day: 0, coins: 300, label: 'CN' },
  ];

  const today = new Date().getDay();

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
        <PageHeader
          title="Điểm danh nhận xu"
          description="Làm nhiệm vụ mỗi ngày, điểm danh liên tục để nhận thêm thưởng chuỗi."
        />
        <Card className="text-center py-8">
          <p className="text-neutral-400">Đang tải...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Điểm danh nhận xu"
        description="Làm nhiệm vụ mỗi ngày, điểm danh liên tục để nhận thêm thưởng chuỗi."
      />

      {/* Nhiệm vụ chính */}
      <Card className="mb-6 bg-neutral-900 border-blue-800/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Target size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Làm ít nhất 1 nhiệm vụ rồi quay lại điểm danh nhận xu.</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Bạn cần làm ít nhất 1 nhiệm vụ (nhiệm vụ sẽ bị khoá 24h) rồi mới được điểm danh nhận xu.
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Gift size={16} className="text-neutral-400" />
                <span className="text-neutral-400">Thưởng theo thứ:</span>
                <span className="text-white font-semibold">100 xu</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-neutral-400" />
                <span className="text-neutral-400">Chuỗi hiện tại:</span>
                <span className="text-white font-semibold">0 ngày</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy size={16} className="text-neutral-400" />
                <span className="text-neutral-400">Mốc tiếp theo:</span>
                <span className="text-white font-semibold">3 ngày</span>
                <span className="text-neutral-500">(+50 xu)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/dashboard/missions')}
                className="bg-neutral-700 hover:bg-neutral-600 text-black"
              >
                <ArrowRight size={18} />
                {' '}Làm nhiệm vụ
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-blue-800/30">
          <div className="text-sm text-neutral-400 mb-1">HÔM NAY</div>
          <div className="text-3xl font-bold mb-1">+{weeklyRewards.find(r => r.day === today)?.coins || 100} xu</div>
          <div className="text-xs text-neutral-500">Sẵn sàng nhận ngay khi điểm danh.</div>
        </Card>

        <Card className="border-green-800/30">
          <div className="text-sm text-neutral-400 mb-1">CHUỖI NGÀY</div>
          <div className="text-3xl font-bold mb-1">{currentStreak} ngày</div>
          <div className="text-xs text-neutral-500">Bắt đầu ngày đầu tiên hôm nay.</div>
        </Card>

        <Card className="border-yellow-800/30">
          <div className="text-sm text-neutral-400 mb-1">MỐC THƯỞNG TIẾP THEO</div>
          <div className="text-3xl font-bold mb-1">{nextMilestone} ngày</div>
          <div className="text-xs text-neutral-500">Còn {nextMilestone} ngày nữa (+50 xu).</div>
        </Card>
      </div>

      {/* Lịch điểm danh */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar size={20} />
            <div>
              <span className="text-sm text-neutral-400">Tuần: </span>
              <span className="text-white font-semibold">{weekStart} – {weekEnd}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-neutral-400">Reset trong:</span>
              <span className="text-white font-semibold">{resetTime}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 mb-6">
          {weeklyRewards.map((reward, index) => {
            const isChecked = checkedDays.includes(reward.day);
            const isCurrent = reward.day === today;
            const isPast = (reward.day < today && today !== 0) || (today === 0 && reward.day < 6);

            return (
              <div
                key={index}
                className={`
                  relative rounded-lg border-2 p-4 flex flex-col items-center justify-center
                  transition-all duration-200
                  ${isCurrent ? 'border-yellow-500 bg-yellow-500/10' : 'border-neutral-800'}
                  ${isChecked ? 'bg-green-900/20 border-green-700' : 'bg-neutral-900'}
                  ${!isChecked && !isCurrent && !isPast ? 'opacity-50' : ''}
                `}
              >
                {isChecked && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}
                <p className="text-xs text-neutral-400 mb-2 whitespace-pre-line text-center">
                  {reward.label}
                </p>
                <p className={`text-lg font-bold ${isCurrent ? 'text-yellow-400' : 'text-white'}`}>
                  +{reward.coins}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Gift size={12} className="text-neutral-500" />
                  <span className="text-xs text-neutral-500">điểm Xu danh</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              <span className="text-sm text-neutral-400">Nhiệm vụ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-neutral-400">BXH</span>
            </div>
          </div>

          <Button
            onClick={handleCheckIn}
            disabled={checking || todayChecked || !hasCompletedMissionToday}
            className={
              hasCompletedMissionToday && !todayChecked
                ? 'bg-blue-500 text-black hover:bg-black hover:text-white active:bg-black active:text-white ring-4 ring-blue-400/30 shadow-lg animate-pulse transition-colors'
                : 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }
          >
            {checking ? (
              <Check size={18} />
            ) : todayChecked ? (
              <Check size={18} />
            ) : !hasCompletedMissionToday ? (
              <X size={18} />
            ) : (
              <Check size={18} />
            )}
            {checking
              ? 'Đang xử lý...'
              : todayChecked
              ? 'Đã điểm danh'
              : !hasCompletedMissionToday
              ? 'Cần hoàn thành 1 nhiệm vụ'
              : 'Điểm danh'}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Số dư hiện tại: <span className="text-white font-semibold">{user?.coins?.toLocaleString() || 0} xu</span></span>
          </div>
          <div className="text-xs text-neutral-500 mb-2">
            Điểm danh đều để nhận thưởng mốc <span className="text-yellow-400">3, 7, 14, 30</span> ngày.
          </div>
          <div className="text-xs text-neutral-500 mb-3">
            Tiến độ chuỗi (tối đa 30 ngày):
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < currentStreak ? 'bg-blue-500' :
                  [2, 6, 13, 29].includes(i) ? 'bg-yellow-500' :
                  'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
