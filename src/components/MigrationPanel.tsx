'use client';

import React, { useState } from 'react';
import {
  Database,
  Download,
  FileJson,
  Upload,
  Copy,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  downloadSqlMigrationFile,
  downloadJsonMigrationFile,
  buildSqlMigrationString,
  importJsonMigrationFile,
} from '@/src/utils/migration';
import { copyTextSafe } from '@/src/assets/brandAssets';
import AdminZipExportSection from './AdminZipExportSection';

interface MigrationPanelProps {
  onImportSuccess?: () => void;
}

export default function MigrationPanel({ onImportSuccess }: MigrationPanelProps) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleCopySql = async () => {
    const sql = buildSqlMigrationString();
    await copyTextSafe(sql);
    setCopiedSql(true);
    setStatus({
      type: 'success',
      text: 'সম্পূর্ণ SQL মাইগ্রেট কোড ক্লিপবোর্ডে কপি হয়েছে!',
    });
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSqlDownload = () => {
    downloadSqlMigrationFile();
    setStatus({
      type: 'success',
      text: 'SQL মাইগ্রেট ফাইল (.sql) সফলভাবে ডাউনলোড শুরু হয়েছে।',
    });
  };

  const handleJsonDownload = () => {
    downloadJsonMigrationFile();
    setStatus({
      type: 'success',
      text: 'JSON মাইগ্রেট ব্যাকআপ ফাইল (.json) ডাউনলোড শুরু হয়েছে।',
    });
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importJsonMigrationFile(file);
      setStatus({
        type: 'success',
        text: `মাইগ্রেশন সফল! ${result.productsCount.toLocaleString('bn-BD')} টি প্রোডাক্ট এবং ${result.ordersCount.toLocaleString('bn-BD')} টি অর্ডার ইমপোর্ট হয়েছে।`,
      });
      onImportSuccess?.();
    } catch {
      setStatus({
        type: 'error',
        text: 'ফাইলটি সঠিক JSON মাইগ্রেট ফরম্যাটে নেই। অনুগ্রহ করে সঠিক ফাইল সিলেক্ট করুন।',
      });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-sans text-slate-100">
      <div className="flex items-start gap-3.5 border-b border-slate-800 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            এডমিন সুরক্ষিত জিপ ও ডাটা মাইগ্রেশন
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            শুধুমাত্র ভেরিফাইড TRENDVERSE এডমিন সেশন থেকে ব্যাকআপ জিপ (.zip), SQL স্কিমা (.sql) এবং JSON ব্যাকআপ ডাউনলোড করুন।
          </p>
        </div>
      </div>

      {/* Secure Admin-Only ZIP Export Component */}
      <AdminZipExportSection />

      {status && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SQL Database Migration Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              SQL Database Schema + Data
            </span>
            <h3 className="text-sm font-bold text-white">SQL মাইগ্রেট ফাইল (.sql)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ক্যাটাগরি, প্রোডাক্টস (ইউনিক SKU সহ), অর্ডারস ও স্টোর সেটিংসের পূর্ণাঙ্গ টেবিল স্কিমা এবং বর্তমান ডাটা।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSqlDownload}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/30 font-extrabold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.SQL ডাউনলোড</span>
            </button>
            <button
              type="button"
              onClick={handleCopySql}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedSql ? 'কপি হয়েছে' : 'কোড কপি'}</span>
            </button>
          </div>
        </div>

        {/* JSON Full Backup & Restore Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Portable Data Bundle
            </span>
            <h3 className="text-sm font-bold text-white">JSON মাইগ্রেট ব্যাকআপ (.json)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              এক ক্লিকে সমস্ত ইনভেন্টরি, ক্যাটাগরি ও অর্ডার ব্যাকআপ নিন অথবা অন্য ডিভাইস/সার্ভারে ইমপোর্ট করুন।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleJsonDownload}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>.JSON ডাউনলোড</span>
            </button>
            <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>ইমপোর্ট</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleJsonUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
