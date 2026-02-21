"use client";

import { useState } from "react";
import {
    Plus,
    Download,
    Trash2,
    Building2,
    MoreHorizontal,
    FolderOpen,
} from "lucide-react";
import SearchHeader from "@/components/layout/search-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

const ListsPage = () => {
    const { lists, companies, createList, deleteList } = useStore();
    const [newListName, setNewListName] = useState("");
    const [newListDesc, setNewListDesc] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleCreate = () => {
        if (!newListName.trim()) return;
        createList(newListName.trim(), newListDesc.trim());
        setNewListName("");
        setNewListDesc("");
        setDialogOpen(false);
        toast.success("List created", { description: `"${newListName}" has been added.` });
    };

    const handleDelete = (listId: string, name: string) => {
        deleteList(listId);
        toast.success("List deleted", { description: `"${name}" has been removed.` });
    };

    const handleExportCsv = (listId: string, listName: string) => {
        const list = lists.find((l) => l.id === listId);
        if (!list) return;

        const listCompanies = companies.filter((c) => list.companyIds.includes(c.id));

        const headers = ["Name", "URL", "Industry", "Stage", "Location", "Description", "Tags"];
        const rows = listCompanies.map((c) => [
            c.name,
            c.url,
            c.industry,
            c.stage,
            c.location ?? "",
            `"${c.description.replace(/"/g, '""')}"`,
            c.tags.join("; "),
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${listName.toLowerCase().replace(/\s+/g, "-")}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("CSV exported", {
            description: `${listCompanies.length} companies exported from "${listName}".`,
        });
    };

    return (
        <div className="flex flex-1 flex-col">
            <SearchHeader
                title="Lists"
                subtitle="Organize companies into curated collections"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <p className="text-xs text-muted-foreground">
                    {lists.length} list{lists.length !== 1 ? "s" : ""}
                </p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 gap-1.5 text-xs">
                            <Plus className="h-3 w-3" />
                            New List
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New List</DialogTitle>
                            <DialogDescription>
                                Organize companies into a named collection for review or export.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                            <Input
                                placeholder="List name..."
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                className="h-9 text-sm"
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            />
                            <Input
                                placeholder="Description (optional)..."
                                value={newListDesc}
                                onChange={(e) => setNewListDesc(e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleCreate}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Lists grid */}
            <div className="flex-1 p-6">
                {lists.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-center">
                        <FolderOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="mb-1 text-sm font-medium text-muted-foreground">
                            No lists yet
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            Create your first list to start organizing companies.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {lists.map((list) => {
                            const listCompanies = companies.filter((c) =>
                                list.companyIds.includes(c.id)
                            );
                            return (
                                <div
                                    key={list.id}
                                    className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: list.color }}
                                            />
                                            <h3 className="text-sm font-semibold">{list.name}</h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleExportCsv(list.id, list.name)}
                                                    className="text-xs"
                                                >
                                                    <Download className="mr-2 h-3 w-3" />
                                                    Export CSV
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(list.id, list.name)}
                                                    className="text-xs text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-3 w-3" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {list.description && (
                                        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                                            {list.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="gap-1 text-[10px]">
                                            <Building2 className="h-2.5 w-2.5" />
                                            {listCompanies.length} compan
                                            {listCompanies.length !== 1 ? "ies" : "y"}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            Updated{" "}
                                            {new Date(list.updatedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    {/* Preview company chips */}
                                    {listCompanies.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1 border-t border-border pt-3">
                                            {listCompanies.slice(0, 4).map((c) => (
                                                <span
                                                    key={c.id}
                                                    className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                                >
                                                    {c.name}
                                                </span>
                                            ))}
                                            {listCompanies.length > 4 && (
                                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                                    +{listCompanies.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListsPage;
