import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req?: Request) {
  try {
    // ১. এডমিন সেশন কুকি বা সিকিউরিটি টোকেন চেক
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('trendverse_admin_session');
    const authHeader = req?.headers?.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    const isAuthorized =
      adminSession?.value === 'authenticated_admin_token' ||
      bearerToken === 'authenticated_admin_token';

    // ২. যদি এডমিন সেশন না থাকে বা ইনভ্যালিড হয়
    if (!isAuthorized) {
      return NextResponse.json(
        {
          message:
            'অনুমতি নেই! শুধুমাত্র TRENDVERSE এডমিন এই জিপ ফাইল ডাউনলোড করতে পারবেন।',
        },
        { status: 403 }
      );
    }

    // ৩. শুধুমাত্র এডমিন হলে সুরক্ষিত সার্ভার ফোল্ডার থেকে জিপ ফাইল রিড ও সেন্ড হবে
    const privateZipPath = path.resolve(
      process.cwd(),
      'server-data',
      'TRENDVERSE_Backup_Inventory.zip'
    );

    const zipBuffer = fs.existsSync(privateZipPath)
      ? fs.readFileSync(privateZipPath)
      : Buffer.from('TRENDVERSE_SECURE_BACKUP_DATA');

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition':
          'attachment; filename="TRENDVERSE_Backup_Inventory.zip"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'সার্ভার ত্রুটি ঘটেছে।' },
      { status: 500 }
    );
  }
}
