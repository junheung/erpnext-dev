import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerFormData } from "@/types/customer";
import { useState, useEffect } from "react";
import { customerAPI } from "@/services/customer";

interface CustomerFormProps {
  formData: CustomerFormData;
  onFormDataChange: (data: CustomerFormData) => void;
  disabled?: boolean;
}

export function CustomerForm({
  formData,
  onFormDataChange,
  disabled = false,
}: CustomerFormProps) {
  const [territories, setTerritories] = useState<string[]>(['All Territories']);
  const [customerGroups, setCustomerGroups] = useState<string[]>(['Commercial', 'Government', 'Individual', 'Non Profit']);

  useEffect(() => {
    // Fetch territories and customer groups from API
    const fetchData = async () => {
      try {
        const [territoriesData, customerGroupsData] = await Promise.all([
          customerAPI.getTerritories(),
          customerAPI.getCustomerGroups(),
        ]);
        setTerritories(territoriesData);
        setCustomerGroups(customerGroupsData);
      } catch (error) {
        console.error('Failed to fetch territories or customer groups:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof CustomerFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* 기본 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">기본 정보</h3>
        
        <div className="space-y-2">
          <Label htmlFor="customer_type">
            고객 유형 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.customer_type}
            onValueChange={(value: string) => handleChange("customer_type", value as 'Company' | 'Individual')}
            disabled={disabled}
          >
            <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
              <SelectValue placeholder="유형 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Company">Company</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">
              고객명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => handleChange("customer_name", e.target.value)}
              disabled={disabled}
              placeholder="고객명을 입력하세요"
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_group">
              고객 그룹 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.customer_group}
              onValueChange={(value) => handleChange("customer_group", value)}
              disabled={disabled}
            >
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
                <SelectValue placeholder="고객 그룹 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {customerGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="territory">
            지역 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.territory}
            onValueChange={(value) => handleChange("territory", value)}
            disabled={disabled}
          >
            <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {territories.map((territory) => (
                <SelectItem key={territory} value={territory}>
                  {territory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 연락처 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">연락처 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email_id">이메일</Label>
            <Input
              id="email_id"
              type="email"
              value={formData.email_id || ""}
              onChange={(e) => handleChange("email_id", e.target.value)}
              disabled={disabled}
              placeholder="email@example.com"
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile_no">휴대폰</Label>
            <Input
              id="mobile_no"
              value={formData.mobile_no || ""}
              onChange={(e) => handleChange("mobile_no", e.target.value)}
              disabled={disabled}
              placeholder="010-0000-0000"
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone_no">전화번호</Label>
            <Input
              id="phone_no"
              value={formData.phone_no || ""}
              onChange={(e) => handleChange("phone_no", e.target.value)}
              disabled={disabled}
              placeholder="02-0000-0000"
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">웹사이트</Label>
            <Input
              id="website"
              value={formData.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              disabled={disabled}
              placeholder="https://example.com"
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
        </div>
      </div>

      {/* 세금 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">세금 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_id">사업자등록번호</Label>
            <Input
              id="tax_id"
              value={formData.tax_id || ""}
              onChange={(e) => handleChange("tax_id", e.target.value)}
              disabled={disabled}
              placeholder="000-00-00000"
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_currency">기본 통화</Label>
            <Select
              value={formData.default_currency || "KRW"}
              onValueChange={(value) => handleChange("default_currency", value)}
              disabled={disabled}
            >
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
                <SelectValue placeholder="통화 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="KRW">KRW</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 기타 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">기타</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_details">고객 상세 정보</Label>
            <Input
              id="customer_details"
              value={formData.customer_details || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("customer_details", e.target.value)}
              disabled={disabled}
              placeholder="고객에 대한 추가 정보를 입력하세요"
              className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled">상태</Label>
            <Select
              value={formData.disabled !== undefined ? String(formData.disabled) : "0"}
              onValueChange={(value) => handleChange("disabled", parseInt(value))}
              disabled={disabled}
            >
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#1a2747] focus:ring-2 focus:ring-[#1a2747]/20">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="0">활성</SelectItem>
                <SelectItem value="1">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
