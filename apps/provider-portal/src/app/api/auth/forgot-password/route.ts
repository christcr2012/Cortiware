import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // In a real implementation, you would:
    // 1. Check if user exists in database
    // 2. Store reset token in database
    // 3. Send email with reset link

    // For now, we'll just log it (in production, send email)
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`);

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

