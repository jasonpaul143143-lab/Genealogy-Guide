export type TreePerson={id:string;name:string;relation:string;status:string;birth:string;death:string;places:string;notes:string};
export type TreeRelationship={id:string;from:string;to:string;type:string};
export type MigrationStop={id:string;person:string;personId:string;year:number;place:string;state:string;lat:number;lon:number;confidence:"Documented"|"Probable"|"Possible";source:string;notes:string};

const STATE_INFO:Record<string,{name:string;lat:number;lon:number}>={
AL:{name:"Alabama",lat:32.8,lon:-86.8},AK:{name:"Alaska",lat:64.2,lon:-149.5},AZ:{name:"Arizona",lat:34.3,lon:-111.7},AR:{name:"Arkansas",lat:34.8,lon:-92.2},CA:{name:"California",lat:36.8,lon:-119.4},CO:{name:"Colorado",lat:39.0,lon:-105.5},CT:{name:"Connecticut",lat:41.6,lon:-72.7},DE:{name:"Delaware",lat:39.0,lon:-75.5},FL:{name:"Florida",lat:28.6,lon:-82.4},GA:{name:"Georgia",lat:32.7,lon:-83.3},HI:{name:"Hawaii",lat:20.8,lon:-156.3},ID:{name:"Idaho",lat:44.2,lon:-114.4},IL:{name:"Illinois",lat:40.0,lon:-89.2},IN:{name:"Indiana",lat:39.9,lon:-86.3},IA:{name:"Iowa",lat:42.1,lon:-93.5},KS:{name:"Kansas",lat:38.5,lon:-98.4},KY:{name:"Kentucky",lat:37.8,lon:-85.7},LA:{name:"Louisiana",lat:31.0,lon:-91.9},ME:{name:"Maine",lat:45.4,lon:-69.0},MD:{name:"Maryland",lat:39.1,lon:-76.8},MA:{name:"Massachusetts",lat:42.2,lon:-71.8},MI:{name:"Michigan",lat:44.3,lon:-85.6},MN:{name:"Minnesota",lat:46.3,lon:-94.2},MS:{name:"Mississippi",lat:32.7,lon:-89.7},MO:{name:"Missouri",lat:38.4,lon:-92.5},MT:{name:"Montana",lat:47.0,lon:-109.6},NE:{name:"Nebraska",lat:41.5,lon:-99.8},NV:{name:"Nevada",lat:39.3,lon:-116.6},NH:{name:"New Hampshire",lat:43.7,lon:-71.6},NJ:{name:"New Jersey",lat:40.1,lon:-74.7},NM:{name:"New Mexico",lat:34.5,lon:-106.0},NY:{name:"New York",lat:42.9,lon:-75.5},NC:{name:"North Carolina",lat:35.5,lon:-79.4},ND:{name:"North Dakota",lat:47.5,lon:-100.5},OH:{name:"Ohio",lat:40.4,lon:-82.8},OK:{name:"Oklahoma",lat:35.6,lon:-97.5},OR:{name:"Oregon",lat:44.0,lon:-120.5},PA:{name:"Pennsylvania",lat:40.9,lon:-77.8},RI:{name:"Rhode Island",lat:41.7,lon:-71.5},SC:{name:"South Carolina",lat:33.8,lon:-80.9},SD:{name:"South Dakota",lat:44.4,lon:-100.2},TN:{name:"Tennessee",lat:35.8,lon:-86.3},TX:{name:"Texas",lat:31.5,lon:-99.3},UT:{name:"Utah",lat:39.3,lon:-111.7},VT:{name:"Vermont",lat:44.0,lon:-72.7},VA:{name:"Virginia",lat:37.5,lon:-79.5},WA:{name:"Washington",lat:47.4,lon:-120.5},WV:{name:"West Virginia",lat:38.6,lon:-80.6},WI:{name:"Wisconsin",lat:44.5,lon:-89.5},WY:{name:"Wyoming",lat:43.0,lon:-107.6}
};
const STATE_NAMES=Object.entries(STATE_INFO).sort((a,b)=>b[1].name.length-a[1].name.length);

export function getState(text:string){
 const value=String(text||""); const upper=value.toUpperCase();
 for(const [abbr,info] of STATE_NAMES){
  if(new RegExp("(^|[^A-Z])"+abbr+"([^A-Z]|$)").test(upper)) return {abbr,...info};
  if(new RegExp("\\b"+info.name.replace(/ /g,"\\s+")+"(?:\\b|$)","i").test(value)) return {abbr,...info};
 }
 return null;
}
function yearFromText(text:string){
 const years=String(text||"").match(/\b(15|16|17|18|19|20)\d{2}\b/g);
 return years?.map(Number).find(y=>y>=1500&&y<=2100)||null;
}
export function parseMigrationStops(people:TreePerson[],relationships:TreeRelationship[],sources:any[]=[]):MigrationStop[]{
 const byId=new Map(people.map(p=>[p.id,p])); const root=people[0]; if(!root)return [];
 const ancestorIds=new Set<string>(); const queue=[root.id];
 while(queue.length){const child=queue.shift()!;for(const r of relationships){const type=String(r.type||"").toLowerCase();const parentEdge=type.includes("parent")&&type.includes("of");const childEdge=type.includes("child");let parent="";if(parentEdge&&r.to===child)parent=r.from;if(childEdge&&r.from===child)parent=r.to;if(parent&&byId.has(parent)&&!ancestorIds.has(parent)){ancestorIds.add(parent);queue.push(parent);}}}
 const peopleToMap=[root,...Array.from(ancestorIds).map(id=>byId.get(id)).filter(Boolean) as TreePerson[]]; const stops:MigrationStop[]=[];
 for(const p of peopleToMap){
  const chunks=String(p.places||"").split(/\s*(?:;|\||\n)\s*/).map(x=>x.trim()).filter(Boolean);
  const parsed=chunks.map((chunk,index)=>{const state=getState(chunk);if(!state)return null;const explicitYear=yearFromText(chunk);const fallbackYear=yearFromText(p.birth);const year=explicitYear??(chunks.length===1?fallbackYear:null);if(!year)return null;const clean=chunk.replace(/\b\d{4}\b/g,"").replace(/[()]/g,"").replace(/[-–—,:;]+$/,"").trim();const personSources=sources.filter(s=>s.personId===p.id);const source=personSources[0]?.title||"Tree location";const confidence=personSources.length?"Documented":"Possible";return {id:p.id+"-"+index+"-"+year+"-"+state.abbr,person:p.name,personId:p.id,year,place:clean||state.name,state:state.name,lat:state.lat,lon:state.lon,confidence,source,notes:personSources.length?"Location is linked to a source in this tree.":"Location comes from the person's tree data and has no attached source yet."} as MigrationStop;}).filter(Boolean) as MigrationStop[];
  stops.push(...parsed);
 }
 return stops.sort((a,b)=>a.year-b.year);
}
export function stateMapUrl(state:string){
 const abbr=Object.entries(STATE_INFO).find(([,v])=>v.name.toLowerCase()===state.toLowerCase())?.[0];
 if(!abbr)return "https://upload.wikimedia.org/wikipedia/commons/3/30/Blank_US_Map_%28states_only%29.svg";
 return "https://commons.wikimedia.org/wiki/Special:Redirect/file/Map_of_USA_"+abbr+".svg";
}
export function stateAbbr(state:string){return Object.entries(STATE_INFO).find(([,v])=>v.name===state)?.[0]||"";}
