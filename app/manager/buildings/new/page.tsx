 "use client";
import {useEffect,useState} from "react";
import {createClient} from "../../../../lib/supabase-browser";

export default function NewBuildingPage(){
  const s=createClient();
  const[loading,setLoading]=useState(true);
  const[creating,setCreating]=useState(false);
  const[error,setError]=useState("");
  const[name,setName]=useState("");
  const[address,setAddress]=useState("");
  const[city,setCity]=useState("");
  const[postalCode,setPostalCode]=useState("");
  const[totalApartments,setTotalApartments]=useState("10");

  useEffect(()=>{
    s.auth.getSession().then(({data})=>{
      if(!data.session){location.href="/";return}
      setLoading(false);
    });
  },[]);

  async function createBuilding(){
    setError("");
    const count=Number(totalApartments);
    if(!name.trim()||!address.trim()){
      setError("Building name and address are required.");return;
    }
    if(!Number.isInteger(count)||count<1||count>1000){
      setError("Enter a valid number of apartments between 1 and 1000.");return;
    }

    setCreating(true);
    const {data,error}=await s.rpc("create_managed_building",{
      p_name:name.trim(),
      p_address:address.trim(),
      p_city:city.trim()||null,
      p_postal_code:postalCode.trim()||null,
      p_total_apartments:count
    });
    if(error){setError(error.message);setCreating(false);return}

    localStorage.setItem("bm_selected_building",data);
    location.href="/";
  }

  if(loading)return <main className="shell"><div className="card"><h1>Loading…</h1></div></main>;

  return <main className="shell">
    <div className="top">
      <div><b>🏠 Building Manager</b><div className="muted">New building setup</div></div>
      <button className="secondary" onClick={()=>location.href="/"}>← Back to Dashboard</button>
    </div>

    <div className="card newBuildingCard">
      <h1>Create New Building</h1>
      <p>Create the building and its apartments in one step. Apartment numbers will initially be created as 1, 2, 3…</p>
      {error&&<div className="notice error">{error}</div>}

      <label>Building name</label>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Example: Riverside Residence"/>

      <label>Address</label>
      <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street and number"/>

      <div className="grid2">
        <div><label>City</label><input value={city} onChange={e=>setCity(e.target.value)} placeholder="Sofia"/></div>
        <div><label>Postal code</label><input value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="1000"/></div>
      </div>

      <label>Number of apartments</label>
      <input type="number" min="1" max="1000" value={totalApartments} onChange={e=>setTotalApartments(e.target.value)}/>
      <div className="muted setupHint">Tenant invitations and monthly fees can be configured after the building is created.</div>

      <div className="createBuildingActions">
        <button className="secondary" disabled={creating} onClick={()=>location.href="/"}>Cancel</button>
        <button className="primary" disabled={creating} onClick={createBuilding}>{creating?"Creating Building…":"Create Building"}</button>
      </div>
    </div>
  </main>
}