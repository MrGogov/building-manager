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
  const[showInstallHelp,setShowInstallHelp]=useState(false);
  const[isIosSafari,setIsIosSafari]=useState(false);
  const[isAndroid,setIsAndroid]=useState(false);
  const[androidInstallPrompt,setAndroidInstallPrompt]=useState<any>(null);
  const[isStandalone,setIsStandalone]=useState(false);
  const[error,setError]=useState("");
  const[msg,setMsg]=useState("");

  const authMode:"login"="login";
  const[email,setEmail]=useState(""); const[password,setPassword]=useState(""); const[fullName,setFullName]=useState("");
  const[resetSending,setResetSending]=useState(false);
  const[mustChangePassword,setMustChangePassword]=useState(false);
  const[firstLoginPassword,setFirstLoginPassword]=useState("");
  const[firstLoginConfirm,setFirstLoginConfirm]=useState("");
  const[changingFirstPassword,setChangingFirstPassword]=useState(false);

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
  const[customerCompanyName,setCustomerCompanyName]=useState("");
  const[customerAdminName,setCustomerAdminName]=useState("");
  const[customerAdminEmail,setCustomerAdminEmail]=useState("");
  const[customerTempPassword,setCustomerTempPassword]=useState("");
  const[creatingCustomerAdmin,setCreatingCustomerAdmin]=useState(false);
  const[lastCreatedCustomer,setLastCreatedCustomer]=useState<any>(null);
  const[customers,setCustomers]=useState<any[]>([]);
  const[customersLoading,setCustomersLoading]=useState(false);
  const[expandedCustomerId,setExpandedCustomerId]=useState<string|null>(null);
  const[supportWorkspace,setSupportWorkspace]=useState<any>(null);
  const[supportWorkspaceLoading,setSupportWorkspaceLoading]=useState(false);
  const[supportBuildingId,setSupportBuildingId]=useState("");
  const[supportTab,setSupportTab]=useState<"overview"|"issues"|"notices"|"fees"|"residents">("overview");
  const[auditLog,setAuditLog]=useState<any[]>([]);
  const[auditLoading,setAuditLoading]=useState(false);
  const[deleteCustomer,setDeleteCustomer]=useState<any>(null);
  const[deleteCustomerConfirm,setDeleteCustomerConfirm]=useState("");
  const[deletingCustomer,setDeletingCustomer]=useState(false);
  const[showAccountSettings,setShowAccountSettings]=useState(false);
  const[accountFullName,setAccountFullName]=useState("");
  const[newAccountPassword,setNewAccountPassword]=useState("");
  const[confirmAccountPassword,setConfirmAccountPassword]=useState("");
  const[savingAccount,setSavingAccount]=useState(false);

  const[showReport,setShowReport]=useState(false);
  const[issueFilter,setIssueFilter]=useState<"all"|"yellow"|"red"|"active"|"resolved">("active");
  const[issueApartmentFocus,setIssueApartmentFocus]=useState<string|null>(null);
  const[managerTab,setManagerTab]=useState<"dashboard"|"fees"|"team"|"customers"|"audit">("dashboard");
  const[noticeTab,setNoticeTab]=useState<"create"|"pending"|"completed">("create");
  const[apartmentOverviewOpen,setApartmentOverviewOpen]=useState(false);
  const[buildingNoticesOpen,setBuildingNoticesOpen]=useState(false);
  const[apartmentOverviewTab,setApartmentOverviewTab]=useState<"issues"|"fees"|"fee_settings">("issues");
  const[tenantDetails,setTenantDetails]=useState<any>(null);
  const[showTenantManager,setShowTenantManager]=useState(false);
  const[notificationsSeen,setNotificationsSeen]=useState(false);
  const[managerNotificationsSeen,setManagerNotificationsSeen]=useState(false);
  const[showNotificationSettings,setShowNotificationSettings]=useState(false);
  const[notificationSaving,setNotificationSaving]=useState(false);
  const[pushRegistered,setPushRegistered]=useState(false);
  const[notificationPrefs,setNotificationPrefs]=useState<any>({
    enabled:false,
    building_notices:true,
    fee_reminders:true,
    issue_updates:true,
    manager_new_issues:true,
    callback_requests:true,
    permission:"default"
  });
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
    const ua=navigator.userAgent;
    const ios=/iPhone|iPad|iPod/i.test(ua);
    const android=/Android/i.test(ua);
    const standalone=window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone===true;
    setIsIosSafari(ios);
    setIsAndroid(android);
    setIsStandalone(standalone);
    const captureInstall=(event:any)=>{
      event.preventDefault();
      setAndroidInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt",captureInstall);
    return()=>window.removeEventListener("beforeinstallprompt",captureInstall);
  },[]);

  useEffect(()=>{
    let alive=true;

    async function startSession(){
      const {data}=await s.auth.getSession();
      if(!alive)return;
      if(data.session){
        setSession(data.session);
        await bootstrap(data.session.user.id);
      }else setLoading(false);
    }

    startSession();

    const {data:{subscription}}=s.auth.onAuthStateChange((_e,ss)=>{
      setSession(ss);
      if(ss) bootstrap(ss.user.id);
      else {setRole(null);setManagerData(null);setTenantData(null);setIssues([]);setAnnouncements([]);setFees([]);setLoading(false)}
    });

    async function onResume(){
      if(document.visibilityState!=="visible")return;
      const {data}=await s.auth.getSession();
      if(!data.session)return;
      const {data:refreshed,error:refreshError}=await s.auth.refreshSession();
      if(refreshError)return;
      const activeSession=refreshed.session||data.session;
      if(activeSession){
        setSession(activeSession);
        await bootstrap(activeSession.user.id);
      }
    }

    document.addEventListener("visibilitychange",onResume);
    return()=>{
      alive=false;
      document.removeEventListener("visibilitychange",onResume);
      subscription.unsubscribe();
    };
  },[]);

  async function sendPasswordReset(){
    setError("");setMsg("");
    if(!email.trim()){setError(t("Enter your email first."));return}
    setResetSending(true);
    const {error}=await s.auth.resetPasswordForEmail(email.trim(),{
      redirectTo:`${location.origin}/reset-password`
    });
    setResetSending(false);
    if(error){setError(error.message);return}
    setMsg(t("Password reset email sent. Check your inbox."));
  }

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
    else {setMsg("Account created. Confirm your email if confirmations are enabled, then log in.")}
  }

  const isPlatformOwner=(session?.user?.email||"").toLowerCase()==="mrgogov@abv.bg";

  async function createCustomerAdmin(){
    if(!isPlatformOwner)return;
    setError("");setMsg("");setLastCreatedCustomer(null);
    if(!customerCompanyName.trim()||!customerAdminName.trim()||!customerAdminEmail.trim()||!customerTempPassword){
      setError(t("Complete all customer admin fields."));return;
    }
    if(customerTempPassword.length<8){
      setError(t("Temporary password must be at least 8 characters."));return;
    }
    setCreatingCustomerAdmin(true);
    const {data,error}=await s.functions.invoke("create-customer-admin",{body:{
      company_name:customerCompanyName.trim(),
      admin_name:customerAdminName.trim(),
      admin_email:customerAdminEmail.trim().toLowerCase(),
      temporary_password:customerTempPassword
    }});
    setCreatingCustomerAdmin(false);
    if(error){setError(error.message);return}
    if(data?.error){setError(data.error);return}
    setLastCreatedCustomer(data);
    setMsg(t("Customer admin account created."));
    setCustomerCompanyName("");setCustomerAdminName("");setCustomerAdminEmail("");setCustomerTempPassword("");
    await loadCustomers();
  }

  async function loadCustomers(){
    if(!isPlatformOwner)return;
    setCustomersLoading(true);
    const {data,error}=await s.functions.invoke("manage-customers",{body:{action:"list"}});
    setCustomersLoading(false);
    if(error){setError(error.message);return}
    if(data?.error){setError(data.error);return}
    setCustomers(data?.customers||[]);
  }

  async function removeCustomer(){
    if(!isPlatformOwner||!deleteCustomer)return;
    setError("");setMsg("");
    if(deleteCustomerConfirm!==deleteCustomer.name){
      setError(t("Type the company name exactly to confirm deletion."));return;
    }
    setDeletingCustomer(true);
    const {data,error}=await s.functions.invoke("manage-customers",{body:{
      action:"delete",
      company_id:deleteCustomer.id,
      confirmation:deleteCustomerConfirm
    }});
    setDeletingCustomer(false);
    if(error){setError(error.message);return}
    if(data?.error){setError(data.error);return}
    setDeleteCustomer(null);setDeleteCustomerConfirm("");
    setMsg(t("Customer and associated Building Community data removed."));
    await loadCustomers();
  }

  async function recordAudit(action:string,entityType:string,entityId:string|null,details:any={},buildingId:string|null=selectedBuildingId||null){
    if(!session)return;
    try{await s.rpc("record_audit_event",{p_action:action,p_target_type:entityType,p_target_id:entityId,p_building_id:buildingId,p_details:details||{}})}catch{}
  }

  async function loadAuditLog(){
    if(!session||!managerData)return;
    setAuditLoading(true);
    const {data,error}=await s.rpc("get_audit_log",{p_limit:200});
    setAuditLoading(false);
    if(error){setError(error.message);return}
    setAuditLog(data||[]);
  }

  function auditActionLabel(action:string){
    const labels:any={
      "customer.created":"Customer created","customer.removed":"Customer removed",
      "building.created":"Building created","manager.invited":"Manager invited",
      "manager.access_updated":"Manager access updated","manager.removed":"Manager removed",
      "tenant.invited":"Tenant invited","tenancy.ended":"Tenancy ended",
      "issue.created":"Issue reported","issue.status_updated":"Issue status updated",
      "notice.created":"Notice created","notice.updated":"Notice updated",
      "notice.completed":"Notice completed","notice.reopened":"Notice reopened",
      "fee.settings_updated":"Fee settings updated","fee.generated":"Monthly fees generated",
      "fee.status_updated":"Fee status updated"
    };
    return t(labels[action]||action);
  }

  async function openCustomerSupportWorkspace(customer:any){
    if(!isPlatformOwner)return;
    setError("");setMsg("");setSupportWorkspaceLoading(true);
    const {data,error}=await s.functions.invoke("manage-customers",{body:{action:"workspace",company_id:customer.id}});
    setSupportWorkspaceLoading(false);
    if(error){setError(error.message);return}
    if(data?.error){setError(data.error);return}
    setSupportWorkspace(data);
    setSupportBuildingId(data?.buildings?.[0]?.id||"");
    setSupportTab("overview");
  }

  function closeCustomerSupportWorkspace(){
    setSupportWorkspace(null);setSupportBuildingId("");setSupportTab("overview");
  }

  function openAccountSettings(){
    const currentName=role==="tenant"?tenantData?.profile?.full_name:managerData?.profile?.full_name;
    setAccountFullName(currentName||"");
    setNewAccountPassword("");
    setConfirmAccountPassword("");
    setError("");setMsg("");
    setShowAccountSettings(true);
  }

  async function saveAccountSettings(){
    if(!session)return;
    setError("");setMsg("");
    if(!accountFullName.trim()){setError(t("Full name is required."));return}
    if(newAccountPassword){
      if(newAccountPassword.length<8){setError(t("Password must be at least 8 characters."));return}
      if(newAccountPassword!==confirmAccountPassword){setError(t("Passwords do not match."));return}
    }
    setSavingAccount(true);
    const {error:profileError}=await s.from("profiles").update({full_name:accountFullName.trim()}).eq("id",session.user.id);
    if(profileError){setSavingAccount(false);setError(profileError.message);return}
    if(newAccountPassword){
      const {error:passwordError}=await s.auth.updateUser({password:newAccountPassword});
      if(passwordError){setSavingAccount(false);setError(passwordError.message);return}
      const {error:flagError}=await s.from("profiles").update({must_change_password:false,updated_at:new Date().toISOString()}).eq("id",session.user.id);
      if(flagError){setSavingAccount(false);setError(flagError.message);return}
      setMustChangePassword(false);
    }
    setSavingAccount(false);
    setMsg(newAccountPassword?t("Profile and password updated."):t("Profile updated."));
    setShowAccountSettings(false);
    await bootstrap(session.user.id);
  }

  async function completeFirstLoginPasswordChange(){
    if(!session)return;
    setError("");setMsg("");
    if(firstLoginPassword.length<8){setError(t("Password must be at least 8 characters."));return}
    if(firstLoginPassword!==firstLoginConfirm){setError(t("Passwords do not match."));return}
    setChangingFirstPassword(true);
    const {error:passwordError}=await s.auth.updateUser({password:firstLoginPassword});
    if(passwordError){setChangingFirstPassword(false);setError(passwordError.message);return}
    const {error:profileError}=await s.from("profiles").update({must_change_password:false,updated_at:new Date().toISOString()}).eq("id",session.user.id);
    if(profileError){setChangingFirstPassword(false);setError(profileError.message);return}
    setChangingFirstPassword(false);
    setFirstLoginPassword("");setFirstLoginConfirm("");
    setMustChangePassword(false);
    setMsg(t("Password changed successfully. Welcome to Building Community."));
    await bootstrap(session.user.id);
  }

  function notificationDeviceLabel(){
    if(typeof navigator==="undefined")return "Web";
    const ua=navigator.userAgent;
    if(/iPhone/i.test(ua))return "iPhone";
    if(/iPad/i.test(ua))return "iPad";
    if(/Android/i.test(ua))return "Android";
    if(/Macintosh|Mac OS X/i.test(ua))return "Mac";
    if(/Windows/i.test(ua))return "Windows";
    return "Web";
  }

  const VAPID_PUBLIC_KEY="BPCeJIgOyWtasWVOHYb7s-zHU1EXx5T1FJRmhO-RaDYuMfp58E5iCJ96nze-5Iw8-0qmZtOxEhpuuqGWrOrCAoE";

  function urlBase64ToUint8Array(base64String:string){
    const padding="=".repeat((4-base64String.length%4)%4);
    const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
    const raw=atob(base64);
    return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
  }

  async function syncPushSubscription(uid:string){
    if(!("serviceWorker" in navigator)||!("PushManager" in window)){
      setPushRegistered(false);
      return null;
    }
    const registration=await navigator.serviceWorker.ready;
    const existing=await registration.pushManager.getSubscription();
    setPushRegistered(!!existing);
    if(existing){
      const json=existing.toJSON();
      const keys=json.keys||{};
      if(json.endpoint&&keys.p256dh&&keys.auth){
        await s.from("push_subscriptions").upsert({
          user_id:uid,
          endpoint:json.endpoint,
          p256dh:keys.p256dh,
          auth:keys.auth,
          device_label:notificationDeviceLabel(),
          updated_at:new Date().toISOString()
        },{onConflict:"endpoint"});
      }
    }
    return existing;
  }

  async function registerPushSubscription(uid:string){
    if(!("serviceWorker" in navigator)||!("PushManager" in window))throw new Error(t("Push notifications are not supported on this browser."));
    const registration=await navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription){
      subscription=await registration.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    const json=subscription.toJSON();
    const keys=json.keys||{};
    if(!json.endpoint||!keys.p256dh||!keys.auth)throw new Error(t("Could not register this device for push notifications."));
    const {error}=await s.from("push_subscriptions").upsert({
      user_id:uid,
      endpoint:json.endpoint,
      p256dh:keys.p256dh,
      auth:keys.auth,
      device_label:notificationDeviceLabel(),
      updated_at:new Date().toISOString()
    },{onConflict:"endpoint"});
    if(error)throw error;
    setPushRegistered(true);
    return subscription;
  }

  async function triggerPush(event_type:string,resource_id:string){
    try{
      const {error}=await s.functions.invoke("send-push",{body:{event_type,resource_id}});
      if(error)console.warn("push dispatch",error.message);
    }catch(e){
      console.warn("push dispatch",e);
    }
  }

  async function loadNotificationPreferences(uid:string){
    const supported=typeof window!=="undefined"&&"Notification" in window;
    const browserPermission=supported?Notification.permission:"unsupported";
    if(browserPermission==="granted")await syncPushSubscription(uid); else setPushRegistered(false);
    const {data,error}=await s.from("notification_preferences").select("*").eq("user_id",uid).maybeSingle();
    if(error){
      console.warn("notification preferences",error.message);
      return;
    }
    if(data){
      setNotificationPrefs({...data,permission:browserPermission});
      if(data.permission!==browserPermission){
        await s.from("notification_preferences").update({permission:browserPermission,updated_at:new Date().toISOString()}).eq("user_id",uid);
      }
    }else{
      const initial={
        user_id:uid,
        enabled:browserPermission==="granted",
        building_notices:true,
        fee_reminders:true,
        issue_updates:true,
        manager_new_issues:true,
        callback_requests:true,
        permission:browserPermission,
        device_label:notificationDeviceLabel(),
        updated_at:new Date().toISOString()
      };
      const {error:insertError}=await s.from("notification_preferences").insert(initial);
      if(!insertError)setNotificationPrefs(initial);
    }
  }

  async function saveNotificationPreferences(next:any=notificationPrefs){
    if(!session?.user?.id)return;
    setNotificationSaving(true);setError("");setMsg("");
    const payload={
      user_id:session.user.id,
      enabled:!!next.enabled,
      building_notices:!!next.building_notices,
      fee_reminders:!!next.fee_reminders,
      issue_updates:!!next.issue_updates,
      manager_new_issues:!!next.manager_new_issues,
      callback_requests:!!next.callback_requests,
      permission:next.permission||("Notification" in window?Notification.permission:"unsupported"),
      device_label:notificationDeviceLabel(),
      updated_at:new Date().toISOString()
    };
    const {error}=await s.from("notification_preferences").upsert(payload,{onConflict:"user_id"});
    setNotificationSaving(false);
    if(error){setError(error.message);return}
    setNotificationPrefs(payload);
    setMsg(t("Notification preferences saved."));
  }

  async function enableDeviceNotifications(){
    if(!("Notification" in window)){
      const next={...notificationPrefs,enabled:false,permission:"unsupported"};
      setNotificationPrefs(next);
      await saveNotificationPreferences(next);
      setError(t("Notifications are not supported on this browser."));
      return;
    }
    const permission=await Notification.requestPermission();
    const next={...notificationPrefs,enabled:permission==="granted",permission};
    setNotificationPrefs(next);
    await saveNotificationPreferences(next);
    if(permission==="granted"){
      try{
        await registerPushSubscription(session.user.id);
        setMsg(t("Push notifications are connected on this device."));
      }catch(e:any){
        setError(e?.message||t("Could not register this device for push notifications."));
      }
    }
    if(permission==="denied")setError(t("Notification permission is blocked in your browser settings."));
  }

  function isFutureJwtError(error:any){
    const message=String(error?.message||error||"").toLowerCase();
    return message.includes("jwt issued at future")||message.includes("pgrst303");
  }

  async function bootstrap(uid:string,retried=false){
    setLoading(true);setError("");
    const {data:p,error:pe}=await s.from("profiles").select("id,full_name,email,role,avatar_url,must_change_password").eq("id",uid).single();

    if(pe&&isFutureJwtError(pe)&&!retried){
      // Supabase/PostgREST can very briefly see a newly-issued token as being
      // in the future if service clocks differ by a few seconds.
      await new Promise(resolve=>setTimeout(resolve,1800));
      const {data:refreshed}=await s.auth.refreshSession();
      if(refreshed.session)setSession(refreshed.session);
      return bootstrap(uid,true);
    }

    if(pe){setError(pe.message);setLoading(false);return}
    setRole(p.role);
    setMustChangePassword(!!p.must_change_password);
    if(p.must_change_password){setLoading(false);return}
    await loadNotificationPreferences(uid);
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

  function managerNotificationSeenKey(buildingId:string,uid:string){
    return `bm_manager_issue_seen_${buildingId}_${uid}`;
  }

  function markManagerNotificationsSeen(){
    if(!managerData?.selectedBuilding||!session)return;
    const latest=(managerData.issues||[])[0]?.id||"none";
    localStorage.setItem(managerNotificationSeenKey(managerData.selectedBuilding.id,session.user.id),latest);
    setManagerNotificationsSeen(true);
    setManagerTab("dashboard");
    setIssueApartmentFocus(null);
    setIssueFilter("active");
    setTimeout(()=>document.getElementById("issueDashboardCard")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
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
    const latestManagerIssue=(i||[])[0]?.id||"none";
    const managerSeen=localStorage.getItem(managerNotificationSeenKey(buildingId,uid));
    setManagerNotificationsSeen(managerSeen===latestManagerIssue);

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
    await recordAudit("tenancy.ended","apartment",selectedApartment.id,{apartment_number:selectedApartment.apartment_number,replace_tenant:replace},selectedBuildingId);
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
    await recordAudit("manager.invited","manager_invitation",row?.invitation_id||null,{email:teamInviteEmail.trim().toLowerCase(),building_ids:teamInviteBuildings},null);
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
    await recordAudit("manager.access_updated","profile",editingManager.user_id,{email:editingManager.email,building_ids:editingManagerBuildings},null);
    setEditingManager(null);
    setMsg(t("Manager building access updated."));
    await loadTeamData();
  }

  async function removeManager(userId:string){
    if(!window.confirm(t("Remove this manager from the company?")))return;
    const {error}=await s.rpc("remove_company_manager",{p_manager_id:userId});
    if(error){setError(error.message);return}
    await recordAudit("manager.removed","profile",userId,{},null);
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
    await recordAudit("tenant.invited","invitation",data.id,{email:inviteEmail.trim().toLowerCase(),apartment_number:inviteApartment.apartment_number},selectedBuildingId);
    const url=inviteUrl(data.token);
    setLastInviteLink(url);
    setInviteApartment(null);setInviteEmail("");
    setMsg(`Invitation created for Apartment ${selectedApartment?.apartment_number||""}.`);
    await copyInvite(url);
    await loadManagerBuilding(session.user.id,managerData.profile,managerData.buildings,selectedBuildingId);
  }

  async function submitIssue(){
    if(!tenantData||!session||!description.trim())return;
    const {data:created,error:e}=await s.from("issues").insert({building_id:tenantData.building.id,apartment_id:tenantData.apartment.id,tenant_id:session.user.id,severity,description:description.trim(),callback_requested:callback}).select("id").single();
    if(e){setError(e.message);return}
    if(created?.id)await triggerPush("issue_created",created.id);
    if(created?.id)await recordAudit("issue.created","issue",created.id,{severity,callback_requested:callback},tenantData.building.id);
    setShowReport(false);setDescription("");setCallback(false);setMsg("Issue submitted to the building manager.");
    await loadTenant(session.user.id,tenantData.profile);
  }

  async function updateIssue(id:string,status:"acknowledged"|"in_progress"|"resolved"){
    const patch:any={status};
    if(status==="acknowledged")patch.acknowledged_at=new Date().toISOString();
    if(status==="resolved")patch.resolved_at=new Date().toISOString();
    const {error:e}=await s.from("issues").update(patch).eq("id",id);
    if(e){setError(e.message);return}
    await triggerPush("issue_updated",id);
    await recordAudit("issue.status_updated","issue",id,{status},selectedBuildingId);
    setMsg("Issue status updated.");await loadManager(session.user.id,managerData.profile);
  }

  async function createAnnouncement(){
    if(!session||!selectedBuildingId||!noticeTitle.trim()||!noticeMessage.trim())return;
    const {data:created,error:e}=await s.from("announcements").insert({
      building_id:selectedBuildingId,manager_id:session.user.id,type:noticeType,title:noticeTitle.trim(),message:noticeMessage.trim(),
      starts_at:noticeStart?new Date(noticeStart).toISOString():null,ends_at:noticeEnd?new Date(noticeEnd).toISOString():null
    }).select("id").single();
    if(e){setError(e.message);return}
    if(created?.id)await triggerPush("announcement_created",created.id);
    if(created?.id)await recordAudit("notice.created","announcement",created.id,{title:noticeTitle.trim(),type:noticeType},selectedBuildingId);
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
    await triggerPush("announcement_updated",editingNotice.id);
    await recordAudit("notice.updated","announcement",editingNotice.id,{title:editNoticeTitle.trim(),type:editNoticeType},selectedBuildingId);
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
    await recordAudit("notice.completed","announcement",id,{},selectedBuildingId);
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
    await recordAudit("notice.reopened","announcement",id,{},selectedBuildingId);
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

    await recordAudit("fee.settings_updated","apartment",selectedApartment.id,{apartment_number:selectedApartment.apartment_number,monthly_fee:amount,due_day:dueDay},selectedBuildingId);
    setMsg("Apartment fee settings updated.");
    await loadManager(session.user.id,managerData.profile);
  }

  async function generateFees(){
    if(!selectedBuildingId)return;
    const period=currentPeriod+"-01";
    const {data,error}=await s.rpc("generate_monthly_fees",{p_building_id:selectedBuildingId,p_period_month:period});
    if(error){setError(error.message);return}
    await recordAudit("fee.generated","building",selectedBuildingId,{period:currentPeriod,records_generated:data||0},selectedBuildingId);
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

    await recordAudit("fee.status_updated","fee_record",id,{status:paid?"paid":"pending",apartment_id:current?.apartment_id||null},current?.building_id||selectedBuildingId);
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

  function handleAuthKeyDown(e:React.KeyboardEvent){
    if(e.key!=="Enter"||e.shiftKey)return;
    const target=e.target as HTMLElement;
    if(target.tagName==="TEXTAREA"||target.tagName==="BUTTON"||target.tagName==="SELECT")return;
    e.preventDefault();
    signIn();
  }

  const languageSelector=<select className="languageSelect" value={language} onChange={e=>setLanguage(e.target.value as "en"|"bg")} aria-label="Language">
    <option value="en">EN</option>
    <option value="bg">BG</option>
  </select>;

  const accountSettingsModal=showAccountSettings&&<div className="modal"><div className="modalcard notificationSettingsModal">
    <div className="row"><div><h2>👤 {t("Account Settings")}</h2><div className="muted">{t("Update your profile or change your password.")}</div></div><button className="secondary compactButton" onClick={()=>setShowAccountSettings(false)}>✕</button></div>
    <label>{t("Full name")}</label>
    <input value={accountFullName} onChange={e=>setAccountFullName(e.target.value)}/>
    <label>{t("Email")}</label>
    <input type="email" value={session?.user?.email||""} disabled/>
    <div className="notificationStageNote">🔐 {t("Leave the password fields empty if you only want to update your name.")}</div>
    <label>{t("New password")}</label>
    <input type="password" autoComplete="new-password" value={newAccountPassword} onChange={e=>setNewAccountPassword(e.target.value)} placeholder={t("Minimum 8 characters")}/>
    <label>{t("Confirm new password")}</label>
    <input type="password" autoComplete="new-password" value={confirmAccountPassword} onChange={e=>setConfirmAccountPassword(e.target.value)}/>
    <button className="primary full" disabled={savingAccount} onClick={saveAccountSettings}>{savingAccount?t("Saving…"):t("Save Account Settings")}</button>
  </div></div>;

  const notificationSettingsModal=showNotificationSettings&&<div className="modal"><div className="modalcard notificationSettingsModal">
    <div className="row"><div><h2>🔔 {t("Notification Settings")}</h2><div className="muted">{t("Choose which alerts you want on this device.")}</div></div><button className="secondary compactButton" onClick={()=>setShowNotificationSettings(false)}>✕</button></div>

    <div className="notificationPermissionBox">
      <div>
        <b>{t("Device notifications")}</b>
        <div className="muted">{t("Permission")}: {t(String(notificationPrefs.permission||"default"))}</div>
      </div>
      <button className={pushRegistered?"secondary":"primary"} onClick={enableDeviceNotifications}>
        {pushRegistered?t("Push connected"):notificationPrefs.permission==="granted"?t("Connect push notifications"):t("Enable on this device")}
      </button>
    </div>

    {role==="tenant"&&<div className="notificationChoiceList">
      <label className="notificationChoice"><input type="checkbox" checked={!!notificationPrefs.building_notices} onChange={e=>setNotificationPrefs((p:any)=>({...p,building_notices:e.target.checked}))}/><span><b>{t("Building notices")}</b><small>{t("New notices and schedule changes.")}</small></span></label>
      <label className="notificationChoice"><input type="checkbox" checked={!!notificationPrefs.fee_reminders} onChange={e=>setNotificationPrefs((p:any)=>({...p,fee_reminders:e.target.checked}))}/><span><b>{t("Fee reminders")}</b><small>{t("Upcoming and overdue monthly fees.")}</small></span></label>
      <label className="notificationChoice"><input type="checkbox" checked={!!notificationPrefs.issue_updates} onChange={e=>setNotificationPrefs((p:any)=>({...p,issue_updates:e.target.checked}))}/><span><b>{t("Issue updates")}</b><small>{t("Changes to issues you reported.")}</small></span></label>
    </div>}

    {role!=="tenant"&&<div className="notificationChoiceList">
      <label className="notificationChoice"><input type="checkbox" checked={!!notificationPrefs.manager_new_issues} onChange={e=>setNotificationPrefs((p:any)=>({...p,manager_new_issues:e.target.checked}))}/><span><b>{t("New tenant issues")}</b><small>{t("Alerts when a tenant submits a new issue.")}</small></span></label>
      <label className="notificationChoice"><input type="checkbox" checked={!!notificationPrefs.callback_requests} onChange={e=>setNotificationPrefs((p:any)=>({...p,callback_requests:e.target.checked}))}/><span><b>{t("Callback requests")}</b><small>{t("Alerts when a tenant asks for a callback.")}</small></span></label>
    </div>}

    <div className="notificationStageNote">ℹ️ {pushRegistered?t("This device is registered for real push notifications."):t("Enable and connect this device to receive notifications while the app is closed.")}</div>
    <button className="primary full" disabled={notificationSaving} onClick={()=>saveNotificationPreferences()}>{notificationSaving?t("Saving…"):t("Save Notification Settings")}</button>
  </div></div>;

  if(loading)return <main className="shell"><div className="card"><h1>{t("Loading…")}</h1></div></main>;

  if(!session)return <main className="shell"><div className="card authCard" onKeyDown={handleAuthKeyDown}>
    <div className="row"><h1>🏠 {t("Building Community")}</h1>{languageSelector}</div><p>{t("Sign in to continue.")}</p>
    {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}
    
    <label>{t("Email")}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <label>{t("Password")}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="primary full" onClick={signIn}>{t("Log in")}</button>
    <button className="textButton full" disabled={resetSending} onClick={sendPasswordReset}>{resetSending?t("Sending…"):t("Forgot password?")}</button>
    {isIosSafari&&!isStandalone&&<>
      <button className="secondary full installAppButton" onClick={()=>setShowInstallHelp(v=>!v)}>📱 {t("Install on iPhone")}</button>
      {showInstallHelp&&<div className="installHelp">
        <b>{t("Add Building Community to your Home Screen")}</b>
        <div>1. {t("Tap the Share button in Safari.")}</div>
        <div>2. {t("Choose Add to Home Screen.")}</div>
        <div>3. {t("Tap Add.")}</div>
      </div>}
    </>}
    {isAndroid&&!isStandalone&&androidInstallPrompt&&
      <button className="secondary full installAppButton" onClick={async()=>{
        await androidInstallPrompt.prompt();
        await androidInstallPrompt.userChoice.catch(()=>null);
        setAndroidInstallPrompt(null);
      }}>📱 {t("Install on Android")}</button>
    }
  </div></main>;

  if(mustChangePassword&&session)return <main className="shell">
    <div className="card authCard" onKeyDown={e=>{
      if(e.key==="Enter"&&!e.shiftKey){
        const target=e.target as HTMLElement;
        if(target.tagName!=="BUTTON"&&target.tagName!=="SELECT"){e.preventDefault();completeFirstLoginPasswordChange()}
      }
    }}>
      <div className="row"><h1>🔐 {t("Change your temporary password")}</h1>{languageSelector}</div>
      <p>{t("For security, you must choose your own password before continuing to Building Community.")}</p>
      {error&&<div className="notice error">{error}</div>}
      {msg&&<div className="notice success">{msg}</div>}
      <label>{t("New password")}</label>
      <input type="password" autoComplete="new-password" value={firstLoginPassword} onChange={e=>setFirstLoginPassword(e.target.value)} placeholder={t("Minimum 8 characters")}/>
      <label>{t("Confirm new password")}</label>
      <input type="password" autoComplete="new-password" value={firstLoginConfirm} onChange={e=>setFirstLoginConfirm(e.target.value)}/>
      <button className="primary full" disabled={changingFirstPassword} onClick={completeFirstLoginPasswordChange}>{changingFirstPassword?t("Saving…"):t("Set New Password")}</button>
      <button className="secondary full" disabled={changingFirstPassword} onClick={()=>s.auth.signOut()}>{t("Sign out")}</button>
    </div>
  </main>;

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
          <button className="bellButton" onClick={openAccountSettings} aria-label={t("Account Settings")}>👤</button>
          <button className="bellButton" onClick={()=>setShowNotificationSettings(true)} aria-label={t("Notification Settings")}>⚙️</button>
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
        <div className="row"><div><h2 style={{margin:0}}>🏢 {t("Building Community")}</h2><p style={{marginBottom:0}}>{t("Tap to make a direct report")}</p></div><b>›</b></div>
      </button>

      <div className="card communityCard">
        <div className="row">
          <div><h2>{t("Building Community")}</h2><div className="muted">{t("Status only — issue details remain private.")}</div></div>
          <span className="tag">{community.length} {community.length===1?t("resident"):t("residents")}</span>
        </div>

        <div className="communityStage">
          <button className="managerHub" onClick={()=>setShowReport(true)}>
            <span className="managerHubIcon">🏢</span>
            <span>{t("Building Community")}</span>
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

      {accountSettingsModal}
      {notificationSettingsModal}
      {showReport&&<div className="modal"><div className="modalcard"><h2>{t("Report an issue")}</h2>
        <div className="grid2"><button className={severity==="yellow"?"yellowChoice":"secondary"} onClick={()=>setSeverity("yellow")}>🟡 {t("Small discomfort")}</button><button className={severity==="red"?"redChoice":"secondary"} onClick={()=>setSeverity("red")}>🔴 {t("Bigger issue")}</button></div>
        <label>{t("Description")}</label><textarea value={description} onChange={e=>setDescription(e.target.value)}/>
        <label className="check"><input type="checkbox" checked={callback} onChange={e=>setCallback(e.target.checked)}/> {t("Request a callback")}</label>
        <button className="primary full" onClick={submitIssue}>{t("Submit Report")}</button><button className="secondary full" onClick={()=>setShowReport(false)}>{t("Cancel")}</button>
      </div></div>}
    </main>
  }

  return <main className="shell">
    <div className="top"><div><b>🏠 {t("Building Community")}</b><div className="muted">{managerData?.profile?.full_name} • {t("Manager Portal")}</div></div><div className="headerActions">{languageSelector}<button className="bellButton" onClick={markManagerNotificationsSeen} aria-label={t("Notifications")}>🔔{managerIssues.length>0&&!managerNotificationsSeen&&<span className="bellDot"></span>}</button><button className="bellButton" onClick={openAccountSettings} aria-label={t("Account Settings")}>👤</button><button className="bellButton" onClick={()=>setShowNotificationSettings(true)} aria-label={t("Notification Settings")}>⚙️</button><button className="danger" onClick={()=>s.auth.signOut()}>{t("Sign out")}</button></div></div>
    {error&&<div className="notice error">{error}</div>}{msg&&<div className="notice success">{msg}</div>}
    {accountSettingsModal}
    {notificationSettingsModal}

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
      <button className={`managerTab ${managerTab==="audit"?"managerTabActive":""}`} onClick={()=>{setManagerTab("audit");loadAuditLog()}}>
        {t("Activity & Audit Log")}
      </button>
      {managerData?.memberRole==="company_admin"&&<button className={`managerTab ${managerTab==="team"?"managerTabActive":""}`} onClick={()=>setManagerTab("team")}>
        {t("Team Management")}
        {team.filter((m:any)=>m.role==="manager").length>0&&<span className="tabCount">{team.filter((m:any)=>m.role==="manager").length}</span>}
      </button>}
      {isPlatformOwner&&<button className={`managerTab ${managerTab==="customers"?"managerTabActive":""}`} onClick={()=>{setManagerTab("customers");loadCustomers()}}>
        {t("Customer Administration")}
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
          <span>{t("Building Community")}</span>
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

    {managerTab==="audit"&&<>
      <div className="card">
        <div className="row"><div><h2>🧾 {t("Activity & Audit Log")}</h2><div className="muted">{t("A chronological record of important actions in your company.")}</div></div><button className="secondary" disabled={auditLoading} onClick={loadAuditLog}>{auditLoading?t("Loading…"):t("Refresh")}</button></div>
        {auditLoading?<p>{t("Loading…")}</p>:auditLog.length===0?<p>{t("No activity recorded yet.")}</p>:auditLog.map((a:any)=><div className="teamMemberRow" key={a.id}>
          <div><b>{auditActionLabel(a.action)}</b><div className="muted">{a.actor_name||a.actor_email||t("System")} • {new Date(a.created_at).toLocaleString(dateLocale)}</div>
          {a.building_name&&<div className="teamBuildingChips"><span className="tag">{a.building_name}</span></div>}
          {a.details&&Object.keys(a.details).length>0&&<div className="muted">{Object.entries(a.details).filter(([k])=>!["password","temporary_password","token"].includes(k)).slice(0,5).map(([k,v]:any)=>`${k.replaceAll("_"," ")}: ${Array.isArray(v)?v.length+" item(s)":String(v)}`).join(" • ")}</div>}</div>
          <span className="tag">{a.target_type}</span>
        </div>)}
      </div>
    </>}

    {managerTab==="customers"&&isPlatformOwner&&<>
      <div className="card">
        <div className="row"><div><h2>🛡️ {t("Customer Administration")}</h2><div className="muted">{t("Create a new customer company and its first company administrator.")}</div></div><span className="tag">{t("Platform Owner")}</span></div>

        <div className="teamInviteBox" onKeyDown={e=>{
          if(e.key==="Enter"&&!e.shiftKey){
            const target=e.target as HTMLElement;
            if(target.tagName!=="BUTTON"&&target.tagName!=="TEXTAREA"){e.preventDefault();createCustomerAdmin()}
          }
        }}>
          <label>{t("Company name")}</label>
          <input value={customerCompanyName} onChange={e=>setCustomerCompanyName(e.target.value)} placeholder={t("Example: ABC Property Management")}/>
          <label>{t("Admin name")}</label>
          <input value={customerAdminName} onChange={e=>setCustomerAdminName(e.target.value)} placeholder={t("Full name")}/>
          <label>{t("Admin email")}</label>
          <input type="email" value={customerAdminEmail} onChange={e=>setCustomerAdminEmail(e.target.value)} placeholder="admin@example.com"/>
          <label>{t("Temporary password")}</label>
          <input type="password" autoComplete="new-password" value={customerTempPassword} onChange={e=>setCustomerTempPassword(e.target.value)} placeholder={t("Minimum 8 characters")}/>
          <div className="muted setupHint">{t("Give these login details to the customer securely. They can then create buildings and invite their managers.")}</div>
          <button className="primary full" disabled={creatingCustomerAdmin} onClick={createCustomerAdmin}>{creatingCustomerAdmin?t("Creating…"):t("Create Customer Admin")}</button>
        </div>

        {lastCreatedCustomer&&<div className="notice success">
          <b>{t("Customer ready")}: {lastCreatedCustomer.company_name}</b>
          <div>{t("Admin email")}: {lastCreatedCustomer.admin_email}</div>
          <div className="muted">{t("The temporary password is not stored or shown again.")}</div>
        </div>}

        <div className="row customerListHeader"><div><h3>{t("Customer Portfolio")}</h3><div className="muted">{t("Read-only overview of every customer and the buildings they manage.")}</div></div><button className="secondary" disabled={customersLoading} onClick={loadCustomers}>{customersLoading?t("Loading…"):t("Refresh")}</button></div>
        {customersLoading?<p>{t("Loading…")}</p>:customers.length===0?<p>{t("No customer accounts found.")}</p>:customers.map((c:any)=><div className="card" key={c.id}>
          <div className="teamMemberRow">
            <div>
              <b>{c.name}</b>
              <div className="muted">{c.admin?.full_name||t("Company Admin")} • {c.admin?.email||c.email||""}</div>
              <div className="teamBuildingChips">
                <span className="tag">🏢 {c.building_count||0} {t("buildings")}</span>
                <span className="tag">🏠 {c.apartment_count||0} {t("apartments")}</span>
                <span className="tag">👥 {c.active_tenant_count||0} {t("active tenants")}</span>
                <span className="tag">🛠️ {c.open_issue_count||0} {t("open issues")}</span>
              </div>
            </div>
            <div className="teamMemberActions">
              <button className="secondary" onClick={()=>setExpandedCustomerId(expandedCustomerId===c.id?null:c.id)}>{expandedCustomerId===c.id?t("Hide Buildings"):t("View Buildings")}</button>
              <button className="primary" disabled={supportWorkspaceLoading} onClick={()=>openCustomerSupportWorkspace(c)}>{supportWorkspaceLoading?t("Opening…"):t("Open Support Workspace")}</button>
              <button className="danger" onClick={()=>{setDeleteCustomer(c);setDeleteCustomerConfirm("");setError("");setMsg("")}}>{t("Remove Customer")}</button>
            </div>
          </div>
          {expandedCustomerId===c.id&&<>
            <div className="notice">🔒 {t("Platform Owner view is read-only.")}</div>
            {(c.buildings||[]).length===0?<p>{t("This customer has not created any buildings yet.")}</p>:(c.buildings||[]).map((b:any)=><div className="teamMemberRow" key={b.id}>
              <div>
                <b>🏢 {b.name}</b>
                <div className="muted">{[b.address,b.city,b.postal_code].filter(Boolean).join(" • ")}</div>
              </div>
              <div className="teamBuildingChips">
                <span className="tag">🏠 {b.apartment_count||0} {t("apartments")}</span>
                <span className="tag">👥 {b.active_tenant_count||0} {t("active tenants")}</span>
                <span className="tag">🛠️ {b.open_issue_count||0} {t("open issues")}</span>
              </div>
            </div>)}
          </>}
        </div>)}
      </div>
    </>}

    {supportWorkspace&&<div className="modal supportWorkspaceModal"><div className="modalcard supportWorkspaceCard">
      <div className="row">
        <div><h2>🛟 {t("Platform Owner Support Mode")}</h2><div className="muted">{supportWorkspace.company?.name} • {t("Read-only troubleshooting workspace")}</div></div>
        <button className="secondary" onClick={closeCustomerSupportWorkspace}>{t("Exit Support Mode")}</button>
      </div>
      <div className="notice">🔒 {t("This support session is read-only and has been recorded in the Audit Log.")}</div>

      {(supportWorkspace.buildings||[]).length===0?<p>{t("This customer has not created any buildings yet.")}</p>:<>
        <label>{t("Building")}</label>
        <select value={supportBuildingId} onChange={e=>{setSupportBuildingId(e.target.value);setSupportTab("overview")}}>
          {(supportWorkspace.buildings||[]).map((b:any)=><option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}
        </select>

        <div className="managerTabs supportTabs">
          {(["overview","issues","notices","fees","residents"] as const).map(tab=><button key={tab} className={`managerTab ${supportTab===tab?"managerTabActive":""}`} onClick={()=>setSupportTab(tab)}>
            {t(tab==="overview"?"Overview":tab==="issues"?"Issues":tab==="notices"?"Building Notices":tab==="fees"?"Fees":"Residents")}
          </button>)}
        </div>

        {(()=>{
          const b=(supportWorkspace.buildings||[]).find((x:any)=>x.id===supportBuildingId);
          const aps=(supportWorkspace.apartments||[]).filter((x:any)=>x.building_id===supportBuildingId);
          const issues=(supportWorkspace.issues||[]).filter((x:any)=>x.building_id===supportBuildingId);
          const notices=(supportWorkspace.announcements||[]).filter((x:any)=>x.building_id===supportBuildingId);
          const fees=(supportWorkspace.fees||[]).filter((x:any)=>x.building_id===supportBuildingId);
          const tenancy=(supportWorkspace.tenancies||[]).filter((t:any)=>aps.some((a:any)=>a.id===t.apartment_id)&&!t.ended_at);
          const profiles=new Map<string,any>((supportWorkspace.tenant_profiles||[]).map((p:any)=>[p.id,p]));
          const aptMap=new Map<string,any>(aps.map((a:any)=>[a.id,a]));
          if(supportTab==="overview")return <div className="card"><h3>{b?.name}</h3><p className="muted">{b?.address}{b?.city?` • ${b.city}`:""}</p><div className="teamBuildingChips"><span className="tag">🏠 {aps.length} {t("apartments")}</span><span className="tag">👥 {tenancy.length} {t("active tenants")}</span><span className="tag">🛠️ {issues.filter((i:any)=>i.status!=="resolved").length} {t("open issues")}</span><span className="tag">📣 {notices.filter((n:any)=>!n.completed_at).length} {t("active notices")}</span></div></div>;
          if(supportTab==="issues")return <div className="card">{issues.length===0?<p>{t("No issues found.")}</p>:issues.map((i:any)=><div className="teamMemberRow" key={i.id}><div><b>{i.severity==="red"?"🔴":"🟡"} {t(i.status)}</b><div>{i.description}</div><div className="muted">{t("Apartment")} {aptMap.get(i.apartment_id)?.apartment_number||"?"} • {new Date(i.created_at).toLocaleString(dateLocale)}</div></div></div>)}</div>;
          if(supportTab==="notices")return <div className="card">{notices.length===0?<p>{t("No building notices yet.")}</p>:notices.map((n:any)=><div className="teamMemberRow" key={n.id}><div><b>📣 {n.title}</b><div>{n.message}</div><div className="muted">{n.completed_at?t("Completed"):t("Pending")} • {new Date(n.created_at).toLocaleString(dateLocale)}</div></div></div>)}</div>;
          if(supportTab==="fees")return <div className="card">{fees.length===0?<p>{t("No fee records found.")}</p>:fees.slice(0,100).map((f:any)=><div className="teamMemberRow" key={f.id}><div><b>{t("Apartment")} {aptMap.get(f.apartment_id)?.apartment_number||"?"} • €{Number(f.amount||0).toFixed(2)}</b><div className="muted">{t(f.status)} • {t("Due")} {f.due_date}</div></div></div>)}</div>;
          return <div className="card">{tenancy.length===0?<p>{t("No active residents found.")}</p>:tenancy.map((tn:any)=>{const p=profiles.get(tn.tenant_id) as any;const a=aptMap.get(tn.apartment_id) as any;return <div className="teamMemberRow" key={`${tn.apartment_id}-${tn.tenant_id}`}><div><b>{p?.full_name||p?.email||t("Resident")}</b><div className="muted">{t("Apartment")} {a?.apartment_number||"?"} • {p?.email||""}</div></div></div>})}</div>;
        })()}
      </>}
    </div></div>}

    {deleteCustomer&&<div className="modal"><div className="modalcard">
      <h2>⚠️ {t("Remove Customer")}</h2>
      <p>{t("This permanently removes the customer, its buildings, apartments, notices, issues, fee records, invitations and accounts that are no longer used elsewhere.")}</p>
      <div className="notice error"><b>{deleteCustomer.name}</b><div>{t("This action cannot be undone.")}</div></div>
      <label>{t("Type the company name to confirm")}</label>
      <input value={deleteCustomerConfirm} onChange={e=>setDeleteCustomerConfirm(e.target.value)} placeholder={deleteCustomer.name}/>
      <button className="danger full" disabled={deletingCustomer||deleteCustomerConfirm!==deleteCustomer.name} onClick={removeCustomer}>{deletingCustomer?t("Removing…"):t("Permanently Remove Customer")}</button>
      <button className="secondary full" disabled={deletingCustomer} onClick={()=>{setDeleteCustomer(null);setDeleteCustomerConfirm("")}}>{t("Cancel")}</button>
    </div></div>}

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

    {editingNotice&&<div className="modal"><div className="modalcard" onKeyDown={e=>{
      if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();updateAnnouncement()}
    }}>
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

    {inviteApartment&&<div className="modal"><div className="modalcard" onKeyDown={e=>{
      if(e.key==="Enter"&&e.target instanceof HTMLInputElement&&inviteEmail.trim()){e.preventDefault();createTenantInvitation()}
    }}>
      <h2>Invite tenant — Apartment {inviteApartment.apartment_number}</h2>
      <p>The invitation will be securely linked to {managerData?.selectedBuilding?.name}, Apartment {inviteApartment.apartment_number}.</p>
      <label>{t("Tenant email")}</label>
      <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="tenant@example.com"/>
      <button className="primary full" disabled={!inviteEmail.trim()} onClick={createTenantInvitation}>{t("Create Invitation")}</button>
      <button className="secondary full" onClick={()=>{setInviteApartment(null);setInviteEmail("")}}>{t("Cancel")}</button>
    </div></div>}
  </main>
}