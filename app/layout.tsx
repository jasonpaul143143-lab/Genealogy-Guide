import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata={
  title:"Genealogy Guide",
  description:"Learn genealogy, research family history, build your tree, and explore genetic genealogy.",
  manifest:"/manifest.webmanifest"
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}<script dangerouslySetInnerHTML={{__html:`if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));}`}}/></body></html>
}