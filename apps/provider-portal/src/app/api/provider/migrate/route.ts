import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * POST /api/provider/migrate
 * Run Prisma migrations in production
 * 
 * TEMPORARY ENDPOINT - For manual migration deployment
 * This is needed because Vercel doesn't expose DATABASE_URL during build time
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const jar = await cookies();
    const session = jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Running Prisma migrations...');

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not available' },
        { status: 500 }
      );
    }

    // Run prisma migrate deploy
    const { stdout, stderr } = await execAsync(
      'npx prisma migrate deploy',
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
        },
      }
    );

    console.log('Migration output:', stdout);
    if (stderr) {
      console.error('Migration stderr:', stderr);
    }

    return NextResponse.json({
      success: true,
      message: 'Migrations applied successfully',
      output: stdout,
      stderr: stderr || null,
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stderr: (error as any).stderr || null,
        stdout: (error as any).stdout || null,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/provider/migrate
 * Check migration status
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const jar = await cookies();
    const session = jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not available', available: false },
        { status: 500 }
      );
    }

    // Run prisma migrate status
    const { stdout, stderr } = await execAsync(
      'npx prisma migrate status',
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
        },
      }
    );

    return NextResponse.json({
      success: true,
      status: stdout,
      stderr: stderr || null,
    });
  } catch (error) {
    console.error('❌ Migration status check failed:', error);
    return NextResponse.json(
      {
        error: 'Migration status check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stderr: (error as any).stderr || null,
        stdout: (error as any).stdout || null,
      },
      { status: 500 }
    );
  }
}

