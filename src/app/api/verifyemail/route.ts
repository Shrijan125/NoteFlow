import prisma from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { token } = reqBody;
    const user = await prisma.user.findFirst({
      where: { verifyToken: token, verifyTokenExpiry: { gt: new Date() } },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Token is invalid or has expired' },
        { status: 400 },
      );
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null, verifyTokenExpiry: null },
    });

    return NextResponse.json(
      { message: 'Email verified successfully', success: true },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 },
    );
  }
}
