import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/login" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} />
          Quay lại
        </Link>

        {/* Header */}
        <PageHeader
          title="Điều khoản dịch vụ"
          description="Cập nhật lần cuối: 3 tháng 12, 2025"
        />

        {/* Content */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <div className="flex items-start gap-3 mb-4">
              <FileText className="text-neutral-400 mt-1" size={20} />
              <div>
                <h2 className="text-lg mb-2">Chào mừng đến với Game Platform</h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây.
                  Vui lòng đọc kỹ trước khi sử dụng nền tảng.
                </p>
              </div>
            </div>
          </Card>

          {/* 1. Chấp nhận điều khoản */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">1.</span>
              Chấp nhận điều khoản
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>
                Khi đăng ký tài khoản và sử dụng các dịch vụ của Game Platform, bạn xác nhận rằng:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Bạn đã đủ 13 tuổi trở lên hoặc có sự đồng ý của phụ huynh/người giám hộ</li>
                <li>Thông tin bạn cung cấp là chính xác và đầy đủ</li>
                <li>Bạn sẽ tuân thủ tất cả các điều khoản và quy định</li>
                <li>Bạn chịu trách nhiệm về mọi hoạt động trong tài khoản của mình</li>
              </ul>
            </div>
          </Card>

          {/* 2. Tài khoản người dùng */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">2.</span>
              Tài khoản người dùng
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Khi tạo tài khoản, bạn cam kết:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                <li>Bảo mật mật khẩu và thông tin tài khoản</li>
                <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
                <li>Không tạo nhiều tài khoản để lạm dụng hệ thống</li>
                <li>Không mua bán, chuyển nhượng tài khoản cho bên thứ ba</li>
              </ul>
            </div>
          </Card>

          {/* 3. Sử dụng dịch vụ */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">3.</span>
              Sử dụng dịch vụ
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Bạn đồng ý KHÔNG:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sử dụng bot, script tự động hoặc phần mềm gian lận</li>
                <li>Thực hiện các hành vi lừa đảo, gian lận điểm số/xu</li>
                <li>Đăng tải nội dung vi phạm pháp luật, khiêu dâm, bạo lực</li>
                <li>Xúc phạm, quấy rối người dùng khác</li>
                <li>Khai thác lỗi hệ thống để trục lợi cá nhân</li>
                <li>Can thiệp vào hoạt động bình thường của dịch vụ</li>
              </ul>
            </div>
          </Card>

          {/* 4. Xu và giao dịch */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">4.</span>
              Xu và giao dịch
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Về đồng xu trong hệ thống:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Xu không có giá trị tiền tệ thực và không thể đổi ra tiền mặt</li>
                <li>Xu chỉ được sử dụng trong nền tảng Game Platform</li>
                <li>Chúng tôi có quyền điều chỉnh tỷ lệ quy đổi và giá trị xu</li>
                <li>Giao dịch đã hoàn tất không thể hoàn lại trừ trường hợp lỗi hệ thống</li>
                <li>Nghiêm cấm mua bán xu ngoài hệ thống chính thức</li>
              </ul>
            </div>
          </Card>

          {/* 5. Quyền sở hữu trí tuệ */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">5.</span>
              Quyền sở hữu trí tuệ
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>
                Mọi nội dung, giao diện, logo, thiết kế của Game Platform đều thuộc quyền sở hữu của chúng tôi.
                Bạn không được sao chép, phân phối, hoặc sử dụng cho mục đích thương mại mà không có sự cho phép.
              </p>
            </div>
          </Card>

          {/* 6. Chấm dứt dịch vụ */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">6.</span>
              Chấm dứt dịch vụ
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Chúng tôi có quyền:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tạm ngưng hoặc khóa tài khoản vi phạm điều khoản</li>
                <li>Thu hồi xu, phần thưởng nếu phát hiện gian lận</li>
                <li>Chấm dứt dịch vụ với thông báo trước 30 ngày</li>
                <li>Xóa tài khoản không hoạt động sau 12 tháng</li>
              </ul>
            </div>
          </Card>

          {/* 7. Giới hạn trách nhiệm */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">7.</span>
              Giới hạn trách nhiệm
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Game Platform không chịu trách nhiệm cho:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Thiệt hại từ việc mất mát dữ liệu, gián đoạn dịch vụ</li>
                <li>Giao dịch giữa người dùng với nhau</li>
                <li>Nội dung do người dùng tạo ra</li>
                <li>Các vấn đề kỹ thuật ngoài tầm kiểm soát</li>
              </ul>
            </div>
          </Card>

          {/* 8. Thay đổi điều khoản */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">8.</span>
              Thay đổi điều khoản
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>
                Chúng tôi có thể cập nhật điều khoản này theo thời gian. Thay đổi quan trọng sẽ được thông báo qua email hoặc
                trên nền tảng. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận điều khoản mới.
              </p>
            </div>
          </Card>

          {/* Contact */}
          <Card className="bg-neutral-800 border-neutral-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-400 mt-1" size={20} />
              <div>
                <h3 className="text-base mb-2">Liên hệ</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Nếu bạn có câu hỏi về Điều khoản dịch vụ, vui lòng liên hệ:
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-neutral-300">Email: support@gameplatform.com</p>
                  <p className="text-neutral-300">Hotline: 1900-xxxx</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link to="/privacy-policy" className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2">
            <Shield size={16} />
            Xem Chính sách bảo mật
          </Link>
        </div>
      </div>
    </div>
  );
}
