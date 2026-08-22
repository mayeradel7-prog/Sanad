import React, { useState } from 'react';
import { X, Star, Heart, CheckCircle2, MessageSquare, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReviewVolunteerModalProps {
  requestId: string;
  targetUserId: string;
  targetUserName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewVolunteerModal: React.FC<ReviewVolunteerModalProps> = ({
  requestId,
  targetUserId,
  targetUserName,
  isOpen,
  onClose,
}) => {
  const { t, language, submitDetailedReview } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [reliability, setReliability] = useState<number>(5);
  const [helpfulness, setHelpfulness] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [respect, setRespect] = useState<number>(5);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['مخلص', 'سريع الاستجابة']);

  if (!isOpen) return null;

  const availableTagsAr = ['مخلص ومتقن', 'سريع الاستجابة', 'ودود ومحترم', 'حل المشكلة بنجاح', 'مبادر ومتميز'];
  const availableTagsEn = ['Dedicated', 'Quick Response', 'Polite & Friendly', 'Solved Problem', 'Proactive'];
  const tags = language === 'ar' ? availableTagsAr : availableTagsEn;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDetailedReview(
      requestId,
      targetUserId,
      rating,
      comment.trim() || (language === 'ar' ? 'شكراً جزيلاً على المساعدة الكريمة والمتميزة!' : 'Thank you so much for the wonderful help!'),
      selectedTags,
      {
        reliability,
        helpfulness,
        communication,
        respect,
        accuracy,
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fafaf7] dark:bg-[#20201a] w-full max-w-lg rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between bg-white dark:bg-[#252520]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5e5dc] dark:bg-[#333329] text-[#3c3c2e] dark:text-[#d0d0be] flex items-center justify-center">
              <Star className="w-5 h-5 fill-current text-[#d4a853]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                {language === 'ar' ? 'تقييم تجربة المساعدة' : 'Review Volunteer Experience'}
              </h3>
              <p className="text-xs text-[#7c7c6e] dark:text-[#a8a898]">
                {language === 'ar' ? `تقييم ${targetUserName}` : `Rating ${targetUserName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c7c6e] hover:bg-[#ecece6] dark:hover:bg-[#2e2e26] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Overall Star Rating */}
          <div className="text-center py-2 bg-white dark:bg-[#252520] rounded-xl border border-[#e2e2d9] dark:border-[#383830] p-4">
            <p className="text-xs font-bold text-[#5c5c50] dark:text-[#b4b4a6] mb-2">
              {language === 'ar' ? 'التقييم العام:' : 'Overall Rating:'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition hover:scale-125 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-[#d4a853] text-[#d4a853]'
                        : 'text-[#d0d0c4] dark:text-[#4d4d40]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-extrabold text-[#5a5a40] dark:text-[#d6d6b8] mt-1 block">
              {rating === 5
                ? language === 'ar' ? 'ممتاز وتجربة استثنائية (مكافأة نقاط للمتطوع) ⭐' : 'Exceptional (Bonus points awarded) ⭐'
                : rating >= 4
                ? language === 'ar' ? 'جيد جداً ومفيد' : 'Very Good'
                : rating === 3
                ? language === 'ar' ? 'مقبول' : 'Average'
                : language === 'ar' ? 'بحاجة لتحسين' : 'Needs Improvement'}
            </span>
          </div>

          {/* Detailed Criteria */}
          <div className="space-y-3 p-4 bg-[#f4f4ec] dark:bg-[#272721] rounded-xl border border-[#e2e2d6] dark:border-[#383830]">
            <p className="text-xs font-bold text-[#3c3c32] dark:text-[#d8d8c8]">
              {language === 'ar' ? 'معايير التقييم التفصيلية (1-5):' : 'Detailed Metrics (1-5):'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5c5c50] dark:text-[#b0b09e]">
                  {language === 'ar' ? 'الالتزام والموثوقية:' : 'Reliability:'}
                </span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reliability}
                  onChange={(e) => setReliability(parseInt(e.target.value) || 5)}
                  className="w-12 text-center py-1 font-bold rounded-lg border border-[#d0d0c4] dark:border-[#444] bg-white dark:bg-[#1e1e18]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5c5c50] dark:text-[#b0b09e]">
                  {language === 'ar' ? 'التعاون وتقديم العون:' : 'Helpfulness:'}
                </span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={helpfulness}
                  onChange={(e) => setHelpfulness(parseInt(e.target.value) || 5)}
                  className="w-12 text-center py-1 font-bold rounded-lg border border-[#d0d0c4] dark:border-[#444] bg-white dark:bg-[#1e1e18]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5c5c50] dark:text-[#b0b09e]">
                  {language === 'ar' ? 'التواصل والوضوح:' : 'Communication:'}
                </span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={communication}
                  onChange={(e) => setCommunication(parseInt(e.target.value) || 5)}
                  className="w-12 text-center py-1 font-bold rounded-lg border border-[#d0d0c4] dark:border-[#444] bg-white dark:bg-[#1e1e18]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5c5c50] dark:text-[#b0b09e]">
                  {language === 'ar' ? 'الاحترام والأخلاق:' : 'Respect:'}
                </span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={respect}
                  onChange={(e) => setRespect(parseInt(e.target.value) || 5)}
                  className="w-12 text-center py-1 font-bold rounded-lg border border-[#d0d0c4] dark:border-[#444] bg-white dark:bg-[#1e1e18]"
                />
              </div>
            </div>
          </div>

          {/* Quick Compliments / Tags */}
          <div>
            <label className="block text-xs font-bold text-[#3c3c32] dark:text-[#d8d8c8] mb-2">
              {language === 'ar' ? 'أوسمة وإشادات تقديرية:' : 'Compliments / Badges:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer ${
                    selectedTags.includes(tag)
                      ? 'bg-[#5a5a40] text-white border-[#5a5a40]'
                      : 'border-[#d0d0c4] dark:border-[#404036] hover:bg-[#ecece6] dark:hover:bg-[#2c2c24] text-[#4e4e42] dark:text-[#cecebd]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-bold text-[#3c3c32] dark:text-[#d8d8c8] mb-1.5">
              {language === 'ar' ? 'رسالة شكر أو تعليق مراجعة:' : 'Written Feedback / Thank you note:'}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب انطباعك وكلمة تقدير للمتطوع...'
                  : 'Write a few kind words or review summary...'
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#404036] bg-white dark:bg-[#252520] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e2e2d9] dark:border-[#383830]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-[#5c5c50] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2c2c24] transition cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white/20" />
              <span>{language === 'ar' ? 'إرسال التقييم والشكر' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
