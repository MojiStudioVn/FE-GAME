import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentSettings() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositConfig, setDepositConfig] = useState({
    provider: '',
    partnerId: '',
    partnerKey: '',
    cardDiscount: 0,
  });
  const [withdrawConfig, setWithdrawConfig] = useState({
    provider: '',
    api_key: '',
    withdraw_fee: '',
    coin_rate: '',
  });
  const [showModal, setShowModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const depositRes = await fetch(`${API_URL}/admin/payment-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (depositRes.ok) {
        setDepositConfig(await depositRes.json());
      }
      // Đã bỏ fetch withdraw config vì dùng API rút tiền mới qua thenapvip
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveDeposit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/payment-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(depositConfig),
      });
      if (res.ok) {
        toast.success('Lưu cấu hình nạp thành công!');
      } else {
        let errorText = 'Có lỗi khi lưu cấu hình nạp!';
        try {
          const data = await res.json();
          if (data && (data.message || data.error)) {
            errorText += `\n${data.message || data.error}`;
          }
        } catch (e) {
          // ignore parse error
        }
        setModalMessage(errorText);
        setShowErrorModal(true);
      }
    } catch (error) {
      let errorText = 'Có lỗi khi lưu cấu hình nạp!';
      if (error instanceof Error && error.message) {
        errorText += `\n${error.message}`;
      }
      setModalMessage(errorText);
      setShowErrorModal(true);
    }
  };

  const handleSaveWithdraw = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/withdraw-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider: withdrawConfig.provider,
          api_key: withdrawConfig.api_key,
          withdraw_fee: withdrawConfig.withdraw_fee,
          coin_rate: withdrawConfig.coin_rate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        toast.success('Lưu cấu hình rút tiền thành công!');
      } else {
        let errorText = 'Có lỗi khi lưu cấu hình rút tiền!';
        if (data && (data.message || data.error)) {
          errorText += `\n${data.message || data.error}`;
        }
        setModalMessage(errorText);
        setShowErrorModal(true);
      }
    } catch (error) {
      let errorText = 'Có lỗi khi lưu cấu hình rút tiền!';
      if (error instanceof Error && error.message) {
        errorText += `\n${error.message}`;
      }
      setModalMessage(errorText);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto smooth-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-8 bg-neutral-900 border border-neutral-800 shadow-lg">
            <div className="flex flex-col items-center py-6">
              <div className="flex items-center gap-3 mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#f3f3f5"/>
                </svg>
                <h1 className="text-2xl font-bold text-white">Trang cấu hình thanh toán</h1>
              </div>
              <p className="text-sm text-neutral-400 text-center">Quản lý cấu hình nạp và rút tiền, tuỳ chỉnh thông số cho hệ thống thanh toán của bạn.</p>
            </div>
          </Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="flex justify-center gap-8 bg-transparent border-none shadow-none mb-2">
              <TabsTrigger
                value="deposit"
                className="text-lg font-bold text-white px-8 py-3 rounded-xl bg-neutral-800 border border-transparent data-[state=active]:border-white data-[state=active]:bg-neutral-900 hover:bg-neutral-700 transition-all duration-150 shadow-md"
              >
                Nạp tiền
              </TabsTrigger>
              <TabsTrigger
                value="withdraw"
                className="text-lg font-bold text-white px-8 py-3 rounded-xl bg-neutral-800 border border-transparent data-[state=active]:border-white data-[state=active]:bg-neutral-900 hover:bg-neutral-700 transition-all duration-150 shadow-md"
              >
                Rút tiền
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">Cấu hình nạp tiền</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Tên nhà cung cấp *</label>
                    <input value="TheNapVip.Com" disabled className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p className="text-xs text-neutral-500 mt-1">Nhà cung cấp mặc định cho hệ thống</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Partner Key *</label>
                    <input value={depositConfig.partnerKey ?? ""} onChange={e => setDepositConfig({ ...depositConfig, partnerKey: e.target.value })} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập Partner Key..." />
                    <p className="text-xs text-neutral-500 mt-1">Khóa bảo mật do nhà cung cấp cấp</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Partner ID *</label>
                    <input value={depositConfig.partnerId ?? ""} onChange={e => setDepositConfig({ ...depositConfig, partnerId: e.target.value })} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập Partner ID..." />
                    <p className="text-xs text-neutral-500 mt-1">ID định danh đối tác</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Chiết khấu đổi thẻ (%)</label>
                    <input type="number" value={depositConfig.cardDiscount ?? 0} onChange={e => setDepositConfig({ ...depositConfig, cardDiscount: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: 10" />
                    <p className="text-xs text-neutral-500 mt-1">Tỉ lệ chiết khấu khi đổi thẻ, càng thấp càng lợi cho khách</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSaveDeposit} className="flex-1">Lưu cấu hình</Button>
                </div>
              </Card>
              {/* Section hiển thị thông tin đã lưu */}
              <Card className="mt-6">
                <h4 className="font-semibold mb-3">Thông tin đã lưu</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Partner Key:</span>
                    <span className="font-mono text-white">{depositConfig.partnerKey || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Partner ID:</span>
                    <span className="font-mono text-white">{depositConfig.partnerId || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Chiết khấu:</span>
                    <span className="font-mono text-white">{depositConfig.cardDiscount || '-'}%</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="withdraw">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">Cấu hình rút tiền</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Nhà cung cấp</label>
                    <input value="TheNapVip.Com" readOnly className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">API Key *</label>
                    <input value={withdrawConfig.api_key} onChange={e => setWithdrawConfig({ ...withdrawConfig, api_key: e.target.value })} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="API_TOKEN_CỦA_BẠN" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Phí rút (%) *</label>
                    <input type="number" value={withdrawConfig.withdraw_fee} onChange={e => setWithdrawConfig({ ...withdrawConfig, withdraw_fee: e.target.value })} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Phí rút (%)" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Quy đổi (1 coin = ? VND) *</label>
                    <input type="number" value={withdrawConfig.coin_rate} onChange={e => setWithdrawConfig({ ...withdrawConfig, coin_rate: e.target.value })} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="1 coin = ? VND" />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSaveWithdraw} className="flex-1">Lưu cấu hình</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Section hướng dẫn bên phải */}
        <div className="md:col-span-1">
          <Card className="bg-neutral-900 border border-neutral-800 shadow-md p-6">
            <h4 className="font-semibold mb-3 text-blue-400">Hướng dẫn cấu hình</h4>
            {activeTab === 'deposit' ? (
              <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm">
                <li>Điền đúng <b>Partner Key</b> và <b>Partner ID</b> do TheNapVip.Com cấp.</li>
                <li>Chiết khấu càng thấp, khách càng có lợi.</li>
                <li>Kiểm tra lại thông tin trước khi lưu.</li>
                <li>Nếu gặp lỗi, liên hệ hỗ trợ kỹ thuật của TheNapVip.Com.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm">
                <li>Nhập <b>API Key</b> rút tiền do TheNapVip.Com cung cấp.</li>
                <li>Thiết lập <b>phí rút</b> phù hợp với chính sách hệ thống.</li>
                <li>Quy đổi <b>coin</b> sang VND đúng tỉ lệ bạn mong muốn.</li>
                <li>Kiểm tra kỹ thông tin trước khi lưu cấu hình rút tiền.</li>
                <li>Nếu gặp lỗi, liên hệ hỗ trợ kỹ thuật của TheNapVip.Com.</li>
              </ul>
            )}
          </Card>
        </div>
      </div>
      {/* Modal thông báo lỗi: popup nền đen chữ trắng */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-black text-white rounded-xl p-6 shadow-xl border border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Lỗi!</DialogTitle>
            <DialogDescription className="mb-4 text-white">{modalMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorModal(false)} className="w-full bg-white text-black hover:bg-neutral-200">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}