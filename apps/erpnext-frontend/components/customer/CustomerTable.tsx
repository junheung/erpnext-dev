import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import type { Customer } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  onView,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  const getTypeBadge = (type: string) => {
    if (type === 'Company') {
      return <Badge className="bg-blue-500 text-white">Company</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">Individual</Badge>;
    }
  };

  const getStatusBadge = (disabled: number) => {
    if (disabled === 0) {
      return <Badge className="bg-green-500 text-white">활성</Badge>;
    } else {
      return <Badge className="bg-gray-500 text-white">비활성</Badge>;
    }
  };

  if (customers.length === 0) {
    return (
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead>고객 ID</TableHead>
              <TableHead>고객명</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>고객 그룹</TableHead>
              <TableHead>지역</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="w-[80px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-200">
            <TableHead>고객 ID</TableHead>
            <TableHead>고객명</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>고객 그룹</TableHead>
            <TableHead>지역</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead className="w-[80px]">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.name}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.customer_name}</TableCell>
              <TableCell>{getTypeBadge(customer.customer_type)}</TableCell>
              <TableCell>{customer.customer_group}</TableCell>
              <TableCell>{customer.territory}</TableCell>
              <TableCell>{customer.email_id || '-'}</TableCell>
              <TableCell>{customer.mobile_no || '-'}</TableCell>
              <TableCell>{getStatusBadge(customer.disabled)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">메뉴 열기</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuLabel>작업</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(customer)}>
                      <Eye className="mr-2 h-4 w-4" />
                      상세보기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(customer)}>
                      <Edit className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(customer)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
