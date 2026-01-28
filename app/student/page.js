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
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "STUDENT") {
    return <div>Unauthorized. Only students can access this page.</div>;
  }

  if (!studentData) {
    return <div>Failed to load student data.</div>;
  }

  const { student } = studentData;
  const profileComplete =
    student.profile &&
    student.profile.name &&
    student.profile.address &&
    student.profile.fName &&
    student.profile.mName;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Student Dashboard</h1>
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

      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      >
        <h2>Basic Information</h2>
        <div style={{ marginBottom: "10px" }}>
          <strong>Roll Number:</strong> {student.rollNo}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Email:</strong> {student.user.email}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Teacher:</strong> {student.teacher.name} (
          {student.teacher.user.email})
        </div>
      </div>

      <div
        style={{
          backgroundColor: profileComplete ? "#e8f5e9" : "#fff3e0",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      >
        <h2>Profile Information</h2>

        {!profileComplete ? (
          <p style={{ color: "#ff9800", fontWeight: "bold" }}>
            ⚠️ Your profile is incomplete. Please wait for your teacher to fill
            in your details.
          </p>
        ) : (
          <>
            <div style={{ marginBottom: "10px" }}>
              <strong>Full Name:</strong> {student.profile.name}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Address:</strong> {student.profile.address}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Father's Name:</strong> {student.profile.fName}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Mother's Name:</strong> {student.profile.mName}
            </div>
            <p
              style={{
                color: "#4caf50",
                fontWeight: "bold",
                marginTop: "15px",
              }}
            >
              ✓ Profile Complete
            </p>
          </>
        )}
      </div>
    </div>
  );
}
