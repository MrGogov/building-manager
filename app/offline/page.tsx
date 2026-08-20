"use client";
export default function OfflinePage(){
  return <main className="shell">
    <div className="card" style={{maxWidth:560,margin:"60px auto"}}>
      <h1>📡 Building Community</h1>
      <h2>You’re offline / Няма интернет връзка</h2>
      <p>The app needs an internet connection to load current building data.</p>
      <p>Приложението се нуждае от интернет връзка, за да зареди актуалните данни за сградата.</p>
      <button className="primary full" onClick={()=>location.reload()}>Reconnect and reload / Свържи се и презареди</button>
    </div>
  </main>
}
