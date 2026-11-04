import React, { useState } from 'react';
import { Phone, MapPin, MessageCircle, ChevronDown, Send, Check } from 'lucide-react';

export const FaqContact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const faqs = [
    {
      q: 'কিভাবে TRENDVERSE থেকে অর্ডার করব?',
      a: 'পছন্দের পোশাক বা পণ্যের নিচে "কার্টে নিন" বাটনে ক্লিক করুন। এরপর উপরের শপিং কার্ট আইকনে ক্লিক করে আপনার নাম, মোবাইল নম্বর ও ঠিকানা দিয়ে অর্ডার কনফার্ম করুন।',
    },
    {
      q: 'পোশাকের সাইজ ঠিক না হলে কি এক্সচেঞ্জ করা যাবে?',
      a: 'অবশ্যই! ডেলিভারি পাওয়ার পর সাইজে কোনো সমস্যা হলে ৭ দিনের মধ্যে আমাদের হেল্পলাইন বা হোয়াটসঅ্যাপে জানালে সহজেই সাইজ এক্সচেঞ্জ করে নিতে পারবেন।',
    },
    {
      q: 'ডেলিভারি চার্জ ও সময় কত?',
      a: 'ঢাকা সিটির ভেতরে ডেলিভারি চার্জ মাত্র ৬০ টাকা (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ১২০ টাকা (২-৩ কার্যদিবস)। ৩,০০০ টাকার বেশি কেনাকাটায় ডেলিভারি সম্পূর্ণ ফ্রি!',
    },
    {
      q: 'ক্যাশ অন ডেলিভারি কি সারা বাংলাদেশে পাওয়া যায়?',
      a: 'হ্যাঁ, সারা বাংলাদেশের ৬৪ জেলায় পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের (Cash on Delivery) সুবিধা রয়েছে, পাশাপাশি বিকাশ ও নগদ পেমেন্ট সাপোর্ট করে।',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setFormData({ name: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-16 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Column */}
          <div>
            <div className="mb-8">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                সাধারণ প্রশ্নোত্তর
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center text-xs sm:text-sm font-semibold text-white hover:text-amber-400 cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        openFaq === idx ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 pt-2 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details & Direct Query Column */}
          <div>
            <div className="mb-8">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                যোগাযোগ ও সহায়তা
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                যেকোনো প্রয়োজনে আমাদের সাথে কথা বলুন
              </h2>
            </div>

            {/* Direct Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <a
                href={`https://wa.me/8801930045168?text=${encodeURIComponent('হ্যালো TRENDVERSE, আমি তথ্য জানতে চাই।')}`}
                target="_blank"
                rel="noreferrer"
                className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-3.5 hover:bg-emerald-500/15 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">হোয়াটসঅ্যাপ চ্যাট</h4>
                  <p className="text-[11px] text-emerald-400 font-mono">+880 1930-045168</p>
                </div>
              </a>

              <a
                href="tel:01930045168"
                className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3.5 hover:border-amber-500/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">হটলাইন সাপোর্ট</h4>
                  <p className="text-[11px] text-amber-400 font-mono">01930045168</p>
                </div>
              </a>
            </div>

            {/* Quick message form */}
            <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-4">
                আমাদের মেসেজ পাঠান:
              </h4>

              {formSent ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ধন্যবাদ! আপনার বার্তাটি আমরা পেয়েছি। খুব দ্রুতই যোগাযোগ করা হবে।</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="আপনার নাম *"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-3.5 py-2.5 text-xs bg-slate-950 text-white border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="tel"
                      placeholder="মোবাইল নম্বর *"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="px-3.5 py-2.5 text-xs bg-slate-950 text-white border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="আপনার প্রশ্ন বা মতামত লিখুন..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950 text-white border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>মেসেজ পাঠান</span>
                  </button>
                </form>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
