import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import type { Supplier } from "@/types/supplier";
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

interface SupplierTableProps {
  suppliers: Supplier[];
  loading?: boolean;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({
  suppliers,
  loading,
  onView,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const getTypeBadge = (type: string) => {
    if (type === 'Company') {
      return <Badge className="bg-blue-500 text-white">Company</Badge>;
    } else if (type === 'Individual') {
      return <Badge className="bg-green-500 text-white">Individual</Badge>;
    } else {
      return <Badge className="bg-purple-500 text-white">Partnership</Badge>;
    }
  };

  const getStatusBadge = (disabled: number) => {
    if (disabled === 0) {
      return <Badge className="bg-green-500 text-white">활성</Badge>;
    } else {
      return <Badge className="bg-gray-500 text-white">비활성</Badge>;
    }
  };

  if (loading) {
    // 깜빡임 효과 + 로딩중 메시지
    return (
      <div className="rounded-md border bg-white animate-pulse">
        <div className="text-center py-4 text-gray-500 font-semibold">로딩중...</div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead>공급자 ID</TableHead>
              <TableHead>공급자명</TableHead>
              <TableHead>공급자 그룹</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>국가</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="w-[80px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                {Array(9).fill(0).map((_, j) => (
                  <TableCell key={j} className="h-8 bg-gray-100" />
                ))}
              </TableRow>
            ))}
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
            <TableHead>공급자 ID</TableHead>
            <TableHead>공급자명</TableHead>
            <TableHead>공급자 그룹</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>국가</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead className="w-[80px]">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.name}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.supplier_name}</TableCell>
              <TableCell>{supplier.supplier_group}</TableCell>
              <TableCell>{getTypeBadge(supplier.supplier_type)}</TableCell>
              <TableCell>{supplier.country}</TableCell>
              <TableCell>{supplier.email_id || '-'}</TableCell>
              <TableCell>{supplier.mobile_no || '-'}</TableCell>
              <TableCell className="text-center">{getStatusBadge(supplier.disabled)}</TableCell>
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
                    <DropdownMenuItem onClick={() => onView(supplier)}>
                      <Eye className="mr-2 h-4 w-4" />
                      상세보기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(supplier)}>
                      <Edit className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(supplier)}
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
