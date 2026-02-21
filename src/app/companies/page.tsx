"use client";

import { useState, useCallback } from "react";
import { Filter, Download, Sparkles, X, Plus } from "lucide-react";
import SearchHeader from "@/components/layout/search-header";
import CompanyTable from "@/components/companies/company-table";
import CompanySheet from "@/components/companies/company-sheet";
import BulkActionBar from "@/components/companies/bulk-action-bar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { INDUSTRIES, STAGES } from "@/data/mock-companies";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

const CompaniesPage = () => {
    const [industryFilter, setIndustryFilter] = useState("all");
    const [stageFilter, setStageFilter] = useState("all");
    const [enrichmentFilter, setEnrichmentFilter] = useState("all");
    const { companies, thesis, updateCompanyEnrichment, addCompany } = useStore();

    const activeFilters =
        (industryFilter !== "all" ? 1 : 0) +
        (stageFilter !== "all" ? 1 : 0) +
        (enrichmentFilter !== "all" ? 1 : 0);

    const clearFilters = () => {
        setIndustryFilter("all");
        setStageFilter("all");
        setEnrichmentFilter("all");
    };

    /* ── Add Company Dialog ── */
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newIndustry, setNewIndustry] = useState(INDUSTRIES[0]);
    const [newStage, setNewStage] = useState(STAGES[0]);
    const [newLocation, setNewLocation] = useState("");
    const [newTags, setNewTags] = useState("");

    const handleAddCompany = () => {
        if (!newName || !newUrl) {
            toast.error("Please provide a name and URL.");
            return;
        }

        // Basic URL validation
        try {
            new URL(newUrl);
        } catch {
            toast.error("Please provide a valid URL (including https://)");
            return;
        }

        addCompany({
            name: newName,
            url: newUrl,
            description: `A new company in the ${newIndustry} space at ${newStage} stage.`, // Placeholder description that will be enriched
            industry: newIndustry,
            stage: newStage,
            tags: newTags.split(",").map(t => t.trim()).filter(t => t !== ""),
            location: newLocation || "Remote",
            founded: new Date().getFullYear(),
        });

        toast.success(`${newName} added!`, {
            description: "You can now enrich this company using the AI tools.",
        });

        // Reset form
        setNewName("");
        setNewUrl("");
        setNewIndustry(INDUSTRIES[0]);
        setNewStage(STAGES[0]);
        setNewLocation("");
        setNewTags("");
        setAddDialogOpen(false);
    };

    /* ── Bulk enrich all un-enriched companies ── */
    const [bulkEnriching, setBulkEnriching] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

    const handleBulkEnrich = useCallback(async () => {
        const unenriched = companies.filter((c) => !c.enrichmentData);
        if (unenriched.length === 0) {
            toast.info("All companies are already enriched.");
            return;
        }

        setBulkEnriching(true);
        setBulkProgress({ done: 0, total: unenriched.length });
        let successCount = 0;

        for (const company of unenriched) {
            try {
                const res = await fetch("/api/enrich", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: company.url, thesis, description: company.description }),
                });

                if (res.ok) {
                    const data = await res.json();
                    updateCompanyEnrichment(company.id, data);
                    successCount++;
                }
            } catch {
                // Continue with next company
            }

            setBulkProgress((prev) => ({ ...prev, done: prev.done + 1 }));

            // Small delay to avoid rate-limiting
            await new Promise((r) => setTimeout(r, 500));
        }

        setBulkEnriching(false);
        toast.success(`Enriched ${successCount} of ${unenriched.length} companies`);
    }, [companies, thesis, updateCompanyEnrichment]);

    /* ── Export CSV ── */
    const handleExport = useCallback(() => {
        const headers = ["Name", "URL", "Industry", "Stage", "Location", "Founded", "Tags", "Enriched"];
        const rows = companies.map((c) => [
            c.name,
            c.url,
            c.industry,
            c.stage,
            c.location ?? "",
            c.founded?.toString() ?? "",
            c.tags.join("; "),
            c.enrichmentData ? "Yes" : "No",
        ]);
        const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `companies-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported to CSV");
    }, [companies]);

    const unenrichedCount = companies.filter((c) => !c.enrichmentData).length;

    return (
        <div className="flex flex-1 flex-col">
            <SearchHeader
                title="Companies"
                subtitle="Discover and analyze startups in your pipeline"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <div className="flex items-center gap-2">
                    {/* Industry filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                            >
                                <Filter className="h-3 w-3" />
                                Industry
                                {industryFilter !== "all" && (
                                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px]">
                                        {industryFilter}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel className="text-xs">
                                Filter by Industry
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setIndustryFilter("all")}
                                className="text-xs"
                            >
                                All Industries
                            </DropdownMenuItem>
                            {INDUSTRIES.map((industry) => (
                                <DropdownMenuItem
                                    key={industry}
                                    onClick={() => setIndustryFilter(industry)}
                                    className="text-xs"
                                >
                                    {industry}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Stage filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                            >
                                <Filter className="h-3 w-3" />
                                Stage
                                {stageFilter !== "all" && (
                                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px]">
                                        {stageFilter}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                            <DropdownMenuLabel className="text-xs">
                                Filter by Stage
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setStageFilter("all")}
                                className="text-xs"
                            >
                                All Stages
                            </DropdownMenuItem>
                            {STAGES.map((stage) => (
                                <DropdownMenuItem
                                    key={stage}
                                    onClick={() => setStageFilter(stage)}
                                    className="text-xs"
                                >
                                    {stage}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Enrichment filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                            >
                                <Sparkles className="h-3 w-3" />
                                Status
                                {enrichmentFilter !== "all" && (
                                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px]">
                                        {enrichmentFilter === "enriched" ? "Enriched" : "Unenriched"}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                            <DropdownMenuLabel className="text-xs">
                                Filter by Enrichment
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setEnrichmentFilter("all")}
                                className="text-xs"
                            >
                                All Companies
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setEnrichmentFilter("enriched")}
                                className="text-xs"
                            >
                                Enriched Only
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setEnrichmentFilter("unenriched")}
                                className="text-xs"
                            >
                                Unenriched Only
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {activeFilters > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 gap-1.5 text-xs text-muted-foreground"
                        >
                            <X className="h-3 w-3" />
                            Clear
                            <Badge variant="destructive" className="ml-1 px-1 py-0 text-[10px]">
                                {activeFilters}
                            </Badge>
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex flex-col items-end gap-1 px-4 border-r border-border">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Enrichment Health</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-muted/50 overflow-hidden">
                                <div
                                    className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-1000"
                                    style={{ width: `${(companies.filter(c => !!c.enrichmentData).length / Math.max(companies.length, 1)) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-primary">
                                {Math.round((companies.filter(c => !!c.enrichmentData).length / Math.max(companies.length, 1)) * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Add Company Button */}
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-8 gap-1.5 text-xs">
                                <Plus className="h-3 w-3" />
                                Add Company
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Company</DialogTitle>
                                <DialogDescription>
                                    Enter the company details and website. We'll use the URL to scrap and enrich the profile later.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="name" className="text-xs font-medium text-muted-foreground">Company Name</label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Acme AI"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="url" className="text-xs font-medium text-muted-foreground">Website URL (for scraping)</label>
                                    <Input
                                        id="url"
                                        placeholder="https://acme.ai"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label htmlFor="industry" className="text-xs font-medium text-muted-foreground">Industry</label>
                                        <select
                                            id="industry"
                                            value={newIndustry}
                                            onChange={(e) => setNewIndustry(e.target.value as any)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            {INDUSTRIES.map((ind) => (
                                                <option key={ind} value={ind}>
                                                    {ind}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="stage" className="text-xs font-medium text-muted-foreground">Stage</label>
                                        <select
                                            id="stage"
                                            value={newStage}
                                            onChange={(e) => setNewStage(e.target.value as any)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            {STAGES.map((stg) => (
                                                <option key={stg} value={stg}>
                                                    {stg}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="location" className="text-xs font-medium text-muted-foreground">Location</label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. San Francisco, CA"
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="tags" className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
                                    <Input
                                        id="tags"
                                        placeholder="e.g. SaaS, AI, B2B"
                                        value={newTags}
                                        onChange={(e) => setNewTags(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button size="sm" onClick={handleAddCompany}>
                                    Save Company
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Bulk enrich */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-amber-400 border-amber-400/20 hover:bg-amber-400/10"
                        onClick={handleBulkEnrich}
                        disabled={bulkEnriching || unenrichedCount === 0}
                    >
                        <Sparkles className={`h-3 w-3 ${bulkEnriching ? "animate-spin" : ""}`} />
                        {bulkEnriching
                            ? `Enriching ${bulkProgress.done}/${bulkProgress.total}...`
                            : `Enrich All${unenrichedCount > 0 ? ` (${unenrichedCount})` : ""}`
                        }
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={handleExport}
                    >
                        <Download className="h-3 w-3" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 p-6">
                <CompanyTable
                    industryFilter={industryFilter}
                    stageFilter={stageFilter}
                    enrichmentFilter={enrichmentFilter}
                />
            </div>

            {/* Company detail sheet */}
            <CompanySheet />

            {/* Floating bulk actions */}
            <BulkActionBar />
        </div >
    );
};

export default CompaniesPage;
