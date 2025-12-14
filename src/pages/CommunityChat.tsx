import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Send, Image, Smile, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export default function CommunityChat() {
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  const channels = [
    { id: 'general', name: 'Thảo luận chung', online: 245 },
    { id: 'lienquan', name: 'Liên Quân Mobile', online: 156 },
    { id: 'freefire', name: 'Free Fire', online: 189 },
    { id: 'pubg', name: 'PUBG Mobile', online: 134 },
    { id: 'trade', name: 'Mua bán ACC', online: 98 },
    { id: 'support', name: 'Hỗ trợ', online: 23 },
  ];

  // messages state is fetched from server and populated via websocket

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

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

  useEffect(() => {
    // init socket once
    if (socketRef.current) return;
    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
      socket.emit('join', { channel: selectedChannel });
    });

    socket.on('message', (msg: any) => {
      setMessages((s) => [...s, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    // fetch recent messages when channel changes
    let ignore = false;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/public/chat/${selectedChannel}?limit=100`);
        const data = await res.json();
        if (!ignore && data && data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load chat messages', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMessages();

    // tell socket to join room
    if (socketRef.current) {
      socketRef.current.emit('join', { channel: selectedChannel });
    }

    return () => {
      ignore = true;
    };
  }, [selectedChannel]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const payload = {
      channel: selectedChannel,
      user: user?.username || 'guest',
      text: message.trim(),
    };

    try {
      socketRef.current?.emit('message', payload);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
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
              {loading && <div className="text-center text-neutral-400">Đang tải...</div>}
              {messages.map((msg: any) => (
                <div key={msg._id || msg.id || `${msg.user}-${msg.createdAt}`} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">{(msg.user || 'G').charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{msg.user}</span>
                      <span className="text-xs text-neutral-500">{new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-neutral-300">{msg.text || msg.message}</p>
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