"use client";

import { useState } from "react";
import { Filter, Plus, Download } from "lucide-react";
import SearchHeader from "@/components/layout/search-header";
import CompanyTable from "@/components/companies/company-table";
import CompanySheet from "@/components/companies/company-sheet";
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
import { INDUSTRIES, STAGES } from "@/data/mock-companies";

const CompaniesPage = () => {
    const [industryFilter, setIndustryFilter] = useState("all");
    const [stageFilter, setStageFilter] = useState("all");

    const activeFilters =
        (industryFilter !== "all" ? 1 : 0) + (stageFilter !== "all" ? 1 : 0);

    const clearFilters = () => {
        setIndustryFilter("all");
        setStageFilter("all");
    };

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

                    {activeFilters > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 text-xs text-muted-foreground"
                        >
                            Clear filters
                            <Badge variant="destructive" className="ml-1 px-1 py-0 text-[10px]">
                                {activeFilters}
                            </Badge>
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                        <Download className="h-3 w-3" />
                        Export
                    </Button>
                    <Button size="sm" className="h-8 gap-1.5 text-xs">
                        <Plus className="h-3 w-3" />
                        Add Company
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 p-6">
                <CompanyTable
                    industryFilter={industryFilter}
                    stageFilter={stageFilter}
                />
            </div>

            {/* Company detail sheet */}
            <CompanySheet />
        </div>
    );
};

export default CompaniesPage;
