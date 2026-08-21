import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Award, Star, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerAssignment } from '../../types';

interface CompleteAssignmentModalProps {
  assignment: VolunteerAssignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CompleteAssignmentModal: React.FC<CompleteAssignmentModalProps> = ({
  assignment,
  isOpen,
  onClose,
}) => {
  const { t, language, completeAssignment, pointRules } = useApp();
  const [actualHours, setActualHours] = useState<number>(assignment?.estimatedHours || 2);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assignment) return null;

  const basePoints = pointRules.pointsPerTask || 100;
  const emergencyBonus = assignment.urgency === 'emergency' ? (pointRules.emergencyBonus || 50) : 0;
  const urgentBonus = assignment.urgency === 'high' ? (pointRules.urgentBonus || 25) : 0;
  const hourlyPoints = actualHours * (pointRules.pointsPerHour || 15);
  const recurringBonus = assignment.isRecurring ? (pointRules.recurringBonus || 20) : 0;
  const estimatedEarned = basePoints + emergencyBonus + urgentBonus + hourlyPoints + recurringBonus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    completeAssignment(assignment.id, actualHours, notes);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fafaf7] dark:bg-[#20201a] w-full max-w-lg rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between bg-white dark:bg-[#252520]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e2e7dc] dark:bg-[#2b3524] text-[#3f4a35] dark:text-[#c7d5bb] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                {language === 'ar' ? 'توثيق وإكمال المهمة التطوعية' : 'Complete & Log Volunteer Task'}
              </h3>
              <p className="text-xs text-[#7c7c6e] dark:text-[#a8a898] truncate max-w-xs">
                {assignment.requestTitle}
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Points Calculation Card */}
          <div className="p-4 rounded-xl bg-[#f0ede6] dark:bg-[#2b2b24] border border-[#dfdbcf] dark:border-[#3c3c32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5a5a40] dark:text-[#c0c0a8] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {language === 'ar' ? 'المكافأة التقديرية بالنقاط' : 'Estimated Points Earned'}
              </span>
              <span className="text-lg font-black text-[#5a5a40] dark:text-[#d6d6b8]">
                +{estimatedEarned} {language === 'ar' ? 'نقطة' : 'pts'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#707062] dark:text-[#a2a294] border-t border-[#dfdbcf] dark:border-[#3c3c32] pt-2">
              <div>• {language === 'ar' ? 'إنجاز المهمة' : 'Task base'}: +{basePoints}</div>
              <div>• {language === 'ar' ? 'ساعات التطوع' : 'Hours logged'}: +{hourlyPoints}</div>
              {emergencyBonus > 0 && <div>• {language === 'ar' ? 'حالة طارئة' : 'Emergency bonus'}: +{emergencyBonus}</div>}
              {urgentBonus > 0 && <div>• {language === 'ar' ? 'أولوية قصوى' : 'High urgency'}: +{urgentBonus}</div>}
              {recurringBonus > 0 && <div>• {language === 'ar' ? 'مهمة متكررة' : 'Recurring bonus'}: +{recurringBonus}</div>}
            </div>
          </div>

          {/* Actual Hours Input */}
          <div>
            <label className="block text-xs font-bold text-[#3c3c32] dark:text-[#d8d8c8] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
              <span>{language === 'ar' ? 'عدد ساعات التطوع الفعلية' : 'Actual Volunteer Hours Worked'}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                required
                value={actualHours}
                onChange={(e) => setActualHours(parseFloat(e.target.value) || 1)}
                className="w-28 px-3.5 py-2 text-sm font-bold text-center rounded-xl border border-[#d8d8cc] dark:border-[#404036] bg-white dark:bg-[#252520] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
              <span className="text-xs text-[#7c7c6e] dark:text-[#a8a898]">
                {language === 'ar'
                  ? 'يتم احتساب الساعات في سجلك التطوعي وإضافتها لرصيد شهادتك المعتمدة.'
                  : 'Hours are verified and logged directly into your official certificate.'}
              </span>
            </div>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block text-xs font-bold text-[#3c3c32] dark:text-[#d8d8c8] mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
              <span>{language === 'ar' ? 'ملاحظات الإنجاز أو ملخص المساعدة (اختياري)' : 'Completion Notes / Summary (Optional)'}</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب نبذة موجزة عما تم إنجازه أو أي ملاحظات للمتابعة...'
                  : 'Briefly summarize what was accomplished or any follow-up info...'
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#404036] bg-white dark:bg-[#252520] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          {/* Buttons */}
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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'تأكيد وإتمام المهمة' : 'Confirm & Complete'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
