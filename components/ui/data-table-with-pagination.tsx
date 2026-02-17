"use client";

import { flexRender, Table as TableType } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

interface DataTableProps<TData> {
  table: TableType<TData>;
  isLoading?: boolean;
}

export function DataTableWithPagination<TData>({
  table,
  isLoading,
}: DataTableProps<TData>) {

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full rounded-xl shadow-md print:shadow-none print:rounded-sm print:border-black h-full border">
        <Table>
          <TableHeader className="heading-h5 ">
            {table?.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={table._getColumnDefs().length}
                  className="h-24 text-center pl-[50%]"
                >
                  <Loader2 className=" h-6 w-6 text-primary left-1/2 animate-spin" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel()?.rows?.length > 0 ? (
              table.getRowModel()?.rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table._getColumnDefs().length}
                  className="h-24 text-center print:h-0"
                >
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end px-2 pb-4  ">
        <div className=" flex items-center  gap-4 ">
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Page {table?.getState().pagination.pageIndex + 1} of{" "}
            {table?.getPageCount()}
          </div>
          <div className="flex items-center space-x-8 z-0">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 "
              onClick={() => table?.previousPage()}
              disabled={!table?.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table?.nextPage()}
              disabled={!table?.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
