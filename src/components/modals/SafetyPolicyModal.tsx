import React from 'react';
import {
  ShieldCheck,
  Lock,
  DollarSign,
  Award,
  X,
  CheckCircle2,
  FileText,
  PhoneCall,
  ExternalLink,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type SafetyTopicId = 'verification' | 'privacy' | 'instapay' | 'certificates' | 'general';

interface SafetyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: SafetyTopicId;
  onOpenAuth?: (mode: 'login' | 'register', role?: 'volunteer' | 'owner') => void;
}

export const SafetyPolicyModal: React.FC<SafetyPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'general',
  onOpenAuth,
}) => {
  const { language, t, currentUser, setActiveTab } = useApp();
  const [selectedTopic, setSelectedTopic] = React.useState<SafetyTopicId>(initialTopic);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  const topics = [
    {
      id: 'verification' as SafetyTopicId,
      icon: FileText,
      titleEn: 'Owner Document Verification',
      titleAr: 'توثيق هوية أصحاب الطلبات',
      descEn: 'Strict verification of national IDs, syndicates, and NGO credentials.',
      descAr: 'مراجعة دقيقة لبطاقات الهوية وكارنيهات النقابات والجهات الأهلية.',
    },
    {
      id: 'privacy' as SafetyTopicId,
      icon: Lock,
      titleEn: 'Phone & Data Privacy Shield',
      titleAr: 'درع حماية الخصوصية والهاتف',
      descEn: 'Phone masking and approximate location display on public feeds.',
      descAr: 'حجب رقم الهاتف وإظهار نطاق جغرافي تقريبي للمحافظة على الأمان.',
    },
    {
      id: 'instapay' as SafetyTopicId,
      icon: DollarSign,
      titleEn: 'Direct InstaPay Support',
      titleAr: 'دعم إنستاباي المالي المباشر',
      descEn: '0% commission, direct peer-to-peer aid for medicines and supplies.',
      descAr: 'تحويل مباشر من المتبرع لصاحب الطلب بدون عمولات أو وسطاء.',
    },
    {
      id: 'certificates' as SafetyTopicId,
      icon: Award,
      titleEn: 'Official Volunteer Certificates',
      titleAr: 'شهادات التطوع المعتمدة',
      descEn: 'Automated hour calculation with verifiable certificate numbers.',
      descAr: 'توثيق معتمد للساعات التطوعية مع رمز تحقق ورقم تسلسلي موثق.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="safety-policy-modal-container"
        className="relative w-full max-w-2xl bg-white dark:bg-[#20201a] rounded-2xl shadow-2xl border border-[#e2e2d9] dark:border-[#383830] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e2d9] dark:border-[#33332a] bg-[#fafaf7] dark:bg-[#24241d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#5a5a40] dark:text-[#a8a880]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                {language === 'ar' ? 'معايير الأمان والنزاهة المجتمعية' : 'Safety & Integrity Standards'}
              </h3>
              <p className="text-[11px] text-[#7c7c6e]">
                {language === 'ar' ? 'سند - منصة التكافل والعمل التطوعي الآمن' : 'Sanad Trust & Verification Protocols'}
              </p>
            </div>
          </div>
          <button
            id="close-safety-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#888878] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] rounded-lg hover:bg-[#ecece6] dark:hover:bg-[#2d2d25] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="p-3 border-b border-[#ecece4] dark:border-[#33332a] bg-[#f7f7f3] dark:bg-[#1e1e18] flex items-center gap-1.5 overflow-x-auto">
          {topics.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTopic === t.id;
            return (
              <button
                key={t.id}
                id={`safety-tab-${t.id}`}
                onClick={() => setSelectedTopic(t.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#5a5a40] text-white shadow-xs'
                    : 'bg-white dark:bg-[#272720] text-[#555547] dark:text-[#c4c4b2] hover:bg-[#ecece6] dark:hover:bg-[#32322a] border border-[#e2e2d9] dark:border-[#383830]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? t.titleAr : t.titleEn}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#4e4e42] dark:text-[#cecebd]">
          {selectedTopic === 'verification' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#e2e7dc]/40 dark:bg-[#2b3524]/40 border border-[#cbd5c0] dark:border-[#3b4832] flex items-start gap-3">
                <FileText className="w-6 h-6 text-[#5a5a40] dark:text-[#a8a880] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                    {language === 'ar' ? 'آلية التحقق من هوية أصحاب الطلبات' : 'Owner Document Verification System'}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] mt-1 leading-relaxed">
                    {language === 'ar'
                      ? 'لضمان ألا تُنشر أي طلبات وهمية أو غير دقيقة، تُلزم منصة سند جميع أصحاب الطلبات بتقديم مستند إثبات هوية رسمي لمراجعته من قبل المشرفين.'
                      : 'To eliminate fake or misleading requests, Sanad requires all help seekers to upload valid identification documents reviewed by our admin moderation team.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-xs text-[#2c2c2c] dark:text-[#f3f3ed] uppercase tracking-wider">
                  {language === 'ar' ? 'المستندات المقبولة للتوثيق:' : 'Accepted Verification Documents:'}
                </h5>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                    <span>{language === 'ar' ? 'بطاقة الرقم القومي سارية المفعول.' : 'Valid National Identity Card (Civil ID).'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                    <span>{language === 'ar' ? 'كارنيه نقابي أو إثبات مهني (أطباء، تمريض، أخصائيين اجتماعيين).' : 'Syndicate or Professional Card (Doctors, Social Workers).'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                    <span>{language === 'ar' ? 'خطاب تفويض معتمد من جمعية خيرية أو مؤسسة أهلية مشهرة.' : 'Official Authorization letter from a registered NGO or Charity.'}</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-[#fafaf7] dark:bg-[#25251f] rounded-xl border border-[#e2e2d9] dark:border-[#383830] text-xs space-y-1">
                <span className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                  {language === 'ar' ? 'شارة الحساب الموثق:' : 'Verified Account Badge:'}
                </span>
                <p className="text-[#6c6c5e] dark:text-[#a4a496]">
                  {language === 'ar'
                    ? 'يحصل الحساب على علامة التوثيق الخضراء (موثق رسمياً) فور اعتماد مستنداته، مما يمنحه ثقة المتطوعين وسرعة الاستجابة لطلباته.'
                    : 'Verified accounts display a green check badge indicating verified status, boosting volunteer confidence and rapid assistance.'}
                </p>
              </div>
            </div>
          )}

          {selectedTopic === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#dde4ea]/40 dark:bg-[#222d36]/40 border border-[#b8cad8] dark:border-[#2f404d] flex items-start gap-3">
                <Lock className="w-6 h-6 text-[#3b556b] dark:text-[#a8c2d6] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                    {language === 'ar' ? 'حماية خصوصية أرقام الهواتف والعناوين' : 'Phone & Location Privacy Shield'}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] mt-1 leading-relaxed">
                    {language === 'ar'
                      ? 'خصوصيتك خط أحمر. لا يتم عرض أرقام الهواتف أو العناوين الدقيقة للعامة على المنصة.'
                      : 'Your personal security is our top priority. Exact phone numbers and street addresses are never published openly.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-xs text-[#2c2c2c] dark:text-[#f3f3ed] uppercase tracking-wider">
                  {language === 'ar' ? 'كيف يحميك النظام؟' : 'How the Privacy Shield Protects You:'}
                </h5>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3b556b] dark:text-[#a8c2d6] mt-0.5" />
                    <span>{language === 'ar' ? 'يظهر فقط النطاق الجغرافي العام (المحافظة أو الحي).' : 'Only general approximate location (City or District) is shown publicly.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3b556b] dark:text-[#a8c2d6] mt-0.5" />
                    <span>{language === 'ar' ? 'يمكن لصاحب الطلب حظر أو كشف رقم الهاتف فقط للمتطوع الذي تم قبوله للمهمة.' : 'Owners can restrict phone access exclusively to accepted and assigned volunteers.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3b556b] dark:text-[#a8c2d6] mt-0.5" />
                    <span>{language === 'ar' ? 'إمكانية التنسيق الكامل عبر نظام المحادثات الداخلي المشفر في المنصة.' : 'Full coordination can take place safely inside the built-in messaging center.'}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedTopic === 'instapay' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#eae5d8]/40 dark:bg-[#383327]/40 border border-[#d8cebe] dark:border-[#4d4432] flex items-start gap-3">
                <DollarSign className="w-6 h-6 text-[#7a6442] dark:text-[#dfd4be] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                    {language === 'ar' ? 'التبرع المالي المباشر عبر إنستاباي' : 'Transparent Direct InstaPay Support'}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] mt-1 leading-relaxed">
                    {language === 'ar'
                      ? 'للحالات الطبية أو الإنسانية التي تتطلب شراء أدوية أو أجهزة، يُتاح التبرع مباشرة للحساب المصرفي لصاحب الحالة دون أي استقطاع.'
                      : 'For verified medical or urgent needs requiring prescription medicines, donors can send support directly to the beneficiary’s official InstaPay handle.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-xs text-[#2c2c2c] dark:text-[#f3f3ed] uppercase tracking-wider">
                  {language === 'ar' ? 'مبادئ الدعم المالي في سند:' : 'Sanad Financial Principles:'}
                </h5>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7a6442] dark:text-[#dfd4be]" />
                    <span>{language === 'ar' ? 'نسبة عمولة المنصة 0% تماماً.' : 'Zero platform fee or commission (0%).'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7a6442] dark:text-[#dfd4be]" />
                    <span>{language === 'ar' ? 'فصل تام بين الجهد التطوعي البدني والمساعدة المالية الاختيارية.' : 'Clear separation between voluntary labor and voluntary financial aid.'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7a6442] dark:text-[#dfd4be]" />
                    <span>{language === 'ar' ? 'لا تُقبل حسابات إنستاباي إلا للحسابات الموثقة بقرار من المشرفين.' : 'InstaPay handles are reviewed strictly to avoid misuse or unauthorized appeals.'}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedTopic === 'certificates' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#e2e7dc]/40 dark:bg-[#2b3524]/40 border border-[#cbd5c0] dark:border-[#3b4832] flex items-start gap-3">
                <Award className="w-6 h-6 text-[#5a5a40] dark:text-[#a8a880] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                    {language === 'ar' ? 'شهادات التطوع وسجل الساعات المعتمد' : 'Official Volunteer Hours & Certificates'}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] mt-1 leading-relaxed">
                    {language === 'ar'
                      ? 'توثق المنصة جهودك وإنجازاتك في كل مهمة تكتمل، وتتيح لك استخراج شهادة تقدير رسمية فورية وموثقة.'
                      : 'Every completed mission automatically credits certified hours and grants an official downloadable certificate with verification codes.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-xs text-[#2c2c2c] dark:text-[#f3f3ed] uppercase tracking-wider">
                  {language === 'ar' ? 'مزايا التوثيق للمتطوعين:' : 'Volunteer Recognition Benefits:'}
                </h5>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                    <span>{language === 'ar' ? 'رقم شهادة فريد وكود تحقق للجامعات وأرباب العمل.' : 'Unique serial certificate number and verification code.'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                    <span>{language === 'ar' ? 'نقاط وأوسمة مجتمعية ومستويات تطوع متقدمة.' : 'Gamified badge progression and volunteer levels.'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                    <span>{language === 'ar' ? 'إمكانية طباعة أو تصدير الشهادة كملف PDF في أي وقت من ملفك الشخصي.' : 'Print or export instant PDF certificates anytime from your profile.'}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#e2e2d9] dark:border-[#33332a] bg-[#fafaf7] dark:bg-[#24241d] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              setActiveTab('home');
            }}
            className="text-xs font-semibold text-[#5a5a40] dark:text-[#a8a880] hover:underline cursor-pointer"
          >
            {language === 'ar' ? 'تصفح طلبات التطوع المفتوحة' : 'Browse Open Volunteer Requests'}
          </button>

          <div className="flex items-center gap-2">
            {!currentUser && onOpenAuth && (
              <button
                id="safety-modal-register-btn"
                onClick={() => {
                  onClose();
                  onOpenAuth('register', 'volunteer');
                }}
                className="px-4 py-2 bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>{language === 'ar' ? 'انضم كمتطوع الآن' : 'Join as Volunteer'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-[#2b2b23] border border-[#d8d8cc] dark:border-[#3d3d30] text-[#3c3c32] dark:text-[#dedecf] text-xs font-semibold rounded-xl hover:bg-[#ecece6] dark:hover:bg-[#34342a] transition cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
