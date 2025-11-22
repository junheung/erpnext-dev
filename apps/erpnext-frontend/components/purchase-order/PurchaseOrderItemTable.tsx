import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { PurchaseOrderItem } from "@/types/purchase-order";
import type { Item } from "@/types/item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { itemAPI } from "@/services/item";

interface PurchaseOrderItemTableProps {
  items: PurchaseOrderItem[];
  onItemsChange: (items: PurchaseOrderItem[]) => void;
  disabled?: boolean;
}

export function PurchaseOrderItemTable({
  items,
  onItemsChange,
  disabled = false,
}: PurchaseOrderItemTableProps) {
  const [itemList, setItemList] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await itemAPI.list({
          limit_page_length: 1000,
        });
        setItemList(response);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };
    fetchItems();
  }, []);

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate amount when qty or rate changes
    if (field === "qty" || field === "rate") {
      const qty = field === "qty" ? Number(value) : newItems[index].qty;
      const rate = field === "rate" ? Number(value) : newItems[index].rate;
      newItems[index].amount = qty * rate;
    }

    onItemsChange(newItems);
  };

  const handleItemSelect = async (index: number, itemCode: string) => {
    const selectedItem = itemList.find((item) => item.item_code === itemCode);
    if (!selectedItem) {
      console.warn('[PurchaseOrderItemTable] 선택된 코드에 해당하는 품목을 찾지 못했습니다.', itemCode);
      return;
    }
    let fullItem = selectedItem;
    try {
      // name과 item_code가 다를 가능성 대비하여 name 기준으로 단건 조회 시도
      if (selectedItem.name) {
        const fetched = await itemAPI.get(selectedItem.name);
        if (fetched) {
          fullItem = fetched;
        }
      }
    } catch (e) {
      console.warn('[PurchaseOrderItemTable] 단건 조회 실패, 리스트 데이터로 계속 진행합니다.', e);
    }
    const newItems = [...items];
    const qty = newItems[index].qty || 1;
    const rate = fullItem.standard_rate || selectedItem.standard_rate || 0;
    newItems[index] = {
      ...newItems[index],
      item_code: fullItem.item_code || selectedItem.item_code,
      item_name: fullItem.item_name || selectedItem.item_name,
      uom: fullItem.stock_uom || selectedItem.stock_uom || 'Nos',
      rate,
      amount: qty * rate,
    };
    onItemsChange(newItems);
    console.log('[PurchaseOrderItemTable] 품목 선택 완료', { index, itemCode, applied: newItems[index] });
  };

  const handleAddItem = () => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: PurchaseOrderItem = {
      item_code: "",
      item_name: "",
      qty: 1,
      uom: "Nos",
      rate: 0,
      amount: 0,
      schedule_date: today,
    };
    onItemsChange([...items, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  return (
    <div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="w-[150px]">품목코드</TableHead>
              <TableHead className="w-[150px]">품목명</TableHead>
              <TableHead className="w-[90px]">수량</TableHead>
              <TableHead className="w-[80px]">단위</TableHead>
              <TableHead className="w-[110px]">단가</TableHead>
              <TableHead className="w-[110px]">금액</TableHead>
              <TableHead className="w-[140px]">입고예정일 <span className="text-red-500">*</span></TableHead>
              <TableHead className="w-[70px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  품목을 추가하세요.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="py-2 px-2">
                    <Select
                      value={item.item_code}
                      onValueChange={(value) => handleItemSelect(index, value)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 text-left">
                        <SelectValue placeholder="품목 선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {itemList.length === 0 ? (
                          <div className="px-2 py-1 text-sm text-gray-500">품목이 없습니다.</div>
                        ) : (
                          itemList.map((itemOption) => (
                            <SelectItem key={itemOption.name} value={itemOption.item_code}>
                              {itemOption.item_code} - {itemOption.item_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Input
                      value={item.item_name || ""}
                      disabled
                      placeholder="품목명"
                      className="bg-gray-100"
                    />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", Number(e.target.value))
                      }
                      disabled={disabled}
                      min="0"
                      step="1"
                      className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 text-right"
                    />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Input
                      value={item.uom}
                      disabled
                      placeholder="단위"
                      className="bg-gray-100"
                    />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", Number(e.target.value))
                      }
                      disabled={disabled}
                      min="0"
                      step="0.01"
                      className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 text-right"
                    />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Input
                      type="number"
                      value={item.amount}
                      disabled
                      className="bg-gray-100 text-right"
                    />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Input
                      type="date"
                      value={item.schedule_date || ""}
                      onChange={(e) =>
                        handleItemChange(index, "schedule_date", e.target.value)
                      }
                      disabled={disabled}
                      required
                      className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
                    />
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        onClick={handleAddItem}
        disabled={disabled}
        className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1a2747] to-[#2d3f6b] text-white hover:from-[#223060] hover:to-[#3a4f7f] shadow hover:shadow-md transition-all font-semibold"
      >
        + 품목 추가
      </Button>
    </div>
  );
}
