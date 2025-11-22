import { MoreHorizontal, Eye, Edit, FileText, XCircle, Trash2 } from "lucide-react";
import type { SalesOrder } from "@/types/sales-order";
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

interface SalesOrderTableProps {
  orders: SalesOrder[];
  loading?: boolean;
  onView: (order: SalesOrder) => void;
  onEdit: (order: SalesOrder) => void;
  onSubmit: (order: SalesOrder) => void;
  onCancel: (order: SalesOrder) => void;
  onDelete: (order: SalesOrder) => void;
}

export function SalesOrderTable({
  orders,
  onView,
  onEdit,
  onSubmit,
  onCancel,
  onDelete,
}: SalesOrderTableProps) {
  const getStatusBadge = (status: string, docstatus: number) => {
    if (docstatus === 0) {
      return <Badge className="bg-gray-500 text-white">Draft</Badge>;
    } else if (docstatus === 2) {
      return <Badge className="bg-red-600 text-white">Cancelled</Badge>;
    } else {
      switch (status) {
        case "To Deliver and Bill":
          return <Badge className="bg-orange-500 text-white">To Deliver and Bill</Badge>;
        case "To Deliver":
          return <Badge className="bg-blue-500 text-white">To Deliver</Badge>;
        case "To Bill":
          return <Badge className="bg-yellow-500 text-white">To Bill</Badge>;
        case "Completed":
          return <Badge className="bg-green-500 text-white">Completed</Badge>;
        case "Closed":
          return <Badge className="bg-gray-400 text-white">Closed</Badge>;
        default:
          return <Badge className="bg-gray-600 text-white">{status}</Badge>;
      }
    }
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

  if (orders.length === 0) {
    return (
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead>주문번호</TableHead>
              <TableHead>고객명</TableHead>
              <TableHead>주문일자</TableHead>
              <TableHead>납품예정일</TableHead>
              <TableHead className="text-right">총 수량</TableHead>
              <TableHead className="text-right">총 금액</TableHead>
              <TableHead className="text-center">출고율</TableHead>
              <TableHead className="text-center">청구율</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="w-[80px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
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
            <TableHead>주문번호</TableHead>
            <TableHead>고객명</TableHead>
            <TableHead>주문일자</TableHead>
            <TableHead>납품예정일</TableHead>
            <TableHead className="text-right">총 수량</TableHead>
            <TableHead className="text-right">총 금액</TableHead>
            <TableHead className="text-center">출고율</TableHead>
            <TableHead className="text-center">청구율</TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead className="w-[80px]">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.name}>
              <TableCell className="font-medium">{order.name}</TableCell>
              <TableCell>{order.customer_name || order.customer}</TableCell>
              <TableCell>{formatDate(order.transaction_date)}</TableCell>
              <TableCell>{order.delivery_date ? formatDate(order.delivery_date) : '-'}</TableCell>
              <TableCell className="text-right">{order.total_qty}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.grand_total, order.currency)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={order.per_delivered === 100 ? "default" : "secondary"}>
                  {order.per_delivered}%
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={order.per_billed === 100 ? "default" : "secondary"}>
                  {order.per_billed}%
                </Badge>
              </TableCell>
              <TableCell className="text-center">{getStatusBadge(order.status, order.docstatus)}</TableCell>
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
                    <DropdownMenuItem onClick={() => onView(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      상세보기
                    </DropdownMenuItem>
                    {order.docstatus === 0 && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSubmit(order)}>
                          <FileText className="mr-2 h-4 w-4" />
                          제출
                        </DropdownMenuItem>
                      </>
                    )}
                    {order.docstatus === 1 && (
                      <DropdownMenuItem onClick={() => onCancel(order)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        취소
                      </DropdownMenuItem>
                    )}
                    {order.docstatus === 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(order)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </>
                    )}
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
