import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Gavel,
  Eye,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ACCAdmin() {
  const [blob, setBlob] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saleType, setSaleType] = useState<'fixed' | 'auction'>('fixed');
  const [price, setPrice] = useState('');
  const [auctionStartPrice, setAuctionStartPrice] = useState('');
  const [auctionStepPrice, setAuctionStepPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('24');
  const [customDescription, setCustomDescription] = useState('');
  const [parsedData, setParsedData] = useState<{
    username: string;
    password: string;
    heroes: string[];
    skins: string[];
    ssCards: string[];
    sssCards: string[];
    level: number;
    rank: string;
    country: string;
  } | null>(null);
  const [autoDescription, setAutoDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Auto-parse blob when it changes
  useEffect(() => {
    if (blob.trim()) {
      parseBlob();
    } else {
      setParsedData(null);
      setAutoDescription('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);

  const parseBlob = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/parse-blob`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blob }),
      });

      if (response.ok) {
        const data = await response.json();
        setParsedData(data.parsed);
        setAutoDescription(data.description);
      }
    } catch (error) {
      console.error('Error parsing blob:', error);
    }
  };

  const handleUpload = async () => {
    if (!blob.trim()) {
      alert('Vui lòng nhập thông tin ACC');
      return;
    }

    if (images.length === 0) {
      alert('Vui lòng upload ít nhất 1 ảnh');
      return;
    }

    if (saleType === 'fixed' && !price) {
      alert('Vui lòng nhập giá bán');
      return;
    }

    if (saleType === 'auction' && (!auctionStartPrice || !auctionStepPrice)) {
      alert('Vui lòng nhập đầy đủ thông tin đấu giá');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('blob', blob);
      formData.append('saleType', saleType);

      if (saleType === 'fixed') {
        formData.append('price', price);
      } else {
        formData.append('auctionStartPrice', auctionStartPrice);
        formData.append('auctionStepPrice', auctionStepPrice);
        formData.append('auctionDuration', auctionDuration);
      }

      if (customDescription) {
        formData.append('customDescription', customDescription);
      }

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/upload-account`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Upload ACC thành công!');
        // Reset form
        setBlob('');
        setImages([]);
        setImagePreviews([]);
        setSaleType('fixed');
        setPrice('');
        setAuctionStartPrice('');
        setAuctionStepPrice('');
        setAuctionDuration('24');
        setCustomDescription('');
        setParsedData(null);
        setAutoDescription('');
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error uploading account:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto smooth-fade-in">
      <PageHeader
        title="Upload ACC"
        description="Quản lý và upload ACC hàng loạt với auto-parse"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              Upload ảnh ACC
            </h3>
            <label className="block w-full p-6 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-neutral-400" size={32} />
                <p className="text-sm text-neutral-400">Click để chọn ảnh (tối đa 10 ảnh)</p>
              </div>
            </label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Blob Input */}
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Thông tin ACC (1 dòng blob)
            </h3>
            <textarea
              value={blob}
              onChange={(e) => setBlob(e.target.value)}
              placeholder="username:password&#10;Heroes: Hero1, Hero2&#10;Skins: Skin1, Skin2&#10;SS: Card1, Card2&#10;SSS: Card3&#10;Level: 50&#10;Rank: Diamond&#10;Country: Vietnam"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
            />
            <p className="text-xs text-neutral-500 mt-2">
              Tự động parse: username:password, Tướng, Skin, SS, SSS, Level, Rank, Quốc gia
            </p>
          </Card>

          {/* Sale Type */}
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Loại bán
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSaleType('fixed')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  saleType === 'fixed'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <DollarSign className="mx-auto mb-1" size={20} />
                <p className="text-sm font-medium">Mua ngay</p>
              </button>
              <button
                onClick={() => setSaleType('auction')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  saleType === 'auction'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <Gavel className="mx-auto mb-1" size={20} />
                <p className="text-sm font-medium">Đấu giá</p>
              </button>
            </div>

            {saleType === 'fixed' ? (
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Giá bán (xu)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="VD: 100000"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Giá khởi điểm (xu)</label>
                  <input
                    type="number"
                    value={auctionStartPrice}
                    onChange={(e) => setAuctionStartPrice(e.target.value)}
                    placeholder="VD: 50000"
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Bước giá (xu)</label>
                  <input
                    type="number"
                    value={auctionStepPrice}
                    onChange={(e) => setAuctionStepPrice(e.target.value)}
                    placeholder="VD: 5000"
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Thời lượng (giờ)</label>
                  <input
                    type="number"
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(e.target.value)}
                    placeholder="VD: 24"
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Custom Description */}
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={20} />
              Mô tả tùy chỉnh (tùy chọn)
            </h3>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Để trống để dùng mô tả tự động..."
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </Card>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang upload...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload ACC
              </>
            )}
          </Button>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye size={20} />
              Preview Realtime
            </h3>

            {parsedData ? (
              <div className="space-y-4">
                {/* Images Preview */}
                {imagePreviews.length > 0 && (
                  <div>
                    <img
                      src={imagePreviews[0]}
                      alt="Main preview"
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    {imagePreviews.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviews.slice(1, 5).map((preview, index) => (
                          <img
                            key={index}
                            src={preview}
                            alt={`Preview ${index + 2}`}
                            className="w-full h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Account Info */}
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-1">Username</p>
                  <p className="font-medium">{parsedData.username}</p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-400 mb-1">Level</p>
                    <p className="font-bold text-green-300">{parsedData.level}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-400 mb-1">Rank</p>
                    <p className="font-bold text-blue-300">{parsedData.rank}</p>
                  </div>
                </div>

                {/* Heroes */}
                {parsedData.heroes?.length > 0 && (
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-2">🦸 Tướng</p>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.heroes.map((hero: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
                        >
                          {hero}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skins */}
                {parsedData.skins?.length > 0 && (
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-2">👗 Skin</p>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skins.map((skin: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded"
                        >
                          {skin}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SS/SSS Cards */}
                {(parsedData.ssCards?.length > 0 || parsedData.sssCards?.length > 0) && (
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-2">⭐ Cards</p>
                    <div className="space-y-2">
                      {parsedData.ssCards?.length > 0 && (
                        <div>
                          <p className="text-xs text-yellow-400 mb-1">SS:</p>
                          <div className="flex flex-wrap gap-1">
                            {parsedData.ssCards.map((card: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded"
                              >
                                {card}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {parsedData.sssCards?.length > 0 && (
                        <div>
                          <p className="text-xs text-orange-400 mb-1">SSS:</p>
                          <div className="flex flex-wrap gap-1">
                            {parsedData.sssCards.map((card: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded"
                              >
                                {card}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 mb-1">
                    {saleType === 'fixed' ? 'Giá bán' : 'Giá khởi điểm'}
                  </p>
                  <p className="text-2xl font-bold text-blue-300">
                    {saleType === 'fixed'
                      ? `${parseInt(price || '0').toLocaleString()} xu`
                      : `${parseInt(auctionStartPrice || '0').toLocaleString()} xu`}
                  </p>
                  {saleType === 'auction' && (
                    <p className="text-xs text-blue-400 mt-1">
                      Bước giá: {parseInt(auctionStepPrice || '0').toLocaleString()} xu
                    </p>
                  )}
                </div>

                {/* Auto Description */}
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-400 mb-2">📝 Mô tả</p>
                  <p className="text-sm whitespace-pre-line">
                    {customDescription || autoDescription}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                <Eye size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nhập blob để xem preview</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
