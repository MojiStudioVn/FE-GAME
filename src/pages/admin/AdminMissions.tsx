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
}
import { PageHeader } from "../../components/PageHeader";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    provider: PROVIDER_OPTIONS[0]?.value || "",
    url: "",
    reward: 0,
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

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // 1. Gọi API tạo link shortcut
      const shortcutRes = await fetch(`/api/admin/link-shortcut`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          provider: form.provider,
          url: form.url,
        }),
      });
      let shortcutData: { shortcut?: string; message?: string } = {};
      try {
        shortcutData = await shortcutRes.json();
      } catch {
        shortcutData = {};
      }
      if (!shortcutRes.ok || !shortcutData.shortcut) {
        const reason = shortcutData.message || shortcutRes.statusText || "Tạo link shortcut thất bại";
        throw new Error(`Tạo link shortcut thất bại: ${reason}`);
      }
      // 2. Lưu nhiệm vụ
      const missionRes = await fetch(`/api/admin/missions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          ...form,
          shortcut: shortcutData.shortcut,
        }),
      });
      if (!missionRes.ok) throw new Error("Lưu nhiệm vụ thất bại");
      setForm({ name: "", description: "", provider: PROVIDER_OPTIONS[0]?.value || "", url: "", reward: 0 });
      fetchMissions();
      alert("Tạo nhiệm vụ thành công!");
    } catch (err) {
      if (err instanceof Error) alert(err.message || "Có lỗi khi tạo nhiệm vụ");
      else alert("Có lỗi khi tạo nhiệm vụ");
    }
    setCreating(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Quản lý nhiệm vụ" />
      <Card className="mb-6 p-6">
        <h3 className="font-semibold mb-4">Tạo nhiệm vụ mới</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateMission}>
          <div>
            <label className="block text-sm mb-1">Tên nhiệm vụ *</label>
            <input required className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
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
            <input className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Link nhiệm vụ *</label>
            <input required className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Thưởng coin *</label>
            <input required type="number" min={0} className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: Number(e.target.value) }))} />
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
                  <td className="p-2"><a href={mission.shortcut} target="_blank" rel="noopener noreferrer" className="underline text-green-400">Shortcut</a></td>
                  <td className="p-2">{mission.reward}</td>
                  <td className="p-2">
                    <Button variant="outline" size="sm">Sửa</Button>
                    <Button variant="primary" size="sm" className="ml-2">Xóa</Button>
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
