"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function CreateStudent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await axios.get("/api/teacher/list");
        setTeachers(response.data.teachers);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    }
    fetchTeachers();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("/api/student/create", {
        email,
        password,
        name,
        rollNo,
        teacherId: parseInt(teacherId),
      });

      setSuccess("Student created successfully!");
      setEmail("");
      setPassword("");
      setName("");
      setRollNo("");
      setTeacherId("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Student</h2>
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
              placeholder="Enter student name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Roll Number</label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter roll number"
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

        <div style={styles.formGroup}>
          <label style={styles.label}>Assign Teacher</label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating..." : "Create Student"}
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
    marginBottom: "15px",
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
  select: {
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
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
