/**
 * TOTP Enrollment API
 * 
 * Allows users to enable two-factor authentication (2FA) using TOTP.
 * 
 * Flow:
 * 1. User requests enrollment (POST with email)
 * 2. Generate TOTP secret and QR code
 * 3. Return QR code and backup codes
 * 4. User scans QR code with authenticator app
 * 5. User verifies with a TOTP code (POST with code)
 * 6. Enable TOTP in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { enrollTOTP, verifyTOTPEnrollment } from '@/lib/totp';
import { applyRateLimit } from '@/lib/rate-limit';

const prisma = new PrismaClient();

/**
 * POST /api/auth/totp/enroll
 * 
 * Step 1: Generate TOTP secret and QR code
 * Body: { email: string }
 * 
 * Step 2: Verify and enable TOTP
 * Body: { email: string, code: string, secret: string }
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    const { email, code, secret } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    if (user.totpEnabled) {
      return NextResponse.json(
        { error: 'TOTP is already enabled for this account' },
        { status: 400 }
      );
    }

    // Step 1: Generate enrollment data
    if (!code && !secret) {
      const enrollmentData = await enrollTOTP(email);
      
      // Store secret temporarily (in a real app, you might use a session or temporary storage)
      // For now, we'll return it to the client and expect it back for verification
      return NextResponse.json({
        success: true,
        qrCode: enrollmentData.qrCodeDataUrl,
        secret: enrollmentData.secret,
        backupCodes: enrollmentData.backupCodes,
        message: 'Scan the QR code with your authenticator app, then verify with a code',
      });
    }

    // Step 2: Verify and enable TOTP
    if (code && secret) {
      // Verify the code
      const isValid = verifyTOTPEnrollment(code, secret);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Generate backup codes
      const enrollmentData = await enrollTOTP(email);

      // Enable TOTP in database
      await prisma.user.update({
        where: { email },
        data: {
          totpSecret: secret,
          totpEnabled: true,
          backupCodesHash: enrollmentData.backupCodesHash,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication enabled successfully',
        backupCodes: enrollmentData.backupCodes,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[TOTP] Enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll TOTP' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/totp/enroll
 * 
 * Disable TOTP for a user
 * Body: { email: string, password: string }
 */
export async function DELETE(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password (security check before disabling 2FA)
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Disable TOTP
    await prisma.user.update({
      where: { email },
      data: {
        totpSecret: null,
        totpEnabled: false,
        backupCodesHash: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
    });
  } catch (error) {
    console.error('[TOTP] Disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable TOTP' },
      { status: 500 }
    );
  }
}

