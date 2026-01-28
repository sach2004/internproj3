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
    return <div style={styles.loading}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div style={styles.error}>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "TEACHER") {
    return (
      <div style={styles.error}>
        Unauthorized. Only teachers can access this page.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={styles.signOutBtn}
        >
          Sign Out
        </button>
      </div>

      <hr style={styles.divider} />

      <h2 style={styles.sectionTitle}>My Students</h2>
      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p style={styles.emptyText}>No students assigned yet.</p>
      ) : (
        <div style={styles.grid}>
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => router.push(`/teacher/student/${student.id}`)}
              style={styles.card}
            >
              <h3 style={styles.studentName}>{student.name}</h3>
              <p style={styles.studentInfo}>
                <strong>Roll No:</strong> {student.rollNo}
              </p>
              <p style={styles.studentInfo}>
                <strong>Email:</strong> {student.user.email}
              </p>
              <div
                style={{
                  ...styles.progressBadge,
                  backgroundColor: getProgressColor(student.profile),
                }}
              >
                {student.profile
                  ? `${calculateProgress(student.profile)}%`
                  : "Not Started"}
              </div>
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

function getProgressColor(profile) {
  const progress = calculateProgress(profile);
  if (progress === 0) return "#f5f5f5";
  if (progress < 50) return "#ffe0e0";
  if (progress < 100) return "#fff3cd";
  return "#d4edda";
}

const styles = {
  container: {
    maxWidth: "1200px",
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
    marginBottom: "20px",
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "28px",
  },
  subtitle: {
    margin: 0,
    color: "#666",
    fontSize: "16px",
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
  divider: {
    border: "none",
    borderTop: "1px solid #ddd",
    margin: "20px 0",
  },
  sectionTitle: {
    fontSize: "22px",
    marginBottom: "20px",
  },
  emptyText: {
    color: "#666",
    fontSize: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  studentName: {
    margin: "0 0 10px 0",
    fontSize: "20px",
  },
  studentInfo: {
    margin: "5px 0",
    fontSize: "14px",
    color: "#555",
  },
  progressBadge: {
    display: "inline-block",
    marginTop: "10px",
    padding: "5px 12px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "bold",
  },
};
