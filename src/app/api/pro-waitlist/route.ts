import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

const ALLOWED_AREAS = [
  "hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima",
  "ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa",
  "niigata", "toyama", "ishikawa", "fukui", "yamanashi", "nagano", "gifu",
  "shizuoka", "aichi", "mie", "shiga", "kyoto", "osaka", "hyogo", "nara",
  "wakayama", "tottori", "shimane", "okayama", "hiroshima", "yamaguchi",
  "tokushima", "kagawa", "ehime", "kochi", "fukuoka", "saga", "nagasaki",
  "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa",
];

const ALLOWED_EXPERIENCE = [
  "beginner",
  "1-3",
  "3-5",
  "5-10",
  "10+",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      phone,
      area,
      experience,
      services,
      message,
    } = body ?? {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "メールアドレスが必要です" },
        { status: 400 },
      );
    }
    if (area && !ALLOWED_AREAS.includes(area)) {
      return NextResponse.json({ error: "対応エリアが不正です" }, { status: 400 });
    }
    if (experience && !ALLOWED_EXPERIENCE.includes(experience)) {
      return NextResponse.json({ error: "経験年数が不正です" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("pros").insert([
      {
        email,
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        area: area || null,
        experience_years: experience || null,
        services: Array.isArray(services) ? services : null,
        message: message?.trim() || null,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "既に登録済みです。担当者よりご連絡しています。" },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { error: "登録に失敗しました。時間をおいて再度お試しください。" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "プロ登録の申込を受け付けました" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
