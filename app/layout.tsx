import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Genealogy Guide",description:"Learn genealogy, research family history, build your tree, and explore genetic genealogy."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}