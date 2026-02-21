"use client";

import {
    ExternalLink,
    MapPin,
    Calendar,
    Sparkles,
    Globe,
    Zap,
    Tag,
    FileText,
    Link2,
    RefreshCw,
    ListPlus,
    Check,
    Clock,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const CompanySheet = () => {
    const {
        companies,
        selectedCompanyId,
        setSelectedCompanyId,
        thesis,
        updateCompanyEnrichment,
        lists,
        addCompanyToList,
    } = useStore();
    const [enriching, setEnriching] = useState(false);

    const company = companies.find((c) => c.id === selectedCompanyId);
    const isOpen = !!selectedCompanyId && !!company;

    /* ── Keyboard: Escape closes sheet ── */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setSelectedCompanyId(null);
            }
        },
        [isOpen, setSelectedCompanyId]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleEnrich = async () => {
        if (!company) return;
        setEnriching(true);

        try {
            const res = await fetch("/api/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: company.url, thesis, description: company.description }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Enrichment failed" }));
                throw new Error(err.error ?? "Enrichment failed");
            }

            const data = await res.json();
            updateCompanyEnrichment(company.id, data);
            toast.success("Profile enriched", {
                description: `${company.name} has been updated with AI insights.`,
            });
        } catch (err) {
            toast.error("Enrichment failed", {
                description: err instanceof Error ? err.message : "Please try again later.",
                action: {
                    label: "Retry",
                    onClick: handleEnrich,
                },
            });
        } finally {
            setEnriching(false);
        }
    };

    const handleAddToList = (listId: string, listName: string) => {
        if (!company) return;
        addCompanyToList(listId, company.id);
        toast.success(`Added to "${listName}"`, {
            description: `${company.name} was added to your list.`,
        });
    };

    /* ── Relative time helper ── */
    const getRelativeTime = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && setSelectedCompanyId(null)}>
            <SheetContent className="w-full border-border bg-card sm:max-w-lg">
                <SheetHeader className="pb-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold text-primary">
                            {company?.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-lg font-semibold text-foreground">
                                {company?.name}
                            </SheetTitle>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {company?.location && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {company.location}
                                    </span>
                                )}
                                {company?.founded && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Founded {company.founded}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="space-y-6 pr-4">
                        {/* Meta badges */}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                                {company?.industry}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="border-primary/30 bg-primary/10 text-xs text-primary"
                            >
                                {company?.stage}
                            </Badge>
                            {company?.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            {/* Add to List */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                        <ListPlus className="h-3.5 w-3.5" />
                                        Add to List
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuLabel className="text-xs">Your Lists</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {lists.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                            No lists yet — create one first
                                        </DropdownMenuItem>
                                    ) : (
                                        lists.map((list) => {
                                            const alreadyIn = company
                                                ? list.companyIds.includes(company.id)
                                                : false;
                                            return (
                                                <DropdownMenuItem
                                                    key={list.id}
                                                    disabled={alreadyIn}
                                                    onClick={() => handleAddToList(list.id, list.name)}
                                                    className="text-xs"
                                                >
                                                    <span
                                                        className="mr-2 inline-block h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: list.color }}
                                                    />
                                                    {list.name}
                                                    {alreadyIn && (
                                                        <Check className="ml-auto h-3 w-3 text-emerald-400" />
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Website link button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                asChild
                            >
                                <a href={company?.url} target="_blank" rel="noopener">
                                    <Globe className="h-3.5 w-3.5" />
                                    Website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </Button>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" /> Overview
                            </h3>
                            <p className="text-sm leading-relaxed text-foreground/80">
                                {company?.description}
                            </p>
                        </div>

                        <Separator className="bg-border" />

                        {/* Enrichment Section */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Enrichment
                                </h3>
                                {company?.enrichmentData && !enriching && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleEnrich}
                                        className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                                    >
                                        <RefreshCw className="h-3 w-3" />
                                        Re-enrich
                                    </Button>
                                )}
                            </div>

                            {enriching ? (
                                <EnrichmentSkeleton />
                            ) : company?.enrichmentData ? (
                                <EnrichmentDisplay data={company.enrichmentData} getRelativeTime={getRelativeTime} />
                            ) : (
                                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
                                    <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                                    <p className="mb-3 text-xs text-muted-foreground">
                                        Enrich this profile with AI-generated insights from their website.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={handleEnrich}
                                        className="gap-1.5"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Enrich Profile
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

/* ── Staggered skeleton loading state ── */
const EnrichmentSkeleton = () => (
    <div className="space-y-4 animate-in fade-in-0 duration-500">
        <div>
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
        </div>
        <div className="animation-delay-150 animate-in fade-in-0 slide-in-from-bottom-2">
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="mt-1.5 h-3 w-4/6" />
            <Skeleton className="mt-1.5 h-3 w-3/6" />
        </div>
        <div className="animation-delay-300 animate-in fade-in-0 slide-in-from-bottom-2">
            <Skeleton className="mb-2 h-3 w-20" />
            <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
            </div>
        </div>
        <div className="animation-delay-500 animate-in fade-in-0 slide-in-from-bottom-2">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-2/3" />
        </div>
    </div>
);

/* ── Enrichment data display ── */
const EnrichmentDisplay = ({
    data,
    getRelativeTime,
}: {
    data: NonNullable<import("@/types").EnrichmentData>;
    getRelativeTime: (ts: string) => string;
}) => (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
        {/* Enrichment timestamp */}
        {data.sources?.[0]?.timestamp && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                Enriched {getRelativeTime(data.sources[0].timestamp)}
            </div>
        )}

        {/* Summary */}
        <div>
            <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Zap className="h-3 w-3 text-amber-400" /> Summary
            </h4>
            <p className="text-sm leading-relaxed text-foreground/80">{data.summary}</p>
        </div>

        {/* What They Do */}
        <div>
            <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground">
                What They Do
            </h4>
            <ul className="space-y-1">
                {data.what_they_do.map((item, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>

        {/* Keywords */}
        <div>
            <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Tag className="h-3 w-3" /> Keywords
            </h4>
            <div className="flex flex-wrap gap-1.5">
                {data.keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-[10px]">
                        {kw}
                    </Badge>
                ))}
            </div>
        </div>

        {/* Derived Signals */}
        <div>
            <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3 w-3 text-emerald-400" /> Derived Signals
            </h4>
            <ul className="space-y-1">
                {data.derived_signals.map((signal, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                        {signal}
                    </li>
                ))}
            </ul>
        </div>

        {/* Sources */}
        {data.sources.length > 0 && (
            <div>
                <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Link2 className="h-3 w-3" /> Sources
                </h4>
                <div className="space-y-1">
                    {data.sources.map((src, i) => (
                        <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener"
                            className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary"
                        >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">{src.url}</span>
                            <span className="shrink-0 text-muted-foreground">
                                · {new Date(src.timestamp).toLocaleDateString()}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export default CompanySheet;
