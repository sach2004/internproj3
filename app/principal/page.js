"use client";
import { signOut, useSession } from "next-auth/react";
import CreateStudent from "../../component/CreateStudent";
import CreateTeacher from "../../component/CreateTeacher";

export default function Principal() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Access Denied. Please login.
      </div>
    );
  }

  if (session?.user?.role !== "PRINCIPAL") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Unauthorized.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Principal Dashboard
            </h1>
            <p className="text-gray-400">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Sign Out
          </button>
        </div>

        <div className="space-y-8">
          <CreateTeacher />
          <CreateStudent />
        </div>
      </div>
    </div>
  );
}
