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
        const response = await axios.get("/api/teachers/list");
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
      const response = await axios.post("/api/student/create", {
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
    <div
      style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc" }}
    >
      <h2>Create Student</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Roll Number
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Assign Teacher
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Student"}
        </button>
      </form>
    </div>
  );
}
