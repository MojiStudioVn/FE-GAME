import { Link } from 'react-router-dom';
import {
  Coins,
  Users,
  Trophy,
  Gamepad2,
  Shield,
  Zap,
  Gift,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function LandingPage() {
  const features = [
    {
      icon: <Coins className="text-yellow-400" size={32} />,
      title: 'Kiếm xu miễn phí',
      description: 'Hoàn thành nhiệm vụ hàng ngày, tham gia mini game để nhận xu'
    },
    {
      icon: <Gift className="text-pink-400" size={32} />,
      title: 'Đổi quà hấp dẫn',
      description: 'Đổi xu lấy thẻ game, ACC game, và nhiều phần thưởng giá trị'
    },
    {
      icon: <Users className="text-blue-400" size={32} />,
      title: 'Mời bạn bè',
      description: 'Nhận thưởng khi giới thiệu bạn bè tham gia nền tảng'
    },
    {
      icon: <Trophy className="text-orange-400" size={32} />,
      title: 'Bảng xếp hạng',
      description: 'Cạnh tranh với người chơi khác, leo top nhận thưởng lớn'
    },
    {
      icon: <Gamepad2 className="text-purple-400" size={32} />,
      title: 'Mini game',
      description: 'Chơi game giải trí, thư giãn và kiếm thêm xu'
    },
    {
      icon: <Shield className="text-green-400" size={32} />,
      title: 'An toàn & bảo mật',
      description: 'Thông tin được mã hóa, giao dịch minh bạch'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Người dùng' },
    { value: '100K+', label: 'Giao dịch' },
    { value: '1M+', label: 'Xu đã trao' },
    { value: '99%', label: 'Hài lòng' }
  ];

  const pricing = [
    {
      name: 'Miễn phí',
      price: '0đ',
      features: [
        'Nhiệm vụ hàng ngày',
        'Mini game cơ bản',
        'Điểm danh nhận xu',
        'Đổi thẻ game',
        'Hỗ trợ 24/7'
      ],
      popular: false
    },
    {
      name: 'VIP',
      price: '99K/tháng',
      features: [
        'Tất cả tính năng Free',
        'Nhận 2x xu từ nhiệm vụ',
        'Ưu tiên đổi quà',
        'Mini game đặc biệt',
        'Badge VIP đẹp mắt',
        'Hỗ trợ ưu tiên'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: '299K/tháng',
      features: [
        'Tất cả tính năng VIP',
        'Nhận 3x xu từ nhiệm vụ',
        'Truy cập sớm tính năng mới',
        'Quà tặng hàng tháng',
        'Không quảng cáo',
        'Hỗ trợ 1-1'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-800 sticky top-0 bg-black/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="text-white" size={28} />
              <span className="text-xl font-semibold">Game Platform</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-neutral-400 hover:text-white transition-colors text-sm">Tính năng</a>
              <a href="#how-it-works" className="text-neutral-400 hover:text-white transition-colors text-sm">Cách hoạt động</a>
              <a href="#pricing" className="text-neutral-400 hover:text-white transition-colors text-sm">Bảng giá</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Đăng ký ngay</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto smooth-slide-up">
            <div className="inline-flex items-center gap-2 bg-neutral-800/50 border border-neutral-700 rounded-full px-4 py-2 mb-6 hover:bg-neutral-800 transition-all duration-300">
              <Zap className="text-yellow-400" size={16} />
              <span className="text-sm">🎉 Tham gia ngay - Nhận 100 xu miễn phí</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Kiếm xu, đổi quà
              <br />
              Chơi game không giới hạn
            </h1>
            <p className="text-xl text-neutral-400 mb-8 leading-relaxed">
              Nền tảng game số 1 Việt Nam. Hoàn thành nhiệm vụ, tham gia mini game để kiếm xu và đổi lấy thẻ game, ACC game yêu thích.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Bắt đầu miễn phí
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Xem demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-neutral-400 text-lg">Mọi thứ bạn cần để kiếm xu và đổi quà</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:border-neutral-600 smooth-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Cách hoạt động</h2>
            <p className="text-neutral-400 text-lg">Chỉ 3 bước đơn giản</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center smooth-fade-in" style={{ animationDelay: '0s' }}>
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110 hover:bg-blue-500/20">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl mb-3">Đăng ký tài khoản</h3>
              <p className="text-neutral-400">Tạo tài khoản miễn phí chỉ trong 30 giây</p>
            </div>
            <div className="text-center smooth-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110 hover:bg-purple-500/20">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-xl mb-3">Hoàn thành nhiệm vụ</h3>
              <p className="text-neutral-400">Làm nhiệm vụ, chơi game để kiếm xu</p>
            </div>
            <div className="text-center smooth-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110 hover:bg-green-500/20">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="text-xl mb-3">Đổi quà yêu thích</h3>
              <p className="text-neutral-400">Dùng xu đổi thẻ game, ACC game và nhiều hơn nữa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Bảng giá linh hoạt</h2>
            <p className="text-neutral-400 text-lg">Chọn gói phù hợp với bạn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan, index) => (
              <Card
                key={index}
                className={`relative smooth-scale hover:scale-105 ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/20' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs px-4 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">{plan.price}</div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="text-green-400 shrink-0 mt-0.5" size={16} />
                      <span className="text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full justify-center"
                  >
                    Bắt đầu ngay
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Sẵn sàng bắt đầu chưa?
          </h2>
          <p className="text-xl text-neutral-400 mb-8">
            Tham gia cùng hàng nghìn game thủ đang kiếm xu và đổi quà mỗi ngày
          </p>
          <div className="flex justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="gap-2">
                Đăng ký miễn phí ngay
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="text-white" size={24} />
                <span className="text-lg font-semibold">Game Platform</span>
              </div>
              <p className="text-sm text-neutral-500">
                Nền tảng kiếm xu và đổi quà game hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Pháp lý</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
            © 2025 Game Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
