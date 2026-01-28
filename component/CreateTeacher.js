"use client";
import axios from "axios";
import { useState } from "react";

export default function CreateTeacher() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("/api/teacher/create", {
        email,
        password,
        name,
        empId,
      });

      setSuccess("Teacher created successfully!");
      setEmail("");
      setPassword("");
      setName("");
      setEmpId("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Teacher</h2>
      <form onSubmit={onSubmit}>
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter teacher name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Employee ID</label>
            <input
              type="text"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter employee ID"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter email"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter password"
            />
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating..." : "Create Teacher"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "20px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  error: {
    color: "#dc3545",
    fontSize: "14px",
    margin: "0 0 15px 0",
  },
  success: {
    color: "#28a745",
    fontSize: "14px",
    margin: "0 0 15px 0",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
