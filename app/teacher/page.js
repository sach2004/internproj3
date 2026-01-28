"use client";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "TEACHER") {
      fetchStudents();
    }
  }, [status, session]);

  async function fetchStudents() {
    try {
      const response = await axios.get("/api/teacher/students");
      setStudents(response.data.students);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  }

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

  if (session?.user?.role !== "TEACHER") {
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
              Teacher Dashboard
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

        <h2 className="text-2xl font-semibold text-white mb-6">My Students</h2>

        {loading ? (
          <p className="text-gray-400">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-400">No students assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => router.push(`/teacher/student/${student.id}`)}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition"
              >
                <h3 className="text-xl font-semibold text-white mb-3">
                  {student.name}
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  <strong>Roll No:</strong> {student.rollNo}
                </p>
                <p className="text-gray-400 text-sm mb-3">
                  <strong>Email:</strong> {student.user.email}
                </p>
                <div
                  className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                    student.profile
                      ? calculateProgress(student.profile) === 100
                        ? "bg-green-900 text-green-300"
                        : calculateProgress(student.profile) >= 50
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-red-900 text-red-300"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {student.profile
                    ? `${calculateProgress(student.profile)}% Complete`
                    : "Not Started"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function calculateProgress(profile) {
  if (!profile) return 0;
  const fields = ["name", "address", "fName", "mName"];
  const filledFields = fields.filter(
    (field) => profile[field] && profile[field].trim() !== "",
  );
  return Math.round((filledFields.length / fields.length) * 100);
}
