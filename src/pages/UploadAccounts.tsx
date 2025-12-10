import { useState, useRef } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useToast } from '../components/Toast';

type UploadTab = 'random' | 'checked';

export default function UploadAccounts() {
  const [activeTab, setActiveTab] = useState<UploadTab>('random');
  const [fileName, setFileName] = useState('');
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setPreviewLines([]);

    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt') {
      try {
        const text = await f.text();
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        setPreviewLines(lines.slice(0, 200)); // preview first 200 lines
        showToast({ type: 'success', title: `Đã đọc ${lines.length} dòng (hiển thị ${Math.min(lines.length,200)})` });
      } catch (err) {
        showToast({ type: 'error', title: 'Không thể đọc file txt' });
      }
    } else if (ext === 'docx') {
      // docx parsing in-browser is not implemented; upload to server for processing
      setPreviewLines([`File DOCX sẽ được gửi lên server để xử lý: ${f.name}`]);
      showToast({ type: 'info', title: 'DOCX sẽ được gửi lên server để xử lý' });
    } else {
      showToast({ type: 'error', title: 'Vui lòng chọn file .txt hoặc .docx' });
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (tab: UploadTab) => {
    const input = fileRef.current?.files?.[0];
    if (!input) {
      showToast({ type: 'error', title: 'Vui lòng chọn file trước khi tải lên' });
      return;
    }

    const form = new FormData();
    form.append('file', input);
    form.append('type', tab === 'random' ? 'random' : 'checked-account');

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/upload-accounts', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: form,
      });
      const j = await res.json();
      if (res.ok && j.success !== false) {
        showToast({ type: 'success', title: 'Tải lên thành công' });
        setPreviewLines([]);
        setFileName('');
        if (fileRef.current) fileRef.current.value = '';
      } else {
        showToast({ type: 'error', title: j?.message || 'Lỗi khi tải lên' });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Lỗi mạng khi tải lên' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Tải lên tài khoản" description="Tải lên file danh sách tài khoản (txt hoặc docx)." />

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as UploadTab)}>
            <TabsList className="bg-transparent p-0">
              <TabsTrigger
                value="random"
                className="bg-transparent text-neutral-400 data-[state=active]:bg-white data-[state=active]:text-black px-4 py-2 rounded-md mr-2"
              >
                Up ACC Random
              </TabsTrigger>
              <TabsTrigger
                value="checked"
                className="bg-transparent text-neutral-400 data-[state=active]:bg-white data-[state=active]:text-black px-4 py-2 rounded-md"
              >
                Up ACC Checked
              </TabsTrigger>
            </TabsList>

            <TabsContent value="random">
              <div className="space-y-4">
                <p className="text-sm text-neutral-400">Định dạng: mỗi dòng là một tài khoản. Hệ thống sẽ gán <code>type = random</code> tự động.</p>
                <div>
                  <input ref={fileRef} onChange={handleFileChange} accept=".txt,.docx" type="file" />
                </div>
                {fileName && <div className="text-sm">File: <strong>{fileName}</strong></div>}
                <div className="max-h-64 overflow-auto bg-neutral-900 p-3 rounded">
                  {previewLines.length === 0 ? (
                    <div className="text-sm text-neutral-500">Không có dữ liệu xem trước</div>
                  ) : (
                    <ul className="text-xs space-y-1">
                      {previewLines.map((l, i) => (
                        <li key={i} className="font-mono">{l}</li>
                      ))}
                    </ul>
                  )}
                </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleSubmit(activeTab)}
                      disabled={isUploading}
                      variant="primary"
                      className="hover:bg-black hover:text-white border border-neutral-200 px-6 py-2 rounded-md"
                    >
                      {isUploading ? 'Đang tải...' : 'Tải lên'}
                    </Button>
                    <div className="ml-auto">
                      <Button variant="outline" onClick={() => { setPreviewLines([]); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }} className="border-neutral-600">Huỷ</Button>
                    </div>
                  </div>
              </div>
            </TabsContent>

            <TabsContent value="checked">
              <div className="space-y-4">
                <p className="text-sm text-neutral-400">Định dạng: mỗi dòng là một tài khoản đã kiểm tra. Hệ thống sẽ gán <code>type = checked-account</code> tự động.</p>
                <div>
                  <input ref={fileRef} onChange={handleFileChange} accept=".txt,.docx" type="file" />
                </div>
                {fileName && <div className="text-sm">File: <strong>{fileName}</strong></div>}
                <div className="max-h-64 overflow-auto bg-neutral-900 p-3 rounded">
                  {previewLines.length === 0 ? (
                    <div className="text-sm text-neutral-500">Không có dữ liệu xem trước</div>
                  ) : (
                    <ul className="text-xs space-y-1">
                      {previewLines.map((l, i) => (
                        <li key={i} className="font-mono">{l}</li>
                      ))}
                    </ul>
                  )}
                </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleSubmit(activeTab)}
                      disabled={isUploading}
                      variant="primary"
                      className="hover:bg-black hover:text-white border border-neutral-200 px-6 py-2 rounded-md"
                    >
                      {isUploading ? 'Đang tải...' : 'Tải lên'}
                    </Button>
                    <div className="ml-auto">
                      <Button variant="outline" onClick={() => { setPreviewLines([]); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }} className="border-neutral-600">Huỷ</Button>
                    </div>
                  </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card>
          <h3 className="text-lg mb-2">Lưu ý</h3>
          <div className="text-sm text-neutral-400 space-y-2">
            <p>- File <code>.txt</code>: mỗi dòng là một tài khoản; các trường phân tách bằng ký tự <code>|</code> (pipe). Hệ thống yêu cầu ít nhất hai trường bắt buộc là <code>account|password</code>. Các trường phụ (ví dụ <code>NAME : ...</code>, <code>RANK : ...</code>, <code>LEVEL : ...</code>, <code>TƯỚNG : ...</code>, <code>SKIN : ...</code>, <code>SS : ...</code>, <code>SSS : ...</code>) nếu có hãy viết dưới dạng <code>KEY : VALUE</code> — hệ thống sẽ cố gắng map tự động các KEY này vào các trường tương ứng (LEVEL → <code>level</code>, RANK → <code>rank</code>, SKIN → <code>skins</code>, TƯỚNG → <code>heroes</code>, SS/SSS → <code>ssCards</code>/<code>sssCards</code>). Nếu không theo dạng <code>KEY:VALUE</code> thì phần extras sẽ được lưu vào mô tả.</p>



            <p>- Kích thước tối đa: server giới hạn file upload ~5MB. Hệ thống sẽ trả về danh sách các bản ghi tạo thành công và các lỗi parse (nếu có).</p>

            <p>- Ví dụ 1 dòng (mẫu):</p>
            <pre className="bg-neutral-800 p-2 rounded text-xs">lqshopz2665|nghia2004| NAME : hoàinam.v6 | RANK : T.Anh V | LEVEL : 30 | TƯỚNG : 102 | SKIN : 248 | ...</pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
