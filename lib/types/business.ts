export type Business = { name: string; address: string; category: string; placeId: string; websiteUrl?: string; phone?: string; mapsUrl?: string };
export interface BusinessSearchProvider { search(params: { businessType: string; location: string; limit: number }): Promise<Business[]>; }
