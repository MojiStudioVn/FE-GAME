import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Camera,
  Shield,
  Bell,
  Wallet,
  Award,
  LogOut,
  Eye,
  EyeOff,
  Smartphone,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export default function Profile() {
  const { user, loading, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'settings'>('info');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editData, setEditData] = useState({
    username: '',
    avatar: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Chỉ redirect khi đã load xong và không có user
    if (!loading && !user) {
      navigate('/login');
    }
    // Cập nhật editData khi có user
    if (user && !isEditing) {
      setEditData({
        username: user.username,
        avatar: user.avatar || '',
      });
    }
  }, [user, loading, navigate, isEditing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      await updateProfile({
        username: editData.username,
        avatar: editData.avatar,
      });
      showToast({
        type: 'success',
        title: 'Cập nhật thành công!',
        message: 'Thông tin hồ sơ đã được lưu',
        duration: 3000,
      });
      setIsEditing(false);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        duration: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = () => {
    showToast({
      type: 'info',
      title: 'Tính năng đang phát triển',
      message: 'Chức năng thay đổi ảnh đại diện sẽ sớm có mặt',
      duration: 3000,
    });
  };

  const handleLogout = () => {
    logout();
    showToast({
      type: 'success',
      title: 'Đăng xuất thành công',
      message: 'Hẹn gặp lại bạn!',
      duration: 2000,
    });
    navigate('/login');
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;

  const stats = [
    { icon: <Wallet className="text-yellow-400" size={20} />, label: 'Tổng xu', value: user.coins.toLocaleString() },
    { icon: <Award className="text-purple-400" size={20} />, label: 'Cấp độ', value: user.level.toString() },
    { icon: <User className="text-blue-400" size={20} />, label: 'Kinh nghiệm', value: user.experience.toLocaleString() },
    { icon: <Calendar className="text-green-400" size={20} />, label: 'Ngày tham gia', value: formatDate(user.createdAt) },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader title="Hồ sơ" description="Quản lý thông tin cá nhân của bạn" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar & Basic Info */}
          <Card className="text-center">
            <div className="relative inline-block mb-4">
              <img
                src={user.avatar || defaultAvatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-neutral-800 bg-neutral-800"
              />
              {isEditing && (
                <button
                  onClick={handleAvatarChange}
                  className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full hover:bg-neutral-200 transition-all hover:scale-110"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">{user.username}</h2>
            <p className="text-neutral-500 text-sm mb-4">{user.email}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-400 mb-4">
              <MapPin size={14} />
              <span>Việt Nam</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {isEditing ? (
                <>
                  <Button variant="primary" size="sm" className="justify-center col-span-2" onClick={handleSaveProfile} disabled={updating}>
                    {updating ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Lưu</>}
                  </Button>
                  <Button variant="outline" size="sm" className="justify-center col-span-2" onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" size="sm" className="justify-center" onClick={() => setIsEditing(true)}>
                    <Edit2 size={14} />
                    Chỉnh sửa
                  </Button>
                  <Button variant="outline" size="sm" className="justify-center" onClick={handleLogout}>
                    <LogOut size={14} />
                    Đăng xuất
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award size={18} className="text-yellow-400" />
              Thống kê
            </h3>
            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <span className="text-sm text-neutral-400">{stat.label}</span>
                  </div>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <Card>
            <div className="flex gap-2 border-b border-neutral-800 pb-3 mb-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'info'
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Thông tin
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'stats'
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Thành tích
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Cài đặt
              </button>
            </div>

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">Tên người dùng</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                      <input
                        type="text"
                        value={isEditing ? editData.username : user.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white disabled:opacity-50 focus:outline-none focus:border-neutral-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white opacity-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">Vai trò</label>
                    <div className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        user.role === 'admin'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">Trạng thái</label>
                    <div className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        user.isVerified
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">URL Avatar (tùy chọn)</label>
                    <input
                      type="text"
                      value={editData.avatar}
                      onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button variant="primary" onClick={handleSaveProfile} disabled={updating}>
                      {updating ? <Loader2 className="animate-spin" size={14} /> : 'Lưu thay đổi'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Award size={18} className="text-yellow-400" />
                    Thống kê tài khoản
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-800 p-4 rounded-lg text-center">
                      <Wallet className="text-yellow-400 mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold">{user.coins.toLocaleString()}</p>
                      <p className="text-sm text-neutral-400">Xu hiện tại</p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg text-center">
                      <Award className="text-purple-400 mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold">{user.level}</p>
                      <p className="text-sm text-neutral-400">Cấp độ</p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg text-center">
                      <User className="text-blue-400 mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold">{user.experience.toLocaleString()}</p>
                      <p className="text-sm text-neutral-400">Kinh nghiệm</p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg text-center">
                      <Calendar className="text-green-400 mx-auto mb-2" size={24} />
                      <p className="text-sm font-bold">{formatDate(user.createdAt)}</p>
                      <p className="text-sm text-neutral-400">Ngày tham gia</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800/50 p-6 rounded-lg text-center">
                  <p className="text-neutral-400">
                    Lịch sử hoạt động và thành tích sẽ sớm được cập nhật
                  </p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Privacy */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield size={18} />
                    Quyền riêng tư
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                      <span className="text-sm">Hiển thị hồ sơ công khai</span>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                      <span className="text-sm">Cho phép người khác xem thống kê</span>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                      <span className="text-sm">Hiển thị trạng thái online</span>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Bell size={18} />
                    Thông báo
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                      <span className="text-sm">Thông báo nhiệm vụ mới</span>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                      <span className="text-sm">Email khuyến mãi</span>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                      <span className="text-sm">Thông báo bạn bè</span>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield size={18} />
                    Bảo mật
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className={`w-full justify-between ${is2FAEnabled ? 'text-green-400 border-green-400/20 hover:bg-green-400/10' : ''}`}
                      onClick={() => setShow2FAModal(true)}
                    >
                      <span className="flex items-center gap-2">
                        <Smartphone size={16} />
                        Xác thực hai yếu tố (2FA)
                      </span>
                      <span className="text-xs">{is2FAEnabled ? 'Đã bật' : 'Chưa bật'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/10"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Đổi mật khẩu
                    </Button>
                    <Button variant="outline" className="w-full justify-center mt-6">
                      <LogOut size={16} />
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Shield className="text-yellow-400" size={20} />
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription className="text-neutral-300">
              Nhập mật khẩu cũ và mật khẩu mới để thay đổi mật khẩu của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Mật khẩu cũ</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  placeholder="Nhập mật khẩu cũ"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                  showToast({ type: 'error', title: 'Vui lòng điền đầy đủ thông tin' });
                  return;
                }
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                  showToast({ type: 'error', title: 'Mật khẩu mới không khớp' });
                  return;
                }
                if (passwordData.newPassword.length < 6) {
                  showToast({ type: 'error', title: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
                  return;
                }
                showToast({ type: 'success', title: 'Đổi mật khẩu thành công!' });
                setShowPasswordModal(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}
              variant="primary"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Smartphone className="text-green-400" size={20} />
              Xác thực hai yếu tố (2FA)
            </DialogTitle>
            <DialogDescription className="text-neutral-300">
              {is2FAEnabled
                ? 'Tắt xác thực hai yếu tố sẽ làm giảm bảo mật tài khoản của bạn.'
                : 'Tăng cường bảo mật tài khoản bằng cách bật xác thực hai yếu tố.'}
            </DialogDescription>
          </DialogHeader>

          {!is2FAEnabled ? (
            <div className="space-y-4 py-4">
              <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <p className="text-sm text-white mb-3">Bước 1: Tải ứng dụng xác thực</p>
                <p className="text-xs text-neutral-300">Tải Google Authenticator, Authy hoặc ứng dụng tương tự trên điện thoại của bạn.</p>
              </div>

              <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <p className="text-sm text-white mb-3">Bước 2: Quét mã QR</p>
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="w-40 h-40 bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      QR CODE
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-neutral-300 mb-2">Hoặc nhập mã thủ công:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-neutral-700 rounded text-sm font-mono text-white">
                        ABCD-EFGH-IJKL-MNOP
                      </code>
                      <button
                        onClick={() => {
                          setQrCopied(true);
                          setTimeout(() => setQrCopied(false), 2000);
                          showToast({ type: 'success', title: 'Đã sao chép mã' });
                        }}
                        className="p-2 hover:bg-neutral-700 rounded transition-colors"
                      >
                        {qrCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <p className="text-sm text-white mb-3">Bước 3: Nhập mã xác thực</p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Nhập mã 6 chữ số"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-center text-2xl tracking-widest text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  Bạn có chắc chắn muốn tắt xác thực hai yếu tố? Điều này sẽ làm giảm bảo mật cho tài khoản của bạn.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FAModal(false);
                setQrCopied(false);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (is2FAEnabled) {
                  setIs2FAEnabled(false);
                  showToast({ type: 'success', title: 'Đã tắt xác thực hai yếu tố' });
                } else {
                  setIs2FAEnabled(true);
                  showToast({ type: 'success', title: 'Đã bật xác thực hai yếu tố thành công!' });
                }
                setShow2FAModal(false);
                setQrCopied(false);
              }}
              variant="primary"
            >
              {is2FAEnabled ? 'Tắt 2FA' : 'Bật 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
