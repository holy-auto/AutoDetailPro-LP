import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "メールアドレスが必要です" }, { status: 400 });
    }

    const { error } = await supabase.from("waitlist").insert([
      { email, created_at: new Date().toISOString() },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "既に登録済みです" }, { status: 200 });
      }
      return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ message: "登録完了" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
