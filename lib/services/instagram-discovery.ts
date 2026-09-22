import "server-only";
import { analyzeWebsite } from "./website-analyzer";
export type InstagramDiscovery={url?:string;username?:string;source?:"website"};
export async function discoverInstagram(websiteUrl?:string|null,knownAnalysis?:Awaited<ReturnType<typeof analyzeWebsite>>):Promise<InstagramDiscovery>{const a=knownAnalysis??await analyzeWebsite(websiteUrl);if(!a?.instagramUrl)return {};try{const u=new URL(a.instagramUrl);const name=u.pathname.split("/").filter(Boolean)[0];return name?{url:`https://www.instagram.com/${name}/`,username:name,source:"website"}:{}}catch{return {}}}
