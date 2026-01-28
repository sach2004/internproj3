"use client";
import { signOut, useSession } from "next-auth/react";
import CreateStudent from "../../component/CreateStudent";
import CreateTeacher from "../../component/CreateTeacher";

export default function Principal() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div style={styles.error}>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "PRINCIPAL") {
    return (
      <div style={styles.error}>
        Unauthorized. Only principals can access this page.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Principal Dashboard</h1>
          <p style={styles.subtitle}>{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={styles.signOutBtn}
        >
          Sign Out
        </button>
      </div>

      <div style={styles.section}>
        <CreateTeacher />
      </div>

      <div style={styles.section}>
        <CreateStudent />
      </div>
    </div>
  );
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
  section: {
    marginBottom: "30px",
  },
};
