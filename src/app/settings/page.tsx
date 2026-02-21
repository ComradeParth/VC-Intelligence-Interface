"use client";

import { useState } from "react";
import { Save, FileText, Sparkles } from "lucide-react";
import SearchHeader from "@/components/layout/search-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

const SettingsPage = () => {
    const { thesis, setThesis } = useStore();
    const [localThesis, setLocalThesis] = useState(thesis);
    const [saved, setSaved] = useState(true);

    const handleSave = () => {
        setThesis(localThesis);
        setSaved(true);
        toast.success("Thesis saved", {
            description: "Your investment thesis has been updated.",
        });
    };

    return (
        <div className="flex flex-1 flex-col">
            <SearchHeader
                title="Settings"
                subtitle="Configure your fund parameters and preferences"
            />

            <div className="mx-auto w-full max-w-2xl p-6">
                {/* Investment Thesis */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">Investment Thesis</h2>
                            <p className="text-xs text-muted-foreground">
                                This thesis is sent to the AI during company enrichment to derive relevant signals.
                            </p>
                        </div>
                    </div>

                    <textarea
                        value={localThesis}
                        onChange={(e) => {
                            setLocalThesis(e.target.value);
                            setSaved(false);
                        }}
                        rows={5}
                        className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        placeholder="Describe your fund's investment thesis..."
                    />

                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                            {localThesis.length} characters
                        </span>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saved}
                            className="gap-1.5"
                        >
                            <Save className="h-3.5 w-3.5" />
                            {saved ? "Saved" : "Save Thesis"}
                        </Button>
                    </div>
                </div>

                <Separator className="my-6 bg-border" />

                {/* Info */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold">About</h2>
                    </div>
                    <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                        <p>
                            <strong className="text-foreground">VC Intelligence</strong> is an AI-powered
                            deal sourcing platform for venture capital funds.
                        </p>
                        <p>
                            It uses the Jina Reader API for web scraping and Google Gemini for structured
                            data extraction to enrich company profiles with actionable intelligence.
                        </p>
                        <p className="text-[10px]">
                            Built with Next.js 16 · shadcn/ui · Zustand · TanStack Table
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
