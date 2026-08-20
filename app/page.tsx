 "use client";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "../lib/supabase-browser";
import {useLanguage} from "../lib/i18n";

type Role="company_admin"|"manager"|"tenant"|null;

export default function Home(){
  const s=createClient();
  const{language,setLanguage,t,dateLocale}=useLanguage();
  const[session,setSession]=useState<any>(null);
  const[role,setRole]=useState<Role>(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState("");
  const[msg,setMsg]=useState("");

  const[authMode,setAuthMode]=useState<"login"|"signup">("login");
  const[email,setEmail]=useState(""); const[password,setPassword]=useState(""); const[fullName,setFullName]=useState("");

  const[managerData,setManagerData]=useState<any>(null);
  const[selectedBuildingId,setSelectedBuildingId]=useState("");
  const[team,setTeam]=useState<any[]>([]);
  const[managerInvites,setManagerInvites]=useState<any[]>([]);
  const[teamInviteEmail,setTeamInviteEmail]=useState("");
  const[teamInviteBuildings,setTeamInviteBuildings]=useState<string[]>([]);
  const[lastManagerInviteLink,setLastManagerInviteLink]=useState("");
  const[editingManager,setEditingManager]=useState<any>(null);
  const[editingManagerBuildings,setEditingManagerBuildings]=useState<string[]>([]);
  const[tenantData,setTenantData]=useState<any>(null);
  const[issues,setIssues]=useState<any[]>([]);
  const[announcements,setAnnouncements]=useState<any[]>([]);
  const[fees,setFees]=useState<any[]>([]);
  const[community,setCommunity]=useState<any[]>([]);
  const[invitations,setInvitations]=useState<any[]>([]);
  const[inviteApartment,setInviteApartment]=useState<any>(null);
  const[inviteEmail,setInviteEmail]=useState("");
  const[lastInviteLink,setLastInviteLink]=useState("");
  const[avatarUploading,setAvatarUploading]=useState(false);

  const[showReport,setShowReport]=useState(false);
  const[issueFilter,setIssueFilter]=useState<"all"|"yellow"|"red"|"active"|"resolved">("active");
  const[issueApartmentFocus,setIssueApartmentFocus]=useState<string|null>(null);
  const[managerTab,setManagerTab]=useState<"dashboard"|"fees"|"team">("dashboard");
  const[noticeTab,setNoticeTab]=useState<"create"|"pending"|"completed">("create");
  const[apartmentOverviewOpen,setApartmentOverviewOpen]=useState(false);
  const[buildingNoticesOpen,setBuildingNoticesOpen]=useState(false);
  const[apartmentOverviewTab,setApartmentOverviewTab]=useState<"issues"|"fees"|"fee_settings">("issues");
  const[tenantDetails,setTenantDetails]=useState<any>(null);
  const[showTenantManager,setShowTenantManager]=useState(false);
  const[notificationsSeen,setNotificationsSeen]=useState(false);
  const[severity,setSeverity]=useState<"yellow"|"red">("yellow");
  const[description,setDescription]=useState(""); const[callback,setCallback]=useState(false);

  const[noticeType,setNoticeType]=useState<"planned_work"|"general"|"important">("planned_work");
  const[noticeTitle,setNoticeTitle]=useState(""); const[noticeMessage,setNoticeMessage]=useState("");
  const[noticeStart,setNoticeStart]=useState(""); const[noticeEnd,setNoticeEnd]=useState("");
  const[editingNotice,setEditingNotice]=useState<any>(null);
  const[editNoticeType,setEditNoticeType]=useState<"planned_work"|"general"|"important">("planned_work");
  const[editNoticeTitle,setEditNoticeTitle]=useState("");
  const[editNoticeMessage,setEditNoticeMessage]=useState("");
  const[editNoticeStart,setEditNoticeStart]=useState("");
  const[editNoticeEnd,setEditNoticeEnd]=useState("");

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
    const {data:n}=await s.from("announcements").select("*").eq("building_id",apt.building_id).is("completed_at",null).order("created_at",{ascending:false});
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
    const {data:m,error:me}=await s.from("company_members").select("company_id,role").eq("user_id",uid).limit(1);
    if(me){setError(me.message);return}
    if(!m?.[0]){
      setManagerData({profile,companyId:null,memberRole:null,buildings:[],selectedBuilding:null,apartments:[],issues:[]});
      setSelectedBuildingId("");
      setAnnouncements([]);setFees([]);setCommunity([]);setInvitations([]);setTeam([]);setManagerInvites([]);
      return
    }

    const memberRole=m[0].role;
    const companyId=m[0].company_id;
    const {data:b,error:be}=await s.rpc("get_accessible_buildings");
    if(be){setError(be.message);return}

    const buildings=b||[];
    if(memberRole==="company_admin") await loadTeamData();

    if(!buildings.length){
      setManagerData({profile,companyId,memberRole,buildings:[],selectedBuilding:null,apartments:[],issues:[]});
      setSelectedBuildingId("");
      setAnnouncements([]);setFees([]);setCommunity([]);setInvitations([]);
      return
    }

    const savedBuildingId=typeof window!=="undefined"?localStorage.getItem("bm_selected_building"):null;
    const preferred=buildings.find((x:any)=>x.id===selectedBuildingId)?.id
      ||buildings.find((x:any)=>x.id===savedBuildingId)?.id
      ||buildings[0].id;
    setSelectedBuildingId(preferred);
    if(typeof window!=="undefined")localStorage.setItem("bm_selected_building",preferred);
    await loadManagerBuilding(uid,profile,buildings,preferred,memberRole,companyId);
  }

  async function loadTeamData(){
    const [{data:tdata,error:te},{data:idata,error:ie}]=await Promise.all([
      s.rpc("get_company_team"),
      s.rpc("get_pending_manager_invitations")
    ]);
    if(te||ie){setError((te||ie)?.message||"Failed to load team.");return}
    setTeam(tdata||[]);
    setManagerInvites(idata||[]);
  }


  async function loadManagerBuilding(uid:string,profile:any,buildings:any[],buildingId:string,memberRole?:string,companyId?:string){
    setError("");
    const building=buildings.find((x:any)=>x.id===buildingId)||null;
    if(!building)return;

    const [{data:a,error:ae},{data:i,error:ie},{data:n,error:ne},{data:f,error:fe},{data:c,error:ce},{data:inv,error:inve}]=await Promise.all([
      s.from("apartments").select("id,apartment_number,monthly_fee,fee_due_day").eq("building_id",buildingId).order("apartment_number"),
      s.from("issues").select("*").eq("building_id",buildingId).order("created_at",{ascending:false}),
      s.from("announcements").select("*").eq("building_id",buildingId).order("created_at",{ascending:false}),
      s.from("fee_records").select("*").eq("building_id",buildingId).order("due_date",{ascending:false}),
      s.rpc("get_building_community_status",{p_building_id:buildingId}),
      s.from("invitations").select("id,apartment_id,email,status,expires_at,token,created_at").eq("building_id",buildingId).order("created_at",{ascending:false})
    ]);

    const firstError=ae||ie||ne||fe||ce||inve;
    if(firstError){setError(firstError.message);return}

    const aps=a||[];
    setAnnouncements(n||[]);
    setFees(f||[]);
    setCommunity(c||[]);
    setInvitations(inv||[]);
    setManagerData((prev:any)=>({profile,companyId:companyId||prev?.companyId||null,memberRole:memberRole||prev?.memberRole||null,buildings,selectedBuilding:building,apartments:aps,issues:i||[]}));

    // Apartment selection belongs to the selected building.
    const keep=aps.find((x:any)=>x.id===selectedApartmentId);
    const chosen=keep||aps[0]||null;
    if(chosen){
      setSelectedApartmentId(chosen.id);
      setSelectedApartment(chosen);
      setFeeAmount(String(chosen.monthly_fee||0));
      setFeeDueDay(String(chosen.fee_due_day||1));
      await loadApartmentTenantDetails(chosen.id);
    }else{
      setSelectedApartmentId("");
      setSelectedApartment(null);
      setFeeAmount("");
      setFeeDueDay("1");
      setTenantDetails(null);
    }
  }

  async function changeManagerBuilding(buildingId:string){
    if(!session||!managerData)return;
    setSelectedBuildingId(buildingId);
    if(typeof window!=="undefined")localStorage.setItem("bm_selected_building",buildingId);
    setSelectedApartmentId("");
    setSelectedApartment(null);
    setIssueFilter("active");
    setManagerTab("dashboard");
    setNoticeTab("create");
    setApartmentOverviewTab("issues");
    setApartmentOverviewOpen(false);
    setBuildingNoticesOpen(false);
    setMsg("");setError("");
    await loadManagerBuilding(session.user.id,managerData.profile,managerData.buildings,buildingId,managerData.memberRole,managerData.companyId);
  }

  function openApartmentFromStatus(apartmentId:string){
    const a=managerData?.apartments?.find((x:any)=>x.id===apartmentId);
    if(!a)return;

    const apartmentActiveIssues=managerIssues.filter((i:any)=>i.apartment_id===apartmentId&&i.status!=="resolved");

    if(apartmentActiveIssues.length>0){
      const hasRed=apartmentActiveIssues.some((i:any)=>i.severity==="red");
      const hasYellow=apartmentActiveIssues.some((i:any)=>i.severity==="yellow");
      setIssueApartmentFocus(apartmentId);
      setIssueFilter(hasRed?"red":hasYellow?"yellow":"active");
      setApartmentOverviewOpen(false);
      setBuildingNoticesOpen(false);
      setTimeout(()=>document.getElementById("issueDashboardCard")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
      return;
    }

    setIssueApartmentFocus(null);
    setSelectedApartmentId(apartmentId);
    setSelectedApartment(a);
    setFeeAmount(String(a.monthly_fee||0));
    setFeeDueDay(String(a.fee_due_day||1));
    setApartmentOverviewTab("issues");
    setApartmentOverviewOpen(true);
    setShowTenantManager(false);
    loadApartmentTenantDetails(apartmentId);
    setTimeout(()=>document.getElementById("apartmentOverviewCard")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  }

  async function loadApartmentTenantDetails(apartmentId:string){
    if(!apartmentId){setTenantDetails(null);return}
    const {data,error}=await s.rpc("get_apartment_tenant_details",{p_apartment_id:apartmentId});
    if(error){setError(error.message);setTenantDetails(null);return}
    setTenantDetails(data?.[0]||null);
  }

  async function endTenancy(replace:boolean){
    if(!selectedApartment||!session||!managerData)return;
    const ok=window.confirm(replace
      ? `End the current tenancy for Apartment ${selectedApartment.apartment_number} and invite a replacement tenant?`
      : `End the current tenancy for Apartment ${selectedApartment.apartment_number}?`);
    if(!ok)return;

    setError("");setMsg("");
    const {error}=await s.rpc("end_apartment_tenancy",{p_apartment_id:selectedApartment.id});
    if(error){setError(error.message);return}

    setTenantDetails(null);
    setMsg("Tenancy ended. Apartment history is preserved; fee history will reset only when a new tenant accepts an invitation.");
    await loadManagerBuilding(session.user.id,managerData.profile,managerData.buildings,selectedBuildingId);
    setApartmentOverviewTab("issues");
    setShowTenantManager(true);
    if(replace){
      setInviteApartment(selectedApartment);
      setInviteEmail("");
    }
  }

  async function revokeInvitation(invitationId:string){
    if(!session||!managerData)return;
    const ok=window.confirm("Revoke this pending tenant invitation?");
    if(!ok)return;
    const {error}=await s.rpc("revoke_tenant_invitation",{p_invitation_id:invitationId});
    if(error){setError(error.message);return}
    setMsg("Pending invitation revoked.");
    await loadManagerBuilding(session.user.id,managerData.profile,managerData.buildings,selectedBuildingId);
  }

  function managerInviteUrl(token:string){
    return `${location.origin}/manager/invite?token=${encodeURIComponent(token)}`;
  }

  async function createManagerInvite(){
    if(managerData?.memberRole!=="company_admin")return;
    if(!teamInviteEmail.trim()||teamInviteBuildings.length===0){
      setError(t("Enter an email and select at least one building."));return
    }
    setError("");setMsg("");
    const {data,error}=await s.rpc("create_manager_invitation",{
      p_email:teamInviteEmail.trim().toLowerCase(),
      p_building_ids:teamInviteBuildings
    });
    if(error){setError(error.message);return}
    const row=data?.[0];
    if(row?.token){
      const url=managerInviteUrl(row.token);
      setLastManagerInviteLink(url);
      try{await navigator.clipboard.writeText(url)}catch{}
    }
    setTeamInviteEmail("");setTeamInviteBuildings([]);
    setMsg(t("Manager invitation created."));
    await loadTeamData();
  }

  async function revokeManagerInvite(id:string){
    if(!window.confirm(t("Revoke this manager invitation?")))return;
    const {error}=await s.rpc("revoke_manager_invitation",{p_invitation_id:id});
    if(error){setError(error.message);return}
    setMsg(t("Manager invitation revoked."));
    await loadTeamData();
  }

  async function saveManagerBuildings(){
    if(!editingManager)return;
    const {error}=await s.rpc("set_manager_buildings",{
      p_manager_id:editingManager.user_id,
      p_building_ids:editingManagerBuildings
    });
    if(error){setError(error.message);return}
    setEditingManager(null);
    setMsg(t("Manager building access updated."));
    await loadTeamData();
  }

  async function removeManager(userId:string){
    if(!window.confirm(t("Remove this manager from the company?")))return;
    const {error}=await s.rpc("remove_company_manager",{p_manager_id:userId});
    if(error){setError(error.message);return}
    setMsg(t("Manager removed."));
    await loadTeamData();
  }

  function inviteUrl(token:string){
    return `${location.origin}/invite?token=${encodeURIComponent(token)}`;
  }

  async function copyInvite(url:string){
    setLastInviteLink(url);
    try{
      await navigator.clipboard.writeText(url);
      setMsg("Invitation link copied.");
    }catch{
      setMsg("Invitation created. Copy the link shown below.");
    }
  }

  async function createTenantInvitation(){
    if(!session||!selectedBuildingId||!inviteApartment||!inviteEmail.trim())return;
    setError("");setMsg("");

    const pending=invitations.find((x:any)=>
      x.apartment_id===inviteApartment.id&&x.status==="pending"&&new Date(x.expires_at)>new Date()
    );
    if(pending){
      const url=inviteUrl(pending.token);
      setLastInviteLink(url);
      setInviteApartment(null);setInviteEmail("");
      setMsg("This apartment already has a pending invitation. Use the existing link below.");
      return;
    }

    const {data,error}=await s.from("invitations").insert({
      building_id:selectedBuildingId,
      apartment_id:inviteApartment.id,
      email:inviteEmail.trim().toLowerCase(),
      invited_by:session.user.id
    }).select("id,token,expires_at").single();

    if(error){setError(error.message);return}
    const url=inviteUrl(data.token);
    setLastInviteLink(url);
    setInviteApartment(null);setInviteEmail("");
    setMsg(`Invitation created for Apartment ${selectedApartment?.apartment_number||""}.`);
    await copyInvite(url);
    await loadManagerBuilding(session.user.id,managerData.profile,managerData.buildings,selectedBuildingId);
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
    if(!session||!selectedBuildingId||!noticeTitle.trim()||!noticeMessage.trim())return;
    const {error:e}=await s.from("announcements").insert({
      building_id:selectedBuildingId,manager_id:session.user.id,type:noticeType,title:noticeTitle.trim(),message:noticeMessage.trim(),
      starts_at:noticeStart?new Date(noticeStart).toISOString():null,ends_at:noticeEnd?new Date(noticeEnd).toISOString():null
    });
    if(e){setError(e.message);return}
    setNoticeTitle("");setNoticeMessage("");setNoticeStart("");setNoticeEnd("");setMsg("Building notice published.");
    setNoticeTab("pending");
    await loadManager(session.user.id,managerData.profile);
  }

  function toLocalInput(value:string|null){
    if(!value)return "";
    const d=new Date(value);
    const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,16);
  }

  function openNoticeEditor(n:any){
    setEditingNotice(n);
    setEditNoticeType(n.type);
    setEditNoticeTitle(n.title||"");
    setEditNoticeMessage(n.message||"");
    setEditNoticeStart(toLocalInput(n.starts_at));
    setEditNoticeEnd(toLocalInput(n.ends_at));
  }

  async function updateAnnouncement(){
    if(!editingNotice||!editNoticeTitle.trim()||!editNoticeMessage.trim())return;
    setError("");setMsg("");
    const {error:e}=await s.from("announcements").update({
      type:editNoticeType,
      title:editNoticeTitle.trim(),
      message:editNoticeMessage.trim(),
      starts_at:editNoticeStart?new Date(editNoticeStart).toISOString():null,
      ends_at:editNoticeEnd?new Date(editNoticeEnd).toISOString():null,
      updated_at:new Date().toISOString()
    }).eq("id",editingNotice.id);
    if(e){setError(e.message);return}
    setEditingNotice(null);
    setMsg(t("Notice updated."));
    await loadManager(session.user.id,managerData.profile);
  }

  async function completeAnnouncement(id:string){
    const ok=window.confirm(t("Mark this notice as completed?"));
    if(!ok)return;
    setError("");setMsg("");
    const {error:e}=await s.from("announcements").update({
      completed_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    }).eq("id",id);
    if(e){setError(e.message);return}
    setMsg(t("Notice marked as completed."));
    setNoticeTab("completed");
    await loadManager(session.user.id,managerData.profile);
  }

  async function reopenAnnouncement(id:string){
    const {error:e}=await s.from("announcements").update({
      completed_at:null,
      updated_at:new Date().toISOString()
    }).eq("id",id);
    if(e){setError(e.message);return}
    setMsg(t("Notice reopened."));
    setNoticeTab("pending");
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
        building_id:selectedBuildingId,
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
    if(!selectedBuildingId)return;
    const period=currentPeriod+"-01";
    const {data,error}=await s.rpc("generate_monthly_fees",{p_building_id:selectedBuildingId,p_period_month:period});
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
    if(days<=2) return {dueDate,glow:"feeGlowYellow",label:days===0?t("Due today"):days===1?t("Due tomorrow"):`${t("Due in")} ${days} ${t("days")}`};
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
  const selectedPendingInvitation=invitations.find((x:any)=>x.apartment_id===selectedApartmentId&&x.status==="pending"&&new Date(x.expires_at)>new Date());
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

  function uiStatus(value:string){
    return t(value);
  }

  const languageSelector=<select className="languageSelect" value={language} onChange={e=>setLanguage(e.target.value as "en"|"bg")} aria-label="Language">
    <option value="en">EN</option>
    <option value="bg">BG</option>
  </select>;

  if(loading)return <main className="shell"><div className="card"><h1>{t("Loading…")}</h1></div></main>;

  if(!session)return <main className="shell"><div className="card authCard">
    <div className="row"><h1>🏠 {t("Building Manager")}</h1>{languageSelector}</div><p>{authMode==="login"?t("Sign in to continue."):t("Create a manager account.")}</p>
    {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}
    {authMode==="signup"&&<><label>{t("Full name")}</label><input value={fullName} onChange={e=>setFullName(e.target.value)}/></>}
    <label>{t("Email")}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <label>{t("Password")}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="primary full" onClick={authMode==="login"?signIn:signUpManager}>{authMode==="login"?t("Log in"):t("Create manager account")}</button>
    <button className="secondary full" onClick={()=>setAuthMode(authMode==="login"?"signup":"login")}>{authMode==="login"?t("Create a manager account"):t("Back to login")}</button>
  </div></main>;

  if(role==="tenant"&&tenantData){
    const active=issues.find(i=>i.status!=="resolved");
    const color=active?.severity==="red"?"#df6d67":active?.severity==="yellow"?"#e9c65b":"#78b77b";
    const latestFee=fees.find((f:any)=>effectiveFeeStatus(f)!=="paid")||fees[0];
    const dueInfo=tenantDueInfo(latestFee);
    return <main className="shell">
      <div className="top">
        <div><b>🏠 {tenantData.building.name}</b><div className="muted">{t("Resident Portal")} • {t("Apartment")} {tenantData.apartment.apartment_number}</div></div>
        <div className="headerActions">
          {languageSelector}
          <button className="bellButton" onClick={markNotificationsSeen} aria-label="Notifications">
            🔔{announcements.length>0&&!notificationsSeen&&<span className="bellDot"></span>}
          </button>
          <button className="danger" onClick={()=>s.auth.signOut()}>{t("Sign out")}</button>
        </div>
      </div>
      {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}

      <div className="card"><div className="row profileRow">
        <div><h2>{t("Hello")}, {tenantData.profile.full_name}</h2><p>{tenantData.building.address}</p></div>
        <div className="profilePhotoWrap">
          <div className="profilePhoto" style={{borderColor:color,boxShadow:`0 0 0 7px ${color}33`}}>
            {tenantData.profile.avatar_url
              ? <img src={tenantData.profile.avatar_url} alt="Your profile"/>
              : <span>{initials(tenantData.profile.full_name)}</span>}
          </div>
          <label className="photoButton">
            {avatarUploading?t("Uploading…"):t("Change photo")}
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
        <div className="row"><div><h2 style={{margin:0}}>🏢 {t("Building Manager")}</h2><p style={{marginBottom:0}}>{t("Tap to make a direct report")}</p></div><b>›</b></div>
      </button>

      <div className="card communityCard">
        <div className="row">
          <div><h2>{t("Building Community")}</h2><div className="muted">{t("Status only — issue details remain private.")}</div></div>
          <span className="tag">{community.length} {community.length===1?t("resident"):t("residents")}</span>
        </div>

        <div className="communityStage">
          <button className="managerHub" onClick={()=>setShowReport(true)}>
            <span className="managerHubIcon">🏢</span>
            <span>{t("Building Manager")}</span>
            <small>{t("Direct report")}</small>
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
                <div className="residentLabel">{t("Apartment")} {r.apartment_number}</div>
              </div>
            })}
          </div>
        </div>

        <div className="legend">
          <span><i className="dot greenDot"></i>{t("No active issue")}</span>
          <span><i className="dot yellowDot"></i>{t("Small discomfort")}</span>
          <span><i className="dot redDot"></i>{t("Bigger issue")}</span>
        </div>
      </div>

      <div className="grid2">
        <div className="card"><div className="muted">{t("Apartment")}</div><div className="stat">{tenantData.apartment.apartment_number}</div></div>
        <div className={`card monthlyFeeCard ${dueInfo.glow}`}><div className="row"><div className="muted">{t("Monthly fee")}</div>{dueInfo.label&&<span className="feeAlertLabel">{dueInfo.label}</span>}</div><div className="stat">€{Number(tenantData.apartment.monthly_fee||0).toFixed(2)}</div><div className="muted">{t("Due")}: {dueInfo.dueDate?dueInfo.dueDate.toLocaleDateString(dateLocale,{day:"numeric",month:"long",year:"numeric"}):"—"}</div></div>
      </div>

      <div className="card"><div className="row"><h2>{t("My Active Issues")}</h2><span className="tag">{issues.filter(i=>i.status!=="resolved").length}</span></div>
        {issues.filter(i=>i.status!=="resolved").length===0?<p>{t("No active issues.")}</p>:issues.filter(i=>i.status!=="resolved").map(i=><div className="issue" key={i.id}><div className="row"><b>{i.severity==="red"?`🔴 ${t("Bigger issue")}`:`🟡 ${t("Small discomfort")}`}</b><span className="tag">{uiStatus(String(i.status))}</span></div><p>{i.description}</p>{i.callback_requested&&<div className="muted">☎ {t("Callback requested")}</div>}</div>)}
      </div>

      <div className="card" id="tenantNotifications"><div className="row"><h2>🔔 {t("Notifications")}</h2><span className="tag">{announcements.length}</span></div>
        {announcements.length===0?<p>{t("No building notices yet.")}</p>:announcements.map(n=><div className="issue noticeTenantCard" key={n.id}>
          <div className="row"><b>{noticeIcon(n.type)} {n.title}</b><span className="tag">{t(n.type==="planned_work"?"Planned works":n.type==="important"?"Important notice":"General announcement")}</span></div>
          <p>{n.message}</p>
          {(n.starts_at||n.ends_at)&&<div className="noticeSchedule">
            {n.starts_at&&<div><span className="muted">{t("Starts")}</span><b>{new Date(n.starts_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</b></div>}
            {n.ends_at&&<div><span className="muted">{t("Ends")}</span><b>{new Date(n.ends_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</b></div>}
          </div>}
        </div>)}
      </div>

      {showReport&&<div className="modal"><div className="modalcard"><h2>{t("Report an issue")}</h2>
        <div className="grid2"><button className={severity==="yellow"?"yellowChoice":"secondary"} onClick={()=>setSeverity("yellow")}>🟡 {t("Small discomfort")}</button><button className={severity==="red"?"redChoice":"secondary"} onClick={()=>setSeverity("red")}>🔴 {t("Bigger issue")}</button></div>
        <label>{t("Description")}</label><textarea value={description} onChange={e=>setDescription(e.target.value)}/>
        <label className="check"><input type="checkbox" checked={callback} onChange={e=>setCallback(e.target.checked)}/> {t("Request a callback")}</label>
        <button className="primary full" onClick={submitIssue}>{t("Submit Report")}</button><button className="secondary full" onClick={()=>setShowReport(false)}>{t("Cancel")}</button>
      </div></div>}
    </main>
  }

  return <main className="shell">
    <div className="top"><div><b>🏠 {t("Building Manager")}</b><div className="muted">{managerData?.profile?.full_name} • {t("Manager Portal")}</div></div><div className="headerActions">{languageSelector}<button className="danger" onClick={()=>s.auth.signOut()}>{t("Sign out")}</button></div></div>
    {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}

    <div className="card buildingSelectorCard">
      <div className="row buildingSelectorHeader">
        <div>
          <h2>{t("Manager Dashboard")}</h2>
          <div className="muted">{t("Choose which building you want to manage.")}</div>
        </div>
        <span className="tag">{managerData?.buildings?.length||0} {(managerData?.buildings?.length||0)===1?t("building"):t("buildings")}</span>
      </div>

      {managerData?.buildings?.length>0?<>
        <div className="buildingPickerRow">
          <div className="buildingPickerField">
            <label>{t("Building")}</label>
            <select value={selectedBuildingId} onChange={e=>changeManagerBuilding(e.target.value)}>
              {managerData.buildings.map((b:any)=><option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}
            </select>
          </div>
          {managerData?.memberRole==="company_admin"&&<button className="primary createBuildingButton" onClick={()=>location.href="/manager/buildings/new"}>+ {t("Create New Building")}</button>}
        </div>
        <div className="selectedBuildingSummary">
          <b>🏢 {managerData?.selectedBuilding?.name}</b>
          <span className="muted">{managerData?.selectedBuilding?.address}</span>
        </div>
      </>:<><p>{t("No buildings are assigned to this management company yet.")}</p>{managerData?.memberRole==="company_admin"&&<button className="primary" onClick={()=>location.href="/manager/buildings/new"}>+ {t("Create New Building")}</button>}</>}
    </div>

    <div className="managerTabs">
      <button className={`managerTab ${managerTab==="dashboard"?"managerTabActive":""}`} onClick={()=>setManagerTab("dashboard")}>
        {t("Dashboard")}
      </button>
      <button className={`managerTab ${managerTab==="fees"?"managerTabActive":""}`} onClick={()=>setManagerTab("fees")}>
        {t("Pending Tenant Fees")}
        {pendingFees.length>0&&<span className="tabCount">{pendingFees.length}</span>}
      </button>
      {managerData?.memberRole==="company_admin"&&<button className={`managerTab ${managerTab==="team"?"managerTabActive":""}`} onClick={()=>setManagerTab("team")}>
        {t("Team Management")}
        {team.filter((m:any)=>m.role==="manager").length>0&&<span className="tabCount">{team.filter((m:any)=>m.role==="manager").length}</span>}
      </button>}
    </div>

    {managerTab==="dashboard"&&<>
    <div className="card communityCard">
      <div className="row">
        <div><h2>{t("Building Status")}</h2><div className="muted">{managerData?.selectedBuilding?.name} • {t("Live resident overview by apartment.")}</div></div>
        <span className="tag">{community.length} {community.length===1?t("resident"):t("residents")}</span>
      </div>

      <div className="communityStage managerView">
        <div className="managerHub staticHub">
          <span className="managerHubIcon">🏢</span>
          <span>{t("Building Manager")}</span>
          <small>{managerData?.selectedBuilding?.name||""}</small>
        </div>

        <div className="residentOval">
          {community.map((r:any,index:number)=>{
            const angle=(Math.PI*2*index/Math.max(community.length,1))-Math.PI/2;
            const x=50+43*Math.cos(angle);
            const y=55+38*Math.sin(angle);
            return <button type="button" className="residentItem ovalItem residentApartmentButton" key={r.apartment_id} style={{left:`${x}%`,top:`${y}%`}} onClick={()=>openApartmentFromStatus(r.apartment_id)}>
              <div className={`residentAvatar ${statusClass(r.status_color)}`} title={`${r.tenant_name} • ${t("Apartment")} ${r.apartment_number}`}>
                {r.avatar_url?<img src={r.avatar_url} alt="Resident"/>:<span>{initials(r.tenant_name)}</span>}
              </div>
              <div className="residentLabel">{t("Apartment")} {r.apartment_number}</div>
            </button>
          })}
        </div>
      </div>
    </div>

    <div className="card" id="issueDashboardCard">
      <div className="row"><div><h2>{t("Issue Dashboard")}</h2><div className="muted">{managerData?.selectedBuilding?.name} • {t("Active issues are separated from resolved history.")}</div></div><span className="tag">{managerIssues.length}</span></div>

      <div className="issueFilterGrid">
        <button className={`filterTile ${issueFilter==="active"?"filterActive":""}`} onClick={()=>{setIssueApartmentFocus(null);setIssueFilter("active")}}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.status!=="resolved").length}</span>
          <span>{t("Active")}</span>
        </button>
        <button className={`filterTile yellowTile ${issueFilter==="yellow"?"filterActive":""}`} onClick={()=>{setIssueApartmentFocus(null);setIssueFilter("yellow")}}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.severity==="yellow"&&i.status!=="resolved").length}</span>
          <span>{t("Yellow")}</span>
        </button>
        <button className={`filterTile redTile ${issueFilter==="red"?"filterActive":""}`} onClick={()=>{setIssueApartmentFocus(null);setIssueFilter("red")}}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.severity==="red"&&i.status!=="resolved").length}</span>
          <span>{t("Red")}</span>
        </button>
        <button className={`filterTile ${issueFilter==="resolved"?"filterActive":""}`} onClick={()=>{setIssueApartmentFocus(null);setIssueFilter("resolved")}}>
          <span className="filterNumber">{managerIssues.filter((i:any)=>i.status==="resolved").length}</span>
          <span>{t("Resolved")}</span>
        </button>
      </div>

      <div className="filterBar">
        <span className="muted">{t("Showing")}: {uiStatus(issueFilter)}</span>
        {issueFilter!=="active"&&<button className="linkButton" onClick={()=>{setIssueApartmentFocus(null);setIssueFilter("active")}}>{t("Back to active")}</button>}
      </div>

      {filteredManagerIssues.length===0?<p>{t("No issues in this filter.")}</p>:filteredManagerIssues.map((i:any)=><div className="issue" key={i.id}><div className="row"><b>{i.severity==="red"?"🔴":"🟡"} Apartment {managerData.apartments.find((a:any)=>a.id===i.apartment_id)?.apartment_number||"?"}</b><span className="tag">{uiStatus(String(i.status))}</span></div><p>{i.description}</p>{i.callback_requested&&<div className="muted">☎ {t("Callback requested")}</div>}<div className="row actions">{i.status==="submitted"&&<button className="secondary" onClick={()=>updateIssue(i.id,"acknowledged")}>{t("Acknowledge")}</button>}{i.status!=="resolved"&&<button className="secondary" onClick={()=>updateIssue(i.id,"in_progress")}>{t("In Progress")}</button>}{i.status!=="resolved"&&<button className="primary" onClick={()=>updateIssue(i.id,"resolved")}>{t("Resolve")}</button>}</div></div>)}
    </div>

    {lastInviteLink&&<div className="card inviteLinkCard">
      <div className="row"><div><h2>{t("Tenant Invitation Link")}</h2><div className="muted">{t("Send this secure link to the invited tenant.")}</div></div><button className="secondary" onClick={()=>setLastInviteLink("")}>{t("Close")}</button></div>
      <input value={lastInviteLink} readOnly onFocus={e=>e.currentTarget.select()}/>
      <button className="primary full" onClick={()=>copyInvite(lastInviteLink)}>{t("Copy Link")}</button>
    </div>}

    <div className="card" id="apartmentOverviewCard">
      <button type="button" className="sectionToggleHeader" onClick={()=>setApartmentOverviewOpen(v=>!v)} aria-expanded={apartmentOverviewOpen}>
        <div className="sectionToggleText">
          <h2>🏠 {t("Apartment Overview")}</h2>
          <div className="muted">{t("Tenant, fees and issue history for one apartment.")}</div>
        </div>
        <div className="sectionToggleRight">
          {selectedApartmentCommunity
            ? <span className={`feeBadge ${statusClass(selectedApartmentCommunity.status_color)==="residentRed"?"feeOverdue":statusClass(selectedApartmentCommunity.status_color)==="residentYellow"?"feePending":"feePaid"}`}>
                {selectedApartmentCommunity.status_color}
              </span>
            : <span className="tag">{t("VACANT")}</span>}
          <span className={`chevron ${apartmentOverviewOpen?"chevronOpen":""}`}>⌄</span>
        </div>
      </button>
      {apartmentOverviewOpen&&<div className="collapsibleSectionBody">

      <label>{t("Apartment")}</label>
      <select
        value={selectedApartmentId}
        onChange={e=>{
          const id=e.target.value;
          setSelectedApartmentId(id);
          setApartmentOverviewTab("issues");
          setShowTenantManager(false);
          const a=managerData.apartments.find((x:any)=>x.id===id);
          setSelectedApartment(a||null);
          if(a){
            setFeeAmount(String(a.monthly_fee||0));
            setFeeDueDay(String(a.fee_due_day||1));
            loadApartmentTenantDetails(a.id);
          }else{
            setTenantDetails(null);
          }
        }}
      >
        {(managerData?.apartments||[]).map((a:any)=>
          <option key={a.id} value={a.id}>Apartment {a.apartment_number}</option>
        )}
      </select>

      {selectedApartment&&<div className="apartmentSummaryGrid">
        <div className="summaryBox">
          <div className="muted">{t("Tenant")}</div>
          <div className="summaryValue">{selectedApartmentCommunity?.tenant_name||t("Vacant")}</div>
          {selectedApartmentCommunity
            ? <div className="muted">{t("Active tenant account")}</div>
            : selectedPendingInvitation
              ? <div className="muted">Invitation pending: {selectedPendingInvitation.email}</div>
              : <div className="muted">{t("No active tenant")}</div>
          }
          <button className="secondary summaryAction" onClick={()=>setShowTenantManager(v=>!v)}>{showTenantManager?t("Hide Tenant Manager"):t("Manage Tenant")}</button>
        </div>

        <div className="summaryBox">
          <div className="muted">{t("Monthly fee")}</div>
          <div className="summaryValue">€{Number(selectedApartment.monthly_fee||0).toFixed(2)}</div>
          <div className="muted">
            {selectedApartmentOutstanding
              ? `${t("Due")} ${new Date(selectedApartmentOutstanding.due_date+"T00:00:00").toLocaleDateString(dateLocale,{day:"numeric",month:"long",year:"numeric"})}`
              : t("No outstanding fee")}
          </div>
        </div>

        <div className="summaryBox">
          <div className="muted">{t("Active issues")}</div>
          <div className="summaryValue">{selectedApartmentActiveCount}</div>
          <div className="muted">{selectedApartmentResolvedCount} {t("resolved in history")}</div>
        </div>
      </div>}

      {showTenantManager&&<div className="tenantManagerSection">
        <div className="tenantManagerHeading"><h3>{t("Tenant Management")}</h3><div className="muted">{t("Manage the current tenant or invitation for this apartment.")}</div></div>
        {tenantDetails?<>
          <div className="tenantManagementCard">
            <div className="tenantIdentity">
              <div className="tenantManagementAvatar">
                {tenantDetails.avatar_url?<img src={tenantDetails.avatar_url} alt="Tenant"/>:<span>{initials(tenantDetails.full_name)}</span>}
              </div>
              <div>
                <div className="summaryValue">{tenantDetails.full_name}</div>
                <div className="muted">{t("Active tenant since")} {new Date(tenantDetails.started_at).toLocaleDateString(dateLocale)}</div>
              </div>
            </div>
            <div className="tenantContactGrid">
              <div><div className="muted">{t("Email")}</div><b>{tenantDetails.email||"—"}</b></div>
              <div><div className="muted">{t("Phone")}</div><b>{tenantDetails.phone||"—"}</b></div>
            </div>
            <div className="tenantActions">
              <button className="secondary" onClick={()=>endTenancy(false)}>{t("End Tenancy")}</button>
              <button className="primary" onClick={()=>endTenancy(true)}>{t("Replace Tenant")}</button>
            </div>
          </div>
        </>:selectedPendingInvitation?<>
          <div className="tenantManagementCard">
            <div className="row"><div><div className="muted">{t("Status")}</div><div className="summaryValue">{t("Invitation Pending")}</div></div><span className="feeBadge feePending">{t("INVITED")}</span></div>
            <p>{selectedPendingInvitation.email}</p>
            <div className="muted">{t("Expires")} {new Date(selectedPendingInvitation.expires_at).toLocaleString(dateLocale)}</div>
            <div className="tenantActions">
              <button className="secondary" onClick={()=>revokeInvitation(selectedPendingInvitation.id)}>{t("Revoke Invitation")}</button>
              <button className="primary" onClick={()=>copyInvite(inviteUrl(selectedPendingInvitation.token))}>{t("Copy Invite Link")}</button>
            </div>
          </div>
        </>:<>
          <div className="emptyTenantState">
            <div className="emptyTenantIcon">🏠</div>
            <h3>{t("Apartment is vacant")}</h3>
            <p>{t("No active tenant is assigned to Apartment")} {selectedApartment?.apartment_number}.</p>
            <button className="primary" onClick={()=>{setInviteApartment(selectedApartment);setInviteEmail("")}}>{t("Invite Tenant")}</button>
          </div>
        </>}
      
      </div>}

      <div className="apartmentInnerTabs">
        <button
          className={`apartmentInnerTab ${apartmentOverviewTab==="issues"?"apartmentInnerTabActive":""}`}
          onClick={()=>setApartmentOverviewTab("issues")}
        >
          {t("Issue History")}
          <span className="innerTabCount">{selectedApartmentIssues.length}</span>
        </button>
        <button
          className={`apartmentInnerTab ${apartmentOverviewTab==="fees"?"apartmentInnerTabActive":""}`}
          onClick={()=>setApartmentOverviewTab("fees")}
        >
          {t("Fee History")}
          <span className="innerTabCount">{selectedApartmentFees.length}</span>
        </button>
        <button
          className={`apartmentInnerTab ${apartmentOverviewTab==="fee_settings"?"apartmentInnerTabActive":""}`}
          onClick={()=>setApartmentOverviewTab("fee_settings")}
        >
          {t("Fee Settings")}
        </button>
      </div>

      {apartmentOverviewTab==="issues"&&<div className="apartmentTabPanel">
        {selectedApartmentIssues.length===0
          ? <p>{t("No issue history for this apartment.")}</p>
          : selectedApartmentIssues.map((i:any)=><div className="issue compactIssue" key={i.id}>
              <div className="row">
                <b>{i.severity==="red"?`🔴 ${t("Bigger issue")}`:`🟡 ${t("Small discomfort")}`}</b>
                <span className="tag">{uiStatus(String(i.status))}</span>
              </div>
              <p>{i.description}</p>
              {i.callback_requested&&<div className="muted">☎ {t("Callback requested")}</div>}
            </div>)
        }
      </div>}

      {apartmentOverviewTab==="fees"&&<div className="apartmentTabPanel">
        {selectedApartmentFees.length===0
          ? <p>{t("No fee history for this apartment.")}</p>
          : selectedApartmentFees.slice(0,12).map((f:any)=><div className="feeHistoryRow" key={f.id}>
              <div>
                <b>{new Date(f.period_month+"T00:00:00").toLocaleDateString(undefined,{month:"long",year:"numeric"})}</b>
                <div className="muted">{t("Due")} {new Date(f.due_date+"T00:00:00").toLocaleDateString(dateLocale)}</div>
              </div>
              <div className="row">
                <b>€{Number(f.amount).toFixed(2)}</b>
                <span className={`feeBadge ${feeStatusClass(effectiveFeeStatus(f))}`}>{uiStatus(effectiveFeeStatus(f))}</span>
              </div>
            </div>)
        }
      </div>}

      {apartmentOverviewTab==="fee_settings"&&<div className="apartmentTabPanel">
        <div className="selectedApartmentEditor inlineFeeEditor">
          <div className="row"><div><h3>{t("Fee Settings")}</h3><div className="muted">{t("Editing Apartment")} {selectedApartment?.apartment_number||"—"}. {t("The next due date advances automatically after payment.")}</div></div><span className="tag">{pendingFees.filter((f:any)=>f.apartment_id===selectedApartmentId).length} pending</span></div>
          <div className="grid2">
            <div>
              <label>{t("Monthly fee (€)")}</label>
              <input type="number" min="0" step="0.01" value={feeAmount} onChange={e=>setFeeAmount(e.target.value)}/>
            </div>
            <div>
              <label>{t("Recurring due day each month")}</label>
              <input type="number" min="1" max="31" value={feeDueDay} onChange={e=>setFeeDueDay(e.target.value)}/>
            </div>
          </div>
          <button className="primary full" onClick={saveApartmentFee}>{t("Save Apartment Fee")}</button>
        </div>
      </div>}

      </div>}
    </div>
    <div className="card noticeWorkspace">
      <button type="button" className="sectionToggleHeader noticeWorkspaceHeader" onClick={()=>setBuildingNoticesOpen(v=>!v)} aria-expanded={buildingNoticesOpen}>
        <div className="sectionToggleText">
          <h2>📣 {t("Building Notices")}</h2>
          <div className="muted">{managerData?.selectedBuilding?.name||t("selected building")}</div>
        </div>
        <div className="sectionToggleRight">
          <span className="tag">{announcements.filter((n:any)=>!n.completed_at).length}</span>
          <span className={`chevron ${buildingNoticesOpen?"chevronOpen":""}`}>⌄</span>
        </div>
      </button>

      {buildingNoticesOpen&&<div className="collapsibleSectionBody">
      <div className="noticeTabs">
        <button className={`noticeTab ${noticeTab==="create"?"noticeTabActive":""}`} onClick={()=>setNoticeTab("create")}>
          {t("Create Notice")}
        </button>
        <button className={`noticeTab ${noticeTab==="pending"?"noticeTabActive":""}`} onClick={()=>setNoticeTab("pending")}>
          {t("Pending Notices")}
          <span className="innerTabCount">{announcements.filter((n:any)=>!n.completed_at).length}</span>
        </button>
        <button className={`noticeTab ${noticeTab==="completed"?"noticeTabActive":""}`} onClick={()=>setNoticeTab("completed")}>
          {t("Completed Notices")}
          <span className="innerTabCount">{announcements.filter((n:any)=>!!n.completed_at).length}</span>
        </button>
      </div>

      {noticeTab==="create"&&<div className="noticeTabPanel">
        <div className="muted noticePanelIntro">{t("Publishing to")} {managerData?.selectedBuilding?.name||t("selected building")}.</div>
        <label>{t("Notice type")}</label>
        <select value={noticeType} onChange={e=>setNoticeType(e.target.value as any)}>
          <option value="planned_work">🔧 {t("Planned works")}</option>
          <option value="general">📣 {t("General announcement")}</option>
          <option value="important">⚠️ {t("Important notice")}</option>
        </select>
        <label>{t("Title")}</label><input value={noticeTitle} onChange={e=>setNoticeTitle(e.target.value)}/>
        <label>{t("Message")}</label><textarea value={noticeMessage} onChange={e=>setNoticeMessage(e.target.value)}/>
        <div className="grid2">
          <div><label>{t("Starts")}</label><input type="datetime-local" value={noticeStart} onChange={e=>setNoticeStart(e.target.value)}/></div>
          <div><label>{t("Ends")}</label><input type="datetime-local" value={noticeEnd} onChange={e=>setNoticeEnd(e.target.value)}/></div>
        </div>
        <button className="primary full" onClick={createAnnouncement}>{t("Publish Notice")}</button>
      </div>}

      {noticeTab==="pending"&&<div className="noticeTabPanel">
        {announcements.filter((n:any)=>!n.completed_at).length===0
          ? <p>{t("No pending notices.")}</p>
          : announcements.filter((n:any)=>!n.completed_at).map((n:any)=><div className="managedNotice" key={n.id}>
              <div className="row managedNoticeTop">
                <div>
                  <b>{noticeIcon(n.type)} {n.title}</b>
                  <div className="muted">{t(n.type==="planned_work"?"Planned works":n.type==="important"?"Important notice":"General announcement")}</div>
                </div>
                <span className="feeBadge feePending">{t("Active")}</span>
              </div>
              <p>{n.message}</p>
              <div className="noticeSchedule">
                {n.starts_at&&<div><span className="muted">{t("Starts")}</span><b>{new Date(n.starts_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</b></div>}
                {n.ends_at&&<div><span className="muted">{t("Ends")}</span><b>{new Date(n.ends_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</b></div>}
              </div>
              <div className="noticeActions">
                <button className="secondary" onClick={()=>openNoticeEditor(n)}>{t("Edit")}</button>
                <button className="primary" onClick={()=>completeAnnouncement(n.id)}>{t("Mark Completed")}</button>
              </div>
            </div>)
        }
      </div>}

      {noticeTab==="completed"&&<div className="noticeTabPanel">
        {announcements.filter((n:any)=>!!n.completed_at).length===0
          ? <p>{t("No completed notices.")}</p>
          : announcements.filter((n:any)=>!!n.completed_at).map((n:any)=><div className="managedNotice managedNoticeCompleted" key={n.id}>
              <div className="row managedNoticeTop">
                <div>
                  <b>{noticeIcon(n.type)} {n.title}</b>
                  <div className="muted">{t(n.type==="planned_work"?"Planned works":n.type==="important"?"Important notice":"General announcement")}</div>
                </div>
                <span className="feeBadge feePaid">{t("Completed")}</span>
              </div>
              <p>{n.message}</p>
              <div className="noticeSchedule">
                {n.starts_at&&<div><span className="muted">{t("Starts")}</span><b>{new Date(n.starts_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</b></div>}
                {n.ends_at&&<div><span className="muted">{t("Ends")}</span><b>{new Date(n.ends_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</b></div>}
              </div>
              <div className="noticeActions">
                <button className="secondary" onClick={()=>openNoticeEditor(n)}>{t("Edit")}</button>
                <button className="secondary" onClick={()=>reopenAnnouncement(n.id)}>{t("Reopen")}</button>
              </div>
            </div>)
        }
      </div>}

      </div>}
    </div>

    </>}

    {managerTab==="fees"&&<>
    <div className="card">
      <div className="row"><div><h2>{t("Pending Tenant Fees")}</h2><div className="muted">{t("Outstanding fees for")} {managerData?.selectedBuilding?.name||t("the selected building")}.</div></div><span className="tag">{pendingFees.length}</span></div>
      {pendingFees.length===0?<p>{t("No pending fees.")}</p>:pendingFees.map(f=>{
        const a=managerData.apartments.find((x:any)=>x.id===f.apartment_id);
        return <div className="apt" key={f.id}>
          <div><b>Apartment {a?.apartment_number||"?"}</b><div className="muted">€{Number(f.amount).toFixed(2)} • due {new Date(f.due_date+"T00:00:00").toLocaleDateString()}</div></div>
          <div className="row"><span className={`feeBadge ${feeStatusClass(effectiveFeeStatus(f))}`}>{uiStatus(effectiveFeeStatus(f))}</span><button className="primary" onClick={()=>markFee(f.id,true)}>{t("Mark Paid")}</button></div>
        </div>
      })}
    </div>

    </>}

    {managerTab==="team"&&managerData?.memberRole==="company_admin"&&<>
      <div className="card">
        <div className="row"><div><h2>👥 {t("Team Management")}</h2><div className="muted">{t("Invite managers and control which buildings they can access.")}</div></div><span className="tag">{team.length}</span></div>

        <div className="teamInviteBox">
          <h3>{t("Invite Manager")}</h3>
          <label>{t("Manager email")}</label>
          <input type="email" value={teamInviteEmail} onChange={e=>setTeamInviteEmail(e.target.value)} placeholder="manager@example.com"/>
          <label>{t("Building access")}</label>
          <div className="buildingAccessGrid">
            {(managerData?.buildings||[]).map((b:any)=><label className="buildingAccessOption" key={b.id}>
              <input type="checkbox" checked={teamInviteBuildings.includes(b.id)} onChange={e=>setTeamInviteBuildings(prev=>e.target.checked?[...prev,b.id]:prev.filter(x=>x!==b.id))}/>
              <span><b>{b.name}</b><small>{b.address}</small></span>
            </label>)}
          </div>
          <button className="primary full" onClick={createManagerInvite}>{t("Create Manager Invitation")}</button>
        </div>

        {lastManagerInviteLink&&<div className="inviteLinkCard teamInviteLink">
          <div className="row"><b>{t("Manager Invitation Link")}</b><button className="secondary" onClick={()=>setLastManagerInviteLink("")}>{t("Close")}</button></div>
          <input value={lastManagerInviteLink} readOnly onFocus={e=>e.currentTarget.select()}/>
          <button className="secondary full" onClick={()=>navigator.clipboard.writeText(lastManagerInviteLink)}>{t("Copy Link")}</button>
        </div>}

        <h3>{t("Current Team")}</h3>
        {team.map((m:any)=><div className="teamMemberRow" key={m.user_id}>
          <div>
            <b>{m.full_name||m.email}</b>
            <div className="muted">{m.email}</div>
            <div className="teamBuildingChips">
              {m.role==="company_admin"
                ? <span className="tag">{t("All buildings")}</span>
                : (m.building_ids||[]).map((bid:string)=>{
                    const b=managerData.buildings.find((x:any)=>x.id===bid);
                    return b?<span className="tag" key={bid}>{b.name}</span>:null
                  })}
            </div>
          </div>
          <div className="teamMemberActions">
            <span className={`feeBadge ${m.role==="company_admin"?"feePaid":"feePending"}`}>{m.role==="company_admin"?t("Company Admin"):t("Manager")}</span>
            {m.role==="manager"&&<>
              <button className="secondary" onClick={()=>{setEditingManager(m);setEditingManagerBuildings(m.building_ids||[])}}>{t("Edit Access")}</button>
              <button className="danger" onClick={()=>removeManager(m.user_id)}>{t("Remove")}</button>
            </>}
          </div>
        </div>)}

        {managerInvites.length>0&&<>
          <h3>{t("Pending Manager Invitations")}</h3>
          {managerInvites.map((inv:any)=><div className="teamMemberRow" key={inv.invitation_id}>
            <div><b>{inv.email}</b><div className="muted">{t("Expires")} {new Date(inv.expires_at).toLocaleString(dateLocale)}</div></div>
            <div className="teamMemberActions">
              <button className="secondary" onClick={()=>navigator.clipboard.writeText(managerInviteUrl(inv.token))}>{t("Copy Link")}</button>
              <button className="danger" onClick={()=>revokeManagerInvite(inv.invitation_id)}>{t("Revoke")}</button>
            </div>
          </div>)}
        </>}
      </div>
    </>}

    {editingManager&&<div className="modal"><div className="modalcard">
      <h2>{t("Edit Manager Access")}</h2>
      <p>{editingManager.full_name||editingManager.email}</p>
      <div className="buildingAccessGrid">
        {(managerData?.buildings||[]).map((b:any)=><label className="buildingAccessOption" key={b.id}>
          <input type="checkbox" checked={editingManagerBuildings.includes(b.id)} onChange={e=>setEditingManagerBuildings(prev=>e.target.checked?[...prev,b.id]:prev.filter(x=>x!==b.id))}/>
          <span><b>{b.name}</b><small>{b.address}</small></span>
        </label>)}
      </div>
      <button className="primary full" onClick={saveManagerBuildings}>{t("Save Access")}</button>
      <button className="secondary full" onClick={()=>setEditingManager(null)}>{t("Cancel")}</button>
    </div></div>}

    {editingNotice&&<div className="modal"><div className="modalcard">
      <h2>{t("Edit Notice")}</h2>
      <label>{t("Notice type")}</label>
      <select value={editNoticeType} onChange={e=>setEditNoticeType(e.target.value as any)}>
        <option value="planned_work">🔧 {t("Planned works")}</option>
        <option value="general">📣 {t("General announcement")}</option>
        <option value="important">⚠️ {t("Important notice")}</option>
      </select>
      <label>{t("Title")}</label><input value={editNoticeTitle} onChange={e=>setEditNoticeTitle(e.target.value)}/>
      <label>{t("Message")}</label><textarea value={editNoticeMessage} onChange={e=>setEditNoticeMessage(e.target.value)}/>
      <div className="grid2">
        <div><label>{t("Starts")}</label><input type="datetime-local" value={editNoticeStart} onChange={e=>setEditNoticeStart(e.target.value)}/></div>
        <div><label>{t("Ends")}</label><input type="datetime-local" value={editNoticeEnd} onChange={e=>setEditNoticeEnd(e.target.value)}/></div>
      </div>
      <button className="primary full" onClick={updateAnnouncement}>{t("Save Changes")}</button>
      <button className="secondary full" onClick={()=>setEditingNotice(null)}>{t("Cancel")}</button>
    </div></div>}

    {inviteApartment&&<div className="modal"><div className="modalcard">
      <h2>Invite tenant — Apartment {inviteApartment.apartment_number}</h2>
      <p>The invitation will be securely linked to {managerData?.selectedBuilding?.name}, Apartment {inviteApartment.apartment_number}.</p>
      <label>{t("Tenant email")}</label>
      <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="tenant@example.com"/>
      <button className="primary full" disabled={!inviteEmail.trim()} onClick={createTenantInvitation}>{t("Create Invitation")}</button>
      <button className="secondary full" onClick={()=>{setInviteApartment(null);setInviteEmail("")}}>{t("Cancel")}</button>
    </div></div>}
  </main>
}