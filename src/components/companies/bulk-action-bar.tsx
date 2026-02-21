"use client";

import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Trash2,
    ListPlus,
    X,
    Sparkles,
    Check,
    MoreHorizontal
} from "lucide-react";
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
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

export default function BulkActionBar() {
    const {
        selectedIds,
        clearSelection,
        bulkDeleteCompanies,
        lists,
        bulkAddCompaniesToList
    } = useStore();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleDelete = () => {
        bulkDeleteCompanies(selectedIds);
        toast.success(`Deleted ${selectedIds.length} companies`);
        setShowDeleteDialog(false);
    };

    const handleAddToList = (listId: string, listName: string) => {
        bulkAddCompaniesToList(listId, selectedIds);
        toast.success(`Added ${selectedIds.length} companies to "${listName}"`);
    };

    return (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 rounded-full border border-border bg-background/80 px-4 py-2 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 border-r border-border pr-2">
                    <Badge variant="secondary" className="h-6 rounded-full px-2 text-[10px] font-bold bg-primary/10 text-primary">
                        {selectedIds.length}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Selected</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-medium hover:bg-primary/5 hover:text-primary">
                                <ListPlus className="h-3.5 w-3.5" />
                                Add to List
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56 overflow-hidden rounded-xl border-border bg-background/95 backdrop-blur-sm">
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Lists</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/50" />
                            <div className="max-h-[200px] overflow-y-auto p-1">
                                {lists.length === 0 ? (
                                    <div className="px-2 py-4 text-center text-xs text-muted-foreground">No lists yet</div>
                                ) : (
                                    lists.map((list) => (
                                        <DropdownMenuItem
                                            key={list.id}
                                            onClick={() => handleAddToList(list.id, list.name)}
                                            className="focus:bg-primary/5 focus:text-primary rounded-lg"
                                        >
                                            <div
                                                className="mr-2 h-2 w-2 rounded-full ring-1 ring-border/20"
                                                style={{ backgroundColor: list.color }}
                                            />
                                            <span className="flex-1 truncate">{list.name}</span>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-medium text-rose-500 hover:bg-rose-500/5 hover:text-rose-600"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </Button>
                </div>

                <div className="ml-2 border-l border-border pl-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                        onClick={clearSelection}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-[400px] rounded-2xl border-border bg-background/95 backdrop-blur-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Delete Companies?</DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-muted-foreground">
                            You are about to delete <strong>{selectedIds.length}</strong> companies. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-2">
                        <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded-xl bg-rose-500 hover:bg-rose-600">
                            Delete All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
