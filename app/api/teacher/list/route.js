import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma.js";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request) {
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
        { message: "Forbidden - Only principals can view teachers" },
        { status: 403 },
      );
    }

    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      empId: teacher.empId,
      email: teacher.user.email,
    }));

    return NextResponse.json({ teachers: formattedTeachers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
