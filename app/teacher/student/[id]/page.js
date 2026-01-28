"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentProfileForm() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;

  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    fName: "",
    mName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "TEACHER") {
      fetchStudent();
    }
  }, [status, session, studentId]);

  useEffect(() => {
    calculateProgress();
  }, [formData]);

  async function fetchStudent() {
    try {
      const response = await axios.get(`/api/teacher/student/${studentId}`);
      setStudent(response.data.student);

      if (response.data.student.profile) {
        setFormData({
          name: response.data.student.profile.name || "",
          address: response.data.student.profile.address || "",
          fName: response.data.student.profile.fName || "",
          mName: response.data.student.profile.mName || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch student:", error);
      setMessage("Failed to load student data");
    } finally {
      setLoading(false);
    }
  }

  function calculateProgress() {
    const fields = Object.values(formData);
    const filledFields = fields.filter((field) => field && field.trim() !== "");
    const progressPercent = Math.round(
      (filledFields.length / fields.length) * 100,
    );
    setProgress(progressPercent);
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave(isFinal = false) {
    setSaving(true);
    setMessage("");

    try {
      await axios.post(`/api/teacher/student/${studentId}/profile`, {
        ...formData,
        isFinal,
      });

      setMessage(isFinal ? "Profile saved successfully!" : "Progress saved!");

      if (isFinal) {
        setTimeout(() => router.push("/teacher"), 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "TEACHER") {
    return <div>Unauthorized. Only teachers can access this page.</div>;
  }

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <button
        onClick={() => router.push("/teacher")}
        style={{
          padding: "8px 16px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>

      <h1>Student Profile Form</h1>
      <h2>
        {student.name} ({student.rollNo})
      </h2>

      {/* Progress Bar */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px",
          }}
        >
          <span>Profile Completion</span>
          <span>
            <strong>{progress}%</strong>
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "#e0e0e0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: progress === 100 ? "#4caf50" : "#2196f3",
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(true);
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Student Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            placeholder="Enter student's full name"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            placeholder="Enter address"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Father's Name
          </label>
          <input
            type="text"
            name="fName"
            value={formData.fName}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            placeholder="Enter father's name"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Mother's Name
          </label>
          <input
            type="text"
            name="mName"
            value={formData.mName}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            placeholder="Enter mother's name"
          />
        </div>

        {message && (
          <p
            style={{
              color:
                message.includes("success") || message.includes("saved")
                  ? "green"
                  : "red",
              marginBottom: "15px",
            }}
          >
            {message}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: saving ? "#ccc" : "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            type="submit"
            disabled={saving || progress !== 100}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: saving || progress !== 100 ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: saving || progress !== 100 ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {saving ? "Submitting..." : "Submit Final"}
          </button>
        </div>
        {progress !== 100 && (
          <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            *All fields must be filled to submit final
          </p>
        )}
      </form>
    </div>
  );
}
