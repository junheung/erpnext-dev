import { useState, useEffect } from "react";
import { PurchaseOrderItemTable } from "./PurchaseOrderItemTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PurchaseOrderFormData, PurchaseOrderItem } from "@/types/purchase-order";
import type { Supplier } from "@/types/supplier";
import type { Company } from "@/types/company";
import { supplierAPI } from "@/services/supplier";
import { companyAPI } from "@/services/company";

interface PurchaseOrderFormProps {
  formData: PurchaseOrderFormData;
  onFormChange: (data: PurchaseOrderFormData) => void;
  disabled?: boolean;
}

export function PurchaseOrderForm({
  formData,
  onFormChange,
  disabled = false,
}: PurchaseOrderFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, companiesData] = await Promise.all([
          supplierAPI.list({
            filters: { disabled: 0 },
            limit_page_length: 1000,
          }),
          companyAPI.list({
            limit_page_length: 100,
          }),
        ]);
        setSuppliers(suppliersData);
        setCompanies(companiesData);
        
        // 회사가 하나만 있으면 자동 설정
        if (companiesData.length === 1 && !formData.company) {
          onFormChange({ ...formData, company: companiesData[0].name });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onFormChange({ ...formData, [name]: value });
  };

  const handleSupplierChange = (value: string) => {
    const selectedSupplier = suppliers.find((s) => s.name === value);
    onFormChange({
      ...formData,
      supplier: value,
      supplier_name: selectedSupplier?.supplier_name || "",
    });
  };

  const handleItemsChange = (items: PurchaseOrderItem[]) => {
    // Recalculate totals
    const total_qty = items.reduce((sum, item) => sum + item.qty, 0);
    const grand_total = items.reduce((sum, item) => sum + item.amount, 0);

    onFormChange({
      ...formData,
      items,
      total_qty,
      grand_total,
    });
  };

  return (
    <div className="space-y-6">
      {/* Supplier Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">
            공급업체 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.supplier}
            onValueChange={handleSupplierChange}
            disabled={disabled}
          >
            <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
              <SelectValue placeholder="공급업체 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.name} value={supplier.name}>
                  {supplier.supplier_name} ({supplier.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier_name">공급업체명</Label>
          <Input
            id="supplier_name"
            name="supplier_name"
            value={formData.supplier_name || ""}
            disabled
            placeholder="공급업체명"
            className="bg-gray-100"
          />
        </div>
      </div>

      {/* Dates and Company */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transaction_date">
            주문일자 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="transaction_date"
            name="transaction_date"
            type="date"
            value={formData.transaction_date}
            onChange={handleInputChange}
            disabled={disabled}
            required
            className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule_date">입고예정일</Label>
          <Input
            id="schedule_date"
            name="schedule_date"
            type="date"
            value={formData.schedule_date || ""}
            onChange={handleInputChange}
            disabled={disabled}
            className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">
            회사 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.company}
            onValueChange={(value) => onFormChange({ ...formData, company: value })}
            disabled={disabled}
          >
            <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
              <SelectValue placeholder="회사 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {companies.map((company) => (
                <SelectItem key={company.name} value={company.name}>
                  {company.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-2">
        <Label>
          품목 <span className="text-red-500">*</span>
        </Label>
        <PurchaseOrderItemTable
          items={formData.items}
          onItemsChange={handleItemsChange}
          disabled={disabled}
        />
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total_qty">총 수량</Label>
          <Input
            id="total_qty"
            name="total_qty"
            type="number"
            value={formData.total_qty}
            disabled
            className="bg-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grand_total">총 금액</Label>
          <Input
            id="grand_total"
            name="grand_total"
            type="number"
            value={formData.grand_total}
            disabled
            className="bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}
