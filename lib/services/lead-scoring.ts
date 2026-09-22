import type { WebsiteAnalysis } from "./website-analyzer";

export type Opportunity = "website" | "booking_system" | "ecommerce" | "online_ordering" | "crm" | "automation" | "other";

export function scoreLead(input: { businessType: string; requestedType: string; instagram: boolean; website: boolean; analysis?: WebsiteAnalysis | null; description?: string }) {
  const reasons: string[] = [];
  let score = 0;
  const categoryMatch = input.businessType.toLowerCase().includes(input.requestedType.toLowerCase().replace(/s$/, "")) || input.requestedType.toLowerCase().includes(input.businessType.toLowerCase().replace(/s$/, ""));
  if (categoryMatch) { score += 20; reasons.push("Business category matches the search"); }
  score += 10; reasons.push("Location matched by Google Places");
  if (input.instagram) { score += 10; reasons.push("Public Instagram profile found"); }
  if (!input.website) { score += 15; reasons.push("No public website listed"); }
  if (input.analysis && !input.analysis.hasBooking) { score += 15; reasons.push("No booking functionality detected"); }
  const opportunity = detectOpportunity(input);
  if (opportunity) { score += 20; reasons.push(`Potential ${opportunity.replace(/_/g, " ")} opportunity`); }
  if (input.description?.trim()) { score += 10; reasons.push("Matches a custom target description"); }
  return { score: Math.min(100, score), reasons, opportunity };
}

export function detectOpportunity(input: { website: boolean; analysis?: WebsiteAnalysis | null; businessType: string }): Opportunity | null {
  if (!input.website) return "website";
  const a = input.analysis;
  if (!a) return "other";
  if (!a.hasBooking && /(barber|salon|spa|dent|fitness|gym|clinic|beaut)/i.test(input.businessType)) return "booking_system";
  if (/(restaurant|cafe|food|pizza)/i.test(input.businessType) && !a.hasOnlineOrdering) return "online_ordering";
  if (/(shop|store|retail|boutique)/i.test(input.businessType) && !a.hasEcommerce) return "ecommerce";
  if (!a.hasContactForm) return "crm";
  return null;
}
