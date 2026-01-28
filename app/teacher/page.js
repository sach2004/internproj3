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
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "TEACHER") {
    return <div>Unauthorized. Only teachers can access this page.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {session?.user?.email}</p>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          padding: "10px 20px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Sign Out
      </button>

      <hr />

      <h2>My Students</h2>
      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students assigned yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => router.push(`/teacher/student/${student.id}`)}
              style={{
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: "#f9f9f9",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e9e9e9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#f9f9f9")
              }
            >
              <h3>{student.name}</h3>
              <p>
                <strong>Roll No:</strong> {student.rollNo}
              </p>
              <p>
                <strong>Email:</strong> {student.user.email}
              </p>
              <p>
                <strong>Profile Status:</strong>{" "}
                {student.profile
                  ? `${calculateProgress(student.profile)}% Complete`
                  : "Not Started"}
              </p>
            </div>
          ))}
        </div>
      )}
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
