import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma.js";
import { authOptions } from "../../../../auth/[...nextauth]/route";

export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const params = await context.params;
    const studentId = parseInt(params.id);

    const { name, address, fName, mName, isFinal } = await request.json();

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher record not found" },
        { status: 404 },
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 },
      );
    }

    if (student.teacherId !== teacher.id) {
      return NextResponse.json(
        { message: "This student is not assigned to you" },
        { status: 403 },
      );
    }

    if (isFinal) {
      if (!name || !address || !fName || !mName) {
        return NextResponse.json(
          { message: "All fields must be filled for final submission" },
          { status: 400 },
        );
      }
    }

    const profile = await prisma.studentProfile.upsert({
      where: { studentId },
      update: {
        name: name || "",
        address: address || "",
        fName: fName || "",
        mName: mName || "",
      },
      create: {
        studentId,
        name: name || "",
        address: address || "",
        fName: fName || "",
        mName: mName || "",
      },
    });

    return NextResponse.json(
      {
        message: isFinal ? "Profile submitted successfully" : "Progress saved",
        profile,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
