import React, { useState } from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerAssignment } from '../../types';

interface CancelAssignmentModalProps {
  assignment: VolunteerAssignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CancelAssignmentModal: React.FC<CancelAssignmentModalProps> = ({
  assignment,
  isOpen,
  onClose,
}) => {
  const { t, language, cancelVolunteerAssignment } = useApp();
  const [reason, setReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  if (!isOpen || !assignment) return null;

  const presetsAr = [
    'ظرف طارئ غير متوقع',
    'تعارض في المواعيد أو العمل',
    'صعوبة في الوصول للموقع',
    'تم حل الطلب من طرف آخر',
  ];

  const presetsEn = [
    'Unexpected emergency',
    'Schedule conflict',
    'Transportation / distance issue',
    'Task already handled',
  ];

  const presets = language === 'ar' ? presetsAr : presetsEn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason.trim() || selectedPreset || (language === 'ar' ? 'اعتذار لظروف طارئة' : 'Cancelled due to unexpected circumstances');
    cancelVolunteerAssignment(assignment.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fafaf7] dark:bg-[#20201a] w-full max-w-md rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between bg-white dark:bg-[#252520]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#faecec] dark:bg-[#382020] text-[#a83232] dark:text-[#df7272] flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                {language === 'ar' ? 'الاعتذار عن مهمة التطوع' : 'Cancel Volunteer Assignment'}
              </h3>
              <p className="text-xs text-[#7c7c6e] dark:text-[#a8a898] truncate max-w-[220px]">
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[#6e6e60] dark:text-[#b0b0a0] leading-relaxed">
            {language === 'ar'
              ? 'نقدّر التزامك. سيتم إشعار صاحب الطلب فوراً لفتح المجال لمتطوع آخر لمساعدته.'
              : 'We appreciate your dedication. The request owner will be notified immediately so another volunteer can assist.'}
          </p>

          <div>
            <label className="block text-xs font-bold text-[#3c3c32] dark:text-[#d8d8c8] mb-2">
              {language === 'ar' ? 'اختر سبب الاعتذار:' : 'Select cancellation reason:'}
            </label>
            <div className="space-y-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset);
                    setReason(preset);
                  }}
                  className={`w-full text-left rtl:text-right px-3 py-2 text-xs rounded-xl border transition cursor-pointer ${
                    selectedPreset === preset
                      ? 'border-[#a83232] bg-[#faecec]/50 dark:bg-[#382020]/50 text-[#a83232] dark:text-[#df7272] font-bold'
                      : 'border-[#d8d8cc] dark:border-[#383830] hover:bg-[#f2f2eb] dark:hover:bg-[#282822]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3c3c32] dark:text-[#d8d8c8] mb-1.5">
              {language === 'ar' ? 'أو اكتب تفاصيل إضافية:' : 'Or custom reason:'}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={language === 'ar' ? 'سبب الاعتذار...' : 'Specify reason...'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#404036] bg-white dark:bg-[#252520] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#a83232]"
            />
          </div>

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
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#a83232] hover:bg-[#8e2828] text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'تأكيد الاعتذار' : 'Confirm Cancel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
