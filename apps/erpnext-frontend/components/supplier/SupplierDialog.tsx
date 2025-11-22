import { useState, useEffect } from "react";
import type { Supplier, SupplierFormData } from "@/types/supplier";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SupplierForm } from "./SupplierForm";

interface SupplierDialogProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  supplier?: Supplier;
  onClose: () => void;
  onSave: (data: SupplierFormData) => void;
}

export function SupplierDialog({
  open,
  mode,
  supplier,
  onClose,
  onSave,
}: SupplierDialogProps) {
  const [formData, setFormData] = useState<SupplierFormData>(() => {
    if (supplier) {
      return {
        supplier_name: supplier.supplier_name,
        supplier_type: supplier.supplier_type,
        supplier_group: supplier.supplier_group,
        country: supplier.country,
        email_id: supplier.email_id,
        mobile_no: supplier.mobile_no,
        website: supplier.website,
        tax_id: supplier.tax_id,
        tax_category: supplier.tax_category,
        default_currency: supplier.default_currency,
        language: supplier.language,
        supplier_details: supplier.supplier_details,
        disabled: supplier.disabled,
      };
    }
    return {
      supplier_name: "",
      supplier_type: "Company",
      supplier_group: "All Supplier Groups",
      country: "South Korea",
      default_currency: "KRW",
    };
  });

  // 수정 모드일 때 supplier 데이터로 formData 업데이트
  useEffect(() => {
    if (supplier && open) {
      setFormData({
        supplier_name: supplier.supplier_name,
        supplier_type: supplier.supplier_type,
        supplier_group: supplier.supplier_group,
        country: supplier.country,
        email_id: supplier.email_id,
        mobile_no: supplier.mobile_no,
        website: supplier.website,
        tax_id: supplier.tax_id,
        tax_category: supplier.tax_category,
        default_currency: supplier.default_currency,
        language: supplier.language,
        supplier_details: supplier.supplier_details,
        disabled: supplier.disabled,
      });
    }
  }, [supplier, open]);

  // 다이얼로그가 닫히고 supplier가 없을 때 폼 초기화
  useEffect(() => {
    if (!open && !supplier) {
      setFormData({
        supplier_name: "",
        supplier_type: "Company",
        supplier_group: "All Supplier Groups",
        country: "South Korea",
        default_currency: "KRW",
      });
    }
  }, [open, supplier]);

  const handleSave = () => {
    // Basic validation
    if (!formData.supplier_name) {
      alert("공급자명을 입력하세요.");
      return;
    }
    if (!formData.supplier_type) {
      alert("공급자 유형을 선택하세요.");
      return;
    }
    if (!formData.supplier_group) {
      alert("공급자 그룹을 선택하세요.");
      return;
    }
    if (!formData.country) {
      alert("국가를 선택하세요.");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden flex flex-col [&>button]:text-white [&>button]:hover:text-white [&>button]:w-10 [&>button]:h-10 [&>button]:p-2 [&>button]:z-50 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <DialogHeader className="mb-0 bg-gradient-to-r from-[#1a2747] via-[#2d3f6b] to-[#1a2747] px-6 py-4 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <DialogTitle className="text-xl font-bold text-white relative z-10">
            {mode === "create" && "새 공급자"}
            {mode === "edit" && "공급자 수정"}
            {mode === "view" && "공급자 상세"}
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-1 relative z-10 text-sm">
            {mode === "create" && "새 공급자 정보를 입력합니다."}
            {mode === "edit" && "공급자 정보를 수정합니다."}
            {mode === "view" && "공급자 상세 정보를 확인합니다."}
            <span className="ml-2 text-red-400 font-semibold">* 필수 항목</span>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <div className="w-full px-8 pt-6">
            <SupplierForm
              formData={formData}
              onFormDataChange={setFormData}
              disabled={mode === "view"}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-1 px-8 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="ml-auto px-6 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
          >
            {mode === "view" ? "닫기" : "취소"}
          </Button>
          {mode !== "view" && (
            <Button 
              onClick={handleSave}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#1a2747] to-[#2d3f6b] text-white hover:from-[#223060] hover:to-[#3a4f7f] shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              {mode === "create" ? "생성" : "저장"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
