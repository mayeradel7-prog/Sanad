import React, { useState } from 'react';
import {
  Mail,
  Send,
  X,
  CheckCircle2,
  Globe,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, currentUser } = useApp();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.fullName || '',
    email: currentUser?.email || '',
    subject: 'general',
    message: '',
  });

  if (!isOpen) return null;

  const supportEmail = 'support.sanad.voulanteer@gmail.com';

  const subjectLabels: Record<string, { ar: string; en: string }> = {
    general: { ar: 'استفسار عام أو اقتراح', en: 'General Inquiry or Proposal' },
    verification: { ar: 'متابعة توثيق هوية صاحب طلب', en: 'Account Verification Status' },
    report: { ar: 'بلاغ عن محتوى أو مخالفة أمان', en: 'Report Violation or Safety Concern' },
    certificates: { ar: 'استفسار عن الساعات والشهادات', en: 'Volunteer Hours & Certificates' },
    partnership: { ar: 'شراكة جمعيات ومؤسسات أهلية', en: 'NGO / Clinic Partnership' },
  };

  const getSubjectText = () => {
    const label = subjectLabels[form.subject]?.[language === 'ar' ? 'ar' : 'en'] || 'Support Request';
    return `[Sanad Support] ${label} - ${form.name || 'User'}`;
  };

  const getBodyText = () => {
    return `Hello Sanad Support Team,\n\nName: ${form.name}\nSender Email: ${form.email}\nInquiry Type: ${subjectLabels[form.subject]?.en || form.subject}\nUser Role: ${currentUser?.role || 'Guest'}\n\nMessage:\n${form.message}\n\nSent via Sanad Volunteer Network Platform`;
  };

  const getGmailUrl = () => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(getSubjectText())}&body=${encodeURIComponent(getBodyText())}`;
  };

  const getMailtoUrl = () => {
    return `mailto:${supportEmail}?subject=${encodeURIComponent(getSubjectText())}&body=${encodeURIComponent(getBodyText())}`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    
    // Open Gmail directly with prefilled recipient, subject and body
    const gmailUrl = getGmailUrl();
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="contact-support-modal-container"
        className="relative w-full max-w-lg bg-white dark:bg-[#20201a] rounded-2xl shadow-2xl border border-[#e2e2d9] dark:border-[#383830] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e2d9] dark:border-[#33332a] bg-[#fafaf7] dark:bg-[#24241d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5a5a40] text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                {language === 'ar' ? 'تواصل مع فريق الدعم والإشراف' : 'Contact Support & Helpdesk'}
              </h3>
              <p className="text-[11px] text-[#7c7c6e]">
                {language === 'ar' ? 'نحن متواجدون لمساعدتك وحل أي استفسار' : 'Available 24/7 for community assistance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888878] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] rounded-lg hover:bg-[#ecece6] dark:hover:bg-[#2d2d25] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick Direct Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#fafaf7] dark:bg-[#262620] rounded-xl border border-[#e2e2d9] dark:border-[#36362e] space-y-1">
              <span className="text-[10px] text-[#7a7a6c] uppercase font-bold tracking-wider">
                {language === 'ar' ? 'البريد الإلكتروني المباشر' : 'Official Support Email'}
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] truncate">
                  {supportEmail}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 text-[#5a5a40] dark:text-[#a8a880] hover:bg-[#eaeae2] dark:hover:bg-[#34342a] rounded transition cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#fafaf7] dark:bg-[#262620] rounded-xl border border-[#e2e2d9] dark:border-[#36362e] space-y-1">
              <span className="text-[10px] text-[#7a7a6c] uppercase font-bold tracking-wider">
                {language === 'ar' ? 'المقر الإقليمي' : 'Regional Hub'}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2c2c2c] dark:text-[#f3f3ed]">
                <Globe className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                <span>Cairo, Egypt & Regional MENA</span>
              </div>
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-6 bg-[#e2e7dc]/50 dark:bg-[#2b3524]/50 border border-[#cbd5c0] dark:border-[#3b4832] rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#5a5a40] dark:text-[#a8a880] mx-auto" />
              <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                {language === 'ar' ? 'تم فتح بريد الدعم بنجاح!' : 'Gmail Composer Opened!'}
              </h4>
              <p className="text-xs text-[#5c5c50] dark:text-[#bebea8]">
                {language === 'ar'
                  ? 'تم تجهيز رسالتك وموضوعها مباشرة في Gmail لإرسالها إلى support.sanad.voulanteer@gmail.com'
                  : 'Your message and subject have been drafted in Gmail to support.sanad.voulanteer@gmail.com'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <a
                  href={getGmailUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إعادة فتح في Gmail Web' : 'Open in Gmail Web'}</span>
                </a>
                <a
                  href={getMailtoUrl()}
                  className="px-4 py-2 bg-[#eaeae2] dark:bg-[#2c2c24] text-[#3c3c32] dark:text-[#dedecf] text-xs font-semibold rounded-xl hover:bg-[#dcdcd4] dark:hover:bg-[#383830] transition flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'فتح في تطبيق البريد' : 'Open in Mail App'}</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    onClose();
                  }}
                  className="text-xs text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] underline cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق النافذة' : 'Close window'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3c3c30] dark:text-[#d6d6c4] mb-1">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#282821] border border-[#d8d8cc] dark:border-[#3e3e34] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3c3c30] dark:text-[#d6d6c4] mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#282821] border border-[#d8d8cc] dark:border-[#3e3e34] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3c3c30] dark:text-[#d6d6c4] mb-1">
                  {language === 'ar' ? 'نوع الاستفسار أو البلاغ' : 'Inquiry Type'}
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#282821] border border-[#d8d8cc] dark:border-[#3e3e34] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                >
                  <option value="general">{language === 'ar' ? 'استفسار عام أو اقتراح' : 'General Inquiry or Proposal'}</option>
                  <option value="verification">{language === 'ar' ? 'متابعة توثيق هوية صاحب طلب' : 'Account Verification Status'}</option>
                  <option value="report">{language === 'ar' ? 'بلاغ عن محتوى أو مخالفة أمان' : 'Report Violation or Safety Concern'}</option>
                  <option value="certificates">{language === 'ar' ? 'استفسار عن الساعات والشهادات' : 'Volunteer Hours & Certificates'}</option>
                  <option value="partnership">{language === 'ar' ? 'شراكة جمعيات ومؤسسات أهلية' : 'NGO / Clinic Partnership'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3c3c30] dark:text-[#d6d6c4] mb-1">
                  {language === 'ar' ? 'نص الرسالة أو الاستفسار' : 'Message'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={language === 'ar' ? 'وضح تفاصيل استفسارك أو طلبك هنا...' : 'Provide details of your inquiry...'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#282821] border border-[#d8d8cc] dark:border-[#3e3e34] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={getMailtoUrl()}
                  className="text-xs text-[#5a5a40] dark:text-[#a8a880] hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'فتح تطبيق البريد الافتراضي' : 'Open in Default Mail'}</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-[#eaeae2] dark:bg-[#2c2c24] text-[#3c3c32] dark:text-[#dedecf] text-xs font-semibold rounded-xl hover:bg-[#dcdcd4] dark:hover:bg-[#383830] transition cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إرسال عبر Gmail' : 'Send via Gmail'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

