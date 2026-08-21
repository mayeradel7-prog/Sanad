import React, { useState } from 'react';
import { X, Star, CheckCircle2, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  requestId: string;
  requestTitle: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  requestId,
  requestTitle,
}) => {
  const { t, language, submitReview } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    submitReview(targetUserId, requestId, rating, comment.trim());
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a16]/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e2d9] dark:border-[#383830] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f4ebe1] text-[#94672e] dark:bg-[#3d3023] dark:text-[#e0b992] flex items-center justify-center mx-auto">
            <Star className="w-6 h-6 fill-[#b58840] text-[#b58840]" />
          </div>
          <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('rateVolunteer')}
          </h3>
          <p className="text-xs text-[#7c7c6e]">
            {language === 'ar' ? `تقييم تجربة المساعدة في: "${requestTitle}"` : `Review feedback for: "${requestTitle}"`}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2 bg-[#e2e7dc] dark:bg-[#2b3524] rounded-xl border border-[#cbd5c3] dark:border-[#3a4731]">
            <CheckCircle2 className="w-8 h-8 text-[#5a5a40] dark:text-[#a8a880] mx-auto" />
            <p className="font-bold text-xs text-[#3f4a35] dark:text-[#c7d5bb]">
              {t('ratingSubmittedSuccess')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Interactive Star Rating */}
            <div className="flex flex-col items-center gap-1.5 py-2">
              <span className="font-semibold text-[#4d4d42] dark:text-[#cfcfbe]">{t('ratingLabel')}</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating !== null ? star <= hoverRating : star <= rating)
                          ? 'text-[#b58840] fill-[#b58840]'
                          : 'text-[#d8d8cc] dark:text-[#525244]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('reviewFeedbackLabel')} <span className="text-[#a84438]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('reviewPlaceholder')}
                className="w-full p-3 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40] resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl font-semibold bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dcdcd4] dark:hover:bg-[#383830] transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl font-bold text-white bg-[#5a5a40] hover:bg-[#484833] shadow-sm transition cursor-pointer"
              >
                {t('submitReviewBtn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
