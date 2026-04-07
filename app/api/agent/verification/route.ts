import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const verificationSchema = z.object({
  govIdUrl: z.string().url().optional(),
  cacDocUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, verificationStatus: true },
    });

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 },
      );
    }

    const nextStatus =
      agentProfile.verificationStatus === "VERIFIED"
        ? "VERIFIED"
        : "PENDING";

    const updated = await prisma.agentProfile.update({
      where: { id: agentProfile.id },
      data: {
        govIdUrl: parsed.data.govIdUrl,
        cacDocUrl: parsed.data.cacDocUrl,
        verificationStatus: nextStatus,
      },
    });

    return NextResponse.json({
      message: "Verification documents submitted",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/agent/verification]", message);
    return NextResponse.json(
      { error: "Failed to submit verification documents" },
      { status: 500 },
    );
  }
}
