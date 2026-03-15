import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    const { error } = await supabase
      .from("signups")
      .update({ won: true, won_at: new Date().toISOString() })
      .eq("phone", phone);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Winner error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
