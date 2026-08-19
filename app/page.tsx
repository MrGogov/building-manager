 "use client";
import {useEffect,useState} from "react";
import {createClient} from "../lib/supabase-browser";

export default function Home(){
  const s=createClient();
  const[session,setSession]=useState<any>(null);
  const[buildings,setBuildings]=useState<any[]>([]);
  const[apartments,setApartments]=useState<any[]>([]);
  const[invitations,setInvitations]=useState<any[]>([]);
  const[invite,setInvite]=useState<any>(null);
  const[email,setEmail]=useState("");
  const[msg,setMsg]=useState("");
  const[err,setErr]=useState("");
  const[lastLink,setLastLink]=useState("");

  useEffect(()=>{
    s.auth.getSession().then(({data})=>{
      if(data.session){setSession(data.session);load(data.session.user.id)}
    });
    const {data:{subscription}}=s.auth.onAuthStateChange((_e,ss)=>{
      if(ss){setSession(ss);load(ss.user.id)} else setSession(null)
    });
    return()=>subscription.unsubscribe();
  },[]);

  async function load(uid:string){
    const{data:m,error:me}=await s.from("company_members").select("company_id").eq("user_id",uid).limit(1);
    if(me){setErr(me.message);return}
    if(!m?.[0])return;

    const{data:b,error:be}=await s.from("buildings").select("id,name,address,total_apartments").eq("company_id",m[0].company_id);
    if(be){setErr(be.message);return}
    setBuildings(b||[]);

    if(b?.[0]){
      const{data:a}=await s.from("apartments").select("id,apartment_number").eq("building_id",b[0].id).order("apartment_number");
      setApartments(a||[]);
      const{data:i}=await s.from("invitations")
        .select("id,apartment_id,email,status,expires_at,token")
        .eq("building_id",b[0].id)
        .order("created_at",{ascending:false});
      setInvitations(i||[]);
    }
  }

  function invitationUrl(token:string){
    return `${location.origin}/invite?token=${encodeURIComponent(token)}`;
  }

  async function copyLink(url:string){
    try{
      await navigator.clipboard.writeText(url);
      setMsg("Invitation link copied.");
    }catch{
      setLastLink(url);
      setMsg("Copy the invitation link shown below.");
    }
  }

  async function createInvitation(){
    if(!invite||!session||!buildings[0])return;
    setErr("");setMsg("");setLastLink("");

    const existing=invitations.find(x=>
      x.apartment_id===invite.id &&
      x.status==="pending" &&
      new Date(x.expires_at)>new Date()
    );
    if(existing){
      const url=invitationUrl(existing.token);
      setLastLink(url);
      setErr("This apartment already has a pending invitation. Use the existing link below.");
      setInvite(null);
      return;
    }

    const{data,error}=await s.from("invitations").insert({
      building_id:buildings[0].id,
      apartment_id:invite.id,
      email:email.trim().toLowerCase(),
      invited_by:session.user.id
    }).select("id,token,expires_at").single();

    if(error){setErr(error.message);return}

    const url=invitationUrl(data.token);
    setLastLink(url);
    setInvite(null);setEmail("");
    setMsg(`Invitation created for Apartment ${invite.apartment_number}.`);
    await load(session.user.id);
  }

  if(!session)return <main className="shell">
    <div className="card">
      <h1>🏠 Building Manager</h1>
      <p>Your session is not active. Please return to the login screen and sign in.</p>
    </div>
  </main>;

  return <main className="shell">
    <div className="top">
      <b>🏠 Building Manager</b>
      <button className="danger" onClick={()=>s.auth.signOut().then(()=>location.reload())}>Sign out</button>
    </div>

    {err&&<div className="notice error">{err}</div>}
    {msg&&<div className="notice success">{msg}</div>}

    {lastLink&&<div className="card">
      <h2>Tenant invitation link</h2>
      <p>Send this secure link only to the invited tenant.</p>
      <input value={lastLink} readOnly onFocus={e=>e.currentTarget.select()}/>
      <button className="primary full" onClick={()=>copyLink(lastLink)}>Copy Link</button>
    </div>}

    <div className="card">
      <h2>Apartments & tenants</h2>
      <p>One authorized tenant account per apartment.</p>

      {apartments.map(a=>{
        const pending=invitations.find(i=>
          i.apartment_id===a.id &&
          i.status==="pending" &&
          new Date(i.expires_at)>new Date()
        );
        const pendingUrl=pending?invitationUrl(pending.token):"";

        return <div className="apt" key={a.id}>
          <div>
            <b>Apartment {a.apartment_number}</b>
            <div className="muted">
              {pending?`Invitation pending: ${pending.email}`:"No active tenant"}
            </div>
          </div>

          {pending?
            <button className="secondary" onClick={()=>{setLastLink(pendingUrl);copyLink(pendingUrl)}}>Copy Invite</button>
            :
            <button className="secondary" onClick={()=>setInvite(a)}>Invite Tenant</button>
          }
        </div>
      })}
    </div>

    {invite&&<div className="modal">
      <div className="modalcard">
        <h2>Invite tenant — Apartment {invite.apartment_number}</h2>
        <p>The invitation is locked to this apartment.</p>
        <label>Tenant email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tenant@example.com"/>
        <button className="primary full" disabled={!email.trim()} onClick={createInvitation}>Create Invitation</button>
        <button className="secondary full" onClick={()=>setInvite(null)}>Cancel</button>
      </div>
    </div>}
  </main>
}