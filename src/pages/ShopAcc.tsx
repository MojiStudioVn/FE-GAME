import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

type Listing = {
  _id: string;
  username?: string;
  price?: number;
  ssCards?: any[];
  sssCards?: any[];
  skins?: number | any[] | string;
  level?: string;
  rank?: string;
  images?: string[];
  description?: string;
};

function PriceBadge({ price }: { price?: number }) {
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black px-3 py-1 rounded-full font-semibold shadow">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1h3a1 1 0 011 1v2h-1v6a3 3 0 11-6 0V8H7V6a1 1 0 011-1h3V3a1 1 0 011-1z"/></svg>
      <span>{price ?? '—'} xu</span>
    </div>
  );
}

function parseSkinNames(skinsField: Listing['skins'], description?: string) {
  // Return array of skin names from various possible shapes
  if (!skinsField && !description) return [];

  // If skins is an array, normalize to strings
  if (Array.isArray(skinsField)) return skinsField.map((s) => String(s).trim()).filter(Boolean);

  // If skins is a string (maybe newline or pipe separated)
  if (typeof skinsField === 'string') {
    const parts = skinsField.split(/[\r\n|,]+/).map((p) => p.trim()).filter((p) => p && p.length > 1);
    if (parts.length) return parts;
  }

  // If skins is a number (count) or not helpful, try to extract from description heuristically
  if (description && typeof description === 'string') {
    // split by newlines or '|' then pick tokens that look like skin names
    const raw = description.split(/[\r\n|]+/).map((p) => p.trim()).filter(Boolean);
    const candidates: string[] = [];
    for (const token of raw) {
      // ignore tokens with colon (likely metadata) or short tokens
      if (token.includes(':')) continue;
      if (token.length < 3 || token.length > 80) continue;
      // ignore all-caps signals like NO SSS
      if (/^[A-Z0-9\s\W]+$/.test(token) && token === token.toUpperCase()) continue;
      // accept tokens containing letters and spaces
      if (/[A-Za-zÀ-ỹ]/.test(token)) candidates.push(token);
    }
    // De-duplicate and return
    return Array.from(new Set(candidates));
  }

  return [];
}

export default function ShopAcc() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [selected, setSelected] = useState<Listing | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    const urlBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${urlBase}/exchange/shop-listings?limit=200`;

    setLoading(true);
    fetch(url, { signal: abort.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) setListings(data.listings || []);
        else setError(data?.message || 'Không thể tải danh sách');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message || 'Lỗi khi tải danh sách');
      })
      .finally(() => setLoading(false));

    return () => abort.abort();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return listings;
    const q = query.toLowerCase();
    return listings.filter((l) => (l.username || '').toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q));
  }, [listings, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const visible = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader title="Shop ACC" description="Danh sách ACC SSS (chỉ hiển thị thông tin, không kèm mật khẩu)." />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex gap-2">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Tìm theo username hoặc mô tả..."
            className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded focus:outline-none"
          />
          <Button onClick={() => { setQuery(''); setPage(1); }}>Xóa</Button>
        </div>
        <div className="flex gap-2">
          <a href="https://buiducthuan.pro" target="_blank" rel="noreferrer">
            <Button className="bg-purple-600 hover:bg-purple-700">Mở shop chính thức</Button>
          </a>
          <Button onClick={() => navigate('/dashboard')}>Quay lại</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="text-sm text-neutral-400">Đang tải danh sách…</div>}
        {error && <div className="text-sm text-rose-400">{error}</div>}

        {!loading && visible.length === 0 && (
          <Card><p className="text-neutral-400">Không có tài khoản nào khớp.</p></Card>
        )}

        {visible.map((l) => {
          const skinNames = parseSkinNames(l.skins, l.description);
          const previewSkins = skinNames.slice(0, 3);
          return (
          <Card key={l._id}>
            <div className="relative">
              <div className="absolute right-3 top-3">
                <PriceBadge price={l.price} />
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-20 h-20 bg-neutral-800 rounded overflow-hidden flex items-center justify-center">
                  {l.images && l.images.length > 0 ? (
                    <img src={l.images[0]} alt="thumb" className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-neutral-400">ACC</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-lg">{l.username || '—'}</div>
                      <div className="text-xs text-neutral-400">{l.rank || ''} {l.level ? `· ${l.level}` : ''}</div>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-neutral-300 line-clamp-3">{l.description || 'Không có mô tả'}</p>

                  {previewSkins.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {previewSkins.map((s, i) => (
                        <div key={i} className="text-xs bg-neutral-900 px-2 py-1 rounded">{s}</div>
                      ))}
                      {skinNames.length > previewSkins.length && (
                        <div className="text-xs text-neutral-400 ml-1">+{skinNames.length - previewSkins.length} khác</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-neutral-400">SS: {Array.isArray(l.ssCards) ? l.ssCards.length : (typeof l.ssCards === 'number' ? l.ssCards : 0)} · Skins: {Array.isArray(l.skins) ? l.skins.length : (typeof l.skins === 'number' ? l.skins : 0)}</div>
                <div className="flex gap-2">
                  <Button className="px-3 py-1" onClick={() => { navigator.clipboard?.writeText(l._id); alert('ID đã được sao chép'); }}>Sao chép ID</Button>
                  <Button className="px-3 py-1" onClick={() => setSelected(l)}>Xem</Button>
                </div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Trước</Button>
        <div className="px-3 py-1 bg-neutral-900 rounded">Trang {page} / {pages}</div>
        <Button onClick={() => setPage((p) => Math.min(p + 1, pages))} disabled={page >= pages}>Sau</Button>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-950 p-6 rounded max-w-xl w-full">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Chi tiết tài khoản</h3>
              <button onClick={() => setSelected(null)} className="text-neutral-400">Đóng</button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-neutral-400">Username</div>
                <div className="font-medium">{selected.username || '—'}</div>

                <div className="mt-3 text-xs text-neutral-400">Giá</div>
                <div className="font-medium">{selected.price ?? '—'} xu</div>

                <div className="mt-3 text-xs text-neutral-400">Số lượng SS / Skins</div>
                <div className="font-medium">{Array.isArray(selected.ssCards) ? selected.ssCards.length : (typeof selected.ssCards === 'number' ? selected.ssCards : 0)} / {Array.isArray(selected.skins) ? selected.skins.length : (typeof selected.skins === 'number' ? selected.skins : 0)}</div>
                {(() => {
                  const names = parseSkinNames(selected.skins, selected.description);
                  if (names.length === 0) return null;
                  return (
                    <div className="mt-3">
                      <div className="text-xs text-neutral-400">Tên skins</div>
                      <ul className="mt-2 max-h-48 overflow-auto text-sm space-y-1">
                        {names.map((n, idx) => (
                          <li key={idx} className="px-2 py-1 bg-neutral-900 rounded">{n}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>

              <div>
                <div className="text-xs text-neutral-400">Mô tả</div>
                <div className="text-sm text-neutral-300 break-words">{selected.description || 'Không có'}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => { navigator.clipboard?.writeText(selected._id); alert('ID đã được sao chép'); }}>Sao chép ID</Button>
              <Button onClick={() => { window.open(`https://buiducthuan.pro/shop/${selected._id}`, '_blank'); }}>Mua ngoài trang</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
