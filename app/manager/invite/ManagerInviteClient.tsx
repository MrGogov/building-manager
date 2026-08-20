"use client";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {createClient} from "../../../lib/supabase-browser";
import {useLanguage} from "../../../lib/i18n";

export default function ManagerInviteClient(){
  const s=createClient();
  const sp=useSearchParams();
  const{language,setLanguage,t}=useLanguage();
  const token=sp.get("token")||"";
  const code=sp.get("code");

  const[inv,setInv]=useState<any>(null);
  const[name,setName]=useState("");
  const[pw,setPw]=useState("");
  const[err,setErr]=useState("");
  const[info,setInfo]=useState("");
  const[busy,setBusy]=useState(true);
  const[done,setDone]=useState(false);

  useEffect(()=>{initialize()},[token,code]);

  async function initialize(){
    setBusy(true);setErr("");
    if(!token){setErr("Invalid invitation link.");setBusy(false);return}
    if(code){
      const {error}=await s.auth.exchangeCodeForSession(code);
      if(error){setErr(error.message);setBusy(false);return}
      history.replaceState({},"",`/manager/invite?token=${encodeURIComponent(token)}`);
    }
    const {data,error}=await s.rpc("get_manager_invitation_by_token",{p_token:token});
    if(error||!data?.length){setErr(error?.message||"Invitation not found.");setBusy(false);return}
    const row=data[0];
    if(row.status!=="pending"){setErr("This invitation has already been used or revoked.");setBusy(false);return}
    if(new Date(row.expires_at)<=new Date()){setErr("This invitation has expired.");setBusy(false);return}
    setInv(row);
    const {data:{session}}=await s.auth.getSession();
    setBusy(false);
    if(session)await accept();
  }

  async function createAccount(){
    if(!inv)return;
    setBusy(true);setErr("");setInfo("");
    const redirectTo=`${location.origin}/manager/invite?token=${encodeURIComponent(token)}`;
    const {data,error}=await s.auth.signUp({
      email:inv.email,password:pw,
      options:{emailRedirectTo:redirectTo,data:{full_name:name,role:"manager"}}
    });
    if(error){setErr(error.message);setBusy(false);return}
    if(data.session){await accept();return}
    setInfo("Account created. Check your email and confirm your address, then return to this invitation.");
    setBusy(false);
  }

  async function accept(){
    const {data:{session}}=await s.auth.getSession();
    if(!session){setErr("Please sign in or create your account first.");setBusy(false);return}
    const {error}=await s.rpc("accept_manager_invitation",{p_token:token});
    if(error){setErr(error.message);setBusy(false);return}
    setDone(true);setBusy(false);
  }

  const languageSelector=<select className="languageSelect" value={language} onChange={e=>setLanguage(e.target.value as "en"|"bg")}><option value="en">EN</option><option value="bg">BG</option></select>;

  return <div className="card" style={{maxWidth:560,margin:"60px auto"}}>
    <div className="row"><h1>👥 {t("Manager Invitation")}</h1>{languageSelector}</div>
    {busy&&!inv&&!err&&<p>…</p>}
    {err&&<div className="notice error">{err}</div>}
    {info&&<div className="notice success">{info}</div>}
    {done&&<>
      <div className="notice success">{t("Manager invitation accepted.")}</div>
      <button className="primary full" onClick={()=>location.href="/"}>{t("Open Manager Dashboard")}</button>
    </>}
    {inv&&!done&&<>
      <p><b>{t("Management company")}:</b> {inv.company_name}</p>
      <div><b>{t("Assigned buildings")}:</b></div>
      <div className="teamBuildingChips">{(inv.building_names||[]).map((x:string)=><span className="tag" key={x}>{x}</span>)}</div>
      <label>{t("Full name")}</label><input value={name} onChange={e=>setName(e.target.value)} placeholder={t("Your full name")}/>
      <label>{t("Email")}</label><input value={inv.email} readOnly/>
      <label>{t("Password")}</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••"/>
      <button className="primary full" disabled={busy||!name.trim()||pw.length<8} onClick={createAccount}>{t("Create Manager Account")}</button>
    </>}
  </div>
}