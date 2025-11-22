import { useState, useEffect } from "react";
import type { SalesOrder, SalesOrderFormData } from "@/types/sales-order";
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
import { SalesOrderForm } from "./SalesOrderForm";
import { Badge } from "@/components/ui/badge";

interface SalesOrderDialogProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  order?: SalesOrder;
  onClose: () => void;
  onSave: (data: SalesOrderFormData) => void;
}

const getInitialFormData = (order?: SalesOrder): SalesOrderFormData => {
  if (order) {
    return {
      customer: order.customer,
      customer_name: order.customer_name,
      transaction_date: order.transaction_date,
      delivery_date: order.delivery_date,
      company: order.company,
      currency: order.currency || "KRW",
      conversion_rate: order.conversion_rate,
      items: order.items || [],
      taxes: order.taxes,
      apply_discount_on: order.apply_discount_on,
      additional_discount_percentage: order.additional_discount_percentage,
      discount_amount: order.discount_amount,
    };
  }
  return {
    customer: "",
    transaction_date: new Date().toISOString().split("T")[0],
    company: "",
    currency: "KRW",
    items: [],
  };
};

export function SalesOrderDialog({
  open,
  mode,
  order,
  onClose,
  onSave,
}: SalesOrderDialogProps) {
  const [formData, setFormData] = useState<SalesOrderFormData>(getInitialFormData(order));

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(order));
    }
  }, [open, order]);

  const handleSave = () => {
    // Basic validation
    if (!formData.customer) {
      alert("고객을 입력하세요.");
      return;
    }
    if (!formData.transaction_date) {
      alert("주문일자를 입력하세요.");
      return;
    }
    if (!formData.company) {
      alert("회사를 입력하세요.");
      return;
    }
    if (formData.items.length === 0) {
      alert("최소 1개의 품목을 추가하세요.");
      return;
    }
    for (const item of formData.items) {
      if (!item.item_code) {
        alert("모든 품목의 품목코드를 입력하세요.");
        return;
      }
      if (item.qty <= 0) {
        alert("품목 수량은 0보다 커야 합니다.");
        return;
      }
      if (!item.delivery_date || !item.delivery_date.trim()) {
        alert("모든 품목의 납품예정일을 입력하세요.");
        return;
      }
    }

    onSave(formData);
    setFormData(getInitialFormData());
  };

  const formatCurrency = (amount: number, currency: string = "KRW") => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const getStatusBadge = (status: string, docstatus: number) => {
    if (docstatus === 0) {
      return <Badge variant="secondary">Draft</Badge>;
    } else if (docstatus === 2) {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else {
      switch (status) {
        case "To Deliver and Bill":
          return <Badge variant="default">To Deliver and Bill</Badge>;
        case "To Deliver":
          return <Badge className="bg-blue-500">To Deliver</Badge>;
        case "To Bill":
          return <Badge className="bg-yellow-500">To Bill</Badge>;
        case "Completed":
          return <Badge className="bg-green-500">Completed</Badge>;
        case "Closed":
          return <Badge variant="outline">Closed</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden flex flex-col [&>button]:text-white [&>button]:hover:text-white [&>button]:w-10 [&>button]:h-10 [&>button]:p-2 [&>button]:z-50 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <DialogHeader className="mb-0 bg-gradient-to-r from-[#1a2747] via-[#2d3f6b] to-[#1a2747] px-6 py-4 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <DialogTitle className="text-xl font-bold text-white relative z-10 flex items-center gap-3">
            {mode === "create" && "새 판매주문"}
            {mode === "edit" && "판매주문 수정"}
            {mode === "view" && "판매주문 상세"}
            {order && (
              <Badge variant="outline" className="ml-2 bg-white/20 border-white/40 text-white text-xs">
                {order.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-1 relative z-10 text-sm">
            {mode === "create" && "새 판매주문을 작성합니다."}
            {mode === "edit" && "판매주문 정보를 수정합니다."}
            {mode === "view" && "판매주문 상세 정보를 확인합니다."}
            <span className="ml-2 text-red-400 font-semibold">* 필수 항목</span>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
        <Tabs defaultValue="details" className="w-full px-8 pt-6">
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">상세 정보</TabsTrigger>
            <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">요약</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <SalesOrderForm
              formData={formData}
              onFormDataChange={setFormData}
              disabled={mode === "view"}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-6 space-y-6">
            {mode === "view" && order ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">주문번호</p>
                    <p className="text-lg font-semibold">{order.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">상태</p>
                    <div className="mt-1">
                      {getStatusBadge(order.status, order.docstatus)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">고객</p>
                    <p className="text-lg">{order.customer_name || order.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">회사</p>
                    <p className="text-lg">{order.company}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">주문일자</p>
                    <p className="text-lg">{formatDate(order.transaction_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">납품예정일</p>
                    <p className="text-lg">
                      {order.delivery_date ? formatDate(order.delivery_date) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 수량</p>
                    <p className="text-lg font-semibold">{order.total_qty}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 금액</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(order.grand_total, order.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">출고율</p>
                    <div className="mt-1">
                      <Badge variant={order.per_delivered === 100 ? "default" : "secondary"}>
                        {order.per_delivered}%
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">청구율</p>
                    <div className="mt-1">
                      <Badge variant={order.per_billed === 100 ? "default" : "secondary"}>
                        {order.per_billed}%
                      </Badge>
                    </div>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
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
                          {order.items.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{item.item_code}</td>
                              <td className="p-2">{item.item_name || "-"}</td>
                              <td className="text-right p-2">{item.qty.toLocaleString()}</td>
                              <td className="p-2">{item.uom}</td>
                              <td className="text-right p-2">{formatCurrency(item.rate, order.currency)}</td>
                              <td className="text-right p-2">{formatCurrency(item.amount, order.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Summary during create/edit using current formData
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">고객</p>
                    <p className="text-lg font-semibold">{formData.customer_name || formData.customer || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">회사</p>
                    <p className="text-lg">{formData.company || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">주문일자</p>
                    <p className="text-lg">{formData.transaction_date || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">통화</p>
                    <p className="text-lg">{formData.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 수량</p>
                    <p className="text-lg font-semibold">{formData.items.reduce((sum, i) => sum + (i.qty || 0), 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">품목 수</p>
                    <p className="text-lg font-semibold">{formData.items.length}개</p>
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
                          </tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{item.item_code || '-'}</td>
                              <td className="p-2">{item.item_name || '-'}</td>
                              <td className="text-right p-2">{item.qty?.toLocaleString() || 0}</td>
                              <td className="p-2">{item.uom || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        </div>

        <DialogFooter className="flex justify-end gap-1 px-8 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => {
              setFormData(getInitialFormData(order));
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
