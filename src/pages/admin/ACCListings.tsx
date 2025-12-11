import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  List,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  Filter,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Account {
  _id: string;
  username: string;
  images: string[];
  status: string;
  saleType: string;
  price?: number;
  currentBid?: number;
  auctionEndTime?: string;
  soldAt?: string;
  createdAt: string;
  uploadedBy?: { username: string };
  soldTo?: { username: string };
}

export default function ACCListings() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAccounts();
  }, [filter]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url =
        filter === "recent"
          ? `${API_URL}/admin/accounts/recent`
          : `${API_URL}/admin/accounts?status=${filter === "all" ? "" : filter}`;

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_URL}/admin/accounts/${id}/hard-delete`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ confirmed: true }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "Xóa ACC thành công!" });
        fetchAccounts();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage({ type: "error", text: "Lỗi khi xóa ACC" });
    }
  };

  const handleCleanup = async () => {
    setCleanupLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/admin/cleanup-accounts`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Cleanup thành công! Đã xóa ${data.deletedCount} ACC`,
        });
        fetchAccounts();
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    } catch (error) {
      console.error("Error running cleanup:", error);
      setMessage({ type: "error", text: "Lỗi khi chạy cleanup" });
    } finally {
      setCleanupLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      available: "default",
      sold: "secondary",
      reserved: "outline",
      removed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status === "available"
          ? "Còn hàng"
          : status === "sold"
          ? "Đã bán"
          : status === "reserved"
          ? "Đã đặt"
          : "Đã xóa"}
      </Badge>
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return "0";
    return price.toLocaleString("vi-VN");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (endTime?: string) => {
    if (!endTime) return null;
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <List className="w-8 h-8" />
            Quản Lý ACC Listings
          </h1>
          <p className="text-gray-600 mt-2">
            Danh sách tất cả ACC đã upload
          </p>
        </div>

        <Button
          onClick={handleCleanup}
          disabled={cleanupLoading}
          variant="outline"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${cleanupLoading ? "animate-spin" : ""}`}
          />
          {cleanupLoading ? "Đang cleanup..." : "Cleanup ACC đã bán"}
        </Button>
      </div>

      {message.text && (
        <Alert
          className={`mb-6 ${
            message.type === "success"
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <AlertDescription
            className={
              message.type === "success" ? "text-green-800" : "text-red-800"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            {["all", "recent", "available", "sold", "reserved", "removed"].map(
              (f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === "all"
                    ? "Tất cả"
                    : f === "recent"
                    ? "20 gần nhất"
                    : f === "available"
                    ? "Còn hàng"
                    : f === "sold"
                    ? "Đã bán"
                    : f === "reserved"
                    ? "Đã đặt"
                    : "Đã xóa"}
                </Button>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ảnh</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Loại bán</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người bán</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Không có ACC nào
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account._id}>
                  <TableCell>
                    {account.images[0] ? (
                      <img
                        src={`${API_URL.replace("/api", "")}${
                          account.images[0]
                        }`}
                        alt={account.username}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Eye className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {account.username}
                  </TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        account.saleType === "auction" ? "default" : "outline"
                      }
                    >
                      {account.saleType === "auction"
                        ? "Đấu giá"
                        : "Mua ngay"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {account.saleType === "auction"
                        ? formatPrice(account.currentBid)
                        : formatPrice(account.price)}
                      <span className="text-xs text-gray-500">xu</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {account.status === "sold" && account.soldAt ? (
                      <div className="text-sm">
                        <div className="text-gray-500">Bán lúc:</div>
                        <div>{formatDate(account.soldAt)}</div>
                      </div>
                    ) : account.saleType === "auction" &&
                      account.auctionEndTime ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">
                          {getTimeRemaining(account.auctionEndTime)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {formatDate(account.createdAt)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {account.uploadedBy?.username || "Unknown"}
                    </div>
                    {account.soldTo && (
                      <div className="text-xs text-gray-500">
                        → {account.soldTo.username}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Xác nhận xóa ACC
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <div className="space-y-2">
                              <p>
                                Bạn có chắc muốn xóa ACC{" "}
                                <strong>{account.username}</strong>?
                              </p>
                              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                                <p className="font-semibold text-red-800 mb-1">
                                  ⚠️ Hành động này sẽ:
                                </p>
                                <ul className="text-red-700 space-y-1 ml-4">
                                  <li>• Xóa vĩnh viễn khỏi database</li>
                                  <li>• Xóa tất cả ảnh trên server</li>
                                  <li>• Không thể khôi phục</li>
                                </ul>
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(account._id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Xóa vĩnh viễn
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
