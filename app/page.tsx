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
  const[msg,setMsg]=useState("");

  const[authMode,setAuthMode]=useState<"login"|"signup">("login");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[fullName,setFullName]=useState("");

  const[managerData,setManagerData]=useState<any>(null);
  const[tenantData,setTenantData]=useState<any>(null);
  const[issues,setIssues]=useState<any[]>([]);
  const[announcements,setAnnouncements]=useState<any[]>([]);

  const[showReport,setShowReport]=useState(false);
  const[severity,setSeverity]=useState<"yellow"|"red">("yellow");
  const[description,setDescription]=useState("");
  const[callback,setCallback]=useState(false);

  const[noticeType,setNoticeType]=useState<"planned_work"|"general"|"important">("planned_work");
  const[noticeTitle,setNoticeTitle]=useState("");
  const[noticeMessage,setNoticeMessage]=useState("");
  const[noticeStart,setNoticeStart]=useState("");
  const[noticeEnd,setNoticeEnd]=useState("");

  useEffect(()=>{
    s.auth.getSession().then(({data})=>{
      if(data.session){setSession(data.session);bootstrap(data.session.user.id)}
      else setLoading(false);
    });
    const {data:{subscription}}=s.auth.onAuthStateChange((_e,ss)=>{
      setSession(ss);
      if(ss) bootstrap(ss.user.id);
      else{
        setRole(null);setManagerData(null);setTenantData(null);
        setIssues([]);setAnnouncements([]);setLoading(false);
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  async function signIn(){
    setError("");setMsg("");
    if(!email||!password){setError("Enter your email and password.");return}
    const {data,error}=await s.auth.signInWithPassword({email,password});
    if(error){setError(error.message);return}
    if(data.user) await bootstrap(data.user.id);
  }

  async function signUpManager(){
    setError("");setMsg("");
    if(!fullName||!email||password.length<8){
      setError("Enter your name, email and a password of at least 8 characters.");
      return;
    }
    const {data,error}=await s.auth.signUp({
      email,password,
      options:{data:{full_name:fullName,role:"company_admin"}}
    });
    if(error){setError(error.message);return}
    if(data.session&&data.user){
      setSession(data.session);await bootstrap(data.user.id);
    }else{
      setMsg("Account created. Confirm your email if confirmations are enabled, then log in.");
      setAuthMode("login");
    }
  }

  async function bootstrap(uid:string){
    setLoading(true);setError("");
    const {data:p,error:pe}=await s.from("profiles").select("id,full_name,email,role").eq("id",uid).single();
    if(pe){setError(pe.message);setLoading(false);return}
    setRole(p.role);
    if(p.role==="tenant") await loadTenant(uid,p);
    else await loadManager(uid,p);
    setLoading(false);
  }

  async function loadTenant(uid:string,profile:any){
    const {data:at,error:ae}=await s.from("apartment_tenants")
      .select("apartment_id,apartments(id,apartment_number,monthly_fee,fee_due_day,building_id,buildings(id,name,address))")
      .eq("tenant_id",uid).is("ended_at",null).maybeSingle();

    if(ae){setError(ae.message);return}
    if(!at){setError("No active apartment is linked to this tenant.");return}

    const apt:any=at.apartments;
    setTenantData({profile,apartment:apt,building:apt.buildings});

    const {data:i,error:ie}=await s.from("issues")
      .select("id,severity,description,callback_requested,status,created_at,acknowledged_at,resolved_at")
      .eq("tenant_id",uid).order("created_at",{ascending:false});
    if(ie){setError(ie.message);return}
    setIssues(i||[]);

    const {data:n,error:ne}=await s.from("announcements")
      .select("id,type,title,message,starts_at,ends_at,created_at")
      .eq("building_id",apt.building_id)
      .order("created_at",{ascending:false});
    if(ne){setError(ne.message);return}
    setAnnouncements(n||[]);
  }

  async function loadManager(uid:string,profile:any){
    const {data:m,error:me}=await s.from("company_members").select("company_id").eq("user_id",uid).limit(1);
    if(me){setError(me.message);return}
    if(!m?.[0]){setManagerData({profile,buildings:[],apartments:[],issues:[]});return}

    const {data:b,error:be}=await s.from("buildings")
      .select("id,name,address,total_apartments")
      .eq("company_id",m[0].company_id);
    if(be){setError(be.message);return}

    let aps:any[]=[]; let allIssues:any[]=[]; let notices:any[]=[];
    if(b?.[0]){
      const {data:a}=await s.from("apartments")
        .select("id,apartment_number")
        .eq("building_id",b[0].id).order("apartment_number");
      aps=a||[];

      const {data:i}=await s.from("issues")
        .select("id,severity,description,callback_requested,status,created_at,apartment_id")
        .eq("building_id",b[0].id).order("created_at",{ascending:false});
      allIssues=i||[];

      const {data:n}=await s.from("announcements")
        .select("id,type,title,message,starts_at,ends_at,created_at")
        .eq("building_id",b[0].id).order("created_at",{ascending:false});
      notices=n||[];
    }

    setAnnouncements(notices);
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

  async function createAnnouncement(){
    if(!session||!managerData?.buildings?.[0])return;
    if(!noticeTitle.trim()||!noticeMessage.trim()){
      setError("Enter a title and message for the notice.");return
    }
    setError("");setMsg("");

    const {error:e}=await s.from("announcements").insert({
      building_id:managerData.buildings[0].id,
      manager_id:session.user.id,
      type:noticeType,
      title:noticeTitle.trim(),
      message:noticeMessage.trim(),
      starts_at:noticeStart?new Date(noticeStart).toISOString():null,
      ends_at:noticeEnd?new Date(noticeEnd).toISOString():null
    });

    if(e){setError(e.message);return}

    setNoticeTitle("");setNoticeMessage("");setNoticeStart("");setNoticeEnd("");
    setMsg("Building notice published.");
    await loadManager(session.user.id,managerData.profile);
  }

  function noticeIcon(type:string){
    if(type==="planned_work")return "🔧";
    if(type==="important")return "⚠️";
    return "📣";
  }

  if(loading)return <main className="shell"><div className="card"><h1>Loading Building Manager…</h1></div></main>;

  if(!session)return <main className="shell">
    <div className="card authCard">
      <h1>🏠 Building Manager</h1>
      <p>{authMode==="login"?"Sign in to continue.":"Create a manager account."}</p>
      {error&&<div className="notice error">{error}</div>}
      {msg&&<div className="notice success">{msg}</div>}

      {authMode==="signup"&&<>
        <label>Full name</label>
        <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your name"/>
      </>}

      <label>Email</label>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>

      <label>Password</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/>

      <button className="primary full" onClick={authMode==="login"?signIn:signUpManager}>
        {authMode==="login"?"Log in":"Create manager account"}
      </button>

      <button className="secondary full" onClick={()=>{setAuthMode(authMode==="login"?"signup":"login");setError("");setMsg("")}}>
        {authMode==="login"?"Create a manager account":"Back to login"}
      </button>
    </div>
  </main>;

  if(role==="tenant"&&tenantData){
    const active=issues.find(i=>i.status!=="resolved");
    const color=active?.severity==="red"?"#df6d67":active?.severity==="yellow"?"#e9c65b":"#78b77b";

    return <main className="shell">
      <div className="top">
        <div>
          <b>🏠 {tenantData.building.name}</b>
          <div className="muted">Resident Portal • Apartment {tenantData.apartment.apartment_number}</div>
        </div>
        <button className="danger" onClick={()=>s.auth.signOut()}>Sign out</button>
      </div>

      {error&&<div className="notice error">{error}</div>}
      {msg&&<div className="notice success">{msg}</div>}

      <div className="card">
        <div className="row">
          <div><h2>Hello, {tenantData.profile.full_name}</h2><p>{tenantData.building.address}</p></div>
          <div style={{width:56,height:56,borderRadius:"50%",background:color,boxShadow:`0 0 0 7px ${color}33`}}></div>
        </div>
      </div>

      <button className="card" style={{width:"100%",textAlign:"left",cursor:"pointer"}} onClick={()=>setShowReport(true)}>
        <div className="row">
          <div><h2 style={{margin:0}}>🏢 Building Manager</h2><p style={{marginBottom:0}}>Tap to make a direct report</p></div>
          <b>›</b>
        </div>
      </button>

      <div className="grid2">
        <div className="card">
          <div className="muted">Apartment</div>
          <div className="stat">{tenantData.apartment.apartment_number}</div>
        </div>

        <div className="card">
          <div className="muted">Monthly fee</div>
          <div className="stat">€{Number(tenantData.apartment.monthly_fee||0).toFixed(2)}</div>
          <div className="muted">Due day: {tenantData.apartment.fee_due_day}</div>
        </div>
      </div>

      <div className="card">
        <div className="row"><h2>My Issues</h2><span className="tag">{issues.length}</span></div>
        {issues.length===0?<p>No issues submitted yet.</p>:issues.map(i=><div className="issue" key={i.id}>
          <div className="row">
            <b>{i.severity==="red"?"🔴 Bigger issue":"🟡 Small discomfort"}</b>
            <span className="tag">{String(i.status).replace("_"," ")}</span>
          </div>
          <p>{i.description}</p>
          {i.callback_requested&&<div className="muted">☎ Callback requested</div>}
          <div className="muted">{new Date(i.created_at).toLocaleString()}</div>
        </div>)}
      </div>

      <div className="card">
        <div className="row"><h2>🔔 Notifications</h2><span className="tag">{announcements.length}</span></div>
        {announcements.length===0?<p>No building notices yet.</p>:announcements.map(n=><div className="issue" key={n.id}>
          <div className="row">
            <b>{noticeIcon(n.type)} {n.title}</b>
            <span className="tag">{n.type.replace("_"," ")}</span>
          </div>
          <p>{n.message}</p>
          {n.starts_at&&<div className="muted">Starts: {new Date(n.starts_at).toLocaleString()}</div>}
          {n.ends_at&&<div className="muted">Ends: {new Date(n.ends_at).toLocaleString()}</div>}
        </div>)}
      </div>

      {showReport&&<div className="modal"><div className="modalcard">
        <h2>Report an issue</h2>

        <div className="grid2">
          <button className={severity==="yellow"?"yellowChoice":"secondary"} onClick={()=>setSeverity("yellow")}>🟡 Small discomfort</button>
          <button className={severity==="red"?"redChoice":"secondary"} onClick={()=>setSeverity("red")}>🔴 Bigger issue</button>
        </div>

        <label>Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the problem…"/>

        <label className="check">
          <input type="checkbox" checked={callback} onChange={e=>setCallback(e.target.checked)}/>
          Request a callback
        </label>

        <button className="primary full" onClick={submitIssue}>Submit Report</button>
        <button className="secondary full" onClick={()=>setShowReport(false)}>Cancel</button>
      </div></div>}
    </main>
  }

  return <main className="shell">
    <div className="top">
      <div>
        <b>🏠 Building Manager</b>
        <div className="muted">{managerData?.profile?.full_name} • Manager Portal</div>
      </div>
      <button className="danger" onClick={()=>s.auth.signOut()}>Sign out</button>
    </div>

    {error&&<div className="notice error">{error}</div>}
    {msg&&<div className="notice success">{msg}</div>}

    <div className="card">
      <h2>Manager Dashboard</h2>
      <p>{managerData?.buildings?.[0]?.name||"No building"}</p>
    </div>

    <div className="card">
      <div className="row"><h2>Issues</h2><span className="tag">{managerData?.issues?.length||0}</span></div>

      {(managerData?.issues||[]).length===0?<p>No tenant issues yet.</p>:(managerData.issues||[]).map((i:any)=><div className="issue" key={i.id}>
        <div className="row">
          <b>{i.severity==="red"?"🔴":"🟡"} Apartment {managerData.apartments.find((a:any)=>a.id===i.apartment_id)?.apartment_number||"?"}</b>
          <span className="tag">{String(i.status).replace("_"," ")}</span>
        </div>
        <p>{i.description}</p>
        {i.callback_requested&&<div className="muted">☎ Callback requested</div>}

        <div className="row actions" style={{marginTop:10}}>
          {i.status==="submitted"&&<button className="secondary" onClick={()=>updateIssue(i.id,"acknowledged")}>Acknowledge</button>}
          {i.status!=="resolved"&&<button className="secondary" onClick={()=>updateIssue(i.id,"in_progress")}>In Progress</button>}
          {i.status!=="resolved"&&<button className="primary" onClick={()=>updateIssue(i.id,"resolved")}>Resolve</button>}
        </div>
      </div>)}
    </div>

    <div className="card">
      <h2>📣 Publish Building Notice</h2>
      <p>Send planned works or other building-wide information to all tenants.</p>

      <label>Notice type</label>
      <select value={noticeType} onChange={e=>setNoticeType(e.target.value as any)}>
        <option value="planned_work">🔧 Planned works</option>
        <option value="general">📣 General announcement</option>
        <option value="important">⚠️ Important notice</option>
      </select>

      <label>Title</label>
      <input value={noticeTitle} onChange={e=>setNoticeTitle(e.target.value)} placeholder="Elevator maintenance"/>

      <label>Message</label>
      <textarea value={noticeMessage} onChange={e=>setNoticeMessage(e.target.value)} placeholder="Describe what tenants need to know…"/>

      <div className="grid2">
        <div>
          <label>Starts (optional)</label>
          <input type="datetime-local" value={noticeStart} onChange={e=>setNoticeStart(e.target.value)}/>
        </div>

        <div>
          <label>Ends (optional)</label>
          <input type="datetime-local" value={noticeEnd} onChange={e=>setNoticeEnd(e.target.value)}/>
        </div>
      </div>

      <button className="primary full" onClick={createAnnouncement}>Publish Notice</button>
    </div>

    <div className="card">
      <div className="row"><h2>Published Notices</h2><span className="tag">{announcements.length}</span></div>
      {announcements.length===0?<p>No notices published yet.</p>:announcements.map(n=><div className="issue" key={n.id}>
        <div className="row">
          <b>{noticeIcon(n.type)} {n.title}</b>
          <span className="tag">{n.type.replace("_"," ")}</span>
        </div>
        <p>{n.message}</p>
        {n.starts_at&&<div className="muted">Starts: {new Date(n.starts_at).toLocaleString()}</div>}
        {n.ends_at&&<div className="muted">Ends: {new Date(n.ends_at).toLocaleString()}</div>}
      </div>)}
    </div>
  </main>
}