import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    const { data, error } = await supabase
      .from("signups")
      .select("phone, username")
      .eq("phone", phone)
      .single();

    if (error || !data) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, user: data });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ found: false }, { status: 500 });
  }
}
