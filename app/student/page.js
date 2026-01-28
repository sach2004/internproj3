"use client";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "STUDENT") {
      fetchStudentData();
    }
  }, [status, session]);

  async function fetchStudentData() {
    try {
      const response = await axios.get("/api/student/profile");
      setStudentData(response.data);
    } catch (error) {
      console.error("Failed to fetch student data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Access Denied.
      </div>
    );
  }

  if (session?.user?.role !== "STUDENT") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Unauthorized.
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Failed to load data.
      </div>
    );
  }

  const { student } = studentData;
  const profileComplete =
    student.profile &&
    student.profile.name &&
    student.profile.address &&
    student.profile.fName &&
    student.profile.mName;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Student Dashboard
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

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-gray-700">
            Basic Information
          </h2>
          <div className="space-y-3">
            <div className="flex border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-medium min-w-[150px]">
                Roll Number:
              </span>
              <span className="text-white">{student.rollNo}</span>
            </div>
            <div className="flex border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-medium min-w-[150px]">
                Name:
              </span>
              <span className="text-white">{student.name}</span>
            </div>
            <div className="flex border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-medium min-w-[150px]">
                Email:
              </span>
              <span className="text-white">{student.user.email}</span>
            </div>
            <div className="flex pb-3">
              <span className="text-gray-400 font-medium min-w-[150px]">
                Teacher:
              </span>
              <span className="text-white">{student.teacher.name}</span>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-lg border ${
            profileComplete
              ? "bg-blue-900/20 border-blue-700"
              : "bg-yellow-900/20 border-yellow-700"
          }`}
        >
          <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-gray-700">
            Profile Information
          </h2>

          {!profileComplete ? (
            <p className="text-yellow-400">
              ⚠️ Your profile is incomplete. Please wait for your teacher to
              complete it.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex border-b border-gray-700 pb-3">
                <span className="text-gray-400 font-medium min-w-[150px]">
                  Full Name:
                </span>
                <span className="text-white">{student.profile.name}</span>
              </div>
              <div className="flex border-b border-gray-700 pb-3">
                <span className="text-gray-400 font-medium min-w-[150px]">
                  Address:
                </span>
                <span className="text-white">{student.profile.address}</span>
              </div>
              <div className="flex border-b border-gray-700 pb-3">
                <span className="text-gray-400 font-medium min-w-[150px]">
                  Father's Name:
                </span>
                <span className="text-white">{student.profile.fName}</span>
              </div>
              <div className="flex pb-3">
                <span className="text-gray-400 font-medium min-w-[150px]">
                  Mother's Name:
                </span>
                <span className="text-white">{student.profile.mName}</span>
              </div>
              <p className="text-green-400 font-semibold mt-4">
                ✓ Profile Complete
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
