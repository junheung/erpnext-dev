'use client';
import { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import type { Customer, CustomerFormData } from "@/types/customer";
import { customerAPI } from "@/services/customer";
import { Button } from "@/components/ui/button";
import { CustomerFilter } from "@/components/customer/CustomerFilter";
import { CustomerTable } from "@/components/customer/CustomerTable";
import { CustomerDialog } from "@/components/customer/CustomerDialog";
import { AlertDialog, ConfirmDialog } from "@/components/ui/alert-dialog-custom";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

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

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerAPI.list({
        limit_page_length: 1000,
      });
      setAllCustomers(response);
      setCustomers(response);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      showAlert("고객 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 클라이언트 측 필터링
  useEffect(() => {
    let filtered = [...allCustomers];

    // 검색어 필터 (고객명 또는 이메일)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.customer_name?.toLowerCase().includes(query) ||
          customer.email_id?.toLowerCase().includes(query) ||
          customer.name?.toLowerCase().includes(query)
      );
    }

    // 고객 유형 필터
    if (typeFilter !== "all") {
      filtered = filtered.filter((customer) => customer.customer_type === typeFilter);
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (customer) => customer.disabled === (statusFilter === "disabled" ? 1 : 0)
      );
    }

    setCustomers(filtered);
  }, [searchQuery, typeFilter, statusFilter, allCustomers]);

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleView = async (customer: Customer) => {
    try {
      const fullCustomer = await customerAPI.get(customer.name);
      setSelectedCustomer(fullCustomer);
      setDialogMode("view");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      showAlert("고객 정보를 불러오는데 실패했습니다.", "error");
    }
  };

  const handleEdit = async (customer: Customer) => {
    try {
      const fullCustomer = await customerAPI.get(customer.name);
      setSelectedCustomer(fullCustomer);
      setDialogMode("edit");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      showAlert("고객 정보를 불러오는데 실패했습니다.", "error");
    }
  };

  const handleSave = async (formData: CustomerFormData) => {
    try {
      if (dialogMode === "create") {
        await customerAPI.create(formData);
        showAlert("고객이 생성되었습니다.", "success");
      } else if (dialogMode === "edit" && selectedCustomer) {
        await customerAPI.update(selectedCustomer.name, formData);
        showAlert("고객 정보가 수정되었습니다.", "success");
      }
      setDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to save customer:", error);
      const errorMessage = error instanceof Error ? error.message : "고객 저장에 실패했습니다.";
      showAlert(errorMessage, "error");
    }
  };

  const handleDelete = async (customer: Customer) => {
    showConfirm(
      `"${customer.customer_name}"을(를) 삭제하시겠습니까?`,
      async () => {
        try {
          await customerAPI.delete(customer.name);
          showAlert("고객이 삭제되었습니다.", "success");
          fetchCustomers();
        } catch (error) {
          console.error("Failed to delete customer:", error);
          showAlert("고객 삭제에 실패했습니다.", "error");
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
          <h1 className="text-2xl font-bold">고객 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {customers.length}개의 고객
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchCustomers}
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
            <span className="font-semibold">새 고객</span>
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <CustomerFilter
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        onSearch={() => {}}
      />

      {/* 테이블 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CustomerDialog
        open={dialogOpen}
        mode={dialogMode}
        customer={selectedCustomer}
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
