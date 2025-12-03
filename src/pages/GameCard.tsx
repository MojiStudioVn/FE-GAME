import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CreditCard } from 'lucide-react';

export default function GameCard() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const cards = [
    { id: 1, name: 'Thẻ Garena 20k', coins: 200, image: 'garena' },
    { id: 2, name: 'Thẻ Garena 50k', coins: 500, image: 'garena' },
    { id: 3, name: 'Thẻ Garena 100k', coins: 1000, image: 'garena' },
    { id: 4, name: 'Thẻ Vcoin 50k', coins: 500, image: 'vcoin' },
    { id: 5, name: 'Thẻ Vcoin 100k', coins: 1000, image: 'vcoin' },
    { id: 6, name: 'Thẻ Zing 50k', coins: 500, image: 'zing' },
    { id: 7, name: 'Thẻ Zing 100k', coins: 1000, image: 'zing' },
    { id: 8, name: 'Thẻ Mobi 50k', coins: 500, image: 'mobi' },
  ];

  const recentExchanges = [
    { id: 1, card: 'Thẻ Garena 50k', time: '2 giờ trước', status: 'Thành công' },
    { id: 2, card: 'Thẻ Vcoin 100k', time: '1 ngày trước', status: 'Thành công' },
    { id: 3, card: 'Thẻ Zing 50k', time: '3 ngày trước', status: 'Thành công' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Nhận thẻ game"
        description="Đổi xu lấy thẻ game các loại"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg mb-4">Chọn loại thẻ</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card) => (
              <Card
                key={card.id}
                className={`cursor-pointer ${
                  selectedCard === card.id ? 'border-white' : ''
                }`}
                onClick={() => setSelectedCard(card.id)}
              >
                <div className="aspect-video bg-neutral-800 rounded-lg mb-3 flex items-center justify-center">
                  <CreditCard size={32} className="text-neutral-600" />
                </div>
                <p className="text-sm mb-1">{card.name}</p>
                <p className="text-xs text-neutral-400">{card.coins} xu</p>
              </Card>
            ))}
          </div>

          {selectedCard && (
            <Card>
              <h3 className="text-lg mb-4">Thông tin đổi thẻ</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Thẻ đã chọn</span>
                  <span>{cards.find(c => c.id === selectedCard)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Giá trị</span>
                  <span>{cards.find(c => c.id === selectedCard)?.coins} xu</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Xu hiện có</span>
                  <span>1,250 xu</span>
                </div>
              </div>
              <Button className="w-full">Xác nhận đổi thẻ</Button>
            </Card>
          )}
        </div>

        <div>
          <h3 className="text-lg mb-4">Lịch sử đổi thẻ</h3>
          <Card>
            <div className="space-y-4">
              {recentExchanges.map((exchange) => (
                <div key={exchange.id} className="pb-4 border-b border-neutral-800 last:border-0 last:pb-0">
                  <p className="text-sm mb-1">{exchange.card}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">{exchange.time}</p>
                    <span className="text-xs text-green-500">{exchange.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
