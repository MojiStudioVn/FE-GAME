import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    console.log('Reset password for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <Card className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>

            <h2 className="text-xl text-white mb-2">Email đã được gửi!</h2>
            <p className="text-neutral-400 mb-6">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong className="text-white">{email}</strong>
            </p>

            <div className="space-y-3">
              <p className="text-sm text-neutral-500">
                Vui lòng kiểm tra email của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
              </p>

              <Button variant="primary" className="w-full justify-center" onClick={() => window.location.href = '/login'}>
                Quay lại đăng nhập
              </Button>

              <Button variant="outline" className="w-full justify-center" onClick={() => setIsSubmitted(false)}>
                Gửi lại email
              </Button>
            </div>
          </Card>

          {/* Help Text */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            Không nhận được email?{' '}
            <button onClick={() => setIsSubmitted(false)} className="text-white hover:underline">
              Thử lại
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link to="/login" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} />
          Quay lại đăng nhập
        </Link>

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl text-white mb-2">Quên mật khẩu?</h1>
          <p className="text-neutral-500">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <h3 className="text-sm text-white mb-2 flex items-center gap-2">
                <Mail size={16} className="text-neutral-400" />
                Lưu ý
              </h3>
              <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                <li>Email khôi phục sẽ được gửi trong vòng 5 phút</li>
                <li>Kiểm tra cả thư mục spam/junk mail</li>
                <li>Link đặt lại mật khẩu có hiệu lực trong 24 giờ</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" className="w-full justify-center">
              <Mail size={18} />
              Gửi email khôi phục
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-neutral-900 text-neutral-500">hoặc</span>
              </div>
            </div>

            {/* Alternative Actions */}
            <div className="text-center space-y-2">
              <div className="text-sm text-neutral-500">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-white hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
              <div className="text-sm text-neutral-500">
                Xem{' '}
                <Link to="/privacy-policy" className="text-white hover:underline">
                  Chính sách bảo mật
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
