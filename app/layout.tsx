import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./neo.css";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

export const metadata: Metadata={
  title:"Genealogy Guide",
  description:"Learn genealogy, research family history, build your tree, and investigate evidence with Kinley.",
  manifest:"/manifest.webmanifest"
};

export default function RootLayout({children}:{children:ReactNode}){
 return <html lang="en"><body>{children}<ServiceWorkerRegister/></body></html>;
}
