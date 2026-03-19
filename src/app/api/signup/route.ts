import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone, username } = await req.json();

    // Check if phone already exists
    const { data: existing } = await supabase
      .from("signups")
      .select("id")
      .eq("phone", phone)
      .single();

    let error;
    if (existing) {
      // Update existing record
      ({ error } = await supabase
        .from("signups")
        .update({ username })
        .eq("phone", phone));
    } else {
      // Insert new record
      ({ error } = await supabase
        .from("signups")
        .insert({ phone, username }));
    }

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
