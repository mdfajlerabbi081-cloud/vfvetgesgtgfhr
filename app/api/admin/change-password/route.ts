import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword, newPin } = await req.json();

    // টেস্ট বা বর্তমান ডেমো পাসওয়ার্ড চেক (বাস্তব প্রজেক্টে ডাটাবেজ থেকে ম্যাচ করানো হয়)
    const storedAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    if (currentPassword !== storedAdminPassword) {
      return NextResponse.json(
        { message: 'বর্তমান পাসওয়ার্ডটি ভুল দেওয়া হয়েছে!' },
        { status: 400 }
      );
    }

    // এখানে নতুন পাসওয়ার্ড ডাটাবেজে সেভ করার লজিক বসবে
    // e.g., await db.admin.update({ where: { id: adminId }, data: { password: hashedPassword, pin: newPin } });

    return NextResponse.json(
      { message: 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'সার্ভার ত্রুটি ঘটেছে।' },
      { status: 500 }
    );
  }
}
