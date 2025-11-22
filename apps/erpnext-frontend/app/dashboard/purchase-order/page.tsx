'use client';
import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import type { PurchaseOrder as PurchaseOrderType, PurchaseOrderFormData } from "@/types/purchase-order";
import { purchaseOrderAPI } from "@/services/purchase-order";
import { PurchaseOrderFilter } from "@/components/purchase-order/PurchaseOrderFilter";
import { PurchaseOrderTable } from "@/components/purchase-order/PurchaseOrderTable";
import { PurchaseOrderDialog } from "@/components/purchase-order/PurchaseOrderDialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, ConfirmDialog } from "@/components/ui/alert-dialog-custom";

export default function PurchaseOrder() {
  const [orders, setOrders] = useState<PurchaseOrderType[]>([]);
  const [allOrders, setAllOrders] = useState<PurchaseOrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderType | undefined>(undefined);

  // Alert & Confirm states
  const [alertState, setAlertState] = useState<{
    open: boolean;
    message: string;
    type?: "info" | "success" | "warning" | "error";
  }>({ open: false, message: "" });

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, message: "", onConfirm: () => {} });

  const showAlert = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    setAlertState({ open: true, message, type });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    variant: "default" | "destructive" = "default"
  ) => {
    setConfirmState({ open: true, message, onConfirm, variant });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await purchaseOrderAPI.list({
        limit_start: 0,
        limit_page_length: 1000,
        order_by: "modified desc",
      });
      setAllOrders(response);
      setOrders(response);
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
      showAlert("구매주문 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 클라이언트 측 필터링
  useEffect(() => {
    let filtered = [...allOrders];

    // 검색어 필터 (공급자 또는 주문번호)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.name?.toLowerCase().includes(query) ||
          order.supplier?.toLowerCase().includes(query)
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      if (statusFilter === "Draft") {
        filtered = filtered.filter((order) => order.docstatus === 0);
      } else if (statusFilter === "Cancelled") {
        filtered = filtered.filter((order) => order.docstatus === 2);
      } else {
        filtered = filtered.filter(
          (order) => order.status === statusFilter && order.docstatus === 1
        );
      }
    }

    setOrders(filtered);
  }, [searchQuery, statusFilter, allOrders]);

  const handleCreate = () => {
    setSelectedOrder(undefined);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleView = async (order: PurchaseOrderType) => {
    try {
      const fullOrder = await purchaseOrderAPI.get(order.name);
      setSelectedOrder(fullOrder);
      setDialogMode("view");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      showAlert("상세정보를 불러오는데 실패했습니다.", "error");
    }
  };

  const handleEdit = async (order: PurchaseOrderType) => {
    try {
      const fullOrder = await purchaseOrderAPI.get(order.name);
      setSelectedOrder(fullOrder);
      setDialogMode("edit");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      showAlert("상세정보를 불러오는데 실패했습니다.", "error");
    }
  };

  const handleSubmit = async (order: PurchaseOrderType) => {
    showConfirm(
      `"${order.name}"을(를) 제출하시겠습니까?`,
      async () => {
        try {
          await purchaseOrderAPI.submit(order.name);
          showAlert("제출되었습니다.", "success");
          fetchOrders();
        } catch (error) {
          console.error("Failed to submit:", error);
          showAlert("제출에 실패했습니다.", "error");
        }
      }
    );
  };

  const handleCancel = async (order: PurchaseOrderType) => {
    showConfirm(
      `"${order.name}"을(를) 취소하시겠습니까?`,
      async () => {
        try {
          await purchaseOrderAPI.cancel(order.name);
          showAlert("취소되었습니다.", "success");
          fetchOrders();
        } catch (error) {
          console.error("Failed to cancel:", error);
          showAlert("취소에 실패했습니다.", "error");
        }
      },
      "destructive"
    );
  };

  const handleDelete = async (order: PurchaseOrderType) => {
    showConfirm(
      `"${order.name}"을(를) 삭제하시겠습니까?`,
      async () => {
        try {
          await purchaseOrderAPI.delete(order.name);
          showAlert("삭제되었습니다.", "success");
          fetchOrders();
        } catch (error) {
          console.error("Failed to delete:", error);
          showAlert("삭제에 실패했습니다.", "error");
        }
      },
      "destructive"
    );
  };

  const handleSave = async (data: PurchaseOrderFormData) => {
    try {
      if (dialogMode === "create") {
        await purchaseOrderAPI.create(data);
        showAlert("구매주문이 생성되었습니다.", "success");
      } else if (dialogMode === "edit" && selectedOrder) {
        await purchaseOrderAPI.update(selectedOrder.name, data);
        showAlert("구매주문이 수정되었습니다.", "success");
      }
      fetchOrders();
    } catch (error) {
      console.error("Failed to save:", error);
      throw error;
    }
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">구매 주문</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {orders.length}개의 주문
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchOrders}
            disabled={loading}
            className="bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 px-4 py-2 font-semibold transition-colors duration-150"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            재조회
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-[#1a2747] text-white border border-[#1a2747] rounded-lg shadow-sm hover:bg-[#223060] flex items-center px-4 py-2 gap-1 transition-colors duration-150"
          >
            <Plus className="h-4 w-4 text-white" />
            <span className="font-semibold">새 구매주문</span>
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <PurchaseOrderFilter
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSearch={() => {}}
      />

      {/* 테이블 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : (
        <PurchaseOrderTable
          orders={orders}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog */}
      <PurchaseOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        order={selectedOrder}
        onSave={handleSave}
      />

      {/* Alert & Confirm Dialogs */}
      <AlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState({ ...alertState, open })}
        message={alertState.message}
        type={alertState.type}
      />
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState({ ...confirmState, open })}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        variant={confirmState.variant}
      />
    </div>
  );
}
