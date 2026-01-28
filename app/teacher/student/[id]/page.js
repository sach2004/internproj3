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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Access Denied.
      </div>
    );
  }

  if (session?.user?.role !== "TEACHER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Unauthorized.
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Student not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/teacher")}
          className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-lg transition"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Student Profile</h1>
        <p className="text-gray-400 mb-8">
          {student.name} • {student.rollNo}
        </p>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <div className="flex justify-between mb-2 text-white">
            <span>Completion</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress === 100 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Student Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Father's Name
            </label>
            <input
              type="text"
              name="fName"
              value={formData.fName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter father's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mother's Name
            </label>
            <input
              type="text"
              name="mName"
              value={formData.mName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mother's name"
            />
          </div>

          {message && (
            <p
              className={`text-sm font-medium ${
                message.includes("✓") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Progress"}
            </button>

            <button
              type="submit"
              disabled={saving || progress !== 100}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit Final"}
            </button>
          </div>

          {progress !== 100 && (
            <p className="text-xs text-gray-500 text-center">
              * All fields required for final submission
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
