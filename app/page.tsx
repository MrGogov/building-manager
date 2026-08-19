 "use client";
import {useEffect,useState} from "react";
import {createClient} from "../lib/supabase-browser";

type Role="company_admin"|"manager"|"tenant"|null;

export default function Home(){
  const s=createClient();
  const[session,setSession]=useState<any>(null);
  const[role,setRole]=useState<Role>(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState("");

  const[managerData,setManagerData]=useState<any>(null);
  const[tenantData,setTenantData]=useState<any>(null);
  const[issues,setIssues]=useState<any[]>([]);
  const[showReport,setShowReport]=useState(false);
  const[severity,setSeverity]=useState<"yellow"|"red">("yellow");
  const[description,setDescription]=useState("");
  const[callback,setCallback]=useState(false);
  const[msg,setMsg]=useState("");

  useEffect(()=>{
    s.auth.getSession().then(({data})=>{
      if(data.session){
        setSession(data.session);
        bootstrap(data.session.user.id);
      } else setLoading(false);
    });
    const {data:{subscription}}=s.auth.onAuthStateChange((_e,ss)=>{
      setSession(ss);
      if(ss) bootstrap(ss.user.id);
      else {setRole(null);setLoading(false)}
    });
    return()=>subscription.unsubscribe();
  },[]);

  async function bootstrap(uid:string){
    setLoading(true);setError("");
    const {data:p,error:pe}=await s.from("profiles").select("id,full_name,email,role").eq("id",uid).single();
    if(pe){setError(pe.message);setLoading(false);return}
    setRole(p.role);

    if(p.role==="tenant") await loadTenant(uid,p);
    else await loadManager(uid,p);

    setLoading(false);
  }

  async function loadTenant(uid:string, profile:any){
    const {data:at,error:ae}=await s.from("apartment_tenants")
      .select("apartment_id,apartments(id,apartment_number,monthly_fee,fee_due_day,building_id,buildings(id,name,address))")
      .eq("tenant_id",uid).is("ended_at",null).maybeSingle();
    if(ae){setError(ae.message);return}
    if(!at){setError("No active apartment is linked to this tenant.");return}
    const apt:any=at.apartments;
    setTenantData({profile,apartment:apt,building:apt.buildings});
    const {data:i}=await s.from("issues")
      .select("id,severity,description,callback_requested,status,created_at,acknowledged_at,resolved_at")
      .eq("tenant_id",uid).order("created_at",{ascending:false});
    setIssues(i||[]);
  }

  async function loadManager(uid:string, profile:any){
    const {data:m}=await s.from("company_members").select("company_id").eq("user_id",uid).limit(1);
    if(!m?.[0]){setManagerData({profile,buildings:[],apartments:[],issues:[]});return}
    const {data:b}=await s.from("buildings").select("id,name,address,total_apartments").eq("company_id",m[0].company_id);
    let aps:any[]=[]; let allIssues:any[]=[];
    if(b?.[0]){
      const {data:a}=await s.from("apartments").select("id,apartment_number").eq("building_id",b[0].id).order("apartment_number");
      aps=a||[];
      const {data:i}=await s.from("issues")
        .select("id,severity,description,callback_requested,status,created_at,apartment_id")
        .eq("building_id",b[0].id).order("created_at",{ascending:false});
      allIssues=i||[];
    }
    setManagerData({profile,buildings:b||[],apartments:aps,issues:allIssues});
  }

  async function submitIssue(){
    if(!tenantData||!session)return;
    if(!description.trim()){setError("Please describe the issue.");return}
    setError("");setMsg("");
    const {error:e}=await s.from("issues").insert({
      building_id:tenantData.building.id,
      apartment_id:tenantData.apartment.id,
      tenant_id:session.user.id,
      severity,
      description:description.trim(),
      callback_requested:callback
    });
    if(e){setError(e.message);return}
    setShowReport(false);setDescription("");setCallback(false);
    setMsg("Issue submitted to the building manager.");
    await loadTenant(session.user.id,tenantData.profile);
  }

  async function updateIssue(id:string,status:"acknowledged"|"in_progress"|"resolved"){
    const patch:any={status};
    if(status==="acknowledged")patch.acknowledged_at=new Date().toISOString();
    if(status==="resolved")patch.resolved_at=new Date().toISOString();
    const {error:e}=await s.from("issues").update(patch).eq("id",id);
    if(e){setError(e.message);return}
    setMsg("Issue status updated.");
    await loadManager(session.user.id,managerData.profile);
  }

  if(loading)return <main className="shell"><div className="card"><h1>Loading Building Manager…</h1></div></main>;
  if(!session)return <main className="shell"><div className="card"><h1>🏠 Building Manager</h1><p>Please sign in.</p></div></main>;

  if(role==="tenant"&&tenantData){
    const active=issues.find(i=>i.status!=="resolved");
    const color=active?.severity==="red"?"#df6d67":active?.severity==="yellow"?"#e9c65b":"#78b77b";
    return <main className="shell">
      <div className="top"><div><b>🏠 Building Manager</b><div className="muted">{tenantData.building.name} • Apartment {tenantData.apartment.apartment_number}</div></div><button className="danger" onClick={()=>s.auth.signOut()}>Sign out</button></div>
      {error&&<div className="notice error">{error}</div>}
      {msg&&<div className="notice success">{msg}</div>}

      <div className="card">
        <div className="row">
          <div><h2>Hello, {tenantData.profile.full_name}</h2><p>{tenantData.building.address}</p></div>
          <div style={{width:56,height:56,borderRadius:"50%",background:color,boxShadow:`0 0 0 7px ${color}33`}}></div>
        </div>
      </div>

      <button className="card" style={{width:"100%",textAlign:"left",cursor:"pointer"}} onClick={()=>setShowReport(true)}>
        <div className="row"><div><h2 style={{margin:0}}>🏢 Building Manager</h2><p style={{marginBottom:0}}>Tap to make a direct report</p></div><b>›</b></div>
      </button>

      <div className="grid2">
        <div className="card"><div className="muted">Apartment</div><div className="stat">{tenantData.apartment.apartment_number}</div></div>
        <div className="card"><div className="muted">Monthly fee</div><div className="stat">€{Number(tenantData.apartment.monthly_fee||0).toFixed(2)}</div><div className="muted">Due day: {tenantData.apartment.fee_due_day}</div></div>
      </div>

      <div className="card">
        <div className="row"><h2>My Issues</h2><span className="tag">{issues.length}</span></div>
        {issues.length===0?<p>No issues submitted yet.</p>:issues.map(i=><div className="issue" key={i.id}>
          <div className="row"><b>{i.severity==="red"?"🔴 Bigger issue":"🟡 Small discomfort"}</b><span className="tag">{i.status.replace("_"," ")}</span></div>
          <p>{i.description}</p>
          {i.callback_requested&&<div className="muted">☎ Callback requested</div>}
          <div className="muted">{new Date(i.created_at).toLocaleString()}</div>
        </div>)}
      </div>

      <div className="card">
        <h2>🔔 Notifications</h2>
        <p>Planned works, fee reminders and building notices will appear here next.</p>
      </div>

      {showReport&&<div className="modal"><div className="modalcard">
        <h2>Report an issue</h2>
        <div className="grid2">
          <button className={severity==="yellow"?"yellowChoice":"secondary"} onClick={()=>setSeverity("yellow")}>🟡 Small discomfort</button>
          <button className={severity==="red"?"redChoice":"secondary"} onClick={()=>setSeverity("red")}>🔴 Bigger issue</button>
        </div>
        <label>Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the problem…"/>
        <label className="check"><input type="checkbox" checked={callback} onChange={e=>setCallback(e.target.checked)}/> Request a callback</label>
        <button className="primary full" onClick={submitIssue}>Submit Report</button>
        <button className="secondary full" onClick={()=>setShowReport(false)}>Cancel</button>
      </div></div>}
    </main>
  }

  return <main className="shell">
    <div className="top"><div><b>🏠 Building Manager</b><div className="muted">{managerData?.profile?.full_name}</div></div><button className="danger" onClick={()=>s.auth.signOut()}>Sign out</button></div>
    {error&&<div className="notice error">{error}</div>}
    {msg&&<div className="notice success">{msg}</div>}
    <div className="card"><h2>Manager Dashboard</h2><p>{managerData?.buildings?.[0]?.name||"No building"}</p></div>
    <div className="card">
      <div className="row"><h2>Issues</h2><span className="tag">{managerData?.issues?.length||0}</span></div>
      {(managerData?.issues||[]).length===0?<p>No tenant issues yet.</p>:(managerData.issues||[]).map((i:any)=><div className="issue" key={i.id}>
        <div className="row"><b>{i.severity==="red"?"🔴":"🟡"} Apartment {managerData.apartments.find((a:any)=>a.id===i.apartment_id)?.apartment_number||"?"}</b><span className="tag">{i.status.replace("_"," ")}</span></div>
        <p>{i.description}</p>
        {i.callback_requested&&<div className="muted">☎ Callback requested</div>}
        <div className="row" style={{marginTop:10}}>
          {i.status==="submitted"&&<button className="secondary" onClick={()=>updateIssue(i.id,"acknowledged")}>Acknowledge</button>}
          {i.status!=="resolved"&&<button className="secondary" onClick={()=>updateIssue(i.id,"in_progress")}>In Progress</button>}
          {i.status!=="resolved"&&<button className="primary" onClick={()=>updateIssue(i.id,"resolved")}>Resolve</button>}
        </div>
      </div>)}
    </div>
  </main>
}