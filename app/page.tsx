 "use client";
import {useEffect,useMemo,useState} from "react";
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
  const[email,setEmail]=useState(""); const[password,setPassword]=useState(""); const[fullName,setFullName]=useState("");

  const[managerData,setManagerData]=useState<any>(null);
  const[tenantData,setTenantData]=useState<any>(null);
  const[issues,setIssues]=useState<any[]>([]);
  const[announcements,setAnnouncements]=useState<any[]>([]);
  const[fees,setFees]=useState<any[]>([]);
  const[community,setCommunity]=useState<any[]>([]);
  const[avatarUploading,setAvatarUploading]=useState(false);

  const[showReport,setShowReport]=useState(false);
  const[issueFilter,setIssueFilter]=useState<"all"|"yellow"|"red"|"active"|"resolved">("active");
  const[notificationsSeen,setNotificationsSeen]=useState(false);
  const[severity,setSeverity]=useState<"yellow"|"red">("yellow");
  const[description,setDescription]=useState(""); const[callback,setCallback]=useState(false);

  const[noticeType,setNoticeType]=useState<"planned_work"|"general"|"important">("planned_work");
  const[noticeTitle,setNoticeTitle]=useState(""); const[noticeMessage,setNoticeMessage]=useState("");
  const[noticeStart,setNoticeStart]=useState(""); const[noticeEnd,setNoticeEnd]=useState("");

  const[currentPeriod,setCurrentPeriod]=useState(new Date().toISOString().slice(0,7));
  const[selectedApartment,setSelectedApartment]=useState<any>(null);
  const[selectedApartmentId,setSelectedApartmentId]=useState("");
  const[feeAmount,setFeeAmount]=useState("");
  const[feeDueDay,setFeeDueDay]=useState("1");

  useEffect(()=>{
    s.auth.getSession().then(({data})=>{if(data.session){setSession(data.session);bootstrap(data.session.user.id)} else setLoading(false)});
    const {data:{subscription}}=s.auth.onAuthStateChange((_e,ss)=>{
      setSession(ss);
      if(ss) bootstrap(ss.user.id);
      else {setRole(null);setManagerData(null);setTenantData(null);setIssues([]);setAnnouncements([]);setFees([]);setLoading(false)}
    });
    return()=>subscription.unsubscribe();
  },[]);

  async function signIn(){
    setError("");setMsg("");
    const {data,error}=await s.auth.signInWithPassword({email,password});
    if(error){setError(error.message);return}
    if(data.user) await bootstrap(data.user.id);
  }

  async function signUpManager(){
    setError("");setMsg("");
    if(!fullName||!email||password.length<8){setError("Enter your name, email and a password of at least 8 characters.");return}
    const {data,error}=await s.auth.signUp({email,password,options:{data:{full_name:fullName,role:"company_admin"}}});
    if(error){setError(error.message);return}
    if(data.session&&data.user){setSession(data.session);await bootstrap(data.user.id)}
    else {setMsg("Account created. Confirm your email if confirmations are enabled, then log in.");setAuthMode("login")}
  }

  async function bootstrap(uid:string){
    setLoading(true);setError("");
    const {data:p,error:pe}=await s.from("profiles").select("id,full_name,email,role,avatar_url").eq("id",uid).single();
    if(pe){setError(pe.message);setLoading(false);return}
    setRole(p.role);
    if(p.role==="tenant") await loadTenant(uid,p); else await loadManager(uid,p);
    setLoading(false);
  }

  function notificationSeenKey(buildingId:string,uid:string){
    return `bm_notice_seen_${buildingId}_${uid}`;
  }

  function markNotificationsSeen(){
    if(!tenantData||!session)return;
    const latest=announcements[0]?.id||"none";
    localStorage.setItem(notificationSeenKey(tenantData.building.id,session.user.id),latest);
    setNotificationsSeen(true);
    document.getElementById("tenantNotifications")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function loadTenant(uid:string,profile:any){
    const {data:at,error:ae}=await s.from("apartment_tenants")
      .select("apartment_id,apartments(id,apartment_number,monthly_fee,fee_due_day,building_id,buildings(id,name,address))")
      .eq("tenant_id",uid).is("ended_at",null).maybeSingle();
    if(ae){setError(ae.message);return}
    if(!at){setError("No active apartment is linked to this tenant.");return}
    const apt:any=at.apartments;
    setTenantData({profile,apartment:apt,building:apt.buildings});

    const {data:i}=await s.from("issues").select("*").eq("tenant_id",uid).order("created_at",{ascending:false});
    setIssues(i||[]);
    const {data:n}=await s.from("announcements").select("*").eq("building_id",apt.building_id).order("created_at",{ascending:false});
    setAnnouncements(n||[]);
    const latestNoticeId=n?.[0]?.id||"none";
    const seen=typeof window!=="undefined"?localStorage.getItem(notificationSeenKey(apt.building_id,uid)):null;
    setNotificationsSeen(seen===latestNoticeId);
    const {data:f}=await s.from("fee_records").select("*").eq("apartment_id",apt.id).order("period_month",{ascending:false});
    setFees(f||[]);

    const {data:c,error:ce}=await s.rpc("get_building_community_status",{p_building_id:apt.building_id});
    if(ce){setError(ce.message);return}
    setCommunity(c||[]);
  }

  async function loadManager(uid:string,profile:any){
    const {data:m,error:me}=await s.from("company_members").select("company_id").eq("user_id",uid).limit(1);
    if(me){setError(me.message);return}
    if(!m?.[0]){setManagerData({profile,buildings:[],apartments:[],issues:[]});return}
    const {data:b}=await s.from("buildings").select("id,name,address,total_apartments").eq("company_id",m[0].company_id);
    let aps:any[]=[];let allIssues:any[]=[];let notices:any[]=[];let allFees:any[]=[];
    if(b?.[0]){
      const {data:a}=await s.from("apartments").select("id,apartment_number,monthly_fee,fee_due_day").eq("building_id",b[0].id).order("apartment_number");
      aps=a||[];
      const {data:i}=await s.from("issues").select("*").eq("building_id",b[0].id).order("created_at",{ascending:false});
      allIssues=i||[];
      const {data:n}=await s.from("announcements").select("*").eq("building_id",b[0].id).order("created_at",{ascending:false});
      notices=n||[];
      const {data:f}=await s.from("fee_records").select("*").eq("building_id",b[0].id).order("due_date",{ascending:false});
      allFees=f||[];
    }
    setAnnouncements(notices);setFees(allFees);
    setManagerData({profile,buildings:b||[],apartments:aps,issues:allIssues});
    if(aps.length){
      const keep=aps.find((a:any)=>a.id===selectedApartmentId);
      const chosen=keep||aps[0];
      setSelectedApartmentId(chosen.id);
      setSelectedApartment(chosen);
      setFeeAmount(String(chosen.monthly_fee||0));
      setFeeDueDay(String(chosen.fee_due_day||1));
    }

    if(b?.[0]){
      const {data:c,error:ce}=await s.rpc("get_building_community_status",{p_building_id:b[0].id});
      if(ce){setError(ce.message);return}
      setCommunity(c||[]);
    }else{
      setCommunity([]);
    }
  }

  async function submitIssue(){
    if(!tenantData||!session||!description.trim())return;
    const {error:e}=await s.from("issues").insert({building_id:tenantData.building.id,apartment_id:tenantData.apartment.id,tenant_id:session.user.id,severity,description:description.trim(),callback_requested:callback});
    if(e){setError(e.message);return}
    setShowReport(false);setDescription("");setCallback(false);setMsg("Issue submitted to the building manager.");
    await loadTenant(session.user.id,tenantData.profile);
  }

  async function updateIssue(id:string,status:"acknowledged"|"in_progress"|"resolved"){
    const patch:any={status};
    if(status==="acknowledged")patch.acknowledged_at=new Date().toISOString();
    if(status==="resolved")patch.resolved_at=new Date().toISOString();
    const {error:e}=await s.from("issues").update(patch).eq("id",id);
    if(e){setError(e.message);return}
    setMsg("Issue status updated.");await loadManager(session.user.id,managerData.profile);
  }

  async function createAnnouncement(){
    if(!session||!managerData?.buildings?.[0]||!noticeTitle.trim()||!noticeMessage.trim())return;
    const {error:e}=await s.from("announcements").insert({
      building_id:managerData.buildings[0].id,manager_id:session.user.id,type:noticeType,title:noticeTitle.trim(),message:noticeMessage.trim(),
      starts_at:noticeStart?new Date(noticeStart).toISOString():null,ends_at:noticeEnd?new Date(noticeEnd).toISOString():null
    });
    if(e){setError(e.message);return}
    setNoticeTitle("");setNoticeMessage("");setNoticeStart("");setNoticeEnd("");setMsg("Building notice published.");
    await loadManager(session.user.id,managerData.profile);
  }

  async function saveApartmentFee(){
    if(!selectedApartment)return;
    const amount=Number(feeAmount), dueDay=Number(feeDueDay);
    if(Number.isNaN(amount)||amount<0||dueDay<1||dueDay>31){setError("Enter a valid fee and due day.");return}
    const {error:e}=await s.from("apartments").update({monthly_fee:amount,fee_due_day:dueDay}).eq("id",selectedApartment.id);
    if(e){setError(e.message);return}

    const now=new Date();
    const y=now.getFullYear();
    const m=now.getMonth();
    const periodMonth=new Date(y,m,1);
    const lastDay=new Date(y,m+1,0).getDate();
    const dueDate=new Date(y,m,Math.min(dueDay,lastDay));
    const dueIso=`${dueDate.getFullYear()}-${String(dueDate.getMonth()+1).padStart(2,"0")}-${String(dueDate.getDate()).padStart(2,"0")}`;
    const periodIso=`${periodMonth.getFullYear()}-${String(periodMonth.getMonth()+1).padStart(2,"0")}-01`;

    const {data:existing}=await s.from("fee_records")
      .select("id,status")
      .eq("apartment_id",selectedApartment.id)
      .eq("period_month",periodIso)
      .maybeSingle();

    if(existing){
      const patch:any={amount,due_date:dueIso};
      if(existing.status!=="paid")patch.status=dueDate<new Date(new Date().setHours(0,0,0,0))?"overdue":"pending";
      const {error:fe}=await s.from("fee_records").update(patch).eq("id",existing.id);
      if(fe){setError(fe.message);return}
    }else if(amount>0){
      const {error:fe}=await s.from("fee_records").insert({
        building_id:managerData.buildings[0].id,
        apartment_id:selectedApartment.id,
        period_month:periodIso,
        amount,
        due_date:dueIso,
        status:dueDate<new Date(new Date().setHours(0,0,0,0))?"overdue":"pending"
      });
      if(fe){setError(fe.message);return}
    }

    setMsg("Apartment fee settings updated.");
    await loadManager(session.user.id,managerData.profile);
  }

  async function generateFees(){
    if(!managerData?.buildings?.[0])return;
    const period=currentPeriod+"-01";
    const {data,error}=await s.rpc("generate_monthly_fees",{p_building_id:managerData.buildings[0].id,p_period_month:period});
    if(error){setError(error.message);return}
    setMsg(`${data||0} monthly fee record(s) generated.`);
    await loadManager(session.user.id,managerData.profile);
  }

  async function markFee(id:string,paid:boolean){
    const current=fees.find((f:any)=>f.id===id);
    const {error:e}=await s.from("fee_records")
      .update({status:paid?"paid":"pending",paid_at:paid?new Date().toISOString():null})
      .eq("id",id);
    if(e){setError(e.message);return}

    if(paid&&current){
      const apt=managerData.apartments.find((a:any)=>a.id===current.apartment_id);
      if(apt){
        const currentPeriod=new Date(current.period_month+"T00:00:00");
        const nextPeriod=new Date(currentPeriod.getFullYear(),currentPeriod.getMonth()+1,1);
        const y=nextPeriod.getFullYear();
        const m=nextPeriod.getMonth();
        const dueDay=Math.max(1,Math.min(31,Number(apt.fee_due_day||1)));
        const lastDay=new Date(y,m+1,0).getDate();
        const nextDue=new Date(y,m,Math.min(dueDay,lastDay));

        const periodIso=`${y}-${String(m+1).padStart(2,"0")}-01`;
        const dueIso=`${y}-${String(m+1).padStart(2,"0")}-${String(nextDue.getDate()).padStart(2,"0")}`;

        const {data:existing,error:lookupError}=await s.from("fee_records")
          .select("id")
          .eq("apartment_id",current.apartment_id)
          .eq("period_month",periodIso)
          .maybeSingle();

        if(lookupError){setError(lookupError.message);return}

        if(!existing){
          const {error:nextError}=await s.from("fee_records").insert({
            building_id:current.building_id,
            apartment_id:current.apartment_id,
            period_month:periodIso,
            amount:Number(apt.monthly_fee||current.amount||0),
            due_date:dueIso,
            status:"pending"
          });
          if(nextError){setError(nextError.message);return}
        }
      }
    }

    setMsg(paid?"Fee marked as paid. Next month's due date is now prepared.":"Fee returned to pending.");
    await loadManager(session.user.id,managerData.profile);
  }

  async function uploadAvatar(file:File){
    if(!session||role!=="tenant")return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){
      setError("Please choose a JPG, PNG or WebP image.");return
    }
    if(file.size>2*1024*1024){
      setError("Profile picture must be smaller than 2 MB.");return
    }

    setAvatarUploading(true);setError("");setMsg("");
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
    const path=`${session.user.id}/profile.${ext}`;

    const {error:uploadError}=await s.storage.from("avatars").upload(path,file,{
      upsert:true,
      contentType:file.type,
      cacheControl:"3600"
    });
    if(uploadError){
      setError(uploadError.message);setAvatarUploading(false);return
    }

    const {data:urlData}=s.storage.from("avatars").getPublicUrl(path);
    const publicUrl=`${urlData.publicUrl}?v=${Date.now()}`;

    const {error:profileError}=await s.from("profiles")
      .update({avatar_url:publicUrl,updated_at:new Date().toISOString()})
      .eq("id",session.user.id);

    if(profileError){
      setError(profileError.message);setAvatarUploading(false);return
    }

    setTenantData({...tenantData,profile:{...tenantData.profile,avatar_url:publicUrl}});
    setCommunity((prev:any[])=>prev.map(r=>r.tenant_id===session.user.id?{...r,avatar_url:publicUrl}:r));
    setMsg("Profile picture updated.");
    setAvatarUploading(false);
  }

  function noticeIcon(type:string){return type==="planned_work"?"🔧":type==="important"?"⚠️":"📣"}
  function effectiveFeeStatus(f:any){
    if(!f)return "pending";
    if(f.status==="paid")return "paid";
    const today=new Date(); today.setHours(0,0,0,0);
    const due=new Date(f.due_date+"T00:00:00"); due.setHours(0,0,0,0);
    return due<today?"overdue":"pending";
  }

  function feeStatusClass(status:string){return status==="paid"?"feePaid":status==="overdue"?"feeOverdue":"feePending"}

  function tenantDueInfo(latestFee:any){
    if(!tenantData) return {dueDate:null as Date|null,glow:"",label:""};
    let dueDate:Date;

    if(latestFee?.due_date){
      dueDate=new Date(latestFee.due_date+"T00:00:00");
    }else{
      const now=new Date();
      const y=now.getFullYear();
      const m=now.getMonth();
      const configuredDay=Math.max(1,Math.min(31,Number(tenantData.apartment.fee_due_day||1)));
      const lastDay=new Date(y,m+1,0).getDate();
      dueDate=new Date(y,m,Math.min(configuredDay,lastDay));
    }

    const today=new Date(); today.setHours(0,0,0,0);
    const d=new Date(dueDate); d.setHours(0,0,0,0);
    const days=Math.ceil((d.getTime()-today.getTime())/86400000);

    if(latestFee&&effectiveFeeStatus(latestFee)==="paid") return {dueDate,glow:"feeGlowPaid",label:"Paid"};
    if(latestFee&&effectiveFeeStatus(latestFee)==="overdue") return {dueDate,glow:"feeGlowRed",label:"Overdue"};
    if(!latestFee&&days<0) return {dueDate,glow:"feeGlowRed",label:"Overdue"};
    if(days<=2) return {dueDate,glow:"feeGlowYellow",label:days===0?"Due today":days===1?"Due tomorrow":`Due in ${days} days`};
    return {dueDate,glow:"",label:""};
  }

  function statusClass(color:string){
    return color==="red"?"residentRed":color==="yellow"?"residentYellow":"residentGreen";
  }

  function initials(name:string){
    return (name||"?").split(/\s+/).filter(Boolean).slice(0,2).map((x:string)=>x[0]?.toUpperCase()).join("")||"?";
  }

  const pendingFees=useMemo(()=>fees.filter(f=>effectiveFeeStatus(f)!=="paid"),[fees]);

  const selectedApartmentCommunity=community.find((r:any)=>r.apartment_id===selectedApartmentId);
  const selectedApartmentIssues=(managerData?.issues||[]).filter((i:any)=>i.apartment_id===selectedApartmentId);
  const selectedApartmentFees=fees.filter((f:any)=>f.apartment_id===selectedApartmentId);
  const selectedApartmentOutstanding=selectedApartmentFees.find((f:any)=>effectiveFeeStatus(f)!=="paid");
  const selectedApartmentResolvedCount=selectedApartmentIssues.filter((i:any)=>i.status==="resolved").length;
  const selectedApartmentActiveCount=selectedApartmentIssues.filter((i:any)=>i.status!=="resolved").length;

  const managerIssues=managerData?.issues||[];
  const filteredManagerIssues=managerIssues.filter((i:any)=>{
    if(issueFilter==="yellow")return i.severity==="yellow"&&i.status!=="resolved";
    if(issueFilter==="red")return i.severity==="red"&&i.status!=="resolved";
    if(issueFilter==="active")return i.status!=="resolved";
    if(issueFilter==="resolved")return i.status==="resolved";
    return true;
  });

  if(loading)return <main className="shell"><div className="card"><h1>Loading…</h1></div></main>;

  if(!session)return <main className="shell"><div className="card authCard">
    <h1>🏠 Building Manager</h1><p>{authMode==="login"?"Sign in to continue.":"Create a manager account."}</p>
    {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}
    {authMode==="signup"&&<><label>Full name</label><input value={fullName} onChange={e=>setFullName(e.target.value)}/></>}
    <label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="primary full" onClick={authMode==="login"?signIn:signUpManager}>{authMode==="login"?"Log in":"Create manager account"}</button>
    <button className="secondary full" onClick={()=>setAuthMode(authMode==="login"?"signup":"login")}>{authMode==="login"?"Create a manager account":"Back to login"}</button>
  </div></main>;

  if(role==="tenant"&&tenantData){
    const active=issues.find(i=>i.status!=="resolved");
    const color=active?.severity==="red"?"#df6d67":active?.severity==="yellow"?"#e9c65b":"#78b77b";
    const latestFee=fees.find((f:any)=>effectiveFeeStatus(f)!=="paid")||fees[0];
    const dueInfo=tenantDueInfo(latestFee);
    return <main className="shell">
      <div className="top">
        <div><b>🏠 {tenantData.building.name}</b><div className="muted">Resident Portal • Apartment {tenantData.apartment.apartment_number}</div></div>
        <div className="headerActions">
          <button className="bellButton" onClick={markNotificationsSeen} aria-label="Notifications">
            🔔{announcements.length>0&&!notificationsSeen&&<span className="bellDot"></span>}
          </button>
          <button className="danger" onClick={()=>s.auth.signOut()}>Sign out</button>
        </div>
      </div>
      {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}

      <div className="card"><div className="row profileRow">
        <div><h2>Hello, {tenantData.profile.full_name}</h2><p>{tenantData.building.address}</p></div>
        <div className="profilePhotoWrap">
          <div className="profilePhoto" style={{borderColor:color,boxShadow:`0 0 0 7px ${color}33`}}>
            {tenantData.profile.avatar_url
              ? <img src={tenantData.profile.avatar_url} alt="Your profile"/>
              : <span>{initials(tenantData.profile.full_name)}</span>}
          </div>
          <label className="photoButton">
            {avatarUploading?"Uploading…":"Change photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={avatarUploading}
              onChange={e=>{
                const file=e.target.files?.[0];
                if(file)uploadAvatar(file);
                e.currentTarget.value="";
              }}
            />
          </label>
        </div>
      </div></div>

      <button className="card" style={{width:"100%",textAlign:"left"}} onClick={()=>setShowReport(true)}>
        <div className="row"><div><h2 style={{margin:0}}>🏢 Building Manager</h2><p style={{marginBottom:0}}>Tap to make a direct report</p></div><b>›</b></div>
      </button>

      <div className="card communityCard">
        <div className="row">
          <div><h2>Building Community</h2><div className="muted">Status only — issue details remain private.</div></div>
          <span className="tag">{community.length} residents</span>
        </div>

        <div className="communityStage">
          <button className="managerHub" onClick={()=>setShowReport(true)}>
            <span className="managerHubIcon">🏢</span>
            <span>Building Manager</span>
            <small>Direct report</small>
          </button>

          <div className="residentOval">
            {community.map((r:any,index:number)=>{
              const angle=(Math.PI*2*index/Math.max(community.length,1))-Math.PI/2;
              const x=50+43*Math.cos(angle);
              const y=62+30*Math.sin(angle);
              return <div className="residentItem ovalItem" key={r.apartment_id} style={{left:`${x}%`,top:`${y}%`}}>
                <div className={`residentAvatar ${statusClass(r.status_color)}`} title={`Apartment ${r.apartment_number}`}>
                  {r.avatar_url?<img src={r.avatar_url} alt="Resident"/>:<span>{initials(r.tenant_name)}</span>}
                </div>
                <div className="residentLabel">Apt {r.apartment_number}</div>
              </div>
            })}
          </div>
        </div>

        <div className="legend">
          <span><i className="dot greenDot"></i>No active issue</span>
          <span><i className="dot yellowDot"></i>Small discomfort</span>
          <span><i className="dot redDot"></i>Bigger issue</span>
        </div>
      </div>

      <div className="grid2">
        <div className="card"><div className="muted">Apartment</div><div className="stat">{tenantData.apartment.apartment_number}</div></div>
        <div className={`card monthlyFeeCard ${dueInfo.glow}`}><div className="row"><div className="muted">Monthly fee</div>{dueInfo.label&&<span className="feeAlertLabel">{dueInfo.label}</span>}</div><div className="stat">€{Number(tenantData.apartment.monthly_fee||0).toFixed(2)}</div><div className="muted">Due: {dueInfo.dueDate?dueInfo.dueDate.toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"}):"—"}</div></div>
      </div>

      <div className="card"><div className="row"><h2>My Active Issues</h2><span className="tag">{issues.filter(i=>i.status!=="resolved").length}</span></div>
        {issues.filter(i=>i.status!=="resolved").length===0?<p>No active issues.</p>:issues.filter(i=>i.status!=="resolved").map(i=><div className="issue" key={i.id}><div className="row"><b>{i.severity==="red"?"🔴 Bigger issue":"🟡 Small discomfort"}</b><span className="tag">{String(i.status).replace("_"," ")}</span></div><p>{i.description}</p>{i.callback_requested&&<div className="muted">☎ Callback requested</div>}</div>)}
      </div>

      <div className="card" id="tenantNotifications"><div className="row"><h2>🔔 Notifications</h2><span className="tag">{announcements.length}</span></div>
        {announcements.length===0?<p>No building notices yet.</p>:announcements.map(n=><div className="issue" key={n.id}><b>{noticeIcon(n.type)} {n.title}</b><p>{n.message}</p></div>)}
      </div>

      {showReport&&<div className="modal"><div className="modalcard"><h2>Report an issue</h2>
        <div className="grid2"><button className={severity==="yellow"?"yellowChoice":"secondary"} onClick={()=>setSeverity("yellow")}>🟡 Small discomfort</button><button className={severity==="red"?"redChoice":"secondary"} onClick={()=>setSeverity("red")}>🔴 Bigger issue</button></div>
        <label>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)}/>
        <label className="check"><input type="checkbox" checked={callback} onChange={e=>setCallback(e.target.checked)}/> Request a callback</label>
        <button className="primary full" onClick={submitIssue}>Submit Report</button><button className="secondary full" onClick={()=>setShowReport(false)}>Cancel</button>
      </div></div>}
    </main>
  }

  return <main className="shell">
    <div className="top"><div><b>🏠 Building Manager</b><div className="muted">{managerData?.profile?.full_name} • Manager Portal</div></div><button className="danger" onClick={()=>s.auth.signOut()}>Sign out</button></div>
    {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}

    <div className="card"><h2>Manager Dashboard</h2><p>{managerData?.buildings?.[0]?.name||"No building"}</p></div>

    <div className="card communityCard">
      <div className="row">
        <div><h2>Building Status</h2><div className="muted">Live resident overview by apartment.</div></div>
        <span className="tag">{community.length} residents</span>
      </div>

      <div className="communityStage managerView">
        <div className="managerHub staticHub">
          <span className="managerHubIcon">🏢</span>
          <span>Building Manager</span>
          <small>{managerData?.buildings?.[0]?.name||""}</small>
        </div>

        <div className="residentOval">
          {community.map((r:any,index:number)=>{
            const angle=(Math.PI*2*index/Math.max(community.length,1))-Math.PI/2;
            const x=50+43*Math.cos(angle);
            const y=55+38*Math.sin(angle);
            return <div className="residentItem ovalItem" key={r.apartment_id} style={{left:`${x}%`,top:`${y}%`}}>
              <div className={`residentAvatar ${statusClass(r.status_color)}`} title={`${r.tenant_name} • Apartment ${r.apartment_number}`}>
                {r.avatar_url?<img src={r.avatar_url} alt="Resident"/>:<span>{initials(r.tenant_name)}</span>}
              </div>
              <div className="residentLabel">Apt {r.apartment_number}</div>
            </div>
          })}
        </div>
      </div>
    </div>

    <div className="card">
      <div className="row"><div><h2>Issue Dashboard</h2><div className="muted">Active issues are separated from resolved history.</div></div><span className="tag">{managerIssues.length}</span></div>

      <div className="issueFilterGrid">
        <button className={`filterTile ${issueFilter==="active"?"filterActive":""}`} onClick={()=>setIssueFilter("active")}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.status!=="resolved").length}</span>
          <span>Active</span>
        </button>
        <button className={`filterTile yellowTile ${issueFilter==="yellow"?"filterActive":""}`} onClick={()=>setIssueFilter("yellow")}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.severity==="yellow"&&i.status!=="resolved").length}</span>
          <span>Yellow</span>
        </button>
        <button className={`filterTile redTile ${issueFilter==="red"?"filterActive":""}`} onClick={()=>setIssueFilter("red")}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.severity==="red"&&i.status!=="resolved").length}</span>
          <span>Red</span>
        </button>
        <button className={`filterTile ${issueFilter==="resolved"?"filterActive":""}`} onClick={()=>setIssueFilter("resolved")}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.status==="resolved").length}</span>
          <span>Resolved</span>
        </button>
      </div>

      <div className="filterBar">
        <span className="muted">Showing: {issueFilter}</span>
        {issueFilter!=="active"&&<button className="linkButton" onClick={()=>setIssueFilter("active")}>Back to active</button>}
      </div>

      {filteredManagerIssues.length===0?<p>No issues in this filter.</p>:filteredManagerIssues.map((i:any)=><div className="issue" key={i.id}><div className="row"><b>{i.severity==="red"?"🔴":"🟡"} Apartment {managerData.apartments.find((a:any)=>a.id===i.apartment_id)?.apartment_number||"?"}</b><span className="tag">{String(i.status).replace("_"," ")}</span></div><p>{i.description}</p>{i.callback_requested&&<div className="muted">☎ Callback requested</div>}<div className="row actions">{i.status==="submitted"&&<button className="secondary" onClick={()=>updateIssue(i.id,"acknowledged")}>Acknowledge</button>}{i.status!=="resolved"&&<button className="secondary" onClick={()=>updateIssue(i.id,"in_progress")}>In Progress</button>}{i.status!=="resolved"&&<button className="primary" onClick={()=>updateIssue(i.id,"resolved")}>Resolve</button>}</div></div>)}
    </div>

    <div className="card">
      <div className="row">
        <div>
          <h2>🏠 Apartment Overview</h2>
          <div className="muted">Tenant, fees and issue history for one apartment.</div>
        </div>
        {selectedApartmentCommunity
          ? <span className={`feeBadge ${statusClass(selectedApartmentCommunity.status_color)==="residentRed"?"feeOverdue":statusClass(selectedApartmentCommunity.status_color)==="residentYellow"?"feePending":"feePaid"}`}>
              {selectedApartmentCommunity.status_color}
            </span>
          : <span className="tag">VACANT</span>}
      </div>

      <label>Apartment</label>
      <select
        value={selectedApartmentId}
        onChange={e=>{
          const id=e.target.value;
          setSelectedApartmentId(id);
          const a=managerData.apartments.find((x:any)=>x.id===id);
          setSelectedApartment(a||null);
          if(a){
            setFeeAmount(String(a.monthly_fee||0));
            setFeeDueDay(String(a.fee_due_day||1));
          }
        }}
      >
        {(managerData?.apartments||[]).map((a:any)=>
          <option key={a.id} value={a.id}>Apartment {a.apartment_number}</option>
        )}
      </select>

      {selectedApartment&&<div className="apartmentSummaryGrid">
        <div className="summaryBox">
          <div className="muted">Tenant</div>
          <div className="summaryValue">{selectedApartmentCommunity?.tenant_name||"Vacant"}</div>
          <div className="muted">{selectedApartmentCommunity?"Active tenant account":"No active tenant"}</div>
        </div>

        <div className="summaryBox">
          <div className="muted">Monthly fee</div>
          <div className="summaryValue">€{Number(selectedApartment.monthly_fee||0).toFixed(2)}</div>
          <div className="muted">
            {selectedApartmentOutstanding
              ? `Due ${new Date(selectedApartmentOutstanding.due_date+"T00:00:00").toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}`
              : "No outstanding fee"}
          </div>
        </div>

        <div className="summaryBox">
          <div className="muted">Active issues</div>
          <div className="summaryValue">{selectedApartmentActiveCount}</div>
          <div className="muted">{selectedApartmentResolvedCount} resolved in history</div>
        </div>
      </div>}

      {selectedApartmentIssues.length>0&&<>
        <h3>Apartment issue history</h3>
        {selectedApartmentIssues.map((i:any)=><div className="issue compactIssue" key={i.id}>
          <div className="row">
            <b>{i.severity==="red"?"🔴 Bigger issue":"🟡 Small discomfort"}</b>
            <span className="tag">{String(i.status).replace("_"," ")}</span>
          </div>
          <p>{i.description}</p>
          {i.callback_requested&&<div className="muted">☎ Callback requested</div>}
        </div>)}
      </>}

      {selectedApartmentFees.length>0&&<>
        <h3>Fee history</h3>
        {selectedApartmentFees.slice(0,6).map((f:any)=><div className="feeHistoryRow" key={f.id}>
          <div>
            <b>{new Date(f.period_month+"T00:00:00").toLocaleDateString(undefined,{month:"long",year:"numeric"})}</b>
            <div className="muted">Due {new Date(f.due_date+"T00:00:00").toLocaleDateString()}</div>
          </div>
          <div className="row">
            <b>€{Number(f.amount).toFixed(2)}</b>
            <span className={`feeBadge ${feeStatusClass(effectiveFeeStatus(f))}`}>{effectiveFeeStatus(f)}</span>
          </div>
        </div>)}
      </>}
    </div>

    <div className="card">
      <div className="row"><div><h2>💶 Monthly Fees</h2><p>Fees advance automatically to the next due date when marked paid.</p></div><span className="tag">{pendingFees.length} pending</span></div>

      <h3>Selected apartment fee settings</h3>
      <p className="muted">Editing Apartment {selectedApartment?.apartment_number||"—"}. Change the apartment from Apartment Overview above.</p>

      {selectedApartment&&<div className="selectedApartmentEditor">
        <div className="grid2">
          <div>
            <label>Monthly fee (€)</label>
            <input type="number" min="0" step="0.01" value={feeAmount} onChange={e=>setFeeAmount(e.target.value)}/>
          </div>
          <div>
            <label>Recurring due day each month</label>
            <input type="number" min="1" max="31" value={feeDueDay} onChange={e=>setFeeDueDay(e.target.value)}/>
          </div>
        </div>
        <button className="primary full" onClick={saveApartmentFee}>Save Apartment Fee</button>
      </div>}
    </div>

    <div className="card">
      <div className="row"><h2>Pending Tenant Fees</h2><span className="tag">{pendingFees.length}</span></div>
      {pendingFees.length===0?<p>No pending fees.</p>:pendingFees.map(f=>{
        const a=managerData.apartments.find((x:any)=>x.id===f.apartment_id);
        return <div className="apt" key={f.id}>
          <div><b>Apartment {a?.apartment_number||"?"}</b><div className="muted">€{Number(f.amount).toFixed(2)} • due {new Date(f.due_date+"T00:00:00").toLocaleDateString()}</div></div>
          <div className="row"><span className={`feeBadge ${feeStatusClass(effectiveFeeStatus(f))}`}>{effectiveFeeStatus(f)}</span><button className="primary" onClick={()=>markFee(f.id,true)}>Mark Paid</button></div>
        </div>
      })}
    </div>

    <div className="card"><h2>📣 Publish Building Notice</h2>
      <label>Notice type</label><select value={noticeType} onChange={e=>setNoticeType(e.target.value as any)}><option value="planned_work">🔧 Planned works</option><option value="general">📣 General announcement</option><option value="important">⚠️ Important notice</option></select>
      <label>Title</label><input value={noticeTitle} onChange={e=>setNoticeTitle(e.target.value)}/>
      <label>Message</label><textarea value={noticeMessage} onChange={e=>setNoticeMessage(e.target.value)}/>
      <div className="grid2"><div><label>Starts</label><input type="datetime-local" value={noticeStart} onChange={e=>setNoticeStart(e.target.value)}/></div><div><label>Ends</label><input type="datetime-local" value={noticeEnd} onChange={e=>setNoticeEnd(e.target.value)}/></div></div>
      <button className="primary full" onClick={createAnnouncement}>Publish Notice</button>
    </div>


  </main>
}