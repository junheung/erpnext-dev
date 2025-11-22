import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import type { Item } from "@/types/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


interface ItemTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}
export function ItemTable({ items, onEdit, onDelete }: ItemTableProps) {
  const columnHelper = createColumnHelper<Item>();
  const columns = [
    columnHelper.accessor("item_code", {
      header: "물품코드",
      cell: (info) => <div className="font-medium">{info.getValue()}</div>,
    }),
    columnHelper.accessor("item_name", {
      header: "물품명",
      cell: (info) => <div>{info.getValue()}</div>,
    }),
    columnHelper.accessor("item_group", {
      header: "물품 그룹",
      cell: (info) => <div>{info.getValue() || "-"}</div>,
    }),
    columnHelper.accessor("stock_uom", {
      header: "단위",
      cell: (info) => <div>{info.getValue() || "-"}</div>,
    }),
    columnHelper.accessor("standard_rate", {
      header: "표준가격",
      cell: (info) => {
        const rate = info.getValue() as number;
        return <div className="text-right">{rate ? rate.toLocaleString() : "-"}</div>;
      },
    }),
    columnHelper.accessor("disabled", {
      header: () => <div className="text-center">상태</div>,
      cell: (info) => {
        const disabled = info.getValue() as number;
        return (
          <div className="flex justify-center">
            {disabled === 0 ? (
              <Badge className="bg-green-500 text-white">활성</Badge>
            ) : (
              <Badge className="bg-gray-500 text-white">비활성</Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-center">작업</div>,
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-200">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
