"use client"
import {
    ColumnDef,
    getPaginationRowModel,
    getCoreRowModel,
    useReactTable,
    PaginationState,
    ExpandedState,
    getExpandedRowModel,
} from "@tanstack/react-table";
import React, { useState } from "react";

interface TableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    total?: number;
    pagination?: PaginationState
    setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>
    setRowSelection?: any
    selectedRow?: any

}

export function useCustomReactTable<TData, TValue>({ data, columns }: TableProps<TData, TValue>) {
    const table = useReactTable<TData>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    return table
}

export function useCustomReactPaginatedTable<TData, TValue>({ data, columns, total, setRowSelection, selectedRow = {}, pagination = { pageIndex: 1, pageSize: 10 }, setPagination }: TableProps<TData, TValue>) {

    const table = useReactTable<TData>({
        data,
        columns,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        rowCount: total,
        state: { pagination, rowSelection: selectedRow },
        onPaginationChange: setPagination,
        manualPagination: true,

    });
    return table

}

interface NestedTableProps<TData, TValue> {
    data: TData[];
    columns: any[];
    total: number;
    setRowSelection?: (selection: any) => void;
    selectedRow?: any;
    pagination?: { pageIndex: number; pageSize: number };
    setPagination?: (pagination: any) => void;
    getSubRows?: (row: TData) => TData[] | undefined;
    expanded?: ExpandedState;
    setExpanded?: (expanded: ExpandedState) => void;
}

export function useCustomReactPaginatedNestedTable<TData, TValue>({
    data,
    columns,
    total,
    setRowSelection,
    selectedRow = {},
    pagination = { pageIndex: 1, pageSize: 10 },
    setPagination,
    getSubRows,
    expanded,
    setExpanded,
}: NestedTableProps<TData, TValue>) {
    // Internal expanded state if not provided
    const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});

    const expandedState = expanded !== undefined ? expanded : internalExpanded;
    const onExpandedChange = setExpanded || setInternalExpanded;

    const table = useReactTable<TData>({
        data,
        columns,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        rowCount: total,
        state: {
            pagination,
            rowSelection: selectedRow,
            expanded: expandedState,
        },
        onPaginationChange: setPagination,
        onExpandedChange: onExpandedChange as any,
        manualPagination: true,
        getSubRows: getSubRows,
        enableExpanding: true,
    });

    return table;
}