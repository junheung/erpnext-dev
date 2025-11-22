import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import type { PurchaseOrder, PurchaseOrderFormData } from "@/types/purchase-order";
import { Badge } from "@/components/ui/badge";

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  order?: PurchaseOrder;
  onSave: (data: PurchaseOrderFormData) => Promise<void>;
}

const initialFormData: PurchaseOrderFormData = {
  supplier: "",
  supplier_name: "",
  transaction_date: new Date().toISOString().split("T")[0],
  schedule_date: "",
  company: "",
  items: [],
  total_qty: 0,
  grand_total: 0,
};

export function PurchaseOrderDialog({
  open,
  onOpenChange,
  mode,
  order,
  onSave,
}: PurchaseOrderDialogProps) {
  const [formData, setFormData] = useState<PurchaseOrderFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (order && (mode === "edit" || mode === "view")) {
        setFormData({
          supplier: order.supplier,
          supplier_name: order.supplier_name || "",
          transaction_date: order.transaction_date,
          schedule_date: order.schedule_date || "",
          company: order.company,
          items: order.items || [],
          total_qty: order.total_qty || 0,
          grand_total: order.grand_total || 0,
        });
      } else if (mode === "create") {
        setFormData(initialFormData);
      }
    }
  }, [open, order, mode]);

  const handleSave = async () => {
    // Validation
    if (!formData.supplier.trim()) {
      alert("공급업체를 입력하세요.");
      return;
    }
    if (!formData.transaction_date) {
      alert("주문일자를 입력하세요.");
      return;
    }
    if (!formData.company.trim()) {
      alert("회사를 입력하세요.");
      return;
    }
    if (formData.items.length === 0) {
      alert("최소 1개 이상의 품목을 추가하세요.");
      return;
    }

    // Validate items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.item_code.trim()) {
        alert(`품목 ${i + 1}번의 품목코드를 입력하세요.`);
        return;
      }
      if (item.qty <= 0) {
        alert(`품목 ${i + 1}번의 수량은 0보다 커야 합니다.`);
        return;
      }
      if (item.rate < 0) {
        alert(`품목 ${i + 1}번의 단가는 0 이상이어야 합니다.`);
        return;
      }
      if (!item.schedule_date || !item.schedule_date.trim()) {
        alert(`품목 ${i + 1}번의 입고예정일을 입력하세요.`);
        return;
      }
    }

    setLoading(true);
    try {
      await onSave(formData);
      setFormData(initialFormData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save purchase order:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "새 구매주문";
      case "edit":
        return "구매주문 수정";
      case "view":
        return "구매주문 상세";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden flex flex-col [&>button]:text-white [&>button]:hover:text-white [&>button]:w-10 [&>button]:h-10 [&>button]:p-2 [&>button]:z-50 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <DialogHeader className="mb-0 bg-gradient-to-r from-[#1a2747] via-[#2d3f6b] to-[#1a2747] px-6 py-4 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <DialogTitle className="text-xl font-bold text-white relative z-10 flex items-center gap-3">
            {getTitle()}
            {order && (
              <Badge variant="outline" className="ml-2 bg-white/20 border-white/40 text-white text-xs">
                {order.name}
              </Badge>
            )}
          </DialogTitle>
          <p className="text-blue-100 mt-1 relative z-10 text-sm">
            {mode === "create" ? (
              <>
                새 구매주문을 작성합니다. <span className="text-red-400 font-semibold">* 필수 항목</span>
              </>
            ) : (
              <span className="text-red-400 font-semibold">* 필수 항목</span>
            )}
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
        <Tabs defaultValue="details" className="w-full px-8 pt-6">
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">상세정보</TabsTrigger>
            <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">요약</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <PurchaseOrderForm
              formData={formData}
              onFormChange={setFormData}
              disabled={mode === "view"}
            />
          </TabsContent>

          <TabsContent value="summary" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">기본정보</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex">
                    <dt className="w-32 text-gray-600">공급업체:</dt>
                    <dd className="font-medium">{formData.supplier}</dd>
                  </div>
                  {formData.supplier_name && (
                    <div className="flex">
                      <dt className="w-32 text-gray-600">공급업체명:</dt>
                      <dd className="font-medium">{formData.supplier_name}</dd>
                    </div>
                  )}
                  <div className="flex">
                    <dt className="w-32 text-gray-600">주문일자:</dt>
                    <dd className="font-medium">{formData.transaction_date}</dd>
                  </div>
                  {formData.schedule_date && (
                    <div className="flex">
                      <dt className="w-32 text-gray-600">입고예정일:</dt>
                      <dd className="font-medium">{formData.schedule_date}</dd>
                    </div>
                  )}
                  <div className="flex">
                    <dt className="w-32 text-gray-600">회사:</dt>
                    <dd className="font-medium">{formData.company}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-2">금액정보</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex">
                    <dt className="w-32 text-gray-600">총 수량:</dt>
                    <dd className="font-medium">{(formData.total_qty || 0).toLocaleString()}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 text-gray-600">총 금액:</dt>
                    <dd className="font-medium">₩{(formData.grand_total || 0).toLocaleString()}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 text-gray-600">품목 수:</dt>
                    <dd className="font-medium">{formData.items.length}개</dd>
                  </div>
                </dl>
              </div>
            </div>

            {formData.items.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">품목목록</h3>
                <div className="border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2">품목코드</th>
                        <th className="text-left p-2">품목명</th>
                        <th className="text-right p-2">수량</th>
                        <th className="text-left p-2">단위</th>
                        <th className="text-right p-2">단가</th>
                        <th className="text-right p-2">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{item.item_code}</td>
                          <td className="p-2">{item.item_name || "-"}</td>
                          <td className="text-right p-2">{item.qty.toLocaleString()}</td>
                          <td className="p-2">{item.uom}</td>
                          <td className="text-right p-2">₩{item.rate.toLocaleString()}</td>
                          <td className="text-right p-2">₩{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>

        <DialogFooter className="flex justify-end gap-1 px-8 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => {
              setFormData(initialFormData);
              onOpenChange(false);
            }} 
            disabled={loading}
            className="ml-auto px-6 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
          >
            {mode === "view" ? "닫기" : "취소"}
          </Button>
          {mode !== "view" && (
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#1a2747] to-[#2d3f6b] text-white hover:from-[#223060] hover:to-[#3a4f7f] shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              {loading ? "저장 중..." : "저장"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
