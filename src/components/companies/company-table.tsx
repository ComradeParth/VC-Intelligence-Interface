"use client";

import { useState, useMemo, useEffect } from "react";
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
    MoreHorizontal,
    Pencil,
    Trash2,
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
import { Checkbox } from "@/components/ui/checkbox";
import type { Company } from "@/types";
import { useStore } from "@/store/useStore";
import EditCompanyDialog from "./edit-company-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const stageColorMap: Record<string, string> = {
    "Pre-Seed": "bg-violet-500/15 text-violet-400 border-violet-500/20",
    Seed: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    "Series A": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "Series B": "bg-amber-500/15 text-amber-400 border-amber-500/20",
    "Series C": "bg-rose-500/15 text-rose-400 border-rose-500/20",
    Growth: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20",
};

const HighlightMatch = ({ text, match }: { text: string; match: string }) => {
    if (!match.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${match})`, "gi"));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === match.toLowerCase() ? (
                    <mark key={i} className="bg-amber-400/30 text-inherit rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const columns: ColumnDef<Company>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center px-1">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px] border-muted-foreground/50 transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center px-1" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px] border-muted-foreground/30 transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        cell: ({ row, table }) => {
            const { name, location, url, enrichmentData } = row.original;
            const meta = table.options.meta as { globalSearch?: string };
            const q = meta?.globalSearch ?? "";
            return (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary">
                        {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-foreground">
                                <HighlightMatch text={name} match={q} />
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
        cell: ({ getValue, table }) => {
            const meta = table.options.meta as { globalSearch?: string };
            const q = meta?.globalSearch ?? "";
            return (
                <span className="text-sm text-muted-foreground">
                    <HighlightMatch text={getValue() as string} match={q} />
                </span>
            );
        },
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
        cell: ({ getValue, table }) => {
            const meta = table.options.meta as { globalSearch?: string };
            const q = meta?.globalSearch ?? "";
            return (
                <p className="line-clamp-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    <HighlightMatch text={getValue() as string} match={q} />
                </p>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "tags",
        header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
            </span>
        ),
        cell: ({ getValue, table }) => {
            const tags = getValue() as string[];
            const meta = table.options.meta as { globalSearch?: string };
            const q = meta?.globalSearch ?? "";
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] font-normal"
                        >
                            <HighlightMatch text={tag} match={q} />
                        </Badge>
                    ))}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell company={row.original} />,
    },
];

const ActionsCell = ({ company }: { company: Company }) => {
    const { deleteCompany } = useStore();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const handleDelete = () => {
        deleteCompany(company.id);
        toast.success(`${company.name} deleted`);
        setShowDeleteAlert(false);
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2" onClick={() => setShowEditDialog(true)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-rose-500 focus:text-rose-500" onClick={() => setShowDeleteAlert(true)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete Company
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditCompanyDialog
                company={company}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />

            <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete <strong>{company.name}</strong> and remove it from all your lists.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteAlert(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

interface CompanyTableProps {
    industryFilter: string;
    stageFilter: string;
    enrichmentFilter: string;
}

const CompanyTable = ({ industryFilter, stageFilter, enrichmentFilter }: CompanyTableProps) => {
    const {
        companies,
        globalSearch,
        setSelectedCompanyId,
        selectedCompanyId,
        selectedIds,
        setSelection,
        toggleSelection
    } = useStore();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [activeIndex, setActiveIndex] = useState(-1);

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

        if (enrichmentFilter && enrichmentFilter !== "all") {
            if (enrichmentFilter === "enriched") {
                data = data.filter((c) => !!c.enrichmentData);
            } else {
                data = data.filter((c) => !c.enrichmentData);
            }
        }

        return data;
    }, [companies, globalSearch, industryFilter, stageFilter, enrichmentFilter]);

    // Sync store selectedIds with table state
    useEffect(() => {
        const selection: Record<string, boolean> = {};
        selectedIds.forEach(id => {
            const index = filteredData.findIndex(c => c.id === id);
            if (index !== -1) selection[index] = true;
        });
        setRowSelection(selection);
    }, [selectedIds, filteredData.length]); // length check to avoid stale indices

    // Sync table state back to store
    const handleRowSelectionChange = (updater: any) => {
        const next = typeof updater === 'function' ? updater(rowSelection) : updater;
        setRowSelection(next);
        const ids = Object.keys(next)
            .filter(k => next[k])
            .map(k => filteredData[parseInt(k)].id);
        setSelection(ids);
    };


    /* ── Keyboard Navigation ── */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only if not typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === "j" || e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, filteredData.length - 1));
            } else if (e.key === "k" || e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === "Enter" && activeIndex !== -1) {
                setSelectedCompanyId(filteredData[activeIndex].id);
            } else if (e.key === "x" && activeIndex !== -1) {
                toggleSelection(filteredData[activeIndex].id);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [filteredData, activeIndex, setSelectedCompanyId, toggleSelection]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, columnFilters, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: handleRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            globalSearch,
        },
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
                        table.getRowModel().rows.map((row, i) => (
                            <TableRow
                                key={row.id}
                                onClick={() => {
                                    setSelectedCompanyId(row.original.id);
                                    setActiveIndex(i);
                                }}
                                className={`cursor-pointer border-border transition-colors hover:bg-accent/50 ${activeIndex === i ? "bg-accent/80 border-l-2 border-l-primary" : ""
                                    } ${selectedCompanyId === row.original.id ? "bg-primary/5" : ""}`}
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
