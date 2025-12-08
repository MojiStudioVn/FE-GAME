import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CreditCard, Smartphone, Wallet, Check } from 'lucide-react';

export default function BuyCoins() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cardData, setCardData] = useState({
    cardCode: '',
    cardSerial: '',
    cardValue: '',
  });

  const packages = [
    { id: 1, coins: 100, price: 10000, bonus: 0, popular: false },
    { id: 2, coins: 500, price: 50000, bonus: 50, popular: false },
    { id: 3, coins: 1000, price: 95000, bonus: 150, popular: true },
    { id: 4, coins: 2000, price: 180000, bonus: 400, popular: false },
    { id: 5, coins: 5000, price: 450000, bonus: 1000, popular: false },
    { id: 6, coins: 10000, price: 850000, bonus: 2500, popular: false },
  ];

  const paymentMethods = [
    { id: 'momo', name: 'Ví MoMo', icon: <Smartphone size={24} />, fee: '0%' },
    { id: 'banking', name: 'Chuyển khoản ngân hàng', icon: <CreditCard size={24} />, fee: '0%' },
    { id: 'card', name: 'Thẻ ATM/Visa', icon: <CreditCard size={24} />, fee: '2%' },
    { id: 'ewallet', name: 'Ví điện tử khác', icon: <Wallet size={24} />, fee: '1%' },
    { id: 'scratch', name: 'Nạp thẻ cào', icon: <CreditCard size={24} />, fee: '0%' },
  ];

  const cardValues = [
    { value: '10000', label: '10,000 VNĐ' },
    { value: '20000', label: '20,000 VNĐ' },
    { value: '30000', label: '30,000 VNĐ' },
    { value: '50000', label: '50,000 VNĐ' },
    { value: '100000', label: '100,000 VNĐ' },
    { value: '200000', label: '200,000 VNĐ' },
    { value: '300000', label: '300,000 VNĐ' },
    { value: '500000', label: '500,000 VNĐ' },
  ];

  const recentPurchases = [
    { id: 1, coins: 1000, price: 95000, date: '2024-11-28', status: 'Thành công' },
    { id: 2, coins: 500, price: 50000, date: '2024-11-20', status: 'Thành công' },
    { id: 3, coins: 2000, price: 180000, date: '2024-11-15', status: 'Thành công' },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Mua xu"
        description="Nạp xu để trải nghiệm đầy đủ tính năng"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg mb-4">Chọn gói xu</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative cursor-pointer ${
                  selectedPackage === pkg.id ? 'border-white' : ''
                } ${pkg.popular ? 'border-yellow-500' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-500 text-black text-xs px-3 py-1 rounded-full">
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                <div className="text-center pt-2">
                  <p className="text-3xl mb-2">{pkg.coins.toLocaleString()}</p>
                  <p className="text-xs text-neutral-400 mb-3">xu</p>
                  {pkg.bonus > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg py-1 px-2 mb-3">
                      <p className="text-xs text-green-500">+{pkg.bonus} xu bonus</p>
                    </div>
                  )}
                  <p className="text-lg mb-1">{formatPrice(pkg.price)}</p>
                  <p className="text-xs text-neutral-500">
                    ~{Math.round(pkg.price / pkg.coins)}đ/xu
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {selectedPackage && (
            <>
              <h3 className="text-lg mb-4">Chọn phương thức thanh toán</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer ${
                      paymentMethod === method.id ? 'border-white' : ''
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-neutral-400">{method.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm mb-1">{method.name}</p>
                        <p className="text-xs text-neutral-500">Phí: {method.fee}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <Check size={20} className="text-green-500" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {paymentMethod === 'scratch' && (
                <Card className="mb-6 smooth-fade-in">
                  <h3 className="text-lg mb-4">Thông tin thẻ cào</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Mã thẻ</label>
                      <input
                        type="text"
                        placeholder="Nhập mã thẻ"
                        value={cardData.cardCode}
                        onChange={(e) => setCardData({ ...cardData, cardCode: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Seri thẻ</label>
                      <input
                        type="text"
                        placeholder="Nhập seri thẻ"
                        value={cardData.cardSerial}
                        onChange={(e) => setCardData({ ...cardData, cardSerial: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Chọn mệnh giá thẻ</label>
                      <select
                        value={cardData.cardValue}
                        onChange={(e) => setCardData({ ...cardData, cardValue: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      >
                        <option value="">-- Chọn mệnh giá --</option>
                        {cardValues.map((cv) => (
                          <option key={cv.value} value={cv.value}>
                            {cv.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>
              )}

              {paymentMethod && (
                <Card>
                  <h3 className="text-lg mb-4">Xác nhận giao dịch</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Gói xu</span>
                      <span>
                        {packages.find(p => p.id === selectedPackage)?.coins.toLocaleString()} xu
                        {packages.find(p => p.id === selectedPackage)?.bonus ?
                          ` (+${packages.find(p => p.id === selectedPackage)?.bonus} bonus)` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Giá gói</span>
                      <span>{formatPrice(packages.find(p => p.id === selectedPackage)?.price || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Phương thức</span>
                      <span>{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Phí giao dịch</span>
                      <span>{paymentMethods.find(m => m.id === paymentMethod)?.fee}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-neutral-800">
                      <span>Tổng thanh toán</span>
                      <span className="text-lg">{formatPrice(packages.find(p => p.id === selectedPackage)?.price || 0)}</span>
                    </div>
                  </div>
                  <Button className="w-full">Thanh toán ngay</Button>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg mb-4">Ưu đãi</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm mb-1">🎁 Nạp lần đầu</p>
                <p className="text-xs text-neutral-300">Nhận thêm 50% xu cho lần nạp đầu tiên</p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm mb-1">⚡ Flash sale cuối tuần</p>
                <p className="text-xs text-neutral-300">Giảm 20% cho tất cả gói xu</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm mb-1">💎 Gói VIP</p>
                <p className="text-xs text-neutral-300">Mua gói 10,000 xu nhận thêm 2,500 xu</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-4">Lịch sử nạp xu</h3>
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="pb-3 border-b border-neutral-800 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm">{purchase.coins.toLocaleString()} xu</p>
                    <span className="text-xs text-green-500">{purchase.status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{formatPrice(purchase.price)}</span>
                    <span>{purchase.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg mb-3">Lưu ý</h3>
            <div className="space-y-2 text-xs text-neutral-400">
              <p>• Xu được cộng ngay sau khi thanh toán thành công</p>
              <p>• Không hoàn tiền sau khi đã nạp xu</p>
              <p>• Liên hệ CSKH nếu gặp sự cố trong quá trình thanh toán</p>
              <p>• Giữ lại mã giao dịch để được hỗ trợ nhanh chóng</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
