"use client";

import { createContext, useContext, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface SidebarContextValue {
    collapsed: boolean;
    setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
    collapsed: false,
    setCollapsed: () => { },
});

export const useSidebarState = () => useContext(SidebarContext);

const AppShell = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <TooltipProvider delayDuration={0}>
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main
                        className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "ml-[68px]" : "ml-[240px]"
                            }`}
                    >
                        {children}
                    </main>
                </div>
            </TooltipProvider>
        </SidebarContext.Provider>
    );
};

export default AppShell;
