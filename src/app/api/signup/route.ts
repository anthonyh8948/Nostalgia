import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone, username } = await req.json();

    const { error } = await supabase.from("signups").insert({
      phone,
      username,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
