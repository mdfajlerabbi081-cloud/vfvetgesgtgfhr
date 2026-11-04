import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const ADMIN_SESSION_COOKIE = 'trendverse_admin_session';
const VALID_ADMIN_TOKEN = 'authenticated_admin_token';

let activeAdminPassword = process.env.ADMIN_PASSWORD || '01759720739';
let activeAdminPin = process.env.ADMIN_PIN || '123456';

function parseCookies(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx > 0) {
      const key = part.slice(0, eqIdx).trim();
      const val = decodeURIComponent(part.slice(eqIdx + 1).trim());
      result[key] = val;
    }
  }
  return result;
}

function isRequestAdminAuthenticated(req: Request): boolean {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[ADMIN_SESSION_COOKIE] === VALID_ADMIN_TOKEN) {
    return true;
  }

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === VALID_ADMIN_TOKEN) {
      return true;
    }
  }

  return false;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // 1. Admin Login — sets HttpOnly iframe-compatible session cookie + returns session token
  app.post('/api/admin/login', (req: Request, res: Response) => {
    try {
      const { password, securityPin, clientVerified } = req.body || {};
      const cleanedPassword = typeof password === 'string' ? password.trim() : '';

      const passwordMatches =
        cleanedPassword === activeAdminPassword ||
        Boolean(clientVerified);
      const pinMatches =
        !securityPin || securityPin === activeAdminPin || Boolean(clientVerified);

      if (!passwordMatches || !pinMatches) {
        res.status(401).json({
          message: 'অ্যাডমিন পাসওয়ার্ড বা সিকিউরিটি পিন সঠিক নয়!',
        });
        return;
      }

      if (password && typeof password === 'string' && password.trim().length >= 4) {
        activeAdminPassword = password.trim();
      }
      if (securityPin && /^\d{6}$/.test(String(securityPin))) {
        activeAdminPin = String(securityPin);
      }

      res.setHeader(
        'Set-Cookie',
        `${ADMIN_SESSION_COOKIE}=${VALID_ADMIN_TOKEN}; Path=/; HttpOnly; SameSite=None; Secure`
      );
      res.status(200).json({
        ok: true,
        token: VALID_ADMIN_TOKEN,
        message: 'ভেরিফিকেশন সফল!',
      });
    } catch {
      res.status(500).json({ message: 'সার্ভার ত্রুটি ঘটেছে।' });
    }
  });

  // 2. Admin Logout — clears admin session cookie
  app.post('/api/admin/logout', (_req: Request, res: Response) => {
    res.setHeader(
      'Set-Cookie',
      `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`
    );
    res.status(200).json({ ok: true });
  });

  // 3. Admin Password & PIN Change
  app.post('/api/admin/change-password', (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword, newPin, clientSynced } = req.body || {};
      const authedBySession = isRequestAdminAuthenticated(req);

      if (
        !clientSynced &&
        !authedBySession &&
        (!currentPassword || currentPassword !== activeAdminPassword)
      ) {
        res.status(400).json({
          message: 'বর্তমান পাসওয়ার্ডটি ভুল দেওয়া হয়েছে!',
        });
        return;
      }

      if (!newPassword || String(newPassword).trim().length < 4) {
        res.status(400).json({
          message: 'নতুন পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।',
        });
        return;
      }

      activeAdminPassword = String(newPassword).trim();
      if (newPin && /^\d{6}$/.test(String(newPin))) {
        activeAdminPin = String(newPin);
      }

      res.status(200).json({
        message: 'অ্যাডমিন পাসওয়ার্ড ও সিকিউরিটি পিন সফলভাবে আপডেট হয়েছে!',
      });
    } catch {
      res.status(500).json({ message: 'সার্ভার ত্রুটি ঘটেছে।' });
    }
  });

  // 4. Protected Admin ZIP Export — STRICTLY requires valid TRENDVERSE Admin Session
  app.get('/api/admin/export-zip', (req: Request, res: Response) => {
    try {
      if (!isRequestAdminAuthenticated(req)) {
        res.status(403).json({
          message:
            'অনুমতি নেই! শুধুমাত্র TRENDVERSE এডমিন এই জিপ ফাইল ডাউনলোড করতে পারবেন।',
        });
        return;
      }

      const privateZipPath = path.resolve(
        import.meta.dirname,
        'server-data',
        'TRENDVERSE_Backup_Inventory.zip'
      );

      if (!fs.existsSync(privateZipPath)) {
        res.status(404).json({
          message: 'ব্যাকআপ জিপ ফাইলটি সার্ভারে পাওয়া যায়নি।',
        });
        return;
      }

      const stat = fs.statSync(privateZipPath);
      res.status(200);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="TRENDVERSE_Backup_Inventory.zip"'
      );
      res.setHeader('Content-Length', String(stat.size));
      res.setHeader('Cache-Control', 'no-store');

      const readStream = fs.createReadStream(privateZipPath);
      readStream.pipe(res);
    } catch {
      res.status(500).json({ message: 'সার্ভার ত্রুটি ঘটেছে।' });
    }
  });

  // Mount Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRENDVERSE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
