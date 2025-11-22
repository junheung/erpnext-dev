import { useState, useEffect } from "react";
import type { Customer, CustomerFormData } from "@/types/customer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerForm } from "./CustomerForm";
import { Badge } from "@/components/ui/badge";

interface CustomerDialogProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  customer?: Customer;
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
}

const getInitialFormData = (customer?: Customer): CustomerFormData => {
  if (customer) {
    return {
      customer_name: customer.customer_name,
      customer_type: customer.customer_type,
      customer_group: customer.customer_group,
      territory: customer.territory,
      email_id: customer.email_id,
      mobile_no: customer.mobile_no,
      phone_no: customer.phone_no,
      website: customer.website,
      tax_id: customer.tax_id,
      tax_category: customer.tax_category,
      default_currency: customer.default_currency,
      language: customer.language,
      customer_details: customer.customer_details,
      disabled: customer.disabled,
    };
  }
  return {
    customer_name: "",
    customer_type: "Company",
    customer_group: "Commercial",
    territory: "All Territories",
    default_currency: "KRW",
  };
};

export function CustomerDialog({
  open,
  mode,
  customer,
  onClose,
  onSave,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState<CustomerFormData>(getInitialFormData(customer));

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(customer));
    }
  }, [open, customer]);

  const handleSave = () => {
    // Basic validation
    if (!formData.customer_name) {
      alert("고객명을 입력하세요.");
      return;
    }
    if (!formData.customer_type) {
      alert("고객 유형을 선택하세요.");
      return;
    }
    if (!formData.customer_group) {
      alert("고객 그룹을 선택하세요.");
      return;
    }
    if (!formData.territory) {
      alert("지역을 선택하세요.");
      return;
    }

    onSave(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const getTypeBadge = (type: string) => {
    if (type === 'Company') {
      return <Badge className="bg-blue-500">Company</Badge>;
    } else {
      return <Badge className="bg-green-500">Individual</Badge>;
    }
  };

  const getStatusBadge = (disabled: number) => {
    if (disabled === 0) {
      return <Badge variant="default">Enabled</Badge>;
    } else {
      return <Badge variant="secondary">Disabled</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden flex flex-col [&>button]:text-white [&>button]:hover:text-white [&>button]:w-10 [&>button]:h-10 [&>button]:p-2 [&>button]:z-50 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <DialogHeader className="mb-0 bg-gradient-to-r from-[#1a2747] via-[#2d3f6b] to-[#1a2747] px-6 py-4 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <DialogTitle className="text-xl font-bold text-white relative z-10">
            {mode === "create" && "새 고객"}
            {mode === "edit" && "고객 수정"}
            {mode === "view" && "고객 상세"}
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-1 relative z-10 text-sm">
            {mode === "create" && "새 고객 정보를 입력합니다."}
            {mode === "edit" && "고객 정보를 수정합니다."}
            {mode === "view" && "고객 상세 정보를 확인합니다."}
            <span className="ml-2 text-red-400 font-semibold">* 필수 항목</span>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
        <div className="w-full px-8 pt-6">
          <CustomerForm
            formData={formData}
            onFormDataChange={setFormData}
            disabled={mode === "view"}
          />
        </div>
        </div>

        <DialogFooter className="flex justify-end gap-1 px-8 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => {
              setFormData(getInitialFormData(customer));
              onClose();
            }}
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
