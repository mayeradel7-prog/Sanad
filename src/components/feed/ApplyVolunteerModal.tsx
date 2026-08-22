import React, { useState } from 'react';
import { X, Sparkles, Heart, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ApplyVolunteerModalProps {
  requestId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyVolunteerModal: React.FC<ApplyVolunteerModalProps> = ({
  requestId,
  isOpen,
  onClose,
}) => {
  const { t, language, requests, applyToRequest, applyForRequest, currentUser } = useApp();

  const [message, setMessage] = useState('');
  const [availabilityTime, setAvailabilityTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !requestId || !currentUser) return null;

  const request = requests.find((r) => r.id === requestId);
  if (!request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const applyFn = applyToRequest || applyForRequest;
    if (applyFn) {
      applyFn(request.id, message.trim(), availabilityTime.trim() || undefined);
    }
    setMessage('');
    setAvailabilityTime('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a16]/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e2d9] dark:border-[#383830] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#eaeae2] text-[#5a5a40] dark:bg-[#2c2c24] dark:text-[#bebea8] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('applyModalTitle')}
          </h3>
          <p className="text-xs text-[#7c7c6e] max-w-sm mx-auto">
            {language === 'ar'
              ? `أنت تتقدم للمساعدة في طلب: "${request.title}"`
              : `You are offering to help with: "${request.title}"`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
              {t('applyMessageLabel')} <span className="text-[#a84438]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('applyMessagePlaceholder')}
              className="w-full p-3 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40] resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
              {t('applyAvailabilityLabel')}
            </label>
            <input
              type="text"
              value={availabilityTime}
              onChange={(e) => setAvailabilityTime(e.target.value)}
              placeholder="e.g. Tomorrow 3:00 PM - 7:00 PM / جاهز غداً بعد العصر"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#e2e7dc] dark:bg-[#2b3524] border border-[#cbd5c3] dark:border-[#3a4731] text-xs text-[#3f4a35] dark:text-[#c7d5bb] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880] flex-shrink-0 mt-0.5" />
            <p>
              {language === 'ar'
                ? 'عند قبول طلبك، ستحصل على بيانات التواصل ورقم هاتف صاحب الطلب مباشرة لتنسيق المساعدة، وستسجل لك ساعات تطوعية عند الإنجاز.'
                : 'Once accepted, you will receive direct contact details to coordinate, and your completed volunteer hours will be recorded.'}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dfdfe2] cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              id="submitApplication"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5a5a40] hover:bg-[#484833] shadow-md shadow-[#5a5a40]/20 cursor-pointer disabled:opacity-50"
            >
              {t('submitApplication')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
