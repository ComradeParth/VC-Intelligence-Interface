import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/* ── Mock enrichment for demo/rate-limited scenarios ── */
const generateMockEnrichment = (url: string, description: string, thesis: string) => {
    const sentences = description.split(/\.\s+/).filter(Boolean);
    const words = description.split(/\s+/);

    const stopWords = new Set(["the", "and", "for", "that", "with", "are", "from", "this", "has", "its", "their", "our", "can", "will", "but", "not", "have", "they", "been", "more", "than"]);
    const wordFreq = new Map<string, number>();
    words.forEach((w) => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, "");
        if (clean.length > 4 && !stopWords.has(clean)) {
            wordFreq.set(clean, (wordFreq.get(clean) ?? 0) + 1);
        }
    });
    const keywords = [...wordFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

    const whatTheyDo = sentences.slice(0, Math.min(4, sentences.length)).map((s) => s.trim() + ".");
    if (whatTheyDo.length < 3) {
        whatTheyDo.push("Operates in a growing market with significant upside potential.");
        whatTheyDo.push("Focused on delivering innovative solutions to underserved segments.");
    }

    const signals = [
        "Strong product-market fit indicated by clear value proposition",
        "Positioned in a high-growth sector with expanding TAM",
    ];
    if (thesis) {
        signals.push(`Thesis alignment: addresses themes in "${thesis.slice(0, 60)}..."`);
    }
    if (description.toLowerCase().includes("ai") || description.toLowerCase().includes("machine learning")) {
        signals.push("AI/ML capabilities provide defensible technology moat");
    } else {
        signals.push("Domain expertise suggests defensible competitive positioning");
    }

    return {
        summary: sentences.length >= 2
            ? `${sentences[0].trim()}. ${sentences[1].trim()}.`
            : description.slice(0, 200),
        what_they_do: whatTheyDo,
        keywords: keywords.length >= 3 ? keywords : ["Technology", "Innovation", "Growth", "Platform", "Analytics"],
        derived_signals: signals.slice(0, 4),
        sources: [{ url, timestamp: new Date().toISOString() }],
        demo: true,
    };
};

export const POST = async (req: NextRequest) => {
    try {
        const { url, thesis, description } = await req.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'url' parameter" },
                { status: 400 }
            );
        }

        /* ── Step 1: Scrape via Jina Reader API (with graceful fallback) ── */
        let contentForLLM = "";
        let scrapeSucceeded = false;

        try {
            const jinaUrl = `https://r.jina.ai/${url}`;
            const jinaRes = await fetch(jinaUrl, {
                headers: {
                    Accept: "text/markdown",
                    "X-Return-Format": "markdown",
                },
                next: { revalidate: 86400 },
            });

            if (jinaRes.ok) {
                const markdown = await jinaRes.text();
                contentForLLM = markdown.slice(0, 12_000);
                scrapeSucceeded = true;
            }
        } catch {
            // Jina scrape failed — fall through to description fallback
        }

        if (!scrapeSucceeded) {
            if (description) {
                contentForLLM = `Company URL: ${url}\n\nCompany Description: ${description}`;
            } else {
                return NextResponse.json(
                    { error: `Could not fetch content from ${url}. Provide a company description as fallback.` },
                    { status: 502 }
                );
            }
        }

        /* ── Step 2: Extract structured data via Groq (Llama 3.3 70B) ── */
        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            console.log("[/api/enrich] No GROQ_API_KEY set, using mock enrichment");
            return NextResponse.json(generateMockEnrichment(url, description ?? "", thesis ?? ""));
        }

        const modelName = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

        try {
            const systemPrompt = `You are an expert venture capital analyst. You MUST respond with valid JSON only — no markdown, no code fences, no explanation. The JSON must match this exact schema:
{
  "summary": "string (1-2 sentences about the company's value proposition)",
  "what_they_do": ["string (3-5 bullet points about product, tech, business model)"],
  "keywords": ["string (3-6 relevant industry keywords)"],
  "derived_signals": ["string (2-4 investment signals: market traction, defensibility, team, regulatory tailwinds)"],
  "sources": [{"url": "string", "timestamp": "string (ISO 8601)"}]
}`;

            const userPrompt = `Analyze this company and return ONLY valid JSON matching the schema.

${thesis ? `## Fund Investment Thesis\n${thesis}\n\nUse this thesis to derive relevant investment signals.\n` : ""}

## Company Content
${contentForLLM}

## Important
- sources must include: {"url": "${url}", "timestamp": "${new Date().toISOString()}"}
- Return raw JSON only. No markdown code fences. No explanation text.`;

            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt },
                    ],
                    temperature: 0.3,
                    max_tokens: 1500,
                    response_format: { type: "json_object" },
                }),
            });

            if (!groqRes.ok) {
                const errBody = await groqRes.text();
                console.error("[/api/enrich] Groq API error:", groqRes.status, errBody);

                // Rate limited → fall back to mock
                if (groqRes.status === 429) {
                    console.warn("[/api/enrich] Groq rate limited, using mock enrichment");
                    return NextResponse.json(generateMockEnrichment(url, description ?? "", thesis ?? ""));
                }

                throw new Error(`Groq API error: ${groqRes.status}`);
            }

            const groqData = await groqRes.json();
            const content = groqData.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error("Empty response from Groq");
            }

            const parsed = JSON.parse(content);

            // Ensure sources always have the scraped URL
            if (!parsed.sources || parsed.sources.length === 0) {
                parsed.sources = [{ url, timestamp: new Date().toISOString() }];
            }

            return NextResponse.json(parsed);
        } catch (llmError) {
            const errMsg = llmError instanceof Error ? llmError.message : "";
            if (errMsg.includes("429") || errMsg.includes("rate")) {
                console.warn("[/api/enrich] LLM rate limited, falling back to mock");
                return NextResponse.json(generateMockEnrichment(url, description ?? "", thesis ?? ""));
            }
            throw llmError;
        }
    } catch (err) {
        console.error("[/api/enrich] Error:", err);
        return NextResponse.json(
            {
                error: err instanceof Error ? err.message : "An unexpected error occurred during enrichment",
            },
            { status: 500 }
        );
    }
};
