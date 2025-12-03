import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Settings as SettingsIcon,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Database,
  Palette,
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Game Platform',
    siteUrl: 'https://gameplatform.com',
    supportEmail: 'support@gameplatform.com',
    coinRate: 100,
    minDeposit: 10000,
    minWithdraw: 50000,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    newUserBonus: 100,
    referralBonus: 50,
  });

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
            <button className="w-full text-left px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2">
              <Globe size={16} />
              Thông tin chung
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
              <CreditCard size={16} />
              Thanh toán
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
              <Bell size={16} />
              Thông báo
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
              <Shield size={16} />
              Bảo mật
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
              <Mail size={16} />
              Email
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
              <Database size={16} />
              Cơ sở dữ liệu
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
              <Palette size={16} />
              Giao diện
            </button>
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} />
              <h3 className="font-semibold">Thông tin chung</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Tên website</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">URL website</label>
                <input
                  type="text"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Email hỗ trợ</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">Bật chế độ bảo trì</span>
                </label>
                <p className="text-xs text-neutral-400 mt-1 ml-7">Website sẽ hiển thị thông báo bảo trì cho người dùng</p>
              </div>
            </div>
          </Card>

          {/* Payment Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} />
              <h3 className="font-semibold">Cài đặt thanh toán</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Tỷ giá xu (VNĐ/xu)</label>
                  <input
                    type="number"
                    value={settings.coinRate}
                    onChange={(e) => setSettings({ ...settings, coinRate: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Nạp tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    value={settings.minDeposit}
                    onChange={(e) => setSettings({ ...settings, minDeposit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Rút tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={settings.minWithdraw}
                  onChange={(e) => setSettings({ ...settings, minWithdraw: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} />
              <h3 className="font-semibold">Cài đặt thông báo</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                <span className="text-sm">Thông báo qua Email</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                <span className="text-sm">Thông báo qua SMS</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="w-5 h-5"
                />
              </label>
            </div>
          </Card>

          {/* Bonus Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon size={18} />
              <h3 className="font-semibold">Cài đặt thưởng</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Thưởng người dùng mới (xu)</label>
                  <input
                    type="number"
                    value={settings.newUserBonus}
                    onChange={(e) => setSettings({ ...settings, newUserBonus: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Thưởng giới thiệu (xu)</label>
                  <input
                    type="number"
                    value={settings.referralBonus}
                    onChange={(e) => setSettings({ ...settings, referralBonus: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Hủy</Button>
            <Button variant="primary">Lưu thay đổi</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
