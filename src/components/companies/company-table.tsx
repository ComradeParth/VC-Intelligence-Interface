"use client";

import { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ExternalLink,
    Sparkles,
    MapPin,
} from "lucide-react";
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
import type { Company } from "@/types";
import { useStore } from "@/store/useStore";

const stageColorMap: Record<string, string> = {
    "Pre-Seed": "bg-violet-500/15 text-violet-400 border-violet-500/20",
    Seed: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    "Series A": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "Series B": "bg-amber-500/15 text-amber-400 border-amber-500/20",
    "Series C": "bg-rose-500/15 text-rose-400 border-rose-500/20",
    Growth: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20",
};

const columns: ColumnDef<Company>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Company
                <ArrowUpDown className="ml-1.5 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => {
            const { name, location, url, enrichmentData } = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary">
                        {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-foreground">
                                {name}
                            </span>
                            {enrichmentData && (
                                <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {location && (
                                <>
                                    <MapPin className="h-2.5 w-2.5" />
                                    <span className="truncate">{location}</span>
                                    <span className="mx-1">·</span>
                                </>
                            )}
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-primary/70 hover:text-primary"
                            >
                                <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "industry",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Industry
                <ArrowUpDown className="ml-1.5 h-3 w-3" />
            </Button>
        ),
        cell: ({ getValue }) => (
            <span className="text-sm text-muted-foreground">
                {getValue() as string}
            </span>
        ),
        filterFn: "equals",
    },
    {
        accessorKey: "stage",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Stage
                <ArrowUpDown className="ml-1.5 h-3 w-3" />
            </Button>
        ),
        cell: ({ getValue }) => {
            const stage = getValue() as string;
            return (
                <Badge
                    variant="outline"
                    className={`text-[11px] font-medium ${stageColorMap[stage] ?? ""}`}
                >
                    {stage}
                </Badge>
            );
        },
        filterFn: "equals",
    },
    {
        accessorKey: "description",
        header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
            </span>
        ),
        cell: ({ getValue }) => (
            <p className="line-clamp-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                {getValue() as string}
            </p>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "tags",
        header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
            </span>
        ),
        cell: ({ getValue }) => {
            const tags = getValue() as string[];
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] font-normal"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            );
        },
        enableSorting: false,
    },
];

interface CompanyTableProps {
    industryFilter: string;
    stageFilter: string;
}

const CompanyTable = ({ industryFilter, stageFilter }: CompanyTableProps) => {
    const { companies, globalSearch, setSelectedCompanyId } = useStore();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    /* Apply global search + external filters */
    const filteredData = useMemo(() => {
        let data = companies;

        if (globalSearch) {
            const q = globalSearch.toLowerCase();
            data = data.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q) ||
                    c.industry.toLowerCase().includes(q) ||
                    c.tags.some((t) => t.toLowerCase().includes(q))
            );
        }

        if (industryFilter && industryFilter !== "all") {
            data = data.filter((c) => c.industry === industryFilter);
        }

        if (stageFilter && stageFilter !== "all") {
            data = data.filter((c) => c.stage === stageFilter);
        }

        return data;
    }, [companies, globalSearch, industryFilter, stageFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, columnFilters },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="rounded-lg border border-border bg-card">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="border-border hover:bg-transparent"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="h-10 px-4">
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
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                onClick={() => setSelectedCompanyId(row.original.id)}
                                className="cursor-pointer border-border transition-colors hover:bg-accent/50"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-4 py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-32 text-center text-sm text-muted-foreground"
                            >
                                No companies match your filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Row count */}
            <div className="border-t border-border px-4 py-2">
                <p className="text-xs text-muted-foreground">
                    {filteredData.length} of {companies.length} companies
                </p>
            </div>
        </div>
    );
};

export default CompanyTable;
