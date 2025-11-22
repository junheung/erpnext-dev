'use client';
import { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import type { Supplier, SupplierFormData } from "@/types/supplier";
import { supplierAPI } from "@/services/supplier";
import { Button } from "@/components/ui/button";
import { SupplierFilter } from "@/components/supplier/SupplierFilter";
import { SupplierTable } from "@/components/supplier/SupplierTable";
import { SupplierDialog } from "@/components/supplier/SupplierDialog";
import { AlertDialog, ConfirmDialog } from "@/components/ui/alert-dialog-custom";

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();

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

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      
      // 공급자 유형 필터
      if (typeFilter !== "all") {
        filters["supplier_type"] = typeFilter;
      }
      
      // 상태 필터
      if (statusFilter !== "all") {
        filters["disabled"] = statusFilter === "enabled" ? 0 : 1;
      }

      const response = await supplierAPI.list({
        filters,
        limit_page_length: 999,
      });

      // 검색어 필터는 클라이언트에서 처리
      let filteredSuppliers = response;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredSuppliers = response.filter(supplier => 
          supplier.supplier_name?.toLowerCase().includes(query)
        );
      }

      setSuppliers(filteredSuppliers);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      showAlert("공급자 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [typeFilter, statusFilter, searchQuery]);

  const handleCreate = () => {
    setSelectedSupplier(undefined);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleView = async (supplier: Supplier) => {
    try {
      const fullSupplier = await supplierAPI.get(supplier.name);
      setSelectedSupplier(fullSupplier);
      setDialogMode("view");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch supplier:", error);
      showAlert("공급자 정보를 불러오는데 실패했습니다.", "error");
    }
  };

  const handleEdit = async (supplier: Supplier) => {
    try {
      const fullSupplier = await supplierAPI.get(supplier.name);
      setSelectedSupplier(fullSupplier);
      setDialogMode("edit");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch supplier:", error);
      showAlert("공급자 정보를 불러오는데 실패했습니다.", "error");
    }
  };

  const handleSave = async (formData: SupplierFormData) => {
    try {
      if (dialogMode === "create") {
        await supplierAPI.create(formData);
        showAlert("공급자가 생성되었습니다.", "success");
      } else if (dialogMode === "edit" && selectedSupplier) {
        await supplierAPI.update(selectedSupplier.name, formData);
        showAlert("공급자 정보가 수정되었습니다.", "success");
      }
      setDialogOpen(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      const errorMessage = error instanceof Error ? error.message : "공급자 저장에 실패했습니다.";
      showAlert(errorMessage, "error");
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    showConfirm(
      `"${supplier.supplier_name}"을(를) 삭제하시겠습니까?`,
      async () => {
        try {
          await supplierAPI.delete(supplier.name);
          showAlert("공급자가 삭제되었습니다.", "success");
          fetchSuppliers();
        } catch (error) {
          console.error("Failed to delete supplier:", error);
          showAlert("공급자 삭제에 실패했습니다.", "error");
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
          <h1 className="text-2xl font-bold">공급자 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {suppliers.length}개의 공급자
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchSuppliers}
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
            <span className="font-semibold">새 공급자</span>
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <SupplierFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* 테이블 */}
      <SupplierTable
        suppliers={suppliers}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 다이얼로그 */}
      <SupplierDialog
        open={dialogOpen}
        mode={dialogMode}
        supplier={selectedSupplier}
        onClose={() => setDialogOpen(false)}
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
