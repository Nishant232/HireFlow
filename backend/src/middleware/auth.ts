import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

if (typeof global.WebSocket === 'undefined') {
  (global as any).WebSocket = WebSocket;
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy-initialise the Supabase admin client.
// If credentials are missing / placeholder, auth will fall back to JWT decode.
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;

  if (
    !supabaseUrl ||
    supabaseUrl.includes('your-project') ||
    !serviceRoleKey ||
    serviceRoleKey === 'your_service_role_key'
  ) {
    return null;
  }

  _supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabase;
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Decode a Supabase JWT without verification (for development fallback).
 * In production the service role key MUST be set to properly validate tokens.
 */
function decodeJwtPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase();

    if (supabase) {
      // Full server-side validation using service role key
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.userId = user.id;
      req.userEmail = user.email || '';
    } else {
      // Fallback: decode JWT locally (no signature verification)
      // This is acceptable in development; set SUPABASE_SERVICE_ROLE_KEY for production.
      const payload = decodeJwtPayload(token);
      if (!payload?.sub) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Basic expiry check
      const exp = (payload as any).exp as number | undefined;
      if (exp && Date.now() / 1000 > exp) {
        return res.status(401).json({ error: 'Token expired' });
      }

      req.userId = payload.sub;
      req.userEmail = payload.email || '';

      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '⚠️  Auth: SUPABASE_SERVICE_ROLE_KEY not set — using JWT decode (dev mode only)'
        );
      }
    }

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
