import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SalesOrderFormData, SalesOrderItem } from "@/types/sales-order";
import type { Customer } from "@/types/customer";
import type { Company } from "@/types/company";
import { customerAPI } from "@/services/customer";
import { companyAPI } from "@/services/company";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesOrderItemTable } from "./SalesOrderItemTable";

interface SalesOrderFormProps {
  formData: SalesOrderFormData;
  onFormDataChange: (data: SalesOrderFormData) => void;
  disabled?: boolean;
}

export function SalesOrderForm({
  formData,
  onFormDataChange,
  disabled = false,
}: SalesOrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCustomers(true);
        const [customersData, companiesData] = await Promise.all([
          customerAPI.list({
            filters: { disabled: 0 },
            limit_page_length: 1000,
          }),
          companyAPI.list({
            limit_page_length: 100,
          }),
        ]);
        setCustomers(customersData);
        setCompanies(companiesData);
        
        // 회사가 하나만 있으면 자동 설정
        if (companiesData.length === 1 && !formData.company) {
          onFormDataChange({ ...formData, company: companiesData[0].name });
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchData();
  }, []);
  const handleChange = (field: keyof SalesOrderFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleItemsChange = (items: SalesOrderItem[]) => {
    onFormDataChange({ ...formData, items });
  };

  // Calculate totals
  const total_qty = formData.items.reduce((sum, item) => sum + item.qty, 0);
  const total = formData.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Customer Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">고객 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">고객 <span className="text-red-500">*</span></Label>
            <Select
              value={formData.customer}
              onValueChange={(val) => {
                const selected = customers.find((c) => c.name === val);
                onFormDataChange({
                  ...formData,
                  customer: val,
                  customer_name: selected?.customer_name || selected?.name || "",
                });
              }}
              disabled={disabled || loadingCustomers}
            >
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
                <SelectValue placeholder={loadingCustomers ? "고객 불러오는 중..." : "고객 선택"} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {customers.length === 0 && !loadingCustomers ? (
                  <div className="px-2 py-1 text-sm text-gray-500">고객이 없습니다.</div>
                ) : (
                  customers.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.customer_name || c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_name">고객명</Label>
            <Input
              id="customer_name"
              value={formData.customer_name || ""}
              disabled
              placeholder="자동 입력"
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Date and Company Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">주문 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transaction_date">
              주문일자 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transaction_date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => handleChange("transaction_date", e.target.value)}
              disabled={disabled}
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_date">납품예정일</Label>
            <Input
              id="delivery_date"
              type="date"
              value={formData.delivery_date || ""}
              onChange={(e) => handleChange("delivery_date", e.target.value)}
              disabled={disabled}
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">
              회사 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.company}
              onValueChange={(value) => onFormDataChange({ ...formData, company: value })}
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
          <div className="space-y-2">
            <Label htmlFor="currency">통화</Label>
            <Input
              id="currency"
              value={formData.currency || "KRW"}
              onChange={(e) => handleChange("currency", e.target.value)}
              disabled={disabled}
              placeholder="KRW"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          품목 <span className="text-red-500">*</span>
        </h3>
        <SalesOrderItemTable
          items={formData.items}
          onItemsChange={handleItemsChange}
          disabled={disabled}
        />
      </div>

      {/* Totals Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">합계</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>총 수량</Label>
            <Input
              type="number"
              value={total_qty}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label>총 금액</Label>
            <Input
              type="number"
              value={total.toFixed(2)}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
