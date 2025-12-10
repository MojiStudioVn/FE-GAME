import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// no auth needed for landing page copy-only behaviour
import { Button } from '../components/Button';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/PageHeader';
import { Clipboard, Check, Gift } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MissionLanding() {
  const { id } = useParams();
  const navigate = useNavigate();
  // no auth required on landing page
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchMission = async () => {
      try {
        const res = await fetch(`${API_URL}/missions/${id}`);
        const data = await res.json();
        if (data.success) {
          setMission(data.mission);
          setCode(data.mission?.publicCode || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, [id]);

  // claim flow removed for landing page; users copy the code instead

  const handleCopy = async () => {
    if (!mission?.publicCode) return;
    try {
      await navigator.clipboard.writeText(mission.publicCode);
      setMessage('Đã sao chép mã vào clipboard');
      setCopied(true);
      // restore message and copied state after short delay
      setTimeout(() => {
        setMessage('');
        setCopied(false);
      }, 1400);
    } catch (e) {
      console.error('Copy failed', e);
      setMessage('Không thể sao chép');
    }
  };

  // focus input when page loads if user must input code
  useEffect(() => {
    if (!loading && mission && mission.requiresCode && !mission.publicCode) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [loading, mission]);

  const [copied, setCopied] = useState(false);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!mission) return <div className="p-6">Mission không tồn tại</div>;

  return (
    <PageLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-neutral-400">Tên nhiệm vụ</label>
            <div className="mt-1 text-xl font-semibold text-white">{mission.name}</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-neutral-400">Mô tả</label>
            <div className="mt-1 text-sm text-neutral-300">{mission.description}</div>
          </div>

          {/* Form area */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">FORM</label>
            <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
              <div className="mb-4">
                <div className="text-sm text-neutral-300 mb-2">Phần thưởng</div>
                <div className="text-2xl font-bold text-yellow-300">{mission.reward} xu</div>
              </div>

              {mission.publicCode ? (
                <div className="mb-4">
                  <label className="block text-sm text-neutral-400 mb-2">Mã xác nhận</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-900/30 border border-neutral-700 rounded px-3 py-2 text-yellow-200 font-mono text-lg flex items-center justify-between">
                      <span className="truncate">{code}</span>
                    </div>
                    <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
                      {copied ? <Check size={16} /> : <Clipboard size={16} />} {copied ? 'Đã sao chép' : 'Copy'}
                    </Button>
                  </div>
                </div>

              ) : mission.requiresCode ? (
                <div className="mb-4">
                  <label className="block text-sm text-neutral-400 mb-2">Nhập mã xác nhận</label>
                  <div className="flex items-center gap-2">
                    <input ref={inputRef} value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 px-3 py-2 rounded bg-black/20 border border-neutral-700 text-white" />
                    <Button variant="outline" onClick={() => { navigator.clipboard.writeText(code || '').then(()=>{ setMessage('Đã sao chép mã'); setCopied(true); setTimeout(()=>{ setMessage(''); setCopied(false); },1400); }).catch(()=> setMessage('Không thể sao chép')); }}>
                      {copied ? <Check size={16} /> : <Clipboard size={16} />} {copied ? 'Đã sao chép' : 'Copy'}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Quay lại</Button>
              </div>

              {message && <div className="mt-4 text-sm text-yellow-300">{message}</div>}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
