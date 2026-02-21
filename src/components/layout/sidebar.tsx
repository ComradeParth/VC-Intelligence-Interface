"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    ListChecks,
    Bookmark,
    Settings,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarState } from "@/components/layout/app-shell";
import { useStore } from "@/store/useStore";

const Sidebar = () => {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebarState();
    const companies = useStore((s) => s.companies);
    const lists = useStore((s) => s.lists);
    const savedSearches = useStore((s) => s.savedSearches);

    const enrichedCount = companies.filter((c) => c.enrichmentData && !c.enrichmentData.demo).length;

    const navItems = [
        { href: "/companies", label: "Companies", icon: Building2, count: companies.length, badge: enrichedCount > 0 ? `${enrichedCount} enriched` : undefined },
        { href: "/lists", label: "Lists", icon: ListChecks, count: lists.length },
        { href: "/saved", label: "Saved", icon: Bookmark, count: savedSearches.length },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${collapsed ? "w-[68px]" : "w-[240px]"
                }`}
        >
            {/* Logo */}
            <div className="flex h-14 items-center gap-2.5 px-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                {!collapsed && (
                    <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                        VC Intelligence
                    </span>
                )}
            </div>

            <Separator className="bg-sidebar-border" />

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-1 p-3">
                <span
                    className={`mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ${collapsed ? "sr-only" : ""
                        }`}
                >
                    Navigate
                </span>
                {navItems.map(({ href, label, icon: Icon, count }) => {
                    const isActive =
                        pathname === href || pathname.startsWith(`${href}/`);
                    return (
                        <Tooltip key={href} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={href}
                                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                                        }`}
                                >
                                    <Icon
                                        className={`h-4 w-4 shrink-0 transition-colors ${isActive
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                                            }`}
                                    />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1">{label}</span>
                                            {count > 0 && (
                                                <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                                                    {count}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right" sideOffset={8}>
                                    {label} {count > 0 ? `(${count})` : ""}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-sidebar-border p-3">
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Link
                            href="/settings"
                            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        >
                            <Settings className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-sidebar-accent-foreground" />
                            {!collapsed && <span>Settings</span>}
                        </Link>
                    </TooltipTrigger>
                    {collapsed && (
                        <TooltipContent side="right" sideOffset={8}>
                            Settings
                        </TooltipContent>
                    )}
                </Tooltip>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed((prev: boolean) => !prev)}
                    className="mt-1 h-8 w-full text-muted-foreground hover:text-sidebar-foreground"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
