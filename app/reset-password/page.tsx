"use client";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase-browser";
import {useLanguage} from "../../lib/i18n";

export default function ResetPasswordPage(){
  const s=createClient();
  const{language,setLanguage,t}=useLanguage();
  const[password,setPassword]=useState("");
  const[confirm,setConfirm]=useState("");
  const[busy,setBusy]=useState(false);
  const[ready,setReady]=useState(false);
  const[error,setError]=useState("");
  const[msg,setMsg]=useState("");

  useEffect(()=>{
    s.auth.getSession().then(({data})=>{
      if(data.session)setReady(true);
      else setError(t("Open this page from the password reset email."));
    });
    const {data:{subscription}}=s.auth.onAuthStateChange((_event,session)=>{
      if(session)setReady(true);
    });
    return()=>subscription.unsubscribe();
  },[]);

  async function updatePassword(){
    setError("");setMsg("");
    if(password.length<8){setError(t("Password must be at least 8 characters."));return}
    if(password!==confirm){setError(t("Passwords do not match."));return}
    setBusy(true);
    const {error}=await s.auth.updateUser({password});
    setBusy(false);
    if(error){setError(error.message);return}
    setMsg(t("Password updated successfully."));
    setTimeout(()=>location.href="/",900);
  }

  const languageSelector=<select className="languageSelect" value={language} onChange={e=>setLanguage(e.target.value as "en"|"bg")}><option value="en">EN</option><option value="bg">BG</option></select>;

  return <main className="shell">
    <div className="card authCard" onKeyDown={e=>{
      if(e.key==="Enter"&&ready&&!busy&&password&&confirm){
        const target=e.target as HTMLElement;
        if(target.tagName!=="BUTTON"&&target.tagName!=="SELECT"){e.preventDefault();updatePassword()}
      }
    }}>
      <div className="row"><h1>🔐 {t("Reset password")}</h1>{languageSelector}</div>
      <p>{t("Choose a new password for your Building Community account.")}</p>
      {error&&<div className="notice error">{error}</div>}
      {msg&&<div className="notice success">{msg}</div>}
      {ready&&<>
        <label>{t("New password")}</label>
        <input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <label>{t("Confirm new password")}</label>
        <input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/>
        <button className="primary full" disabled={busy} onClick={updatePassword}>{busy?t("Saving…"):t("Update password")}</button>
      </>}
      <button className="secondary full" onClick={()=>location.href="/"}>{t("Back to login")}</button>
    </div>
  </main>
}
