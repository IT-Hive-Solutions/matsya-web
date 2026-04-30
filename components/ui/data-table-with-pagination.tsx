"use client";

import { flexRender, Row, Table as TableType } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onRowClick?: (row: TData) => void;
    selectedRowId?: number | string | null;
    getRowId?: (row: TData) => number | string;
  }
}

interface DataTableProps<TData> {
  table: TableType<TData>;
  isLoading?: boolean;
  fullWidth?: boolean;
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
}

export function DataTableWithPagination<TData>({
  table,
  isLoading,
  fullWidth = true,
  renderSubComponent,
}: DataTableProps<TData>) {
  const { onRowClick, selectedRowId, getRowId } = table.options.meta ?? {};
  const colCount = table._getColumnDefs().length;

  return (
    <div className={`${fullWidth ? "w-full" : "w-max"} h-full flex flex-col gap-4`}>
      <div
        className={`${fullWidth ? "w-full" : "w-max"} rounded-xl  print:shadow-none print:rounded-sm print:border-black h-full border `}
      >
        <Table>
          <TableHeader className="heading-h5 bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colCount} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 text-primary mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const isSelected =
                  getRowId && selectedRowId !== undefined
                    ? getRowId(row.original) === selectedRowId
                    : false;

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => onRowClick?.(row.original)}
                      className={[
                        onRowClick ? "cursor-pointer" : "",
                        isSelected ? "bg-slate-50 border-l-2 border-l-slate-900" : "",
                        row.getIsExpanded() ? "bg-slate-50 border-b-0" : "hover:bg-slate-50/60",
                        "transition-colors",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Expanded sub-component row */}
                    {row.getIsExpanded() && renderSubComponent && (
                      <TableRow key={`${row.id}-expanded`} className="hover:bg-transparent">
                        <TableCell
                          colSpan={colCount}
                          className="p-0 border-b border-slate-200"
                        >
                          {renderSubComponent(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={colCount} className="h-24 text-center print:h-0">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}