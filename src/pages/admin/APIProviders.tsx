import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  ChevronDown,
  Key,
  Link,
  Activity,
  Loader2,
  X
} from 'lucide-react';

import { PROVIDER_OPTIONS } from '../../constants/providerOptions';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Provider {
  _id: string;
  provider: string;
  apiKey: string;
  apiUrl: string;
  status: 'active' | 'inactive';
  lastUsed: string | null;
  totalRequests: number;
  successRate: number;
  addedBy: {
    username: string;
  };
  createdAt: string;
}

export default function APIProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; shortenedUrl?: string } | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/api-providers`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched providers:', data);
        setProviders(data.providers || []);
      } else {
        console.error('Failed to fetch providers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleSelectProvider = (value: string) => {
    setSelectedProvider(value);
    setIsDropdownOpen(false);

    // Auto-fill URL if available
    const providerInfo = PROVIDER_OPTIONS.find(p => p.value === value);
    if (providerInfo) {
      setApiUrl(providerInfo.url);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedProvider || !apiKey) {
      setTestResult({
        success: false,
        message: 'Vui lòng chọn nhà cung cấp và nhập API Key',
      });
      return;
    }

    setTesting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/test-provider`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey,
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: 'Có lỗi xảy ra khi test kết nối!',
      });
    } finally {
      setTesting(false);
    }
  };  const handleSave = async () => {
    if (!selectedProvider || !apiKey) {
      alert('Vui lòng chọn nhà cung cấp và nhập API Key');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `${API_URL}/admin/api-providers/${editingId}`
        : `${API_URL}/admin/api-providers`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey,
          apiUrl,
        }),
      });

      if (response.ok) {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm nhà cung cấp thành công!');
        resetForm();
        fetchProviders();
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingId(provider._id);
    setSelectedProvider(provider.provider);
    setApiKey(provider.apiKey);
    setApiUrl(provider.apiUrl);
  };

  const handleDelete = async (id: string, providerName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa nhà cung cấp ${providerName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/api-providers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Xóa thành công!');
        fetchProviders();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedProvider('');
    setApiKey('');
    setApiUrl('');
  };

  const getProviderLabel = (value: string) => {
    return PROVIDER_OPTIONS.find(p => p.value === value)?.label || value;
  };

  const getAvailableProviders = () => {
    const usedProviders = providers.map(p => p.provider);
    return PROVIDER_OPTIONS.filter(p => !usedProviders.includes(p.value) || p.value === selectedProvider);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Quản lý nhà cung cấp API"
        description="Cấu hình các nhà cung cấp API cho hệ thống"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add Provider Form */}
        <Card className="lg:col-span-1">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} />
            {editingId ? 'Chỉnh sửa' : 'Thêm nhà cung cấp'}
          </h3>

          <div className="space-y-4">
            {/* Provider Dropdown */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Chọn nhà cung cấp *</label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                >
                  <span className={selectedProvider ? 'text-white' : 'text-neutral-500'}>
                    {selectedProvider ? getProviderLabel(selectedProvider) : 'Chọn nhà cung cấp...'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {getAvailableProviders().map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSelectProvider(option.value)}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-700 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-2">
                <Key size={14} />
                API Key *
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập API Key..."
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Domain (Read-only) */}
            {selectedProvider && (
              <div>
                <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-2">
                  <Link size={14} />
                  Domain
                </label>
                <div className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-300">
                  {apiUrl || 'Chưa có domain'}
                </div>
              </div>
            )}

            {/* Test Connection Button */}
            {selectedProvider && apiKey && (
              <Button
                onClick={handleTestConnection}
                disabled={testing}
                variant="outline"
                className="w-full gap-2 border-blue-500 text-blue-400 hover:bg-blue-500/10"
              >
                {testing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Đang test...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Test Connection
                  </>
                )}
              </Button>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Lưu'}
              </Button>
              {editingId && (
                <Button
                  onClick={resetForm}
                  variant="outline"
                >
                  Hủy
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Providers List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity size={20} />
            Danh sách nhà cung cấp ({providers.length})
          </h3>

          {providers.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-neutral-500">
                <Activity size={48} className="mx-auto mb-4 opacity-20" />
                <p>Chưa có nhà cung cấp nào</p>
                <p className="text-sm mt-2">Thêm nhà cung cấp đầu tiên để bắt đầu</p>
              </div>
            </Card>
          ) : (
            providers.map((provider) => (
              <Card key={provider._id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{getProviderLabel(provider.provider)}</h4>
                      {provider.status === 'active' ? (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                          <CheckCircle size={12} />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                          <XCircle size={12} />
                          Tạm dừng
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-neutral-400">
                      <p className="flex items-center gap-2">
                        <Key size={14} />
                        <span className="font-mono">
                          {provider.apiKey.substring(0, 20)}...
                        </span>
                      </p>
                      {provider.apiUrl && (
                        <p className="flex items-center gap-2">
                          <Link size={14} />
                          <span className="truncate">{provider.apiUrl}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-700">
                      <div>
                        <p className="text-xs text-neutral-500">Tổng yêu cầu</p>
                        <p className="text-sm font-semibold">{provider.totalRequests.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Tỷ lệ thành công</p>
                        <p className="text-sm font-semibold text-green-400">{provider.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Lần dùng cuối</p>
                        <p className="text-sm font-medium">
                          {provider.lastUsed
                            ? new Date(provider.lastUsed).toLocaleDateString('vi-VN')
                            : 'Chưa sử dụng'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 mt-3">
                      Thêm bởi: {provider.addedBy?.username || 'Admin'} •{' '}
                      {new Date(provider.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(provider)}
                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(provider._id, getProviderLabel(provider.provider))}
                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Test Result Modal */}
      {testResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {testResult.success ? (
                  <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle size={24} className="text-red-400 flex-shrink-0" />
                )}
                <h3 className="font-semibold text-lg">
                  {testResult.success ? 'Kết nối thành công!' : 'Kết nối thất bại!'}
                </h3>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="p-1 hover:bg-neutral-700 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-neutral-300">{testResult.message}</p>

              {testResult.shortenedUrl && (
                <div className="bg-neutral-900 p-3 rounded border border-neutral-700">
                  <p className="text-xs text-neutral-400 mb-1">Test URL đã rút ngắn:</p>
                  <a
                    href={testResult.shortenedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all text-sm"
                  >
                    {testResult.shortenedUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setTestResult(null)}
                variant="outline"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
