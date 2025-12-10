import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

export default function BuyCoins() {
  const [cardData, setCardData] = useState({
    cardCode: '',
    cardSerial: '',
    cardValue: '',
  });

  const [provider, setProvider] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const providers: Record<string, { label: string; denoms: number[] }> = {
    VIETTEL: { label: 'Viettel', denoms: [10000,20000,30000,50000,100000,200000,300000,500000,1000000] },
    VINAPHONE: { label: 'Vinaphone', denoms: [10000,20000,30000,50000,100000,200000,300000,500000] },
    MOBIFONE: { label: 'Mobifone', denoms: [10000,20000,30000,50000,100000,200000,300000,500000] },
  };

  // Provider-specific validation rules (card code and serial allowed lengths)
  const validationRules: Record<string, { code?: number[]; serial?: number[] }> = {
    VIETTEL: { code: [13, 15], serial: [11, 14] },
    VINAPHONE: { code: [14], serial: [14] },
    MOBIFONE: { code: [12], serial: [15] },
  };

  // package/payment-methods removed — this page shows the old scratch-card form inline

  // cardValues replaced by provider-specific denoms in `providers` map

  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupModalData, setTopupModalData] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const token = localStorage.getItem('token');
        const res = await fetch('/api/card/history?page=1&limit=10', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const j = await res.json();
        if (!j || !j.success) {
          setHistoryError(j?.message || 'Không thể lấy lịch sử nạp thẻ');
          setRecentPurchases([]);
          return;
        }
        setRecentPurchases(j.data || []);
      } catch (e) {
        console.error('Fetch card history failed', e);
        setHistoryError((e as Error)?.message || 'Lỗi mạng');
        setRecentPurchases([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleSubmitCard = async () => {
    if (!provider) {
      showToast({ type: 'error', title: 'Vui lòng chọn nhà mạng' });
      return;
    }
    if (!cardData.cardValue) {
      showToast({ type: 'error', title: 'Vui lòng chọn mệnh giá thẻ' });
      return;
    }

    // provider-specific code/serial length validation
    const rules = validationRules[provider];
    const codeLen = cardData.cardCode?.trim()?.length || 0;
    const serialLen = cardData.cardSerial?.trim()?.length || 0;
    if (rules?.code && !rules.code.includes(codeLen)) {
      showToast({ type: 'error', title: `Mã thẻ ${providers[provider].label} phải có độ dài ${rules.code.join(' hoặc ')} ký tự (hiện tại ${codeLen}).` });
      return;
    }
    if (rules?.serial) {
      if (!rules.serial.includes(serialLen)) {
        showToast({ type: 'error', title: `Seri thẻ ${providers[provider].label} phải có độ dài ${rules.serial.join(' hoặc ')} ký tự (hiện tại ${serialLen}).` });
        return;
      }
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      // Align with backend: send `telco` and `amount`
      const body = {
        telco: provider,
        code: cardData.cardCode?.trim(),
        serial: cardData.cardSerial?.trim(),
        amount: Number(cardData.cardValue),
      };
      const res = await fetch('/api/card/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!j || !j.success) {
        showToast({ type: 'error', title: j?.message || 'Lỗi khi nạp thẻ' });
        return;
      }

      // Optimistically add pending transaction so user sees it immediately
      const createdRequestId = j.data?.requestId || `local_${Date.now()}`;
      const pendingEntry = {
        requestId: createdRequestId,
        telco: provider,
        code: body.code,
        serial: body.serial,
        declaredValue: body.amount,
        cardValue: null,
        amount: 0,
        status: j.data?.status ?? 99,
        message: j.data?.message || 'Đang xử lý',
        createdAt: new Date().toISOString(),
      };
      setRecentPurchases((p) => [pendingEntry, ...(p || [])]);

      // Show toast and open modal with details
      showToast({ type: 'success', title: 'Gửi yêu cầu nạp thẻ thành công' });
      setTopupModalData({ requestId: createdRequestId, status: j.data?.status, message: j.data?.message });
      setShowTopupModal(true);
      setCardData({ cardCode: '', cardSerial: '', cardValue: '' });
      setProvider('');
    } catch (e) {
      showToast({ type: 'error', title: 'Lỗi mạng khi nạp thẻ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Mua xu"
        description="Nạp xu để trải nghiệm đầy đủ tính năng"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg mb-4">Nạp thẻ cào</h3>
          <Card className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Nhà mạng</label>
                <select
                  value={provider}
                  onChange={(e) => { setProvider(e.target.value); setCardData({ ...cardData, cardValue: '' }); }}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                >
                  <option value="">-- Chọn nhà mạng --</option>
                  {Object.keys(providers).map((p) => (
                    <option key={p} value={p}>{providers[p].label}</option>
                  ))}
                </select>
              </div>
              {/* Wallet ID removed — server will credit user automatically after successful charge */}
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
                  {provider && providers[provider] ? (
                    providers[provider].denoms.map((d) => (
                      <option key={d} value={String(d)}>{d.toLocaleString()}</option>
                    ))
                  ) : (
                    <option value="">Vui lòng chọn nhà mạng trước</option>
                  )}
                </select>
              </div>
              <div className="pt-3">
                <Button className="w-full" onClick={handleSubmitCard}>Nạp thẻ</Button>
              </div>
            </div>
          </Card>
          {/* Lịch sử nạp xu - moved under form */}
          <Card className="mb-6">
            <h3 className="text-lg mb-4">Lịch sử nạp xu</h3>
            <div className="space-y-3">
              {historyLoading ? (
                <p className="text-sm text-neutral-400">Đang tải lịch sử...</p>
              ) : historyError ? (
                <p className="text-sm text-red-400">{historyError}</p>
              ) : recentPurchases.length === 0 ? (
                <p className="text-sm text-neutral-400">Chưa có lịch sử nạp xu</p>
              ) : (
                <div className="grid gap-3">
                  {recentPurchases.map((t: any) => (
                    <div key={t.requestId || t._id} className="p-3 bg-neutral-850 border border-neutral-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(providers as any)[t.telco]?.label?.[0] || String(t.telco || '-')?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold truncate">{(providers as any)[t.telco]?.label || t.telco}</div>
                            <div className="text-xs text-neutral-400 font-mono truncate">Mã: {t.code || '-'}</div>
                            <div className="text-xs text-neutral-400 font-mono truncate">Seri: {t.serial || '-'}</div>
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                            <div>{formatPrice(t.declaredValue || t.cardValue || 0)}</div>
                            <div className="italic">{new Date(t.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === 1 ? 'bg-green-600/20 text-green-300' : t.status === 2 ? 'bg-yellow-600/20 text-yellow-300' : t.status === 99 ? 'bg-neutral-700 text-neutral-200' : 'bg-red-600/20 text-red-300'}`}>
                          {t.status === 1 ? 'Thành công' : t.status === 2 ? 'Sai mệnh giá' : t.status === 99 ? 'Đang xử lý' : 'Lỗi'}
                        </span>
                        <button
                          className="text-xs text-neutral-300 hover:text-white px-2 py-1 border border-neutral-800 rounded"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(`${t.code || ''}`);
                              showToast({ type: 'success', title: 'Đã sao chép mã thẻ' });
                            } catch (err) {
                              showToast({ type: 'error', title: 'Không thể sao chép' });
                            }
                          }}
                        >Sao chép mã</button>
                        <button className="text-xs text-neutral-300 hover:text-white px-2 py-1 border border-neutral-800 rounded" onClick={() => { setDetailModalData(t); setShowDetailModal(true); }}>Chi tiết</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
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
      {/* Top-up result modal */}
      <Dialog open={showTopupModal} onOpenChange={setShowTopupModal}>
        <DialogContent className="max-w-md bg-green-900 border border-green-700">
          <div className="text-center py-6">
            <div className="text-3xl font-extrabold text-white">Nạp thẻ thành công</div>
            <div className="text-sm text-green-100 mt-2">Vui lòng chờ hệ thống xác thực</div>
          </div>
          <DialogDescription className="mb-4 text-green-50 px-4">
            {topupModalData ? (
              <div className="space-y-1 text-sm">
                <div><strong>Mã yêu cầu:</strong> <span className="font-mono">{topupModalData.requestId}</span></div>
                <div><strong>Ghi chú:</strong> {topupModalData.message || '-'}</div>
              </div>
            ) : (
              <div className="text-sm">Đang xử lý...</div>
            )}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopupModal(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail modal for a history item (dark theme, formatted) */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-xl bg-black text-white border border-neutral-800">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
          </DialogHeader>
          <DialogDescription className="mb-4">
            {detailModalData ? (
              <div className="text-sm text-white space-y-2">
                <div><strong>RequestId:</strong> {(detailModalData.requestId || '').split('_')[0]}</div>
                <div><strong>Loại thẻ:</strong> {detailModalData.telco}</div>
                <div><strong>Mã:</strong> {detailModalData.code}</div>
                <div><strong>Seri:</strong> {detailModalData.serial}</div>
                <div><strong>Mệnh giá khai báo:</strong> {formatPrice(detailModalData.declaredValue || detailModalData.cardValue || 0)}</div>
                <div>
                  <strong>Trạng thái:</strong>
                  <span className="ml-2 font-mono">{detailModalData.status}</span>
                  <div className="mt-1 text-sm text-gray-300">{detailModalData.message}</div>
                </div>
              </div>
            ) : (
              <div>Không có dữ liệu</div>
            )}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
