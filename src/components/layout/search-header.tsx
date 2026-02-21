"use client";

import { useEffect, useRef } from "react";
import { Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";

interface SearchHeaderProps {
    title?: string;
    subtitle?: string;
}

const SearchHeader = ({ title, subtitle }: SearchHeaderProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { globalSearch, setGlobalSearch } = useStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
            {/* Left — Page title */}
            <div className="flex items-center gap-3">
                {title && (
                    <div>
                        <h1 className="text-sm font-semibold leading-none tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Right — Global search */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search companies..."
                    className="h-8 rounded-lg border-border bg-muted/50 pl-9 pr-16 text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/50"
                />
                <Badge
                    variant="secondary"
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 gap-0.5 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
                >
                    <Command className="h-2.5 w-2.5" />K
                </Badge>
            </div>
        </header>
    );
};

export default SearchHeader;
