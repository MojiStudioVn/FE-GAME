import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Shield,
  Clock,
  Upload,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SecuritySettings() {
  const [settings, setSettings] = useState({
    // General
    siteBrand: "",

    // Security
    cspMode: "moderate",
    httpsEnabled: false,

    // Rate Limiting
    rateLimitWindowMs: 900000,
    rateLimitMax: 100,

    // Sessions
    sessionMaxAge: 604800000,
    adminSessionMaxAge: 86400000,

    // File Upload
    maxFileSize: 10485760,
    maxFiles: 10,
    allowedFileTypes: [],

    // Card History
    cardHistoryRetentionDays: 90,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Cập nhật cài đặt thành công!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
      setMessage({ type: "error", text: "Lỗi khi cập nhật cài đặt" });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + " " + sizes[i];
  };

  const formatTime = (ms) => {
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (days >= 1) return `${Math.round(days)} ngày`;
    if (hours >= 1) return `${Math.round(hours)} giờ`;
    if (minutes >= 1) return `${Math.round(minutes)} phút`;
    return `${Math.round(seconds)} giây`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Cài Đặt Bảo Mật
        </h1>
        <p className="text-gray-600 mt-2">
          Quản lý các cấu hình bảo mật và hiệu suất hệ thống
        </p>
      </div>

      {message.text && (
        <Alert className={`mb-6 ${message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Bảo Mật
          </TabsTrigger>
          <TabsTrigger value="rate-limit">
            <Clock className="w-4 h-4 mr-2" />
            Rate Limiting
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            Tổng Quát
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Cấu Hình Bảo Mật</h2>

            <div className="space-y-6">
              {/* CSP Mode */}
              <div>
                <Label>Content Security Policy (CSP) Mode</Label>
                <Select
                  value={settings.cspMode}
                  onValueChange={(value) =>
                    setSettings({ ...settings, cspMode: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Strict</Badge>
                        <span className="text-sm">Bảo mật tối đa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Moderate</Badge>
                        <span className="text-sm">Cân bằng (khuyến nghị)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="relaxed">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Relaxed</Badge>
                        <span className="text-sm">Linh hoạt</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Kiểm soát nội dung được phép tải trên website
                </p>
              </div>

              <Separator />

              {/* HTTPS */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Force HTTPS</Label>
                  <p className="text-sm text-gray-500">
                    Tự động chuyển hướng HTTP sang HTTPS (chỉ production)
                  </p>
                </div>
                <Switch
                  checked={settings.httpsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, httpsEnabled: checked })
                  }
                />
              </div>

              <Separator />

              {/* Session Settings */}
              <div>
                <h3 className="font-semibold mb-3">Session Timeout</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User Session</Label>
                    <Input
                      type="number"
                      value={settings.sessionMaxAge / 1000 / 60 / 60 / 24}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sessionMaxAge:
                            Number(e.target.value) * 24 * 60 * 60 * 1000,
                        })
                      }
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Hiện tại: {formatTime(settings.sessionMaxAge)}
                    </p>
                  </div>

                  <div>
                    <Label>Admin Session</Label>
                    <Input
                      type="number"
                      value={settings.adminSessionMaxAge / 1000 / 60 / 60}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adminSessionMaxAge:
                            Number(e.target.value) * 60 * 60 * 1000,
                        })
                      }
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Hiện tại: {formatTime(settings.adminSessionMaxAge)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Rate Limiting Tab */}
        <TabsContent value="rate-limit">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Rate Limiting</h2>
            <p className="text-gray-600 mb-6">
              Giới hạn số lượng request để chống DDoS và abuse
            </p>

            <div className="space-y-6">
              <div>
                <Label>Time Window (phút)</Label>
                <Input
                  type="number"
                  value={settings.rateLimitWindowMs / 1000 / 60}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rateLimitWindowMs: Number(e.target.value) * 60 * 1000,
                    })
                  }
                  min={1}
                  max={60}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Hiện tại: {formatTime(settings.rateLimitWindowMs)}
                </p>
              </div>

              <div>
                <Label>Max Requests</Label>
                <Input
                  type="number"
                  value={settings.rateLimitMax}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rateLimitMax: Number(e.target.value),
                    })
                  }
                  min={10}
                  max={10000}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Số request tối đa trong time window
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lưu ý:</strong> Giá trị quá thấp có thể ảnh hưởng đến
                  trải nghiệm người dùng. Khuyến nghị: 100 requests / 15 phút
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Cấu Hình Upload</h2>

            <div className="space-y-6">
              <div>
                <Label>Max File Size (MB)</Label>
                <Input
                  type="number"
                  value={settings.maxFileSize / 1024 / 1024}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxFileSize: Number(e.target.value) * 1024 * 1024,
                    })
                  }
                  min={1}
                  max={100}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Hiện tại: {formatBytes(settings.maxFileSize)}
                </p>
              </div>

              <div>
                <Label>Max Files Per Upload</Label>
                <Input
                  type="number"
                  value={settings.maxFiles}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxFiles: Number(e.target.value),
                    })
                  }
                  min={1}
                  max={50}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.allowedFileTypes?.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Chỉnh sửa trong database hoặc code để thay đổi
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Cài Đặt Tổng Quát</h2>

            <div className="space-y-6">
              <div>
                <Label>Site Brand Name</Label>
                <Input
                  value={settings.siteBrand}
                  onChange={(e) =>
                    setSettings({ ...settings, siteBrand: e.target.value })
                  }
                  placeholder="Game Platform"
                  className="mt-2"
                />
              </div>

              <Separator />

              <div>
                <Label>Card History Retention (ngày)</Label>
                <Input
                  type="number"
                  value={settings.cardHistoryRetentionDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cardHistoryRetentionDays: Number(e.target.value),
                    })
                  }
                  min={1}
                  max={365}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Số ngày lưu trữ lịch sử nạp thẻ
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Đang lưu..." : "Lưu Cài Đặt"}
        </Button>
      </div>

      {/* Warning about sensitive settings */}
      <Alert className="mt-6 border-yellow-500 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>⚠️ Lưu ý quan trọng:</strong>
          <br />
          Các giá trị nhạy cảm như ENCRYPTION_KEY, SESSION_SECRET, ADMIN_SESSION_SECRET
          <strong> KHÔNG được lưu trong database</strong> mà phải lưu trong file .env
          hoặc secret manager để đảm bảo bảo mật tối đa.
        </AlertDescription>
      </Alert>
    </div>
  );
}
