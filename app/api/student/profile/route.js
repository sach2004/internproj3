import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma.js";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        profile: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
