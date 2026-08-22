import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportReason } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string | null;
  targetExcerpt?: string;
  reportedUserId?: string;
  type?: 'request' | 'user' | 'message';
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetExcerpt,
  reportedUserId,
  type = 'request',
}) => {
  const { t, language, submitReport } = useApp();

  const [reason, setReason] = useState<ReportReason>('fake_request');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !targetId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(type, targetId, reportedUserId, reason, details.trim() || undefined);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a16]/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e2d9] dark:border-[#383830] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('reportModalTitle')}
          </h3>
          <p className="text-xs text-[#7c7c6e]">
            {t('reportModalSubtitle')}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2 bg-[#e2e7dc] dark:bg-[#2b3524] rounded-xl border border-[#cbd5c3] dark:border-[#3a4731]">
            <CheckCircle2 className="w-8 h-8 text-[#5a5a40] dark:text-[#a8a880] mx-auto" />
            <p className="font-bold text-xs text-[#3f4a35] dark:text-[#c7d5bb]">
              {t('reportSuccess')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {targetExcerpt && (
              <div className="p-2.5 rounded-lg bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#5c5c50] dark:text-[#cfcfbe] line-clamp-2 italic border border-[#ecece4] dark:border-[#33332a]">
                "{targetExcerpt}"
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('reportReasonLabel')}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#a84438]"
              >
                <option value="fake_request">{t('reportReasonFake')}</option>
                <option value="inappropriate">{t('reportReasonInappropriate')}</option>
                <option value="scam_or_spam">{t('reportReasonScam')}</option>
                <option value="harassment">{t('reportReasonHarassment')}</option>
                <option value="other">{t('reportReasonOther')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('reportDetailsLabel')}
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t('reportDetailsPlaceholder')}
                className="w-full p-3 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#a84438] resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl font-semibold bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dfdfe2] cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl font-bold text-white bg-[#a84438] hover:bg-[#8f392f] transition shadow-sm cursor-pointer"
              >
                {t('submitReportBtn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
