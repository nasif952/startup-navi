
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

interface Column {
  key: string;
  header: ReactNode;
  className?: string;
  render?: (value: any, item: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  emptyState?: ReactNode;
}

export function DataTable({ columns, data, className, emptyState }: DataTableProps) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead
                key={i}
                className={cn(column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn(column.className)}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center h-24"
              >
                {emptyState || "No data available"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
