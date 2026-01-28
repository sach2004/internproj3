"use client";
import { signOut, useSession } from "next-auth/react";
import CreateStudent from "../../component/CreateStudent";
import CreateTeacher from "../../component/CreateTeacher";

export default function Principal() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "PRINCIPAL") {
    return <div>Unauthorized. Only principals can access this page.</div>;
  }

  return (
    <div>
      <h1>Principal Dashboard</h1>
      <p>Welcome, {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>

      <button onClick={() => signOut({ callbackUrl: "/login" })}>
        Sign Out
      </button>

      <hr />

      {/* CreateTeacher component */}
      <CreateTeacher />

      <hr />

      {/* CreateStudent component */}
      <CreateStudent />
    </div>
  );
}
