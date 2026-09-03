// ══════════════════════════════════════════════
//  CONFIG — constants only, no imports
// ══════════════════════════════════════════════
export const SUPABASE_URL = "https://gyehrvryxdgvfhfhwyyy.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZWhydnJ5eGRndmZoZmh3eXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Njc4MDcsImV4cCI6MjA4OTU0MzgwN30.4paq-dwUIpUpdM6frnvnYYnih8kXU0cZv67Owdej8H8";

// Prefer stable (GA) model IDs — preview models get retired without warning.
// gemini-3.5-flash is the GA successor to gemini-3-flash-preview (May 2026).
// gemini-3.1-pro-preview has no GA successor yet; swap when one ships.
// NOTE: models must also be in ALLOWED_MODELS in supabase/functions/gemini-proxy.
export const MODEL_FLASH = "gemini-3.5-flash";
export const MODEL_PRO = "gemini-3.1-pro-preview";

// TTS: les spurningar upp (Guðrún hjá Azure) þegar tts-proxy fallið er
// komið upp með AZURE_SPEECH_KEY/AZURE_SPEECH_REGION secrets.
export const TTS_ENABLED = true;

// Admin/CS passwords are verified server-side (admin-auth edge function).
// Set them with: supabase secrets set ADMIN_PASSWORD=... CS_PASSWORD=...

export const MAX_VERSIONS = 20;
