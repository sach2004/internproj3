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
    return <div style={styles.loading}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div style={styles.error}>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "STUDENT") {
    return <div style={styles.error}>Unauthorized.</div>;
  }

  if (!studentData) {
    return <div style={styles.error}>Failed to load data.</div>;
  }

  const { student } = studentData;
  const profileComplete =
    student.profile &&
    student.profile.name &&
    student.profile.address &&
    student.profile.fName &&
    student.profile.mName;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Dashboard</h1>
          <p style={styles.subtitle}>{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={styles.signOutBtn}
        >
          Sign Out
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Basic Information</h2>
        <div style={styles.infoRow}>
          <span style={styles.label}>Roll Number:</span>
          <span>{student.rollNo}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Name:</span>
          <span>{student.name}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Email:</span>
          <span>{student.user.email}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Teacher:</span>
          <span>{student.teacher.name}</span>
        </div>
      </div>

      <div
        style={{
          ...styles.card,
          backgroundColor: profileComplete ? "#f0f9ff" : "#fff3cd",
          borderColor: profileComplete ? "#0ea5e9" : "#ffc107",
        }}
      >
        <h2 style={styles.cardTitle}>Profile Information</h2>

        {!profileComplete ? (
          <p style={styles.warningText}>
            ⚠️ Your profile is incomplete. Please wait for your teacher to
            complete it.
          </p>
        ) : (
          <>
            <div style={styles.infoRow}>
              <span style={styles.label}>Full Name:</span>
              <span>{student.profile.name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Address:</span>
              <span>{student.profile.address}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Father's Name:</span>
              <span>{student.profile.fName}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Mother's Name:</span>
              <span>{student.profile.mName}</span>
            </div>
            <p style={styles.successText}>✓ Profile Complete</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "30px 20px",
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
  },
  error: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: "#dc3545",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #ddd",
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "28px",
  },
  subtitle: {
    margin: 0,
    color: "#666",
    fontSize: "14px",
  },
  signOutBtn: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: "25px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #dee2e6",
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #dee2e6",
  },
  infoRow: {
    display: "flex",
    padding: "10px 0",
    borderBottom: "1px solid #e9ecef",
  },
  label: {
    fontWeight: "600",
    minWidth: "150px",
    color: "#495057",
  },
  warningText: {
    color: "#856404",
    fontSize: "15px",
    margin: 0,
  },
};
