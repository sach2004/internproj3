import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma.js";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    if (session.user.role !== "PRINCIPAL") {
      return NextResponse.json(
        { message: "Forbidden - Only principals can create students" },
        { status: 403 },
      );
    }

    const { email, password, name, rollNo, teacherId } = await request.json();

    if (!email || !password || !name || !rollNo || !teacherId) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: { rollNo },
    });

    if (existingStudent) {
      return NextResponse.json(
        { message: "Student with this roll number already exists" },
        { status: 409 },
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      const student = await tx.student.create({
        data: {
          name: name,
          rollNo: rollNo,
          userId: user.id,
          teacherId: teacherId,
        },
      });

      return { user, student };
    });

    return NextResponse.json(
      {
        message: "Student created successfully",
        student: {
          id: result.student.id,
          name: result.student.name,
          rollNo: result.student.rollNo,
          email: result.user.email,
          teacherId: result.student.teacherId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
