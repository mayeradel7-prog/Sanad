import React, { useRef } from 'react';
import { X, Award, Download, Printer, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';
import { VolunteerCertificate } from '../../types';
import { useApp } from '../../context/AppContext';

interface CertificateModalProps {
  certificate: VolunteerCertificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  const { language } = useApp();
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fafaf7] dark:bg-[#20201a] w-full max-w-2xl rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls */}
        <div className="p-4 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between bg-white dark:bg-[#252520] print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#5a5a40] dark:text-[#a8a880]" />
            <span className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {language === 'ar' ? 'شهادة تقدير وإنجاز تطوعي معتمدة' : 'Official Volunteer Certificate'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#7c7c6e] hover:bg-[#ecece6] dark:hover:bg-[#2e2e26] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-6 sm:p-8 bg-[#fdfdfb] text-[#2c2c2c] relative select-none" ref={certRef}>
          {/* Ornate Framing Borders */}
          <div className="border-4 border-double border-[#5a5a40]/70 p-6 sm:p-10 rounded-2xl relative bg-[#fafaf7] shadow-inner">
            {/* Top Seal & Heading */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#5a5a40] text-white mx-auto flex items-center justify-center shadow-md">
                <Award className="w-9 h-9 stroke-[2]" />
              </div>
              <p className="text-xs uppercase tracking-widest text-[#70705a] font-mono font-bold">
                SANAD VOLUNTEER NETWORK • شبكة سند للعمل التطوعي
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22221b] font-serif tracking-tight pt-1">
                {language === 'ar' ? 'شهادة تقدير واعتماد ساعات تطوعية' : 'Certificate of Volunteer Excellence'}
              </h1>
              <p className="text-xs text-[#6e6e5c] italic">
                {language === 'ar'
                  ? 'تُمنح هذه الشهادة تقديراً للعطاء المجتمعي المتميز والمساهمة الفعالة في خدمة الأفراد'
                  : 'Presented in recognition of outstanding community service and dedicated volunteer impact'}
              </p>
            </div>

            {/* Recipient Name */}
            <div className="my-6 sm:my-8 text-center border-y border-[#d8d8c8] py-4 bg-white/70 rounded-xl">
              <p className="text-xs text-[#7c7c6a] font-medium">
                {language === 'ar' ? 'تُشهد المنصة بأن المتطوع / المتطوعة:' : 'This certifies that volunteer:'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#5a5a40] font-serif tracking-wide py-1">
                {certificate.volunteerName}
              </h2>
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#e2e7dc] text-[#3f4a35] text-xs font-bold">
                {language === 'ar' ? (certificate.titleAr || 'متطوع مجتمعي معتمد') : (certificate.titleEn || 'Certified Community Volunteer')}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 text-center my-6">
              <div className="p-3 bg-white rounded-xl border border-[#e4e4d8] shadow-2xs">
                <p className="text-[11px] text-[#7c7c6e] font-semibold">
                  {language === 'ar' ? 'إجمالي الساعات المعتمدة' : 'Verified Volunteer Hours'}
                </p>
                <p className="text-xl font-black text-[#2c2c2c] font-serif">
                  {certificate.totalHours} {language === 'ar' ? 'ساعة' : 'Hrs'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e4e4d8] shadow-2xs">
                <p className="text-[11px] text-[#7c7c6e] font-semibold">
                  {language === 'ar' ? 'المهام والطلبات المنجزة' : 'Tasks Completed'}
                </p>
                <p className="text-xl font-black text-[#2c2c2c] font-serif">
                  {certificate.tasksCompleted} {language === 'ar' ? 'مهمة' : 'Tasks'}
                </p>
              </div>
            </div>

            {/* Signatures & Verification Code */}
            <div className="pt-4 border-t border-[#d8d8c8] flex items-end justify-between text-xs text-[#555547]">
              <div>
                <p className="text-[10px] text-[#888878] uppercase font-mono">
                  {language === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}
                </p>
                <p className="font-bold text-[#2c2c2c]">{certificate.issueDate}</p>
                <p className="text-[10px] text-[#888878] font-mono mt-1">
                  ID: {certificate.certificateNumber}
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 border border-[#b8b8a8] rounded-lg mx-auto flex items-center justify-center bg-white">
                  <ShieldCheck className="w-6 h-6 text-[#5a5a40]" />
                </div>
                <p className="text-[9px] font-mono font-bold text-[#707060] mt-1">
                  VERIFIED • {certificate.verificationCode}
                </p>
              </div>

              <div className="text-right rtl:text-left">
                <p className="text-[10px] text-[#888878] uppercase font-mono">
                  {language === 'ar' ? 'الجهة المانحة' : 'Issued By'}
                </p>
                <p className="font-bold text-[#5a5a40] font-serif">
                  Sanad Trust Authority
                </p>
                <p className="text-[9px] text-[#888878]">
                  {language === 'ar' ? 'هيئة توثيق التطوع المجتمعي' : 'Community Volunteer Registry'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
