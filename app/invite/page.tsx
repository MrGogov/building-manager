 "use client";
import {useEffect,useState} from "react";
import {useSearchParams,useRouter} from "next/navigation";
import {createClient} from "../../lib/supabase-browser";

export default function Invite(){
  const sp=useSearchParams(),router=useRouter(),s=createClient();
  const token=sp.get("token");
  const[inv,setInv]=useState<any>(null);
  const[name,setName]=useState("");
  const[pw,setPw]=useState("");
  const[err,setErr]=useState("");
  const[done,setDone]=useState(false);
  const[busy,setBusy]=useState(true);

  useEffect(()=>{
    if(!token){setErr("Invalid invitation link.");setBusy(false);return}
    s.from("invitations")
      .select("id,email,status,expires_at,apartment_id,apartments(apartment_number),buildings(name)")
      .eq("token",token).maybeSingle()
      .then(({data,error})=>{
        if(error||!data)setErr("Invitation not found.");
        else if(data.status!=="pending"||new Date(data.expires_at)<new Date())setErr("This invitation is expired or already used.");
        else setInv(data);
        setBusy(false);
      })
  },[token]);

  async function accept(){
    if(!inv)return;
    setBusy(true);setErr("");
    const{data,error}=await s.auth.signUp({email:inv.email,password:pw,options:{data:{full_name:name,role:"tenant"}}});
    if(error){setErr(error.message);setBusy(false);return}
    if(!data.user){setErr("Check your email to confirm your account, then reopen this invitation.");setBusy(false);return}
    let r=await s.from("profiles").upsert({id:data.user.id,full_name:name,email:inv.email,role:"tenant"});
    if(r.error){setErr(r.error.message);setBusy(false);return}
    r=await s.from("apartment_tenants").insert({apartment_id:inv.apartment_id,tenant_id:data.user.id});
    if(r.error){setErr(r.error.message);setBusy(false);return}
    r=await s.from("invitations").update({status:"accepted",accepted_by:data.user.id,accepted_at:new Date().toISOString()}).eq("id",inv.id).eq("status","pending");
    if(r.error){setErr(r.error.message);setBusy(false);return}
    setDone(true);setBusy(false);
  }

  return <main className="shell"><div className="card" style={{maxWidth:520,margin:"60px auto"}}>
    <h1>🏠 Tenant invitation</h1>
    {busy&&!inv&&!err&&<p>Checking invitation…</p>}
    {err&&<div className="notice error">{err}</div>}
    {done&&<><div className="notice success">Account created and linked to Apartment {inv?.apartments?.apartment_number}.</div><button className="primary full" onClick={()=>router.push("/")}>Open app</button></>}
    {inv&&!done&&<><p>You have been invited to <b>{inv.buildings?.name}</b>, Apartment <b>{inv.apartments?.apartment_number}</b>.</p>
      <label>Your name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="John Smith"/>
      <label>Email</label><input value={inv.email} readOnly/>
      <label>Create password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)}/>
      <button className="primary full" disabled={!name||pw.length<8||busy} onClick={accept}>Create Tenant Account</button></>}
  </div></main>
}