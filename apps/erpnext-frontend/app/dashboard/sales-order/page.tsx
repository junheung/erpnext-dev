'use client';
import { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import type { SalesOrder, SalesOrderFormData } from "@/types/sales-order";
import { salesOrderAPI } from "@/services/sales-order";
import { Button } from "@/components/ui/button";
import { SalesOrderFilter } from "@/components/sales-order/SalesOrderFilter";
import { SalesOrderTable } from "@/components/sales-order/SalesOrderTable";
import { SalesOrderDialog } from "@/components/sales-order/SalesOrderDialog";
import { AlertDialog, ConfirmDialog } from "@/components/ui/alert-dialog-custom";

export default function SalesOrder() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [allOrders, setAllOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | undefined>();
  
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
      const response = await salesOrderAPI.list({
        limit_page_length: 1000,
      });
      setAllOrders(response);
      setOrders(response);
    } catch (error) {
      console.error("Failed to fetch sales orders:", error);
      showAlert("판매주문 목록을 불러오는데 실패했습니다.", "error");
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

    // 검색어 필터 (고객 또는 주문번호)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.name?.toLowerCase().includes(query) ||
          order.customer?.toLowerCase().includes(query)
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

  const handleView = (order: SalesOrder) => {
    setSelectedOrder(order);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEdit = async (order: SalesOrder) => {
    try {
      const fullOrder = await salesOrderAPI.get(order.name);
      setSelectedOrder(fullOrder);
      setDialogMode("edit");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch sales order:", error);
      showAlert("판매주문 정보를 불러오는데 실패했습니다.", "error");
    }
  };

  const handleSave = async (formData: SalesOrderFormData) => {
    try {
      if (dialogMode === "create") {
        await salesOrderAPI.create(formData);
        showAlert("판매주문이 생성되었습니다.", "success");
      } else if (dialogMode === "edit" && selectedOrder) {
        await salesOrderAPI.update(selectedOrder.name, formData);
        showAlert("판매주문이 수정되었습니다.", "success");
      }
      setDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Failed to save sales order:", error);
      showAlert("판매주문 저장에 실패했습니다.", "error");
    }
  };

  const handleSubmit = async (order: SalesOrder) => {
    showConfirm(
      `판매주문 ${order.name}을(를) 제출하시겠습니까?`,
      async () => {
        try {
          await salesOrderAPI.submit(order.name);
          showAlert("판매주문이 제출되었습니다.", "success");
          fetchOrders();
        } catch (error) {
          console.error("Failed to submit sales order:", error);
          showAlert("판매주문 제출에 실패했습니다.", "error");
        }
      }
    );
  };

  const handleCancel = async (order: SalesOrder) => {
    showConfirm(
      `판매주문 ${order.name}을(를) 취소하시겠습니까?`,
      async () => {
        try {
          await salesOrderAPI.cancel(order.name);
          showAlert("판매주문이 취소되었습니다.", "success");
          fetchOrders();
        } catch (error) {
          console.error("Failed to cancel sales order:", error);
          showAlert("판매주문 취소에 실패했습니다.", "error");
        }
      },
      "destructive"
    );
  };

  const handleDelete = async (order: SalesOrder) => {
    showConfirm(
      `판매주문 ${order.name}을(를) 삭제하시겠습니까?`,
      async () => {
        try {
          await salesOrderAPI.delete(order.name);
          showAlert("판매주문이 삭제되었습니다.", "success");
          fetchOrders();
        } catch (error) {
          console.error("Failed to delete sales order:", error);
          showAlert("판매주문 삭제에 실패했습니다.", "error");
        }
      },
      "destructive"
    );
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">판매 주문</h1>
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
            <span className="font-semibold">새 판매주문</span>
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <SalesOrderFilter
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
        <SalesOrderTable
          orders={orders}
          onView={handleView}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      )}

      <SalesOrderDialog
        open={dialogOpen}
        mode={dialogMode}
        order={selectedOrder}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      <AlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState({ ...alertState, open })}
        message={alertState.message}
        type={alertState.type}
      />

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState({ ...confirmState, open })}
        onConfirm={confirmState.onConfirm}
        message={confirmState.message}
        variant={confirmState.variant}
      />
    </div>
  );
}
