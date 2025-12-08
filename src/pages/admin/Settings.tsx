import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Globe,
  Shield,
  Database,
  Trash2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteBrand: 'Game Platform',
    cspMode: 'report-only',
    cardHistoryRetentionDays: 90,
  });
  const [healthStats, setHealthStats] = useState({
    totalCleanedRecords: 0,
    retentionDays: 90,
    lastCleanup: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
    fetchHealthStats();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchHealthStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/health-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setHealthStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching health stats:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Lưu cài đặt thành công!');
        fetchHealthStats();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  const handleRunCleanup = async () => {
    if (!confirm('Bạn có chắc muốn dọn dẹp dữ liệu cũ ngay bây giờ?')) return;

    setCleaning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/cleanup-now`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Dọn dẹp thành công! Đã xóa ${data.deletedCount} bản ghi.`);
        fetchHealthStats();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Cài đặt hệ thống"
        description="Quản lý cấu hình và tùy chỉnh hệ thống"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Menu */}
        <Card className="lg:col-span-1">
          <h3 className="font-semibold mb-4">Danh mục</h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'general' ? 'bg-neutral-800' : 'hover:bg-neutral-800'
              }`}
            >
              <Globe size={16} />
              Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'security' ? 'bg-neutral-800' : 'hover:bg-neutral-800'
              }`}
            >
              <Shield size={16} />
              Bảo mật
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'health' ? 'bg-neutral-800' : 'hover:bg-neutral-800'
              }`}
            >
              <Database size={16} />
              Sức khỏe hệ thống
            </button>
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe size={20} />
                Thông tin chung
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Site Brand</label>
                  <input
                    type="text"
                    value={settings.siteBrand}
                    onChange={(e) => setSettings({ ...settings, siteBrand: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Game Platform"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Tên hiển thị của website</p>
                </div>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield size={20} />
                Cài đặt bảo mật
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">CSP Mode</label>
                  <select
                    value={settings.cspMode}
                    onChange={(e) => setSettings({ ...settings, cspMode: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="report-only">Report-Only (Chỉ báo cáo)</option>
                    <option value="enforce">Enforce (Thực thi)</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    Report-Only: Chỉ ghi log vi phạm. Enforce: Chặn các vi phạm CSP.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    Card History Retention Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.cardHistoryRetentionDays}
                    onChange={(e) =>
                      setSettings({ ...settings, cardHistoryRetentionDays: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Số ngày giữ lịch sử giao dịch thẻ cào. Sau đó sẽ tự động xóa.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Health Block */}
          {activeTab === 'health' && (
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Database size={20} />
                Sức khỏe hệ thống
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Tổng records đã dọn dẹp</p>
                  <p className="text-2xl font-bold text-green-400">
                    {healthStats.totalCleanedRecords.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Retention Policy</p>
                  <p className="text-2xl font-bold text-blue-400">{healthStats.retentionDays} ngày</p>
                </div>
              </div>

              {healthStats.lastCleanup && (
                <div className="p-4 bg-neutral-800 rounded-lg mb-4">
                  <p className="text-sm text-neutral-400">Lần dọn dẹp gần nhất</p>
                  <p className="text-sm font-medium">
                    {new Date(healthStats.lastCleanup).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}

              <div className="border-t border-neutral-700 pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                  <AlertCircle size={18} />
                  Dọn dẹp thủ công
                </h4>
                <p className="text-sm text-neutral-400 mb-4">
                  Xóa các bản ghi lịch sử thẻ cào cũ hơn {settings.cardHistoryRetentionDays} ngày.
                  Hành động này không thể hoàn tác!
                </p>
                <Button
                  onClick={handleRunCleanup}
                  disabled={cleaning}
                  className="gap-2 bg-red-500 hover:bg-red-600"
                >
                  {cleaning ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Đang dọn dẹp...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Run Cleanup Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Save Button */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lưu thay đổi</p>
                <p className="text-sm text-neutral-400">Áp dụng các cài đặt vào hệ thống</p>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Lưu cài đặt
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
