import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { ArrowLeft, Shield, Lock, Eye, Database, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
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
          title="Chính sách bảo mật"
          description="Cập nhật lần cuối: 3 tháng 12, 2025"
        />

        {/* Content */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <div className="flex items-start gap-3 mb-4">
              <Shield className="text-neutral-400 mt-1" size={20} />
              <div>
                <h2 className="text-lg mb-2">Cam kết bảo mật thông tin</h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Game Platform cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn.
                  Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
                </p>
              </div>
            </div>
          </Card>

          {/* 1. Thông tin thu thập */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <Database className="text-neutral-400" size={18} />
              <span className="text-neutral-500">1.</span>
              Thông tin chúng tôi thu thập
            </h3>
            <div className="space-y-4 text-sm text-neutral-400 leading-relaxed">
              <div>
                <h4 className="text-white mb-2">1.1. Thông tin cá nhân</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tên người dùng, địa chỉ email</li>
                  <li>Số điện thoại (nếu bạn cung cấp)</li>
                  <li>Thông tin thanh toán (được mã hóa)</li>
                  <li>Hình ảnh đại diện</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white mb-2">1.2. Thông tin tự động</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Địa chỉ IP, loại thiết bị</li>
                  <li>Trình duyệt, hệ điều hành</li>
                  <li>Lịch sử hoạt động trong ứng dụng</li>
                  <li>Cookies và công nghệ theo dõi tương tự</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white mb-2">1.3. Thông tin từ bên thứ ba</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Thông tin từ đăng nhập qua Google, Facebook</li>
                  <li>Dữ liệu phân tích từ các công cụ hợp tác</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 2. Mục đích sử dụng */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <Eye className="text-neutral-400" size={18} />
              <span className="text-neutral-500">2.</span>
              Mục đích sử dụng thông tin
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Chúng tôi sử dụng thông tin của bạn để:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cung cấp và duy trì dịch vụ</li>
                <li>Xử lý giao dịch, phần thưởng, nhiệm vụ</li>
                <li>Gửi thông báo về tài khoản và cập nhật dịch vụ</li>
                <li>Cá nhân hóa trải nghiệm người dùng</li>
                <li>Phân tích và cải thiện chất lượng dịch vụ</li>
                <li>Phát hiện và ngăn chặn gian lận, lạm dụng</li>
                <li>Tuân thủ nghĩa vụ pháp lý</li>
                <li>Gửi email marketing (với sự đồng ý của bạn)</li>
              </ul>
            </div>
          </Card>

          {/* 3. Chia sẻ thông tin */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">3.</span>
              Chia sẻ thông tin
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Chúng tôi có thể chia sẻ thông tin với:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Nhà cung cấp dịch vụ:</strong> Để xử lý thanh toán, lưu trữ dữ liệu, phân tích</li>
                <li><strong className="text-white">Đối tác kinh doanh:</strong> Với sự đồng ý của bạn cho các chương trình khuyến mãi</li>
                <li><strong className="text-white">Cơ quan pháp luật:</strong> Khi được yêu cầu hợp pháp</li>
                <li><strong className="text-white">Trong trường hợp sáp nhập:</strong> Nếu công ty được mua lại hoặc sáp nhập</li>
              </ul>
              <p className="text-yellow-400/80 text-xs">
                ⚠️ Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bên thứ ba
              </p>
            </div>
          </Card>

          {/* 4. Bảo mật thông tin */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <Lock className="text-neutral-400" size={18} />
              <span className="text-neutral-500">4.</span>
              Bảo mật thông tin
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Chúng tôi áp dụng các biện pháp bảo mật:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                <li>Mã hóa mật khẩu bằng thuật toán bcrypt</li>
                <li>Firewall và hệ thống phát hiện xâm nhập</li>
                <li>Kiểm soát truy cập nghiêm ngặt</li>
                <li>Sao lưu dữ liệu định kỳ</li>
                <li>Đánh giá bảo mật thường xuyên</li>
              </ul>
              <p className="text-xs text-neutral-500">
                Lưu ý: Không có hệ thống nào an toàn tuyệt đối. Chúng tôi khuyến khích bạn sử dụng mật khẩu mạnh và bật xác thực 2 yếu tố.
              </p>
            </div>
          </Card>

          {/* 5. Quyền của bạn */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">5.</span>
              Quyền của bạn
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Bạn có quyền:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Truy cập:</strong> Yêu cầu bản sao dữ liệu cá nhân</li>
                <li><strong className="text-white">Chỉnh sửa:</strong> Cập nhật thông tin không chính xác</li>
                <li><strong className="text-white">Xóa:</strong> Yêu cầu xóa dữ liệu cá nhân</li>
                <li><strong className="text-white">Hạn chế:</strong> Giới hạn việc xử lý dữ liệu</li>
                <li><strong className="text-white">Phản đối:</strong> Phản đối việc sử dụng dữ liệu cho mục đích marketing</li>
                <li><strong className="text-white">Rút lại:</strong> Rút lại sự đồng ý bất kỳ lúc nào</li>
              </ul>
              <p className="text-sm">
                Để thực hiện các quyền này, vui lòng liên hệ: <span className="text-white">privacy@gameplatform.com</span>
              </p>
            </div>
          </Card>

          {/* 6. Cookies */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">6.</span>
              Cookies và công nghệ theo dõi
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Chúng tôi sử dụng cookies để:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ghi nhớ thông tin đăng nhập</li>
                <li>Phân tích lưu lượng truy cập</li>
                <li>Cá nhân hóa nội dung</li>
                <li>Hiển thị quảng cáo phù hợp</li>
              </ul>
              <p className="text-sm">
                Bạn có thể quản lý cookies qua cài đặt trình duyệt, nhưng việc vô hiệu hóa có thể ảnh hưởng đến trải nghiệm.
              </p>
            </div>
          </Card>

          {/* 7. Lưu trữ dữ liệu */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">7.</span>
              Thời gian lưu trữ
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>Chúng tôi lưu trữ dữ liệu:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Trong suốt thời gian bạn sử dụng dịch vụ</li>
                <li>Sau khi đóng tài khoản: 90 ngày (để xử lý khiếu nại)</li>
                <li>Dữ liệu giao dịch: 5 năm (tuân thủ pháp luật)</li>
                <li>Logs hệ thống: 12 tháng</li>
              </ul>
            </div>
          </Card>

          {/* 8. Trẻ em */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">8.</span>
              Quyền riêng tư của trẻ em
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>
                Dịch vụ của chúng tôi dành cho người từ 13 tuổi trở lên. Chúng tôi không cố ý thu thập thông tin của trẻ em dưới 13 tuổi.
                Nếu bạn là phụ huynh và phát hiện con bạn đã cung cấp thông tin, vui lòng liên hệ để chúng tôi xóa dữ liệu.
              </p>
            </div>
          </Card>

          {/* 9. Thay đổi chính sách */}
          <Card>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <span className="text-neutral-500">9.</span>
              Thay đổi chính sách
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
              <p>
                Chúng tôi có thể cập nhật Chính sách bảo mật này. Thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên nền tảng.
                Ngày "Cập nhật lần cuối" ở đầu trang sẽ được thay đổi khi có cập nhật.
              </p>
            </div>
          </Card>

          {/* Contact */}
          <Card className="bg-neutral-800 border-neutral-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-400 mt-1" size={20} />
              <div>
                <h3 className="text-base mb-2">Liên hệ về quyền riêng tư</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                  Nếu bạn có câu hỏi hoặc lo ngại về quyền riêng tư, vui lòng liên hệ Đội ngũ Bảo vệ Dữ liệu:
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-neutral-300">Email: privacy@gameplatform.com</p>
                  <p className="text-neutral-300">Hotline: 1900-xxxx</p>
                  <p className="text-neutral-300">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link to="/terms-of-service" className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2">
            <Shield size={16} />
            Xem Điều khoản dịch vụ
          </Link>
        </div>
      </div>
    </div>
  );
}
