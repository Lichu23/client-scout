import { db } from "../db";
import { GooglePlacesProvider } from "../providers/google-places";
export async function searchAndSaveBusinesses(input:{businessType:string;location:string;description?:string;limit:number}) {
 const provider = new GooglePlacesProvider(); const businesses = await provider.search(input);
 const search = await db.search.create({ data:{ businessType:input.businessType, location:input.location, description:input.description || null, requestedLeads:input.limit } });
 const leads = await Promise.all(businesses.map(b => db.lead.upsert({ where:{googlePlaceId:b.placeId}, create:{searchId:search.id,businessName:b.name,businessType:input.businessType,location:input.location,googlePlaceId:b.placeId,googleMapsUrl:b.mapsUrl,websiteUrl:b.websiteUrl,hasWebsite:Boolean(b.websiteUrl)}, update:{searchId:search.id,businessName:b.name,businessType:input.businessType,location:input.location,googleMapsUrl:b.mapsUrl,websiteUrl:b.websiteUrl,hasWebsite:Boolean(b.websiteUrl)} })));
 return { search, leads };
}
