import { useState, useEffect } from "react";
import type { Item } from "@/types/item";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { itemAPI } from "@/services/item";

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onSave: (item: Partial<Item>) => Promise<void>;
}

export function ItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: ItemDialogProps) {
  const [formData, setFormData] = useState<Partial<Item>>({
    item_code: item?.item_code || "",
    item_name: item?.item_name || "",
    item_group: item?.item_group || "",
    stock_uom: item?.stock_uom || "",
    standard_rate: item?.standard_rate || 0,
    disabled: item?.disabled || 0,
    description: item?.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [itemGroups, setItemGroups] = useState<string[]>([]);
  const [uoms, setUoms] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Update form data when item prop changes
  useEffect(() => {
    if (item) {
      setFormData({
        item_code: item.item_code || "",
        item_name: item.item_name || "",
        item_group: item.item_group || "",
        stock_uom: item.stock_uom || "",
        standard_rate: item.standard_rate || 0,
        disabled: item.disabled || 0,
        description: item.description || "",
      });
    } else {
      setFormData({
        item_code: "",
        item_name: "",
        item_group: "",
        stock_uom: "",
        standard_rate: 0,
        disabled: 0,
        description: "",
      });
    }
  }, [item]);

  // Load Item Groups and UOMs
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [groups, uomList] = await Promise.all([
          itemAPI.getItemGroups(),
          itemAPI.getUOMs(),
        ]);
        setItemGroups(groups);
        setUoms(uomList);
      } catch (error) {
        console.error("Failed to load options:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    if (open) {
      loadOptions();
    } else {
      // Reset form when dialog closes
      if (!item) {
        setFormData({
          item_code: "",
          item_name: "",
          item_group: "",
          stock_uom: "",
          standard_rate: 0,
          disabled: 0,
          description: "",
        });
      }
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.item_code?.trim()) {
      throw new Error("물품코드를 입력하세요.");
    }
    if (!formData.item_name?.trim()) {
      throw new Error("물품명을 입력하세요.");
    }
    if (!formData.item_group?.trim()) {
      throw new Error("물품 그룹을 선택하세요.");
    }
    if (!formData.stock_uom?.trim()) {
      throw new Error("단위를 선택하세요.");
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save item:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Item, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white [&>button]:w-10 [&>button]:h-10 [&>button]:p-2 [&>button]:z-50 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-0 bg-gradient-to-r from-[#1a2747] via-[#2d3f6b] to-[#1a2747] px-6 py-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <DialogTitle className="text-xl font-bold text-white relative z-10">
              {item ? "물품 수정" : "물품 신규 등록"}
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1 relative z-10 text-sm">
              물품 정보를 입력하세요. <span className="ml-2 text-red-400 font-semibold">* 필수 항목</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 p-8 bg-white">`
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="item_code" className="text-sm font-semibold text-gray-700">
                  물품코드 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="item_code"
                  value={formData.item_code}
                  onChange={(e) => handleChange("item_code", e.target.value)}
                  className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 rounded-xl bg-white shadow-sm transition-all"
                  required
                  disabled={!!item}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_name" className="text-sm font-semibold text-gray-700">
                  물품명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => handleChange("item_name", e.target.value)}
                  className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 rounded-xl bg-white shadow-sm transition-all"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="item_group" className="text-sm font-semibold text-gray-700">
                  물품 그룹 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.item_group || ""}
                  onValueChange={(value) => handleChange("item_group", value)}
                  disabled={loadingOptions}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 rounded-xl bg-white shadow-sm h-11">
                    <SelectValue placeholder={loadingOptions ? "로딩 중..." : "물품 그룹 선택"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-2 max-h-[300px]">
                    {itemGroups.map((group) => (
                      <SelectItem key={group} value={group} className="rounded-lg">
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_uom" className="text-sm font-semibold text-gray-700">
                  단위 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.stock_uom || ""}
                  onValueChange={(value) => handleChange("stock_uom", value)}
                  disabled={loadingOptions}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 rounded-xl bg-white shadow-sm h-11">
                    <SelectValue placeholder={loadingOptions ? "로딩 중..." : "단위 선택"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-2 max-h-[300px]">
                    {uoms.map((uom) => (
                      <SelectItem key={uom} value={uom} className="rounded-lg">
                        {uom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="standard_rate" className="text-sm font-semibold text-gray-700">
                  표준가격
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₩</span>
                  <Input
                    id="standard_rate"
                    type="number"
                    value={formData.standard_rate}
                    onChange={(e) =>
                      handleChange("standard_rate", parseFloat(e.target.value) || 0)
                    }
                    className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 rounded-xl bg-white shadow-sm transition-all text-right pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled" className="text-sm font-semibold text-gray-700">
                  상태
                </Label>
                <Select
                  value={formData.disabled?.toString()}
                  onValueChange={(value) =>
                    handleChange("disabled", parseInt(value))
                  }
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 rounded-xl bg-white shadow-sm h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-2">
                    <SelectItem value="0" className="rounded-lg">활성</SelectItem>
                    <SelectItem value="1" className="rounded-lg">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                설명
              </Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20 rounded-xl bg-white shadow-sm transition-all"
                placeholder="물품에 대한 간단한 설명을 입력하세요"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-1 px-8 py-4 bg-gray-50 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="ml-auto px-6 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#1a2747] to-[#2d3f6b] text-white hover:from-[#223060] hover:to-[#3a4f7f] shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              {loading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
