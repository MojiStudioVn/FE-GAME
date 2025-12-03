import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Send, Image, Smile, Users } from 'lucide-react';

export default function CommunityChat() {
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');

  const channels = [
    { id: 'general', name: 'Thảo luận chung', online: 245 },
    { id: 'lienquan', name: 'Liên Quân Mobile', online: 156 },
    { id: 'freefire', name: 'Free Fire', online: 189 },
    { id: 'pubg', name: 'PUBG Mobile', online: 134 },
    { id: 'trade', name: 'Mua bán ACC', online: 98 },
    { id: 'support', name: 'Hỗ trợ', online: 23 },
  ];

  const messages = [
    {
      id: 1,
      user: 'ProGamer123',
      avatar: 'P',
      message: 'Có ai muốn đổi ACC Liên Quân không?',
      time: '10:30',
      type: 'text'
    },
    {
      id: 2,
      user: 'GamerXYZ',
      avatar: 'G',
      message: 'Mình có ACC Kim Cương 3, ai quan tâm inbox nhé',
      time: '10:32',
      type: 'text'
    },
    {
      id: 3,
      user: 'TopPlayer88',
      avatar: 'T',
      message: 'Vừa thắng mini game 100 xu luôn 🎉',
      time: '10:35',
      type: 'text'
    },
    {
      id: 4,
      user: 'MasterChief',
      avatar: 'M',
      message: 'Ai biết code mới của sự kiện không?',
      time: '10:38',
      type: 'text'
    },
    {
      id: 5,
      user: 'NinjaGamer',
      avatar: 'N',
      message: 'Cảm ơn admin đã tổ chức event hay!',
      time: '10:40',
      type: 'text'
    },
    {
      id: 6,
      user: 'DragonSlayer',
      avatar: 'D',
      message: 'Mình mới lên Top 10 bảng xếp hạng 🏆',
      time: '10:42',
      type: 'text'
    },
  ];

  const onlineUsers = [
    { id: 1, name: 'ProGamer123', status: 'online' },
    { id: 2, name: 'GamerXYZ', status: 'online' },
    { id: 3, name: 'TopPlayer88', status: 'online' },
    { id: 4, name: 'MasterChief', status: 'away' },
    { id: 5, name: 'NinjaGamer', status: 'online' },
    { id: 6, name: 'DragonSlayer', status: 'online' },
    { id: 7, name: 'PhoenixRising', status: 'away' },
    { id: 8, name: 'ThunderStrike', status: 'online' },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Box chat cộng đồng"
        description="Trò chuyện và kết nối với cộng đồng game thủ"
      />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Channels */}
        <div>
          <Card>
            <h3 className="text-lg mb-4">Kênh chat</h3>
            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition-colors text-sm
                    ${selectedChannel === channel.id
                      ? 'bg-white text-black'
                      : 'hover:bg-neutral-800 text-neutral-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span># {channel.name}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <Users size={12} />
                      {channel.online}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-lg">
                  # {channels.find(c => c.id === selectedChannel)?.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  {channels.find(c => c.id === selectedChannel)?.online} người online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">{msg.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{msg.user}</span>
                      <span className="text-xs text-neutral-500">{msg.time}</span>
                    </div>
                    <p className="text-sm text-neutral-300">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="pt-4 border-t border-neutral-800">
              <div className="flex gap-2 mb-2">
                <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                  <Image size={18} className="text-neutral-400" />
                </button>
                <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                  <Smile size={18} className="text-neutral-400" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-600"
                />
                <Button onClick={handleSendMessage}>
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Online Users */}
        <div>
          <Card>
            <h3 className="text-lg mb-4">Đang online</h3>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-neutral-300">{user.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}