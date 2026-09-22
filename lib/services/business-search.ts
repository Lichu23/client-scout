import { db } from "../db";
import { GooglePlacesProvider } from "../providers/google-places";
import { analyzeWebsite, normalizeWebsiteUrl } from "./website-analyzer";
import { discoverInstagram } from "./instagram-discovery";
import { scoreLead } from "./lead-scoring";
export async function searchAndSaveBusinesses(input:{businessType:string;location:string;description?:string;limit:number}) {
 const businesses=await new GooglePlacesProvider().search(input);
 const search=await db.search.create({data:{businessType:input.businessType,location:input.location,description:input.description||null,requestedLeads:input.limit}});
 const leads=await Promise.all(businesses.map(async b=>{
  const website=normalizeWebsiteUrl(b.websiteUrl); const analysis=website?await analyzeWebsite(website.toString()):null; const ig=await discoverInstagram(website?.toString(),analysis); const domain=analysis?.domain??website?.hostname.toLowerCase();
  const candidates=[...(b.placeId?[{googlePlaceId:b.placeId}]:[]),...(domain?[{websiteDomain:domain}]:[]),...(ig.username?[{instagramUsername:ig.username}]:[]),{businessName:b.name,location:input.location}];
  const existing=await db.lead.findFirst({where:{OR:candidates}});
  const scored=scoreLead({businessType:b.name,requestedType:input.businessType,instagram:Boolean(ig.username),website:Boolean(website),analysis,description:input.description});
  const data={searchId:search.id,businessName:b.name,businessType:input.businessType,location:input.location,googlePlaceId:b.placeId,googleMapsUrl:b.mapsUrl,websiteUrl:analysis?.finalUrl??website?.toString()??null,websiteDomain:domain??null,instagramUrl:ig.url??null,instagramUsername:ig.username??null,hasWebsite:Boolean(website),hasInstagram:Boolean(ig.username),hasHttps:analysis?.hasHttps??null,hasContactForm:analysis?.hasContactForm??null,hasBooking:analysis?.hasBooking??null,hasEcommerce:analysis?.hasEcommerce??null,hasWhatsApp:analysis?.hasWhatsApp??null,websiteAnalyzedAt:analysis?new Date():null,enrichmentStatus:website?(analysis?"complete":"unavailable"):"not_applicable",leadScore:scored.score,scoreReasons:JSON.stringify(scored.reasons),opportunity:scored.opportunity};
  return existing?db.lead.update({where:{id:existing.id},data}):db.lead.create({data});
 })); return {search,leads};
}
