import {Suspense} from "react";
import ManagerInviteClient from "./ManagerInviteClient";

export default function ManagerInvitePage(){
  return <main className="shell"><Suspense fallback={<div className="card">…</div>}><ManagerInviteClient/></Suspense></main>
}