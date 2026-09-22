import { getGroqClient } from "../groq";

export type AnalysisResult = { opportunity: string; reason: string; suggestedOffer: string; confidence: "low" | "medium" | "high"; evidence: Array<{ type: "FACT" | "INFERENCE" | "UNKNOWN"; statement: string }> };

const fallback: AnalysisResult = { opportunity: "other", reason: "A public opportunity could not be confidently determined.", suggestedOffer: "Review the business workflow with the owner before proposing software.", confidence: "low", evidence: [{ type: "UNKNOWN", statement: "AI analysis was unavailable." }] };

export async function analyzeLeadWithGroq(input: Record<string, unknown>): Promise<AnalysisResult> {
  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({ model: "llama-3.1-8b-instant", temperature: 0.1, response_format: { type: "json_object" }, messages: [
      { role: "system", content: "Analyze only the supplied public facts. Return JSON with opportunity, reason, suggestedOffer, confidence (low|medium|high), evidence array. Every evidence item must have type FACT, INFERENCE, or UNKNOWN. Never claim an unverified business fact." },
      { role: "user", content: JSON.stringify(input) }
    ] });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AnalysisResult>;
    const evidence = Array.isArray(parsed.evidence) ? parsed.evidence.filter((e) => e && ["FACT", "INFERENCE", "UNKNOWN"].includes(String((e as any).type))).map((e) => ({ type: (e as any).type as "FACT" | "INFERENCE" | "UNKNOWN", statement: String((e as any).statement || "") })) : [];
    return { opportunity: String(parsed.opportunity || "other"), reason: String(parsed.reason || fallback.reason), suggestedOffer: String(parsed.suggestedOffer || fallback.suggestedOffer), confidence: parsed.confidence === "high" || parsed.confidence === "medium" ? parsed.confidence : "low", evidence: evidence.length ? evidence : fallback.evidence };
  } catch { return fallback; }
}

export async function generateOutreach(input: Record<string, unknown>): Promise<string> {
  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({ model: "llama-3.1-8b-instant", temperature: 0.4, messages: [{ role: "system", content: "Write a concise, human outreach message (max 90 words). Mention only supplied facts, use cautious wording, and do not imply automated sending." }, { role: "user", content: JSON.stringify(input) }] });
    return completion.choices[0]?.message?.content?.trim() || "";
  } catch { return ""; }
}
