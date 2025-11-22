import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchaseOrderFilterProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
}

export function PurchaseOrderFilter({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onSearch,
}: PurchaseOrderFilterProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="공급자명, 주문번호로 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="Draft">Draft</SelectItem>
          <SelectItem value="To Receive and Bill">To Receive and Bill</SelectItem>
          <SelectItem value="To Receive">To Receive</SelectItem>
          <SelectItem value="To Bill">To Bill</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
