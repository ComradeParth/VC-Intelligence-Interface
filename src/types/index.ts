export interface EnrichmentData {
    summary: string;
    what_they_do: string[];
    keywords: string[];
    derived_signals: string[];
    sources: { url: string; timestamp: string }[];
    demo?: boolean;
}

export interface Company {
    id: string;
    name: string;
    url: string;
    description: string;
    industry: string;
    stage: string;
    tags: string[];
    enrichmentData: EnrichmentData | null;
    logo?: string;
    location?: string;
    founded?: number;
}

export interface CompanyList {
    id: string;
    name: string;
    description: string;
    companyIds: string[];
    createdAt: string;
    updatedAt: string;
    color: string;
}

export interface SavedSearch {
    id: string;
    name: string;
    filters: {
        industries: string[];
        stages: string[];
        query: string;
    };
    createdAt: string;
}
