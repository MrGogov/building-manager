 "use client";
import {useEffect,useState} from "react";
import {useSearchParams,useRouter} from "next/navigation";
import {createClient} from "../../lib/supabase-browser";
import {useLanguage} from "../../lib/i18n";

export default function InviteClient(){
  const{language,setLanguage,t}=useLanguage();
  const sp=useSearchParams();
  const router=useRouter();
  const s=createClient();

  const token=sp.get("token")||"";
  const code=sp.get("code");

  const[inv,setInv]=useState<any>(null);
  const[name,setName]=useState("");
  const[pw,setPw]=useState("");
  const[err,setErr]=useState("");
  const[info,setInfo]=useState("");
  const[done,setDone]=useState(false);
  const[busy,setBusy]=useState(true);
  const[session,setSession]=useState<any>(null);

  useEffect(()=>{
    initialize();
  },[token,code]);

  async function initialize(){
    setBusy(true);setErr("");

    if(!token){
      setErr("Invalid invitation link.");
      setBusy(false);
      return;
    }

    if(code){
      const {error}=await s.auth.exchangeCodeForSession(code);
      if(error){
        setErr(error.message);
        setBusy(false);
        return;
      }
      // Remove the auth code from the visible URL while preserving the invite token.
      history.replaceState({}, "", `/invite?token=${encodeURIComponent(token)}`);
    }

    const {data:{session:currentSession}}=await s.auth.getSession();
    setSession(currentSession);

    const {data,error}=await s.rpc("get_invitation_by_token",{p_token:token});
    if(error||!data?.length){
      setErr(error?.message||"Invitation not found.");
      setBusy(false);
      return;
    }

    const row=data[0];
    if(row.status!=="pending"){
      setErr("This invitation has already been used or revoked.");
      setBusy(false);
      return;
    }
    if(new Date(row.expires_at)<=new Date()){
      setErr("This invitation has expired.");
      setBusy(false);
      return;
    }

    setInv(row);
    setBusy(false);

    if(currentSession){
      await completeInvitation(currentSession);
    }
  }

  async function createAccount(){
    if(!inv)return;
    setBusy(true);setErr("");setInfo("");

    const redirectTo=`${location.origin}/invite?token=${encodeURIComponent(token)}`;
    const {data,error}=await s.auth.signUp({
      email:inv.email,
      password:pw,
      options:{
        emailRedirectTo:redirectTo,
        data:{full_name:name,role:"tenant"}
      }
    });

    if(error){
      setErr(error.message);
      setBusy(false);
      return;
    }

    if(data.session){
      setSession(data.session);
      await completeInvitation(data.session);
      return;
    }

    setInfo("Account created. Check your email and confirm your address. The confirmation link will return you to this invitation.");
    setBusy(false);
  }

  async function completeInvitation(currentSession?:any){
    const sess=currentSession||(await s.auth.getSession()).data.session;
    if(!sess){
      setErr("Please confirm your email and sign in before accepting the invitation.");
      setBusy(false);
      return;
    }

    const {data,error}=await s.rpc("accept_invitation",{p_token:token});
    if(error){
      setErr(error.message);
      setBusy(false);
      return;
    }

    setDone(true);
    setBusy(false);
  }

  const languageSelector=<select className="languageSelect" value={language} onChange={e=>setLanguage(e.target.value as "en"|"bg")}><option value="en">EN</option><option value="bg">BG</option></select>;

  return <div className="card" style={{maxWidth:520,margin:"60px auto"}}>
    <div className="row"><h1>🏠 {t("Tenant invitation")}</h1>{languageSelector}</div>

    {busy&&!inv&&!err&&<p>{t("Checking invitation…")}</p>}
    {err&&<div className="notice error">{err}</div>}
    {info&&<div className="notice success">{info}</div>}

    {done&&<>
      <div className="notice success">
        {t("Invitation accepted. Your account is now linked to Apartment")} {inv?.apartment_number}.
      </div>
      <button className="primary full" onClick={()=>router.push("/")}>{t("Open Building Manager")}</button>
    </>}

    {inv&&!done&&!session&&<>
      <p>
        You have been invited to <b>{inv.building_name}</b>,
        Apartment <b>{inv.apartment_number}</b>.
      </p>

      <label>{t("Tenant name")}</label>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder={t("Your full name")}/>

      <label>{t("Email")}</label>
      <input value={inv.email} readOnly/>

      <label>{t("Password")}</label>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)}/>

      <button className="primary full" disabled={!name||pw.length<8||busy} onClick={createAccount}>
        Create Tenant Account
      </button>
    </>}

    {inv&&!done&&session&&<>
      <p>
        Signed in as <b>{session.user.email}</b>. Complete the invitation for
        Apartment <b>{inv.apartment_number}</b>.
      </p>
      <button className="primary full" disabled={busy} onClick={()=>completeInvitation(session)}>
        Complete Invitation
      </button>
    </>}
  </div>
}