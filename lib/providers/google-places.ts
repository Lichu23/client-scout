import "server-only";
import { requireGooglePlacesKey } from "../config";
import type { Business, BusinessSearchProvider } from "../types/business";
const endpoint = "https://places.googleapis.com/v1/places:searchText";
export class GooglePlacesProvider implements BusinessSearchProvider {
 async search({ businessType, location, limit }: { businessType:string; location:string; limit:number }): Promise<Business[]> {
  const key = requireGooglePlacesKey();
  const places: Array<{id:string; displayName?:{text?:string}; formattedAddress?:string; primaryType?:string; websiteUri?:string; nationalPhoneNumber?:string; googleMapsUri?:string}> = [];
  let pageToken: string | undefined;
  do {
    const response = await fetch(endpoint, { method:"POST", headers:{ "Content-Type":"application/json", "X-Goog-Api-Key":key, "X-Goog-FieldMask":"places.id,places.displayName,places.formattedAddress,places.primaryType,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,nextPageToken" }, body: JSON.stringify({ textQuery:`${businessType} in ${location}`, pageSize:Math.min(Math.max(limit - places.length,1),20), ...(pageToken ? { pageToken } : {}), languageCode:"en" }), cache:"no-store" });
    if (!response.ok) throw new Error(`Google Places request failed (${response.status}).`);
    const data = await response.json() as { places?: typeof places; nextPageToken?: string };
    places.push(...(data.places ?? []));
    pageToken = data.nextPageToken;
  } while (places.length < limit && Boolean(pageToken));
  return places.slice(0,limit).map(p => ({ name:p.displayName?.text ?? "Unnamed business", address:p.formattedAddress ?? location, category:p.primaryType ?? businessType, placeId:p.id, websiteUrl:p.websiteUri, phone:p.nationalPhoneNumber, mapsUrl:p.googleMapsUri }));
 }
}
