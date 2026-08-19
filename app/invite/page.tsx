import {Suspense} from "react";
import InviteClient from "./InviteClient";

export default function InvitePage(){
  return <main className="shell">
    <Suspense fallback={<div className="card" style={{maxWidth:520,margin:"60px auto"}}><h1>Checking invitation…</h1></div>}>
      <InviteClient/>
    </Suspense>
  </main>
}