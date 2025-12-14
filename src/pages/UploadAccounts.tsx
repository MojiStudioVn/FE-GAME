import { useState, useRef, useEffect } from 'react';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [defaultPrice, setDefaultPrice] = useState<number | ''>('');
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
    if (defaultPrice !== '') form.append('price', String(defaultPrice));

    // Use XMLHttpRequest to track upload progress
    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage('Đang chuẩn bị tải lên...');
    const token = localStorage.getItem('token');

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload-accounts');
      xhr.withCredentials = true;
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
          setUploadMessage(`Đang tải tài khoản... ${percent}%`);
        } else {
          setUploadMessage('Đang tải tài khoản...');
        }
      };

      xhr.onload = () => {
        try {
          const j = JSON.parse(xhr.responseText || '{}');

          // If server returned a jobId (background processing), poll for status
          const jobId = j.jobId || j.job?._id;
          if (jobId) {
            setUploadProgress(100);
            setUploadMessage('Đã upload. Đang xử lý trên server...');

            const pollInterval = 1000;
            let stopped = false;
            const tokenHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

            const poll = async () => {
              try {
                const res = await fetch(`/api/admin/upload-jobs/${jobId}`, {
                  method: 'GET',
                  credentials: 'include',
                  headers: tokenHeader,
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                  // stop polling on error
                  if (!stopped) {
                    stopped = true;
                    setIsUploading(false);
                    showToast({ type: 'error', title: data?.message || 'Lỗi khi lấy trạng thái xử lý' });
                    resolve();
                  }
                  return;
                }

                const job = data.job;
                setUploadProgress(job.progress || 0);
                setUploadMessage(job.message || job.status || 'Đang xử lý');

                if (job.status === 'done') {
                  if (!stopped) {
                    stopped = true;
                    showToast({ type: 'success', title: 'Tải lên và xử lý hoàn tất' });
                    setPreviewLines([]);
                    setFileName('');
                    if (fileRef.current) fileRef.current.value = '';
                    setTimeout(() => {
                      setIsUploading(false);
                      setUploadProgress(0);
                      setUploadMessage('');
                    }, 800);
                    resolve();
                  }
                } else if (job.status === 'failed') {
                  if (!stopped) {
                    stopped = true;
                    setIsUploading(false);
                    setUploadMessage(job.message || 'Xử lý thất bại');
                    showToast({ type: 'error', title: 'Xử lý file thất bại' });
                    resolve();
                  }
                } else {
                  // continue polling
                  setTimeout(poll, pollInterval);
                }
              } catch (err) {
                if (!stopped) {
                  stopped = true;
                  setIsUploading(false);
                  showToast({ type: 'error', title: 'Lỗi khi poll trạng thái upload' });
                  resolve();
                }
              }
            };

            // start polling
            poll();
            return; // don't resolve here, wait until poll resolves
          }

          // Fallback: if server returned immediate result (created/errors), handle normally
          if (xhr.status >= 200 && xhr.status < 300 && j.success !== false) {
            showToast({ type: 'success', title: 'Tải lên thành công' });
            setPreviewLines([]);
            setFileName('');
            if (fileRef.current) fileRef.current.value = '';
          } else {
            showToast({ type: 'error', title: j?.message || 'Lỗi khi tải lên' });
          }
        } catch (err) {
          showToast({ type: 'error', title: 'Lỗi khi xử lý phản hồi từ server' });
        }
        setUploadProgress(100);
        setUploadMessage('Hoàn tất');
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadMessage('');
        }, 800);
        resolve();
      };

      xhr.onerror = () => {
        showToast({ type: 'error', title: 'Lỗi mạng khi tải lên' });
        setIsUploading(false);
        setUploadMessage('Lỗi khi tải lên');
        resolve();
      };

      // append form data and send
      xhr.send(form);
    });
  };

  // warn users before closing the tab when uploading
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = 'Tệp đang được tải lên. Bạn có chắc chắn muốn rời đi?';
        return e.returnValue;
      }
      return undefined;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isUploading]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Tải lên tài khoản" description="Tải lên file danh sách tài khoản (txt hoặc docx)." />

      {/* Upload progress modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-950 p-6 rounded max-w-xl w-full mx-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Đang tải tài khoản</h3>
            </div>
            <p className="text-sm text-neutral-400 mt-2">{uploadMessage || 'Đang tải tài khoản, vui lòng chờ. Không đóng trang.'}</p>

            <div className="mt-4">
              <div className="w-full bg-neutral-800 rounded-full h-4 overflow-hidden">
                <div className="bg-blue-600 h-4 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="text-xs text-neutral-400 mt-2">{uploadProgress}%</div>
            </div>

            <div className="mt-4 text-right">
              <button disabled className="px-3 py-1 rounded bg-neutral-800 text-neutral-500">Vui lòng chờ...</button>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-400">Giá mặc định (xu):</label>
                  <input
                    type="number"
                    min={0}
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded w-40"
                  />
                </div>
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
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-400">Giá mặc định (xu):</label>
                  <input
                    type="number"
                    min={0}
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded w-40"
                  />
                </div>
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
