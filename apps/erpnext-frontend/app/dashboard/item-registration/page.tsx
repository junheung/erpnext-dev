'use client';
import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import type { Item } from "@/types/item";
import { itemAPI } from "@/services/item";
import { ItemFilter } from "@/components/item/ItemFilter";
import { ItemTable } from "@/components/item/ItemTable";
import { ItemDialog } from "@/components/item/ItemDialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, ConfirmDialog } from "@/components/ui/alert-dialog-custom";

export default function ItemRegistration() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
  // ...existing code...

  const fetchItems = async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      
      // 상태 필터만 서버에서 처리
      if (statusFilter !== "all") {
        filters["disabled"] = statusFilter === "enabled" ? 0 : 1;
      }

      const response = await itemAPI.list({
        filters,
        limit_start: 0,
        limit_page_length: 999,
      });

      // 검색어 필터는 클라이언트에서 처리
      let filteredItems = response;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredItems = response.filter(item => 
          item.item_code?.toLowerCase().includes(query) ||
          item.item_name?.toLowerCase().includes(query)
        );
      }

      setItems(filteredItems);
      
      // ...existing code...
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, statusFilter]);

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (item: Item) => {
    showConfirm(
      `"${item.item_name}"을(를) 삭제하시겠습니까?`,
      async () => {
        try {
          await itemAPI.delete(item.name);
          fetchItems();
        } catch (error) {
          console.error("Failed to delete item:", error);
          showAlert("삭제에 실패했습니다.", "error");
        }
      },
      "destructive"
    );
  };

  const handleSave = async (itemData: Partial<Item>) => {
    try {
      if (selectedItem) {
        // 수정
        await itemAPI.update(selectedItem.name, itemData);
        showAlert("물품이 수정되었습니다.", "success");
      } else {
        // 신규 등록 - 필수 필드 검증
        if (!itemData.item_code || !itemData.item_name) {
          showAlert("물품코드와 물품명은 필수입니다.", "warning");
          return;
        }
        if (!itemData.item_group || !itemData.stock_uom) {
          showAlert("물품 그룹과 단위는 필수입니다.", "warning");
          return;
        }
        await itemAPI.create({
          item_code: itemData.item_code,
          item_name: itemData.item_name,
          item_group: itemData.item_group,
          stock_uom: itemData.stock_uom,
          standard_rate: itemData.standard_rate,
          disabled: itemData.disabled,
          description: itemData.description,
        });
        showAlert("물품이 등록되었습니다.", "success");
      }
      fetchItems();
      setDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
      const errorMessage = error instanceof Error ? error.message : "물품 저장에 실패했습니다.";
      showAlert(errorMessage, "error");
    }
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">물품 등록</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {items.length}개의 물품
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchItems}
            disabled={loading}
            className="bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 px-4 py-2 font-semibold transition-colors duration-150"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            재조회
          </Button>
          <Button
            onClick={handleAddNew}
            className="bg-[#1a2747] text-white border border-[#1a2747] rounded-lg shadow-sm hover:bg-[#223060] flex items-center px-4 py-2 gap-1 transition-colors duration-150"
          >
            <Plus className="h-4 w-4 text-white" />
            <span className="font-semibold">새 물품 등록</span>
          </Button>
        </div>
      </div>

      <ItemFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : (
        <ItemTable items={items} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <ItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
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

