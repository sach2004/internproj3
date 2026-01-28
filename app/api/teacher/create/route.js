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
        { message: "Forbidden - Only principals can create teachers" },
        { status: 403 },
      );
    }

    const { email, password, name, empId } = await request.json();

    if (!email || !password || !name || !empId) {
      return NextResponse.json(
        { message: "Email, password, name, and employee ID are required" },
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

    const existingTeacher = await prisma.teacher.findUnique({
      where: { empId },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { message: "Teacher with this employee ID already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email,
          password: hashedPassword,
          role: "TEACHER",
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          name: name,
          empId: empId,
          userId: user.id,
        },
      });

      return { user, teacher };
    });

    return NextResponse.json(
      {
        message: "Teacher created successfully",
        teacher: {
          id: result.teacher.id,
          name: result.teacher.name,
          empId: result.teacher.empId,
          email: result.user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
