import { NextResponse } from "next/server";

const plans:Record<string,{name:string,amount:number}>={
 researcher:{name:"Genealogy Guide Researcher",amount:499},
 genealogist:{name:"Genealogy Guide Genealogist",amount:999},
 family:{name:"Genealogy Guide Family",amount:1499}
};

export async function POST(req:Request){
 try{
  const {plan}=await req.json();
  const selected=plans[String(plan)];
  if(!selected)return NextResponse.json({error:"Unknown subscription plan."},{status:400});
  const secret=process.env.STRIPE_SECRET_KEY;
  if(!secret)return NextResponse.json({error:"Checkout is not configured yet. The app owner needs to connect Stripe first."},{status:503});
  const origin=req.headers.get("origin")||"https://genealogy-guide.vercel.app";
  const body=new URLSearchParams();
  body.set("mode","subscription");
  body.set("success_url",origin+"/?checkout=success");
  body.set("cancel_url",origin+"/?checkout=cancelled");
  body.set("line_items[0][price_data][currency]","usd");
  body.set("line_items[0][price_data][product_data][name]",selected.name);
  body.set("line_items[0][price_data][unit_amount]",String(selected.amount));
  body.set("line_items[0][price_data][recurring][interval]","month");
  body.set("line_items[0][quantity]","1");
  const response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:"Bearer "+secret,"Content-Type":"application/x-www-form-urlencoded"},body});
  const data=await response.json();
  if(!response.ok)return NextResponse.json({error:data?.error?.message||"Stripe could not create checkout."},{status:500});
  return NextResponse.json({url:data.url});
 }catch{return NextResponse.json({error:"Unable to start checkout."},{status:500});}
}
