
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            {columns.map((column, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-3 text-left text-sm font-medium text-foreground",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border hover:bg-muted/30 transition-colors duration-200"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn("px-4 py-3 text-sm", column.className)}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-muted-foreground"
              >
                {emptyState || "No data available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
