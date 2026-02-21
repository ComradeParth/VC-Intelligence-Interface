import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Company, CompanyList, SavedSearch, EnrichmentData } from "@/types";
import { mockCompanies } from "@/data/mock-companies";

interface StoreState {
    /* ── Companies ── */
    companies: Company[];
    selectedCompanyId: string | null;
    setSelectedCompanyId: (id: string | null) => void;
    updateCompanyEnrichment: (companyId: string, data: EnrichmentData) => void;
    addCompany: (company: Omit<Company, "id" | "enrichmentData">) => void;
    updateCompany: (companyId: string, updates: Partial<Omit<Company, "id" | "enrichmentData">>) => void;
    deleteCompany: (companyId: string) => void;

    /* ── Lists ── */
    lists: CompanyList[];
    createList: (name: string, description?: string, companyIds?: string[]) => void;
    deleteList: (listId: string) => void;
    addCompanyToList: (listId: string, companyId: string) => void;
    removeCompanyFromList: (listId: string, companyId: string) => void;

    /* ── Saved Searches ── */
    savedSearches: SavedSearch[];
    saveSearch: (search: Omit<SavedSearch, "id" | "createdAt">) => void;
    deleteSearch: (searchId: string) => void;

    /* ── Thesis ── */
    thesis: string;
    setThesis: (thesis: string) => void;

    /* ── Search ── */
    globalSearch: string;
    setGlobalSearch: (query: string) => void;

    /* ── Multi-selection & Bulk Actions ── */
    selectedIds: string[];
    toggleSelection: (id: string) => void;
    setSelection: (ids: string[]) => void;
    clearSelection: () => void;
    bulkDeleteCompanies: (ids: string[]) => void;
    bulkAddCompaniesToList: (listId: string, companyIds: string[]) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const LIST_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#06b6d4",
];

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            /* ── Companies ── */
            companies: mockCompanies,
            selectedCompanyId: null,

            setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),

            updateCompanyEnrichment: (companyId, data) =>
                set((state) => ({
                    companies: state.companies.map((c) =>
                        c.id === companyId ? { ...c, enrichmentData: data } : c
                    ),
                })),

            addCompany: (company) =>
                set((state) => ({
                    companies: [
                        ...state.companies,
                        { ...company, id: generateId(), enrichmentData: null },
                    ],
                })),

            updateCompany: (companyId, updates) =>
                set((state) => ({
                    companies: state.companies.map((c) =>
                        c.id === companyId ? { ...c, ...updates } : c
                    ),
                })),

            deleteCompany: (companyId) =>
                set((state) => ({
                    companies: state.companies.filter((c) => c.id !== companyId),
                    lists: state.lists.map((l) => ({
                        ...l,
                        companyIds: l.companyIds.filter((id) => id !== companyId),
                    })),
                    selectedCompanyId: state.selectedCompanyId === companyId ? null : state.selectedCompanyId,
                })),

            /* ── Lists ── */
            lists: [
                {
                    id: "list-default-1",
                    name: "Top Picks Q1 2026",
                    description: "High-conviction companies for Q1 pipeline review",
                    companyIds: ["c-001", "c-004", "c-009"],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    color: "#6366f1",
                },
            ],

            createList: (name, description = "", companyIds = []) =>
                set((state) => ({
                    lists: [
                        ...state.lists,
                        {
                            id: generateId(),
                            name,
                            description,
                            companyIds,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            color: LIST_COLORS[state.lists.length % LIST_COLORS.length],
                        },
                    ],
                })),

            deleteList: (listId) =>
                set((state) => ({
                    lists: state.lists.filter((l) => l.id !== listId),
                })),

            addCompanyToList: (listId, companyId) =>
                set((state) => ({
                    lists: state.lists.map((l) =>
                        l.id === listId && !l.companyIds.includes(companyId)
                            ? {
                                ...l,
                                companyIds: [...l.companyIds, companyId],
                                updatedAt: new Date().toISOString(),
                            }
                            : l
                    ),
                })),

            removeCompanyFromList: (listId, companyId) =>
                set((state) => ({
                    lists: state.lists.map((l) =>
                        l.id === listId
                            ? {
                                ...l,
                                companyIds: l.companyIds.filter((id) => id !== companyId),
                                updatedAt: new Date().toISOString(),
                            }
                            : l
                    ),
                })),

            /* ── Saved Searches ── */
            savedSearches: [],

            saveSearch: (search) =>
                set((state) => ({
                    savedSearches: [
                        ...state.savedSearches,
                        { ...search, id: generateId(), createdAt: new Date().toISOString() },
                    ],
                })),

            deleteSearch: (searchId) =>
                set((state) => ({
                    savedSearches: state.savedSearches.filter((s) => s.id !== searchId),
                })),

            /* ── Thesis ── */
            thesis:
                "We invest in early-stage (Pre-Seed to Series A) technology companies building AI-native infrastructure and vertical SaaS. We look for strong technical moats, large addressable markets, and founders with deep domain expertise.",

            setThesis: (thesis) => set({ thesis }),

            /* ── Search ── */
            globalSearch: "",
            setGlobalSearch: (query) => set({ globalSearch: query }),

            /* ── Multi-selection & Bulk Actions ── */
            selectedIds: [],

            toggleSelection: (id) =>
                set((state) => ({
                    selectedIds: state.selectedIds.includes(id)
                        ? state.selectedIds.filter((x) => x !== id)
                        : [...state.selectedIds, id],
                })),

            setSelection: (ids) => set({ selectedIds: ids }),

            clearSelection: () => set({ selectedIds: [] }),

            bulkDeleteCompanies: (ids) =>
                set((state) => ({
                    companies: state.companies.filter((c) => !ids.includes(c.id)),
                    lists: state.lists.map((l) => ({
                        ...l,
                        companyIds: l.companyIds.filter((id) => !ids.includes(id)),
                    })),
                    selectedIds: [],
                    selectedCompanyId:
                        state.selectedCompanyId && ids.includes(state.selectedCompanyId)
                            ? null
                            : state.selectedCompanyId,
                })),

            bulkAddCompaniesToList: (listId, companyIds) =>
                set((state) => ({
                    lists: state.lists.map((l) =>
                        l.id === listId
                            ? {
                                ...l,
                                companyIds: Array.from(new Set([...l.companyIds, ...companyIds])),
                                updatedAt: new Date().toISOString(),
                            }
                            : l
                    ),
                    selectedIds: [],
                })),
        }),
        {
            name: "vc-intelligence-store",
            partialize: (state) => ({
                companies: state.companies,
                lists: state.lists,
                savedSearches: state.savedSearches,
                thesis: state.thesis,
            }),
            onRehydrateStorage: () => (state) => {
                // Clear any demo/simulated enrichments from persisted state
                if (state) {
                    state.companies = state.companies.map((c) =>
                        c.enrichmentData?.demo
                            ? { ...c, enrichmentData: null }
                            : c
                    );
                }
            },
        }
    )
);
