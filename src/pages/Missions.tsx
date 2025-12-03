import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckCircle, Circle } from 'lucide-react';

export default function Missions() {
  const missions = [
    {
      id: 1,
      title: 'Đăng nhập hàng ngày',
      description: 'Đăng nhập vào hệ thống mỗi ngày',
      progress: 7,
      total: 7,
      reward: 50,
      completed: true,
      type: 'daily'
    },
    {
      id: 2,
      title: 'Hoàn thành 5 nhiệm vụ',
      description: 'Hoàn thành 5 nhiệm vụ bất kỳ trong ngày',
      progress: 3,
      total: 5,
      reward: 30,
      completed: false,
      type: 'daily'
    },
    {
      id: 3,
      title: 'Chơi 3 mini game',
      description: 'Tham gia chơi 3 lượt mini game',
      progress: 1,
      total: 3,
      reward: 25,
      completed: false,
      type: 'daily'
    },
    {
      id: 4,
      title: 'Mời 5 bạn bè',
      description: 'Mời thành công 5 người bạn tham gia',
      progress: 2,
      total: 5,
      reward: 200,
      completed: false,
      type: 'weekly'
    },
    {
      id: 5,
      title: 'Đạt 1000 xu',
      description: 'Tích lũy đủ 1000 xu trong tuần',
      progress: 650,
      total: 1000,
      reward: 100,
      completed: false,
      type: 'weekly'
    },
    {
      id: 6,
      title: 'Điểm danh 30 ngày',
      description: 'Điểm danh liên tục trong 30 ngày',
      progress: 12,
      total: 30,
      reward: 500,
      completed: false,
      type: 'special'
    },
    {
      id: 7,
      title: 'Đạt Top 10 bảng xếp hạng',
      description: 'Leo lên Top 10 trong bảng xếp hạng',
      progress: 0,
      total: 1,
      reward: 1000,
      completed: false,
      type: 'special'
    },
  ];

  const getMissionsByType = (type: string) => missions.filter(m => m.type === type);

  const MissionItem = ({ mission }: { mission: typeof missions[0] }) => (
    <Card className="flex items-start gap-4">
      <div className="mt-1">
        {mission.completed ? (
          <CheckCircle size={24} className="text-green-500" />
        ) : (
          <Circle size={24} className="text-neutral-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm mb-1">{mission.title}</h3>
        <p className="text-xs text-neutral-400 mb-3">{mission.description}</p>
        <div className="mb-2">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Tiến độ</span>
            <span>{mission.progress}/{mission.total}</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(mission.progress / mission.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-green-500">+{mission.reward} xu</span>
          {mission.completed ? (
            <Button size="sm" disabled>Đã hoàn thành</Button>
          ) : (
            <Button size="sm" variant="outline">Làm nhiệm vụ</Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Nhiệm vụ"
        description="Hoàn thành nhiệm vụ để nhận thưởng"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-lg mb-4">Nhiệm vụ hàng ngày</h2>
          <div className="space-y-3">
            {getMissionsByType('daily').map((mission) => (
              <MissionItem key={mission.id} mission={mission} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg mb-4">Nhiệm vụ hàng tuần</h2>
          <div className="space-y-3">
            {getMissionsByType('weekly').map((mission) => (
              <MissionItem key={mission.id} mission={mission} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg mb-4">Nhiệm vụ đặc biệt</h2>
          <div className="space-y-3">
            {getMissionsByType('special').map((mission) => (
              <MissionItem key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
