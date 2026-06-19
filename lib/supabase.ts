import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// ── Check if Supabase is configured ────────────────────────
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// ── Browser client (public anon key) — lazy ───────────────
let _supabase: ReturnType<typeof createClient> | null = null
export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabase = createClient(url, anon)
  }
  return _supabase
}
// Keep backward-compatible named export
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_t, prop) { return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop] }
})

// ── Server client (service role — full access, server only) 
export function supabaseAdmin() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) throw new Error("Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  return createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } })
}

// ── Server component client (reads cookies for session) ────
export async function supabaseServer() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const cookieStore = await cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll()     { return cookieStore.getAll() },
      setAll(list) { try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch { } },
    },
  })
}
