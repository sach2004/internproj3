import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma.js";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    // Check if user is PRINCIPAL
    if (session.user.role !== "PRINCIPAL") {
      return NextResponse.json(
        { message: "Forbidden - Only principals can create students" },
        { status: 403 },
      );
    }

    // Parse request body
    const { email, password, name, rollNo, teacherId } = await request.json();

    // Validate input
    if (!email || !password || !name || !rollNo || !teacherId) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Check if roll number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNo },
    });

    if (existingStudent) {
      return NextResponse.json(
        { message: "Student with this roll number already exists" },
        { status: 409 },
      );
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user with STUDENT role
      const user = await tx.user.create({
        data: {
          email: email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      // Create student linked to user
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

    // Return success response
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
