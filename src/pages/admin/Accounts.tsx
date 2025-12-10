import React, { useEffect, useState } from 'react';

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/accounts?page=${page}&limit=20`);
        // If unauthorized, show specific message
        if (res.status === 401 || res.status === 403) {
          setError('Không tìm thấy token, truy cập bị từ chối');
          setAccounts([]);
          setPages(1);
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Lỗi khi tải danh sách');
        setAccounts(data.accounts || []);
        setPages(data.pagination?.pages || 1);
      } catch (err: any) {
        setError(err?.message || 'Lỗi');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page]);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Danh sách tài khoản</h2>

      {loading && <div className="text-sm text-neutral-400">Đang tải...</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="overflow-auto bg-neutral-900 rounded p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Username</th>
                <th className="px-2 py-2">Level</th>
                <th className="px-2 py-2">Rank</th>
                <th className="px-2 py-2">Sale</th>
                <th className="px-2 py-2">Price</th>
                <th className="px-2 py-2">Uploaded By</th>
                <th className="px-2 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-neutral-500 px-2 py-4">
                    Không có tài khoản
                  </td>
                </tr>
              )}

              {accounts.map((a, i) => (
                <tr key={a._id} className="border-t border-neutral-800">
                  <td className="px-2 py-2 align-top">{(page - 1) * 20 + i + 1}</td>
                  <td className="px-2 py-2 align-top font-mono">{a.username}</td>
                  <td className="px-2 py-2 align-top">{a.level ?? '-'}</td>
                  <td className="px-2 py-2 align-top">{a.rank ?? '-'}</td>
                  <td className="px-2 py-2 align-top">{a.saleType ?? '-'}</td>
                  <td className="px-2 py-2 align-top">{a.price ?? (a.auctionStartPrice ?? '-')}</td>
                  <td className="px-2 py-2 align-top">{a.uploadedBy?.username ?? '-'}</td>
                  <td className="px-2 py-2 align-top">{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
            >
              Trang trước
            </button>
            <div className="text-sm text-neutral-400">{page} / {pages}</div>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(p + 1, pages))}
              className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
