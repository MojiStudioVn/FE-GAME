import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // simple behavior: redirect to home with query param (app can handle it)
    if (query.trim()) navigate(`/?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left: Visual */}
        <div className="flex items-center justify-center">
          <div className="relative w-72 h-72 rounded-2xl bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 shadow-2xl flex items-center justify-center overflow-hidden">
            {/* decorative gradient circles */}
            <div className="absolute -left-10 -top-12 w-40 h-40 bg-blue-600 opacity-20 rounded-full animate-pulse"></div>
            <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-purple-600 opacity-15 rounded-full animate-pulse delay-200"></div>

            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="text-6xl sm:text-7xl md:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white to-sky-300 drop-shadow-lg">404</div>
              <div className="mt-2 text-sm text-neutral-300">Không tìm thấy trang</div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-neutral-800 rounded-xl p-8 backdrop-blur-sm shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Xin lỗi — chúng tôi không tìm thấy trang này</h1>
          <p className="text-neutral-300 mb-6">Có thể liên kết đã lỗi thời hoặc bạn gõ sai URL. Bạn có thể thử tìm kiếm hoặc quay về trang chủ.</p>

          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <input
              aria-label="Tìm kiếm trang"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm (ví dụ: missions, profile...)"
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button type="submit" className="px-5 py-3 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold">Tìm</button>
          </form>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link to="/" className="inline-block px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg">Về trang chủ</Link>
            <Link to="/dashboard" className="inline-block px-4 py-3 border border-neutral-700 rounded-lg">Bảng điều khiển</Link>
            <Link to="/mission-landing/" className="inline-block px-4 py-3 border border-neutral-700 rounded-lg">Xem nhiệm vụ</Link>
          </div>

          <div className="text-sm text-neutral-500">
            <p>Nếu bạn nghĩ đây là lỗi, vui lòng <a href="mailto:support@example.com" className="underline text-sky-400">báo cho chúng tôi</a> — chúng tôi sẽ kiểm tra ngay.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
