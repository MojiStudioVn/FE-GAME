import { useState, useEffect } from "react";
import { PROVIDER_OPTIONS } from "../../constants/providerOptions";

interface Mission {
  _id: string;
  name: string;
  description: string;
  provider: string;
  url: string;
  shortcut: string;
  reward: number;
  code?: string;
  uses?: number;
  singleUsePerUser?: boolean;
}
import { PageHeader } from "../../components/PageHeader";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    provider: PROVIDER_OPTIONS[0]?.value || "",
    path: "",
    reward: "",
    code: "",
    singleUsePerUser: true,
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with your API endpoint
      const res = await fetch("/api/admin/missions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setMissions(data.missions || []);
    } catch {
      setMissions([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa nhiệm vụ này không?")) return;
    try {
      const res = await fetch(`/api/admin/missions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      alert("Xóa nhiệm vụ thành công");
      fetchMissions();
    } catch (err) {
      if (err instanceof Error) alert(err.message || "Có lỗi khi xóa nhiệm vụ");
      else alert("Có lỗi khi xóa nhiệm vụ");
    }
  };

  const handleEdit = async (m: Mission) => {
    try {
      const name = prompt("Tên nhiệm vụ:", m.name) || m.name;
      const description = prompt("Mô tả:", m.description || "") ?? m.description;
      const rewardStr = prompt("Phần thưởng (coin):", String(m.reward || 0)) || String(m.reward || 0);
      const code = prompt("Mã xác nhận (để trống nếu không có):", m.code || "") ?? m.code;
      const singleUsePerUser = confirm("Một lần cho mỗi user? (OK = có, Cancel = không)");

      const payload = {
        name,
        description,
        reward: Number(rewardStr) || 0,
        code: code || undefined,
        singleUsePerUser,
      } as Record<string, unknown>;

      const res = await fetch(`/api/admin/missions/${m._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      alert("Cập nhật nhiệm vụ thành công");
      fetchMissions();
    } catch (err) {
      if (err instanceof Error) alert(err.message || "Có lỗi khi cập nhật nhiệm vụ");
      else alert("Có lỗi khi cập nhật nhiệm vụ");
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg(null);
    try {
      // 1. Gọi API tạo link shortcut (gửi code nếu có)
      // Construct long URL from ID/path provided by admin
      const longUrl = `${window?.location?.origin || 'http://localhost:3000'}/mission-landing/${encodeURIComponent(form.path)}`;
      const shortcutBody: Record<string, unknown> = { provider: form.provider, url: longUrl };
      if (form.code) shortcutBody.code = form.code;

      const shortcutRes = await fetch(`/api/admin/link-shortcut`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(shortcutBody),
      });
      const extractMsg = (obj: unknown): string | undefined => {
        if (!obj) return undefined;
        if (typeof obj === "string") return obj;
        if (typeof obj === "object") {
          const o = obj as Record<string, unknown>;
          if (typeof o.message === "string") return o.message;
          if (Array.isArray(o.message)) return o.message.join("; ");
          if (typeof o.error === "string") return o.error;
        }
        return undefined;
      };

      let shortcutData: Record<string, unknown> = {};
      try {
        shortcutData = await shortcutRes.json();
      } catch {
        // non-json response — try reading text
        const text = await shortcutRes.text().catch(() => "");
        shortcutData = { message: text || shortcutRes.statusText };
      }
      if (!shortcutRes.ok || !shortcutData.shortcut) {
        const reason = extractMsg(shortcutData) || shortcutRes.statusText || "Tạo link shortcut thất bại";
        setErrorMsg(String(reason));
        throw new Error(`Tạo link shortcut thất bại: ${reason}`);
      }
      // 2. Lưu nhiệm vụ (gửi thêm các trường mới)
      const missionRes = await fetch(`/api/admin/missions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          provider: form.provider,
          url: longUrl,
          reward: Number(form.reward) || 0,
          shortcut: shortcutData.shortcut,
          code: form.code,

          singleUsePerUser: form.singleUsePerUser,
        }),
      });
      let missionData: Record<string, unknown> = {};
      try {
        missionData = await missionRes.json();
      } catch {
        missionData = {};
      }

      if (!missionRes.ok) {
        const m = extractMsg(missionData) || missionRes.statusText || "Lưu nhiệm vụ thất bại";
        setErrorMsg(String(m));
        throw new Error(String(m));
      }

      // created; surface shortenError if provider shortening failed server-side
      if (missionData && typeof missionData.shortenError === "string") {
        const se = missionData.shortenError as string;
        setErrorMsg(se);
        alert(`Tạo nhiệm vụ thành công nhưng rút gọn thất bại: ${se}`);
      } else {
        setForm({ name: "", description: "", provider: PROVIDER_OPTIONS[0]?.value || "", path: "", reward: "", code: "", singleUsePerUser: true });
        fetchMissions();
        alert("Tạo nhiệm vụ thành công!");
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Có lỗi khi tạo nhiệm vụ");
        console.error("Create mission error:", err);
      } else {
        alert("Có lỗi khi tạo nhiệm vụ");
      }
    }
    setCreating(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Quản lý nhiệm vụ" />
      <Card className="mb-6 p-6">
        <h3 className="font-semibold mb-4">Tạo nhiệm vụ mới</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateMission}>
          {errorMsg && (
            <div className="md:col-span-2 p-3 bg-red-900 text-red-100 rounded">
              <strong>Lỗi nhà cung cấp:</strong> {errorMsg}
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Tên nhiệm vụ *</label>
            <input required className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Nhà cung cấp API *</label>
            <select
              className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
              value={form.provider}
              onChange={e => {
                const value = e.target.value;
                setForm(f => ({ ...f, provider: value }));
                // Log thông tin provider
                const info = PROVIDER_OPTIONS.find(opt => opt.value === value);
                console.log("Provider chọn:", info);
                const token = localStorage.getItem("token");
                console.log("Token gửi đi:", token);
                fetch(`/api/admin/api-providers/${value}`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                  .then(async res => {
                    console.log("Status:", res.status);
                    let data = {};
                    try { data = await res.json(); } catch { data = {}; }
                    console.log("Response body:", data);
                    const d = data as { apiKey?: string; message?: string };
                    if (d.apiKey) {
                      console.log("API key:", d.apiKey);
                    } else {
                      console.log("Không lấy được apiKey, message:", d.message);
                    }
                  })
                  .catch(err => console.log("Lỗi fetch apiKey:", err));
              }}
            >
              {PROVIDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Mô tả</label>
            <input className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">ID / Path nhiệm vụ *</label>
            <input required placeholder="ví dụ: 9 hoặc nhiem-vu-9" className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.path ?? ''} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} />
            <p className="text-sm text-neutral-400 mt-2">Link của bạn sẽ giống như: <span className="text-blue-400">{window?.location?.origin}/mission-landing/{form.path || 'xxx'}</span></p>
          </div>
          <div>
            <label className="block text-sm mb-1">Thưởng coin *</label>
            <input
              required
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ví dụ: 100"
              className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
              value={form.reward ?? ''}
              onChange={e => setForm(f => ({ ...f, reward: e.target.value.replace(/[^0-9]/g, '') }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Mã xác nhận (tùy chọn)</label>
            <input className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.code ?? ''} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  // generate 10 char uppercase alphanumeric code
                  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                  let out = '';
                  for (let i = 0; i < 10; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
                  setForm(f => ({ ...f, code: out }));
                }}
                className="inline-block border border-neutral-700 px-3 py-1 rounded text-sm text-white hover:bg-neutral-800"
              >
                Tạo mã ngẫu nhiên 10 ký tự
              </button>
            </div>
          </div>
          {/* maxUses removed — no maximum per-mission */}
          {/* expireAt removed — default is next midnight on server */}
          <div className="flex items-center">
            <input id="singleUse" type="checkbox" checked={!!form.singleUsePerUser} onChange={e => setForm(f => ({ ...f, singleUsePerUser: e.target.checked }))} />
            <label htmlFor="singleUse" className="ml-2 text-sm">Một lần cho mỗi user</label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={creating}>{creating ? "Đang tạo..." : "Tạo nhiệm vụ"}</Button>
          </div>
        </form>
      </Card>
      <Card className="mt-6">
        <h3 className="font-semibold mb-4">Danh sách nhiệm vụ</h3>
        {loading ? (
          <div>Đang tải...</div>
        ) : missions.length === 0 ? (
          <div>Không có nhiệm vụ nào.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-800 text-white">
                <th className="p-2">Tên nhiệm vụ</th>
                <th className="p-2">Mô tả</th>
                <th className="p-2">Nhà cung cấp</th>
                <th className="p-2">Link gốc</th>
                <th className="p-2">Link rút gọn</th>
                <th className="p-2">Phần thưởng</th>
                <th className="p-2">Lượt</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission) => (
                <tr key={mission._id} className="border-b border-neutral-700">
                  <td className="p-2">{mission.name}</td>
                  <td className="p-2">{mission.description}</td>
                  <td className="p-2">{mission.provider}</td>
                  <td className="p-2"><a href={mission.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">Link</a></td>
                  <td className="p-2"><a href={mission.shortcut} target="_blank" rel="noopener noreferrer" className="underline text-green-400">{mission.shortcut ? 'Shortcut' : '-'}</a></td>
                  <td className="p-2">{mission.reward}</td>
                  <td className="p-2">{mission.uses || 0}</td>
                  <td className="p-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(mission)}>Sửa</Button>
                    <Button variant="primary" size="sm" className="ml-2" onClick={() => handleDelete(mission._id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
