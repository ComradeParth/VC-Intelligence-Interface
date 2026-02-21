"use client";

import { Search, Trash2, Play, Filter } from "lucide-react";
import SearchHeader from "@/components/layout/search-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SavedPage = () => {
    const { savedSearches, deleteSearch } = useStore();
    const router = useRouter();

    const handleDelete = (id: string, name: string) => {
        deleteSearch(id);
        toast.success("Search deleted", { description: `"${name}" removed.` });
    };

    const handleRun = () => {
        router.push("/companies");
    };

    return (
        <div className="flex flex-1 flex-col">
            <SearchHeader
                title="Saved Searches"
                subtitle="Reuse filter configurations across sessions"
            />

            <div className="flex-1 p-6">
                {savedSearches.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-center">
                        <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="mb-1 text-sm font-medium text-muted-foreground">
                            No saved searches
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            Apply filters on the Companies page and save them for quick access.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {savedSearches.map((search) => (
                            <div
                                key={search.id}
                                className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/20"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                        <h3 className="truncate text-sm font-medium">{search.name}</h3>
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {search.filters.industries.map((ind) => (
                                            <Badge key={ind} variant="secondary" className="text-[10px]">
                                                {ind}
                                            </Badge>
                                        ))}
                                        {search.filters.stages.map((stage) => (
                                            <Badge key={stage} variant="outline" className="text-[10px]">
                                                {stage}
                                            </Badge>
                                        ))}
                                        {search.filters.query && (
                                            <Badge variant="secondary" className="text-[10px]">
                                                &quot;{search.filters.query}&quot;
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        Saved {new Date(search.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={handleRun}
                                    >
                                        <Play className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => handleDelete(search.id, search.name)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPage;
