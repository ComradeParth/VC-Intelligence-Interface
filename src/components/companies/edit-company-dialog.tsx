"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INDUSTRIES, STAGES } from "@/data/mock-companies";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import type { Company } from "@/types";

interface EditCompanyDialogProps {
    company: Company | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditCompanyDialog({
    company,
    open,
    onOpenChange,
}: EditCompanyDialogProps) {
    const { updateCompany } = useStore();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [industry, setIndustry] = useState("");
    const [stage, setStage] = useState("");
    const [location, setLocation] = useState("");
    const [tags, setTags] = useState("");

    useEffect(() => {
        if (company) {
            setName(company.name);
            setUrl(company.url);
            setIndustry(company.industry);
            setStage(company.stage);
            setLocation(company.location || "");
            setTags(company.tags.join(", "));
        }
    }, [company, open]);

    const handleSave = () => {
        if (!company) return;
        if (!name || !url) {
            toast.error("Please provide a name and URL.");
            return;
        }

        updateCompany(company.id, {
            name,
            url,
            industry,
            stage,
            location,
            tags: tags.split(",").map((t) => t.trim()).filter((t) => t !== ""),
        });

        toast.success(`${name} updated!`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Company</DialogTitle>
                    <DialogDescription>
                        Update the details for <strong>{company?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="edit-name" className="text-xs font-medium text-muted-foreground">Company Name</label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="edit-url" className="text-xs font-medium text-muted-foreground">Website URL</label>
                        <Input
                            id="edit-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="edit-industry" className="text-xs font-medium text-muted-foreground">Industry</label>
                            <select
                                id="edit-industry"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
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
                            <label htmlFor="edit-stage" className="text-xs font-medium text-muted-foreground">Stage</label>
                            <select
                                id="edit-stage"
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
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
                        <label htmlFor="edit-location" className="text-xs font-medium text-muted-foreground">Location</label>
                        <Input
                            id="edit-location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="edit-tags" className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
                        <Input
                            id="edit-tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button size="sm" onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
