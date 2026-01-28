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
    setProgress(Math.round((filledFields.length / fields.length) * 100));
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

      setMessage(
        isFinal ? "✓ Profile submitted successfully!" : "✓ Progress saved",
      );

      if (isFinal) {
        setTimeout(() => router.push("/teacher"), 1500);
      }
    } catch (error) {
      setMessage(
        "✗ " + (error.response?.data?.message || "Failed to save profile"),
      );
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div style={styles.error}>Access Denied. Please login.</div>;
  }

  if (session?.user?.role !== "TEACHER") {
    return <div style={styles.error}>Unauthorized.</div>;
  }

  if (!student) {
    return <div style={styles.error}>Student not found.</div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={() => router.push("/teacher")} style={styles.backBtn}>
        ← Back
      </button>

      <h1 style={styles.title}>Student Profile</h1>
      <p style={styles.studentInfo}>
        {student.name} • {student.rollNo}
      </p>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressHeader}>
          <span>Completion</span>
          <span style={styles.progressPercent}>{progress}%</span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
              backgroundColor: progress === 100 ? "#28a745" : "#007bff",
            }}
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(true);
        }}
      >
        <div style={styles.formGroup}>
          <label style={styles.label}>Student Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter full name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            style={styles.textarea}
            placeholder="Enter address"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Father's Name</label>
          <input
            type="text"
            name="fName"
            value={formData.fName}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter father's name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Mother's Name</label>
          <input
            type="text"
            name="mName"
            value={formData.mName}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter mother's name"
          />
        </div>

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.includes("✓") ? "#28a745" : "#dc3545",
            }}
          >
            {message}
          </p>
        )}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            style={styles.saveBtn}
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            type="submit"
            disabled={saving || progress !== 100}
            style={{
              ...styles.submitBtn,
              opacity: saving || progress !== 100 ? 0.5 : 1,
            }}
          >
            {saving ? "Submitting..." : "Submit Final"}
          </button>
        </div>

        {progress !== 100 && (
          <p style={styles.note}>* All fields required for final submission</p>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
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
  backBtn: {
    padding: "8px 16px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "26px",
  },
  studentInfo: {
    margin: "0 0 30px 0",
    color: "#666",
    fontSize: "16px",
  },
  progressContainer: {
    marginBottom: "30px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "14px",
  },
  progressPercent: {
    fontWeight: "bold",
  },
  progressBar: {
    width: "100%",
    height: "18px",
    backgroundColor: "#e0e0e0",
    borderRadius: "9px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "15px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontSize: "15px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  message: {
    marginBottom: "15px",
    fontSize: "14px",
    fontWeight: "500",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  saveBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },
  submitBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },
  note: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#666",
  },
};
