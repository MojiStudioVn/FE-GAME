import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type Account = {
  _id: string;
  username?: string;
  level?: number;
  rank?: string;
  saleType?: string;
  price?: number;
  auctionStartPrice?: number;
  uploadedBy?: { username?: string } | null;
  createdAt?: string;
};

function getErrorMessage(err: unknown) {
  if (!err) return 'Lỗi';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return String(err);
}

// Helper to render account fields in a readable key/value format
function renderAccountFields(acc: Record<string, any>, revealSensitive = false) {
  // fields we want to surface first
  const primary = [
    'username',
    'password',
    'level',
    'rank',
    'saleType',
    'price',
    'auctionStartPrice',
    'description',
    'images',
    'ssCards',
    'sssCards',
    'heroes',
    'skins',
    'uploadedBy',
  ];

  const entries: Array<[string, any]> = [];
  for (const k of primary) {
    if (acc[k] !== undefined) entries.push([k, acc[k]]);
  }
  // include other keys that were not in primary
  for (const [k, v] of Object.entries(acc)) {
    if (!primary.includes(k)) entries.push([k, v]);
  }

  return (
    <>
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <div className="text-neutral-400 w-36">{k}</div>
          <div className="break-words">{renderValue(k, v, revealSensitive)}</div>
        </div>
      ))}
    </>
  );
}

function renderValue(key: string, value: any, revealSensitive: boolean) {
  if (value === null || value === undefined) return <span className="text-neutral-500">-</span>;
  if (key === 'password' || /pass|secret|code|token/i.test(key)) {
    if (!revealSensitive) return <span>••••••</span>;
    return <span className="font-mono">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-neutral-500">(empty)</span>;
    return (
      <ul className="list-disc ml-5">
        {value.map((it, idx) => (
          <li key={idx} className="text-sm">{String(it)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    // common nested objects
    if (value.username) return <span>{value.username}</span>;
    if (value._id) return <span>{String(value._id)}</span>;
    return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
  }
  return <span>{String(value)}</span>;
}

export default function AdminAccounts() {
  // Get auth state first
  const { user, loading: authLoading, token } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    // Don't attempt fetch until we know the user's role
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      setLoading(false);
      setError('Truy cập bị từ chối. Chỉ admin mới có quyền xem trang này.');
      setAccounts([]);
      setPages(1);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use Authorization header only (no cookie fallback)
        const effectiveToken = token || localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (effectiveToken) headers['Authorization'] = `Bearer ${effectiveToken}`;

        const res = await fetch(`/api/admin/accounts?page=${page}&limit=20`, {
          method: 'GET',
          headers,
        });
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
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, authLoading, user]);

  // modal states for details
  const [showModal, setShowModal] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [revealSensitive, setRevealSensitive] = useState(false);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Danh sách tài khoản</h2>

      <div className="mb-3">
        <button
          onClick={() => setShowAllDetails(true)}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
        >
          Xem chi tiết toàn bộ
        </button>
      </div>

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
                <th className="px-2 py-2">Uploaded By</th>
                <th className="px-2 py-2">Created At</th>
                <th className="px-2 py-2">Action</th>
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
                  <td className="px-2 py-2 align-top">{a.uploadedBy?.username ?? '-'}</td>
                  <td className="px-2 py-2 align-top">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-2 py-2 align-top">
                    <button
                      onClick={() => {
                        setSelectedAccount(a);
                        setShowModal(true);
                      }}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                    >
                      Chi tiết
                    </button>
                  </td>
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

      {/* Detail modal for single account */}
      {showModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-800 p-4 rounded max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg">Chi tiết tài khoản: {selectedAccount.username}</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm">Hiện thông tin nhạy cảm</label>
                <input type="checkbox" checked={revealSensitive} onChange={() => setRevealSensitive((s) => !s)} />
                <button onClick={() => setShowModal(false)} className="text-sm px-2 py-1">Đóng</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {renderAccountFields(selectedAccount, revealSensitive)}
            </div>
          </div>
        </div>
      )}

      {/* Modal to show full list details */}
      {showAllDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-800 p-4 rounded max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg">Chi tiết toàn bộ danh sách</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm">Hiện thông tin nhạy cảm</label>
                <input type="checkbox" checked={revealSensitive} onChange={() => setRevealSensitive((s) => !s)} />
                <button onClick={() => setShowAllDetails(false)} className="text-sm px-2 py-1">Đóng</button>
              </div>
            </div>
            <div className="space-y-4">
              {accounts.map((acc) => (
                <div key={acc._id} className="p-3 bg-neutral-900 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-mono">{acc.username}</div>
                    <div className="text-sm text-neutral-400">{acc.createdAt ? new Date(acc.createdAt).toLocaleString() : '-'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {renderAccountFields(acc, revealSensitive)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
