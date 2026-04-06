import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function countAnswers(stateJson: unknown): number {
  try {
    const state = typeof stateJson === "string" ? JSON.parse(stateJson) : stateJson;
    const chapters: unknown[] = (state as Record<string, unknown>)?.chapters as unknown[] || [];
    let count = 0;
    for (const ch of chapters) {
      const answers: unknown[] = (ch as Record<string, unknown>)?.answers as unknown[] || [];
      for (const a of answers) {
        const text = typeof a === "string" ? a : ((a as Record<string, unknown>)?.text as string) || "";
        if (text.trim() !== "") count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const adminSecret = Deno.env.get("ADMIN_SECRET");
  const auth = req.headers.get("authorization");
  if (!adminSecret || auth !== `Bearer ${adminSecret}`) {
    return new Response("Unauthorized", { status: 401, headers: CORS });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [usersRes, progressRes, paidRes] = await Promise.all([
    sb.auth.admin.listUsers({ page: 1, perPage: 500 }),
    sb.from("user_progress").select("user_id, state_json, updated_at"),
    sb.from("paid_users").select("email"),
  ]);

  if (usersRes.error) {
    return new Response(JSON.stringify({ error: usersRes.error.message }), { status: 500, headers: CORS });
  }

  const paidEmails = new Set((paidRes.data || []).map((p: { email: string }) => p.email.toLowerCase()));
  const progressMap = new Map((progressRes.data || []).map((p: { user_id: string; state_json: unknown; updated_at: string }) => [p.user_id, p]));

  const result = usersRes.data.users.map((u) => {
    const prog = progressMap.get(u.id) as { state_json: unknown; updated_at: string } | undefined;
    return {
      email: u.email,
      created_at: u.created_at,
      last_active: prog?.updated_at || null,
      answers: prog ? countAnswers(prog.state_json) : 0,
      is_paid: paidEmails.has((u.email || "").toLowerCase()),
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return new Response(JSON.stringify(result), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
