'use client';

import React, { useState } from 'react';
import {
  FileArchive,
  ShieldCheck,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminZipExportSection() {
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSecureZipDownload = async () => {
    setDownloading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let adminToken = '';
      try {
        adminToken = sessionStorage.getItem('trendverse_admin_session') || '';
      } catch {}

      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch('/api/admin/export-zip', {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (response.status === 403) {
        const errBody = await response.json().catch(() => null);
        setErrorMessage(
          errBody?.message ||
            'অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে! আপনি এডমিন হিসেবে অ্যাক্সেস পাননি।'
        );
        setDownloading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('ফাইল ডাউনলোড ব্যর্থ হয়েছে।');
      }

      // জিপ ফাইল ডাউনলোড প্রসেস
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TRENDVERSE_Inventory_Data_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage('এডমিন ব্যাকআপ জিপ ফাইল সফলভাবে ডাউনলোড শুরু হয়েছে!');
    } catch {
      setErrorMessage('জিপ ফাইল ডাউনলোডে সমস্যা হয়েছে।');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full font-sans">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
        <div className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-2xl shrink-0">
          <FileArchive className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>ইনভেন্টরি ব্যাকআপ জিপ (ZIP Export)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          </h3>
          <p className="text-xs text-slate-400">
            শুধুমাত্র এডমিনদের সুরক্ষিত ডাউনলোডের জন্য
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSecureZipDownload}
        disabled={downloading}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl transition shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 text-xs cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>
          {downloading
            ? 'সুরক্ষিত ফাইল প্রস্তুত হচ্ছে...'
            : 'এডমিন ব্যাকআপ জিপ ডাউনলোড করুন'}
        </span>
      </button>
    </div>
  );
}
