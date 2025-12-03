import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Copy, Users, Gift } from 'lucide-react';

export default function InviteFriends() {
  const [copied, setCopied] = useState(false);
  const inviteCode = 'GAME2024XYZ';
  const inviteLink = `https://gameplatform.com/invite/${inviteCode}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const invitedFriends = [
    { id: 1, name: 'Nguyễn Văn A', joinDate: '2024-11-15', status: 'active', reward: 100 },
    { id: 2, name: 'Trần Thị B', joinDate: '2024-11-18', status: 'active', reward: 100 },
    { id: 3, name: 'Lê Văn C', joinDate: '2024-11-20', status: 'pending', reward: 0 },
    { id: 4, name: 'Phạm Thị D', joinDate: '2024-11-22', status: 'active', reward: 100 },
    { id: 5, name: 'Hoàng Văn E', joinDate: '2024-11-25', status: 'pending', reward: 0 },
  ];

  const rewards = [
    { friends: 1, coins: 100, claimed: true },
    { friends: 5, coins: 500, claimed: true },
    { friends: 10, coins: 1200, claimed: false },
    { friends: 20, coins: 3000, claimed: false },
    { friends: 50, coins: 10000, claimed: false },
  ];

  const totalInvited = invitedFriends.length;
  const activeInvites = invitedFriends.filter(f => f.status === 'active').length;
  const totalEarned = invitedFriends.reduce((sum, f) => sum + f.reward, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Mời bạn bè"
        description="Mời bạn bè tham gia và nhận thưởng hấp dẫn"
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-800 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-2xl">{totalInvited}</p>
              <p className="text-xs text-neutral-400">Tổng số lời mời</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-800 rounded-lg">
              <Users size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl">{activeInvites}</p>
              <p className="text-xs text-neutral-400">Bạn bè hoạt động</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-800 rounded-lg">
              <Gift size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl">{totalEarned} xu</p>
              <p className="text-xs text-neutral-400">Tổng xu kiếm được</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg mb-4">Mã giới thiệu của bạn</h3>
          <div className="mb-3">
            <label className="text-xs text-neutral-400 mb-2 block">Mã mời</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                readOnly
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
              />
              <Button variant="outline" onClick={() => handleCopy(inviteCode)}>
                <Copy size={16} />
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-neutral-400 mb-2 block">Link giới thiệu</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
              />
              <Button variant="outline" onClick={() => handleCopy(inviteLink)}>
                <Copy size={16} />
              </Button>
            </div>
          </div>
          {copied && (
            <p className="text-xs text-green-500">Đã sao chép vào clipboard!</p>
          )}
        </Card>

        <Card>
          <h3 className="text-lg mb-4">Cách nhận thưởng</h3>
          <div className="space-y-3 text-sm text-neutral-400">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">1</span>
              <p>Chia sẻ mã hoặc link mời của bạn</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">2</span>
              <p>Bạn bè đăng ký qua link của bạn</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">3</span>
              <p>Nhận ngay 100 xu cho mỗi lời mời thành công</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">4</span>
              <p>Mở khóa thêm phần thưởng khi đạt mốc</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="text-lg mb-4">Phần thưởng theo mốc</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-lg border-2 text-center
                ${reward.claimed
                  ? 'bg-neutral-800 border-green-500'
                  : totalInvited >= reward.friends
                    ? 'bg-neutral-800 border-white'
                    : 'bg-neutral-900 border-neutral-800'
                }
              `}
            >
              <p className="text-xs text-neutral-400 mb-1">{reward.friends} bạn bè</p>
              <p className="text-lg mb-2">{reward.coins} xu</p>
              {reward.claimed ? (
                <span className="text-xs text-green-500">Đã nhận</span>
              ) : totalInvited >= reward.friends ? (
                <Button size="sm" className="w-full">Nhận thưởng</Button>
              ) : (
                <span className="text-xs text-neutral-500">Chưa đạt</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg mb-4">Danh sách bạn bè đã mời</h3>
        <div className="space-y-3">
          {invitedFriends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between pb-3 border-b border-neutral-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                  <span className="text-xs">{friend.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm">{friend.name}</p>
                  <p className="text-xs text-neutral-500">Tham gia: {friend.joinDate}</p>
                </div>
              </div>
              <div className="text-right">
                {friend.status === 'active' ? (
                  <>
                    <p className="text-sm text-green-500">+{friend.reward} xu</p>
                    <p className="text-xs text-neutral-500">Đã hoạt động</p>
                  </>
                ) : (
                  <p className="text-xs text-neutral-500">Chờ hoạt động</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
