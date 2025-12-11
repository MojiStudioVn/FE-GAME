import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
// removed unused imports: PageHeader, Input, Label
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import BuyCoins from '../BuyCoins';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentSettings() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositConfig, setDepositConfig] = useState({
    provider: '',
    partnerId: '',
    partnerKey: '',
    walletNumber: '',
    cardDiscount: '',
  });
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [buyConfig, setBuyConfig] = useState({
    provider: '',
    partnerId: '',
    partnerKey: '',
    walletNumber: '',
  });
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [withdrawConfig, setWithdrawConfig] = useState({
    provider: '',
    api_key: '',
    withdraw_fee: '',
    coin_rate: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testService, setTestService] = useState('Viettel');
  const [testValue, setTestValue] = useState(10000);
  const [testQty, setTestQty] = useState(1);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<unknown>(null);


  const handleTestBuy = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/card/buy`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          service_code: testService,
          wallet_number: buyConfig.walletNumber || depositConfig.walletNumber,
          value: Number(testValue),
          qty: Number(testQty),
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (res.ok) {
        toast.success('Gọi thử mua thẻ thành công');
      } else {
        toast.error('Gọi thử mua thẻ thất bại');
      }
    } catch (error) {
      console.error('Test buy error', error);
      toast.error('Lỗi khi gọi thử mua thẻ');
      setTestResult({ success: false, error: (error instanceof Error) ? error.message : String(error) });
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const depositRes = await fetch(`${API_URL}/admin/payment-config?type=recharge-card`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (depositRes.ok) {
        setDepositConfig(await depositRes.json());
      }
      const buyRes = await fetch(`${API_URL}/admin/payment-config?type=buy-card`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (buyRes.ok) {
        setBuyConfig(await buyRes.json());
      }
      // Đã bỏ fetch withdraw config vì dùng API rút tiền mới qua thenapvip
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveDeposit = async () => {
    try {
      const token = localStorage.getItem('token');
      // Ensure cardDiscount is sent as Number
      const payload = { ...depositConfig, cardDiscount: Number(depositConfig.cardDiscount) || 0, type: 'recharge-card' };
      const res = await fetch(`${API_URL}/admin/payment-config`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
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
        } catch {
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

  const handleSaveBuy = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/payment-config`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...buyConfig, type: 'buy-card' }),
      });
      if (res.ok) {
        toast.success('Lưu cấu hình mua thẻ thành công!');
      } else {
        let errorText = 'Có lỗi khi lưu cấu hình mua thẻ!';
        try {
          const data = await res.json();
          if (data && (data.message || data.error)) {
            errorText += `\n${data.message || data.error}`;
          }
        } catch {
          // ignore parse error
        }
        setModalMessage(errorText);
        setShowErrorModal(true);
      }
    } catch (error) {
      let errorText = 'Có lỗi khi lưu cấu hình mua thẻ!';
      if (error instanceof Error && error.message) {
        errorText += `\n${error.message}`;
      }
      setModalMessage(errorText);
      setShowErrorModal(true);
    }
  };

  const maskStr = (s?: string | number | null) => {
    if (!s && s !== 0) return '';
    const str = String(s);
    if (str.length <= 10) return str;
    return `${str.slice(0,5)}...${str.slice(-5)}`;
  };

  const isRevealed = (key: string) => Boolean(revealed[key]);
  const revealField = (key: string) => setRevealed(prev => ({ ...prev, [key]: true }));
  const hideField = (key: string) => setRevealed(prev => ({ ...prev, [key]: false }));

  const safeString = (v: unknown) => {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };

  // handleBuyCard removed — opening modal is handled inline in tab buttons

  const handleSaveWithdraw = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/withdraw-config`, {
        method: 'POST',
        credentials: 'include',
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
            <TabsList className="flex items-center justify-center gap-3 sm:gap-8 bg-transparent border-none shadow-none mb-2 overflow-x-auto no-scrollbar py-2 px-2">
              <TabsTrigger
                value="deposit"
                className="text-sm sm:text-lg font-bold text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl bg-neutral-800 border border-transparent data-[state=active]:border-white data-[state=active]:bg-neutral-900 hover:bg-neutral-700 transition-all duration-150 shadow-md whitespace-nowrap min-w-[110px] text-center"
              >
                Nạp tiền
              </TabsTrigger>
              <TabsTrigger
                value="withdraw"
                className="text-sm sm:text-lg font-bold text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl bg-neutral-800 border border-transparent data-[state=active]:border-white data-[state=active]:bg-neutral-900 hover:bg-neutral-700 transition-all duration-150 shadow-md whitespace-nowrap min-w-[110px] text-center"
              >
                Rút tiền
              </TabsTrigger>
              <TabsTrigger
                value="buy"
                className="text-sm sm:text-lg font-bold text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl bg-neutral-800 border border-transparent data-[state=active]:border-white data-[state=active]:bg-neutral-900 hover:bg-neutral-700 transition-all duration-150 shadow-md whitespace-nowrap min-w-[110px] text-center"
              >
                Mua thẻ
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
                    {(!depositConfig.partnerKey || isRevealed('deposit.partnerKey')) ? (
                      <input value={depositConfig.partnerKey ?? ""} onChange={e => setDepositConfig({ ...depositConfig, partnerKey: e.target.value })} onBlur={() => hideField('deposit.partnerKey')} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập Partner Key..." />
                    ) : (
                      <input readOnly value={maskStr(depositConfig.partnerKey)} onFocus={() => revealField('deposit.partnerKey')} onClick={() => revealField('deposit.partnerKey')} className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white cursor-pointer" />
                    )}
                    <p className="text-xs text-neutral-500 mt-1">Khóa bảo mật do nhà cung cấp cấp</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Partner ID *</label>
                    {(!depositConfig.partnerId || isRevealed('deposit.partnerId')) ? (
                      <input value={depositConfig.partnerId ?? ""} onChange={e => setDepositConfig({ ...depositConfig, partnerId: e.target.value })} onBlur={() => hideField('deposit.partnerId')} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập Partner ID..." />
                    ) : (
                      <input readOnly value={maskStr(depositConfig.partnerId)} onFocus={() => revealField('deposit.partnerId')} onClick={() => revealField('deposit.partnerId')} className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white cursor-pointer" />
                    )}
                    <p className="text-xs text-neutral-500 mt-1">ID định danh đối tác</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Chiết khấu đổi thẻ (%)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={String(depositConfig.cardDiscount ?? '')}
                      onChange={e => {
                        // allow only digits and at most one dot
                        let v = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = v.split('.');
                        if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
                        setDepositConfig({ ...depositConfig, cardDiscount: v });
                        // live-clear error
                        if (discountError) setDiscountError(null);
                      }}
                      onBlur={() => {
                        const v = String(depositConfig.cardDiscount || '').trim();
                        const n = Number(v);
                        if (v === '' || Number.isNaN(n) || n < 0) {
                          setDiscountError('Vui lòng nhập số dương');
                        } else {
                          setDiscountError(null);
                        }
                      }}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 10"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Tỉ lệ chiết khấu khi đổi thẻ, chỉ nhập số dương (VD: 10)</p>
                    {discountError && <p className="text-xs text-red-400 mt-1">{discountError}</p>}
                  </div>
                  {/* Wallet ID removed from deposit tab. Kept in 'Mua thẻ' tab. */}
                </div>
              </Card>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveDeposit} className="flex-1">Lưu cấu hình nạp tiền</Button>
              </div>
              {/* Section hiển thị thông tin đã lưu */}
              <Card className="mt-6">
                <h4 className="font-semibold mb-3">Thông tin đã lưu</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Partner Key:</span>
                    <span className="font-mono text-white">{depositConfig.partnerKey ? maskStr(depositConfig.partnerKey) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Partner ID:</span>
                    <span className="font-mono text-white">{depositConfig.partnerId ? maskStr(depositConfig.partnerId) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Chiết khấu:</span>
                    <span className="font-mono text-white">{depositConfig.cardDiscount !== '' ? `${depositConfig.cardDiscount}%` : '-'}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="buy">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">Cấu hình mua thẻ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Tên nhà cung cấp *</label>
                    <input value="TheNapVip.Com" disabled className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p className="text-xs text-neutral-500 mt-1">Nhà cung cấp mặc định cho hệ thống</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Partner Key *</label>
                    {(!buyConfig.partnerKey || isRevealed('buy.partnerKey')) ? (
                      <input value={buyConfig.partnerKey ?? ""} onChange={e => setBuyConfig({ ...buyConfig, partnerKey: e.target.value })} onBlur={() => hideField('buy.partnerKey')} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập Partner Key..." />
                    ) : (
                      <input readOnly value={maskStr(buyConfig.partnerKey)} onFocus={() => revealField('buy.partnerKey')} onClick={() => revealField('buy.partnerKey')} className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white cursor-pointer" />
                    )}
                    <p className="text-xs text-neutral-500 mt-1">Khóa bảo mật do nhà cung cấp cấp</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Partner ID *</label>
                    {(!buyConfig.partnerId || isRevealed('buy.partnerId')) ? (
                      <input value={buyConfig.partnerId ?? ""} onChange={e => setBuyConfig({ ...buyConfig, partnerId: e.target.value })} onBlur={() => hideField('buy.partnerId')} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập Partner ID..." />
                    ) : (
                      <input readOnly value={maskStr(buyConfig.partnerId)} onFocus={() => revealField('buy.partnerId')} onClick={() => revealField('buy.partnerId')} className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white cursor-pointer" />
                    )}
                    <p className="text-xs text-neutral-500 mt-1">ID định danh đối tác</p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Wallet ID (wallet_number)</label>
                    {(!buyConfig.walletNumber || isRevealed('buy.walletNumber')) ? (
                      <input value={buyConfig.walletNumber ?? ""} onChange={e => setBuyConfig({ ...buyConfig, walletNumber: e.target.value })} onBlur={() => hideField('buy.walletNumber')} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập Wallet ID..." />
                    ) : (
                      <input readOnly value={maskStr(buyConfig.walletNumber)} onFocus={() => revealField('buy.walletNumber')} onClick={() => revealField('buy.walletNumber')} className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white cursor-pointer" />
                    )}
                    <p className="text-xs text-neutral-500 mt-1">Wallet ID dùng khi gọi API mua thẻ</p>
                  </div>
                  {/* Chiết khấu removed from buy config */}
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSaveBuy} className="flex-1">Lưu cấu hình mua thẻ</Button>
                </div>
              </Card>
              {/* Section hiển thị thông tin đã lưu (mua thẻ) */}
              <Card className="mt-6">
                <h4 className="font-semibold mb-3">Thông tin mua thẻ đã lưu</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Partner Key:</span>
                    <span className="font-mono text-white">{buyConfig.partnerKey ? maskStr(buyConfig.partnerKey) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Partner ID:</span>
                    <span className="font-mono text-white">{buyConfig.partnerId ? maskStr(buyConfig.partnerId) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Wallet ID:</span>
                    <span className="font-mono text-white">{buyConfig.walletNumber ? maskStr(buyConfig.walletNumber) : '-'}</span>
                  </div>
                  {/* Discount display removed */}
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
                    {(!withdrawConfig.api_key || isRevealed('withdraw.api_key')) ? (
                      <input value={withdrawConfig.api_key ?? ""} onChange={e => setWithdrawConfig({ ...withdrawConfig, api_key: e.target.value })} onBlur={() => hideField('withdraw.api_key')} className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="API_TOKEN_CỦA_BẠN" />
                    ) : (
                      <input readOnly value={maskStr(withdrawConfig.api_key)} onFocus={() => revealField('withdraw.api_key')} onClick={() => revealField('withdraw.api_key')} className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white cursor-pointer" />
                    )}
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
      {/* Modal mua thẻ (hiển thị nội dung trang Mua xu trong modal) */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-black text-white rounded-xl p-4 shadow-xl border border-neutral-700 max-w-5xl w-full">
          <div className="w-full">
            <div className="flex items-end justify-end mb-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Đóng</Button>
            </div>
            <div className="bg-transparent">
              <BuyCoins />
            </div>
          </div>
        </DialogContent>
      </Dialog>
        {/* Test mua thẻ modal */}
        <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
          <DialogContent className="bg-black text-white rounded-xl p-6 shadow-xl border border-neutral-700 max-w-xl w-full">
            <DialogHeader>
              <DialogTitle>Test mua thẻ</DialogTitle>
              <DialogDescription>Gọi thử API mua thẻ với cấu hình hiện tại</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Nhà mạng (service_code)</label>
                <input value={testService} onChange={e => setTestService(e.target.value)} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Mệnh giá (value)</label>
                <input type="number" value={testValue} onChange={e => setTestValue(Number(e.target.value))} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Số lượng (qty)</label>
                <input type="number" value={testQty} onChange={e => setTestQty(Number(e.target.value))} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Wallet ID sẽ dùng</label>
                <input readOnly value={isRevealed('buy.walletNumber') ? (buyConfig.walletNumber ?? '') : maskStr(buyConfig.walletNumber)} onClick={() => revealField('buy.walletNumber')} onFocus={() => revealField('buy.walletNumber')} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white cursor-pointer" />
              </div>
              {Boolean(testResult) && (
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded">
                  <pre className="text-xs overflow-auto max-h-48">{safeString(testResult)}</pre>
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={() => { setTestResult(null); setShowTestModal(false); }} className="flex-1">Đóng</Button>
                <Button onClick={handleTestBuy} className="flex-1" disabled={testLoading}>{testLoading ? 'Đang gọi...' : 'Thử mua'}</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-black text-white rounded-xl p-6 shadow-xl border border-neutral-700 data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full">
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