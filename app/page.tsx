 "use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase-browser";

type Building = { id:string; name:string; address:string; total_apartments:number };
type Apartment = { id:string; apartment_number:string; monthly_fee:number|null; fee_due_day:number|null };

export default function Home() {
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState("");
  const [company,setCompany]=useState("ABC Property Management");
  const [companyId,setCompanyId]=useState<string|null>(null);
  const [buildings,setBuildings]=useState<Building[]>([]);
  const [apartments,setApartments]=useState<Apartment[]>([]);
  const [message,setMessage]=useState(""); const [error,setError]=useState("");

  async function refresh(user:any){
    setSession({user});
    const {data:members}=await supabase.from("company_members").select("company_id").eq("user_id",user.id).limit(1);
    if(members?.[0]?.company_id){setCompanyId(members[0].company_id); return;}
    setCompanyId(null);
  }

  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(data.session) refresh(data.session.user)});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{if(s) refresh(s.user); else {setSession(null);setCompanyId(null)}}); return ()=>subscription.unsubscribe()},[]);

  async function auth(){
    setError(""); setMessage("");
    if(mode==="signup"){
      const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,role:"company_admin"}}});
      if(error)return setError(error.message);
      if(data.session) await refresh(data.user!); else setMessage("Account created. Confirm your email, then return and log in.");
    } else {
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error)return setError(error.message); await refresh(data.user);
    }
  }

  async function createCompany(){
    if(!session?.user)return;
    const id=crypto.randomUUID();
    const {error:e1}=await supabase.from("companies").insert({id,name:company,owner_id:session.user.id});
    if(e1)return setError(e1.message);
    const {error:e2}=await supabase.from("company_members").insert({company_id:id,user_id:session.user.id,role:"company_admin"});
    if(e2)return setError(e2.message);
    setCompanyId(id); setMessage("Company created.");
  }

  async function createBuilding(){
    if(!companyId)return;
    const name=(document.getElementById("bn") as HTMLInputElement).value;
    const address=(document.getElementById("ba") as HTMLInputElement).value;
    const count=Number((document.getElementById("bc") as HTMLInputElement).value||1);
    const {data:b,error:e}=await supabase.from("buildings").insert({company_id:companyId,name,address,city:"Sofia",total_apartments:count}).select().single();
    if(e)return setError(e.message);
    const aps=Array.from({length:count},(_,i)=>({building_id:b.id,apartment_number:String(i+1),monthly_fee:0,fee_due_day:1}));
    const {error:ae}=await supabase.from("apartments").insert(aps);
    if(ae)return setError(ae.message);
    await loadBuildings();
    setMessage("Building and apartments created.");
  }

  async function loadBuildings(){
    if(!companyId)return;
    const {data}=await supabase.from("buildings").select("id,name,address,total_apartments").eq("company_id",companyId);
    setBuildings(data||[]);
    if(data?.[0]){const {data:a}=await supabase.from("apartments").select("id,apartment_number,monthly_fee,fee_due_day").eq("building_id",data[0].id).order("apartment_number");setApartments(a||[])}
  }
  useEffect(()=>{if(companyId)loadBuildings()},[companyId]);

  if(!session) return <main className="shell"><div className="card" style={{maxWidth:520,margin:"60px auto"}}><h1>🏠 Building Manager</h1><p>Friendly building communication and management.</p>{error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}{mode==="signup"&&<><label>Full name</label><input value={name} onChange={e=>setName(e.target.value)} /></>}<label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary full" onClick={auth}>{mode==="signup"?"Create account":"Log in"}</button><button className="secondary full" onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Create a manager account":"Back to login"}</button></div></main>;

  return <main className="shell"><div className="top"><div className="brand">🏠 Building Manager</div><button className="danger" onClick={()=>supabase.auth.signOut()}>Sign out</button></div>
    {error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}
    {!companyId?<div className="card"><h1>Set up your management company</h1><p>Your account will become the company administrator.</p><label>Company name</label><input value={company} onChange={e=>setCompany(e.target.value)}/><button className="primary full" onClick={createCompany}>Create Company</button></div>:
    <><div className="card"><div className="row"><div><div className="muted">Management company</div><h2>{company}</h2></div><span className="tag">MANAGER</span></div><div className="grid" style={{marginTop:16}}><div><div className="stat">{buildings.length}</div><div className="muted">Buildings</div></div><div><div className="stat">{buildings.reduce((n,b)=>n+b.total_apartments,0)}</div><div className="muted">Apartments</div></div></div></div>
    <div className="card"><h2>Create a building</h2><label>Building name</label><input id="bn" placeholder="Sunset Apartments"/><label>Address</label><input id="ba" placeholder="12 Sunset Street"/><label>Number of apartments</label><input id="bc" type="number" min="1" defaultValue="10"/><button className="primary full" onClick={createBuilding}>Create Building + Apartments</button></div>
    <div className="card"><div className="row"><h2>Apartments & tenants</h2><span className="tag">1 tenant / apartment</span></div>{buildings.length===0?<p>No buildings yet.</p>:<>{apartments.map(a=><div className="apt" key={a.id}><div><b>Apartment {a.apartment_number}</b><div className="muted">Vacant</div></div><button className="secondary">Invite Tenant</button></div>)}</>}</div></>}
  </main>
}