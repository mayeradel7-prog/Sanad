import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
  Award,
  ArrowRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  DollarSign,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Send,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register', role?: 'volunteer' | 'owner') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { t, language, requests, categories, users, setActiveTab, setSelectedRequestId } = useApp();

  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const totalVolunteers = users.filter((u) => u.role === 'volunteer').length;
  const totalResolved = requests.filter((r) => r.status === 'completed').length;
  const totalHours = users.reduce((acc, u) => acc + (u.volunteerHours || 0), 0);
  const activeCategoriesCount = categories.filter((c) => c.isActive).length;

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const faqs = [
    {
      qEn: 'Who can register as a Help Seeker (Owner)?',
      qAr: 'من يمكنه التسجيل كطالب مساعدة (صاحب طلب)؟',
      aEn: 'Any individual, family representative, doctor, social worker, or NGO coordinator who needs volunteer support. To maintain safety and trust, owners must submit a valid document (such as ID, syndicate card, or organization authorization) which is reviewed by our admin team before posting.',
      aAr: 'يمكن لأي فرد، ممثل أسرة، طبيب، أخصائي اجتماعي أو منسق جمعية أهلية التسجيل. للحفاظ على الأمان والموثوقية، يلتزم طالب المساعدة برفع وثيقة إثبات (مثل بطاقة الرقم القومي أو كارنيه العمل/النقابة) لمراجعتها من قبل الإدارة قبل تفعيل إمكانية نشر الطلبات.',
    },
    {
      qEn: 'Is volunteering completely free?',
      qAr: 'هل العمل التطوعي مجاني تماماً؟',
      aEn: 'Yes! Volunteers never pay any fees to join, browse, or participate. Volunteers freely offer their skills, time, and empathy to help their communities, earning certified volunteer hours, points, and badges.',
      aAr: 'نعم تماماً! لا يدفع المتطوع أي رسوم للانضمام أو المشاركة. يقدم المتطوعون مهاراتهم ووقتهم بدافع إنساني خالص، ويكسبون ساعات تطوعية معتمدة ونقاطاً وأوسمة تقديرية.',
    },
    {
      qEn: 'How does the InstaPay donation support work?',
      qAr: 'كيف تعمل ميزة التبرع المالي عبر إنستاباي (InstaPay)؟',
      aEn: 'If a verified help seeker also requires financial assistance for medication or supplies, they can optionally add their InstaPay handle. Donors transfer funds directly to the owner without intermediaries or platform commission. We strictly distinguish between volunteer labor and financial aid.',
      aAr: 'إذا كان طالب المساعدة الموثق بحاجة لدعم مالي لشراء أدوية أو مستلزمات، يمكنه إضافة حسابه على إنستاباي. يتم التحويل مباشرة من المتبرع لصاحب الطلب دون أي وسيط أو عمولات، مع وجود فصل تام بين الجهد التطوعي والمساعدة المالية.',
    },
    {
      qEn: 'How is my private information protected?',
      qAr: 'كيف تتم حماية معلوماتي الشخصية؟',
      aEn: 'By default, exact home addresses and phone numbers are shielded. Only approximate areas (e.g. city or district) are shown publicly. Owners can choose to reveal their mobile number exclusively to volunteers they officially accept for a task.',
      aAr: 'بشكل افتراضي، يتم حجب العناوين الدقيقة وأرقام الهواتف، ويظهر فقط النطاق التقريبي (مثل المحافظة أو الحي). ويتحكم صاحب الطلب في إظهار رقم هاتفه فقط للمتطوعين الذين يقبل طلباتهم رسمياً.',
    },
  ];

  // Public requests preview
  const urgentRequests = requests.filter((r) => r.urgency === 'emergency' || r.urgency === 'high').slice(0, 3);
  const displayRequests = urgentRequests.length > 0 ? urgentRequests : requests.slice(0, 3);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-[#5a5a40]/15 via-[#8c8c73]/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#eaeae2] text-[#424232] dark:bg-[#2e2e25] dark:text-[#cfcfbe] border border-[#d8d8cc] dark:border-[#3d3d30] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
            <span>{language === 'ar' ? 'منصة التكافل والعمل التطوعي الموثقة' : 'Verified Community Volunteer Network'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2c2c2c] dark:text-[#f3f3ed] max-w-4xl mx-auto leading-tight sm:leading-tight font-serif">
            {t('landingHeroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-[#5a5a4e] dark:text-[#bebea8] max-w-2xl mx-auto leading-relaxed">
            {t('landingHeroSubtitle')}
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              id="hero-cta-volunteer"
              onClick={() => onOpenAuth('register', 'volunteer')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-[#5a5a40] hover:bg-[#484833] shadow-md shadow-[#5a5a40]/25 transition-all flex items-center justify-center gap-2 text-sm sm:text-base group cursor-pointer"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>{t('landingCtaVolunteer')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>

            <button
              id="hero-cta-seekhelp"
              onClick={() => onOpenAuth('register', 'owner')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] bg-white dark:bg-[#24241f] hover:bg-[#eaeae2] dark:hover:bg-[#2d2d25] border border-[#e2e2d9] dark:border-[#383830] shadow-xs transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <Heart className="w-5 h-5 text-[#c8766a]" />
              <span>{t('landingCtaSeekHelp')}</span>
            </button>
          </div>

          {/* Secondary link */}
          <div className="pt-2">
            <button
              id="hero-cta-browse"
              onClick={() => setActiveTab('home')}
              className="text-xs sm:text-sm font-semibold text-[#5a5a40] dark:text-[#a8a880] hover:underline inline-flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{t('landingCtaBrowse')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Impact Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#5a5a40] rounded-2xl p-6 sm:p-10 text-white shadow-xl shadow-[#5a5a40]/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x sm:divide-white/15 rtl:sm:divide-x-reverse">
            <div className="pt-4 sm:pt-0 space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#d4d4b8] mb-1">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-4xl font-bold tracking-tight font-serif">{totalVolunteers}</p>
              <p className="text-xs sm:text-sm text-[#ecece0]">{t('statsTotalVolunteers')}</p>
            </div>

            <div className="pt-4 sm:pt-0 space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#d4d4b8] mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-4xl font-bold tracking-tight font-serif">{totalResolved}</p>
              <p className="text-xs sm:text-sm text-[#ecece0]">{t('statsResolvedRequests')}</p>
            </div>

            <div className="pt-4 sm:pt-0 space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#d4d4b8] mb-1">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-4xl font-bold tracking-tight font-serif">{totalHours}</p>
              <p className="text-xs sm:text-sm text-[#ecece0]">{t('statsVolunteerHours')}</p>
            </div>

            <div className="pt-4 sm:pt-0 space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#d4d4b8] mb-1">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-4xl font-bold tracking-tight font-serif">{activeCategoriesCount}</p>
              <p className="text-xs sm:text-sm text-[#ecece0]">{language === 'ar' ? 'مجال تطوعي نشط' : 'Active Domains'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Public Community Needs Live Feed Highlight */}
      {displayRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5a5a40] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5a5a40]"></span>
              </span>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {language === 'ar' ? 'طلبات المساعدة العامة المفتوحة الآن' : 'Live Public Help Requests'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eef1e8] dark:bg-[#283022] text-[#4d5d3b] dark:text-[#b8cfa3]">
                  <Globe className="w-3 h-3" />
                  <span>{language === 'ar' ? 'متاح للجميع' : 'Public'}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs sm:text-sm font-semibold text-[#5a5a40] dark:text-[#a8a880] hover:underline flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'عرض كافة الطلبات' : 'Browse All Requests'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayRequests.map((req) => (
              <div
                key={req.id}
                id={`urgent-card-${req.id}`}
                onClick={() => {
                  setSelectedRequestId(req.id);
                  setActiveTab('home');
                }}
                className="bg-white dark:bg-[#24241f] rounded-xl p-5 border border-[#e2e2d9] dark:border-[#383830] hover:border-[#5a5a40] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      req.urgency === 'emergency'
                        ? 'bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94]'
                        : req.urgency === 'high'
                        ? 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
                        : 'bg-[#eaeae2] text-[#424232] dark:bg-[#2e2e25] dark:text-[#cfcfbe]'
                    }`}>
                      {req.urgency === 'emergency' || req.urgency === 'high' ? (
                        <AlertTriangle className="w-3 h-3 text-[#a84438]" />
                      ) : (
                        <Globe className="w-3 h-3 text-[#5a5a40]" />
                      )}
                      {req.urgency === 'emergency'
                        ? t('urgencyEmergency')
                        : req.urgency === 'high'
                        ? t('urgencyHigh')
                        : language === 'ar' ? 'طلب عام' : 'Public Request'}
                    </span>
                    <span className="text-xs text-[#7c7c6e] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {req.ownerCity}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] group-hover:text-[#5a5a40] dark:group-hover:text-[#a8a880] transition-colors line-clamp-2 mb-2 font-serif">
                    {req.title}
                  </h3>

                  <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] line-clamp-2 mb-4">
                    {req.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ecece4] dark:border-[#33332a] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#5a5a40] dark:text-[#a8a880]">
                    {req.volunteersNeeded} {t('volunteersNeededText')}
                  </span>
                  <span className="text-[#7c7c6e] font-medium group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform flex items-center gap-1">
                    {t('viewDetails')}
                    <ArrowIcon className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. How It Works (Dual Pathway) */}
      <section id="how-it-works-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-sm text-[#5c5c50] dark:text-[#a6a698]">
            {language === 'ar'
              ? 'صممنا منصة سند لتكون سلسة، سريعة، وأعلى أماناً لكل من يطلب العون أو يقدمه.'
              : 'Built for speed, clarity, and uncompromising safety for both volunteers and help seekers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pathway A: Help Seekers (Owners) */}
          <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 sm:p-8 border border-[#e2e2d9] dark:border-[#383830] shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eae5d8] text-[#544834] dark:bg-[#383327] dark:text-[#dfd4be] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#7a6442]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {language === 'ar' ? 'إذا كنت بحاجة إلى مساعدة' : 'For Help Seekers & Owners'}
                </h3>
                <p className="text-xs text-[#7c7c6e]">
                  {language === 'ar' ? 'خطوات بسيطة للحصول على متطوعين موثوقين' : 'Simple steps to get verified assistance'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#7a6442] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                    {t('howItWorksOwnerStep1')}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] mt-1">
                    {t('howItWorksOwnerDesc1')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#7a6442] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                    {t('howItWorksOwnerStep2')}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] mt-1">
                    {t('howItWorksOwnerDesc2')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#7a6442] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                    {t('howItWorksOwnerStep3')}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] mt-1">
                    {t('howItWorksOwnerDesc3')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('register', 'owner')}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#4a3d28] dark:text-[#ded2ba] bg-[#eae5d8] dark:bg-[#383327] hover:bg-[#dfd8c8] dark:hover:bg-[#443d2e] border border-[#d8cebe] dark:border-[#4d4432] transition flex items-center justify-center gap-1.5"
            >
              <span>{t('landingCtaSeekHelp')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pathway B: Volunteers */}
          <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 sm:p-8 border border-[#e2e2d9] dark:border-[#383830] shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#5a5a40]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {language === 'ar' ? 'إذا كنت ترغب في التطوع' : 'For Dedicated Volunteers'}
                </h3>
                <p className="text-xs text-[#7c7c6e]">
                  {language === 'ar' ? 'استثمر مهاراتك ووقتك في خدمة أهلك ومجتمعك' : 'Put your skills and compassion to work'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#5a5a40] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                    {t('howItWorksVolStep1')}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] mt-1">
                    {t('howItWorksVolDesc1')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#5a5a40] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                    {t('howItWorksVolStep2')}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] mt-1">
                    {t('howItWorksVolDesc2')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#5a5a40] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                    {t('howItWorksVolStep3')}
                  </h4>
                  <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] mt-1">
                    {t('howItWorksVolDesc3')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('register', 'volunteer')}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#394828] dark:text-[#c7d5bb] bg-[#e2e7dc] dark:bg-[#2b3524] hover:bg-[#d5decb] dark:hover:bg-[#34422c] border border-[#cbd5c0] dark:border-[#3b4832] transition flex items-center justify-center gap-1.5"
            >
              <span>{t('landingCtaVolunteer')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Safety & Verification Pillar */}
      <section id="safety-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#eaeae2] dark:bg-[#22221b] rounded-2xl p-6 sm:p-10 border border-[#d8d8cc] dark:border-[#38382c]">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-[#5a5a40] dark:text-[#a8a880] uppercase tracking-wider">
              {language === 'ar' ? 'ضمانات الأمان والموثوقية' : 'Security & Trust Infrastructure'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {t('safetyTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5c5c50] dark:text-[#a6a698]">
              {t('safetyDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#2a2a22] p-5 rounded-xl border border-[#e2e2d9] dark:border-[#3d3d30] space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#5a5a40]" />
              </div>
              <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                {t('safetyItem1Title')}
              </h4>
              <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] leading-relaxed">
                {t('safetyItem1Desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-[#2a2a22] p-5 rounded-xl border border-[#e2e2d9] dark:border-[#3d3d30] space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#dde4ea] text-[#2c3d4a] dark:bg-[#222d36] dark:text-[#a8c2d6] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#3b556b]" />
              </div>
              <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                {t('safetyItem2Title')}
              </h4>
              <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] leading-relaxed">
                {t('safetyItem2Desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-[#2a2a22] p-5 rounded-xl border border-[#e2e2d9] dark:border-[#3d3d30] space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#eae5d8] text-[#544834] dark:bg-[#383327] dark:text-[#dfd4be] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#7a6442]" />
              </div>
              <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                {t('safetyItem3Title')}
              </h4>
              <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] leading-relaxed">
                {t('safetyItem3Desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-[#2a2a22] p-5 rounded-xl border border-[#e2e2d9] dark:border-[#3d3d30] space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#a84438]" />
              </div>
              <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                {t('safetyItem4Title')}
              </h4>
              <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] leading-relaxed">
                {t('safetyItem4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Categories Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {language === 'ar' ? 'مجالات العمل التطوعي المتاحة' : 'Volunteer Impact Categories'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5c5c50] dark:text-[#a6a698]">
            {language === 'ar'
              ? 'اختر المجال الذي يناسب شغفك وخبرتك وقدم يد العون فيه'
              : 'Choose the domain matching your passion and expertise to start contributing.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.filter((c) => c.isActive).map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActiveTab('home')}
              className="bg-white dark:bg-[#24241f] p-4 rounded-xl border border-[#e2e2d9] dark:border-[#383830] hover:border-[#5a5a40] dark:hover:border-[#a8a880] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] group-hover:text-[#5a5a40] dark:group-hover:text-[#a8a880] transition-colors font-serif">
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </h4>
                <p className="text-[11px] text-[#7c7c6e] mt-1 line-clamp-2">
                  {language === 'ar' ? cat.descriptionAr : cat.descriptionEn}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#5a5a40] dark:text-[#a8a880] mt-3 flex items-center gap-1">
                <span>{language === 'ar' ? 'تصفح الطلبات' : 'Explore'}</span>
                <ArrowIcon className="w-2.5 h-2.5" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-[#eaeae2] dark:bg-[#2e2e25] text-[#5a5a40] dark:text-[#a8a880] mb-1">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('navFAQ')}
          </h2>
          <p className="text-xs sm:text-sm text-[#5c5c50] dark:text-[#a6a698]">
            {language === 'ar' ? 'إجابات على الأسئلة الأكثر شيوعاً حول التسجيل والأمان والتطوع' : 'Frequently asked questions about safety, verification, and volunteering.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#24241f] rounded-xl border border-[#e2e2d9] dark:border-[#383830] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#fafaf7] dark:hover:bg-[#2a2a22] transition"
                >
                  <span className="font-serif">{language === 'ar' ? faq.qAr : faq.qEn}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#5a5a40] dark:text-[#a8a880] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#7c7c6e] flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-[#5c5c50] dark:text-[#bebea8] leading-relaxed border-t border-[#ecece4] dark:border-[#33332a] pt-3">
                    {language === 'ar' ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Contact & Community Support */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#21211b] text-[#f5f5f0] rounded-2xl p-6 sm:p-10 border border-[#36362b] shadow-xl">
          <div className="max-w-xl mx-auto text-center space-y-3 mb-6">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#f5f5f0]">
              {language === 'ar' ? 'هل لديك استفسار أو ترغب في مبادرة مجتمعية؟' : 'Have a Question or Community Initiative?'}
            </h3>
            <p className="text-xs text-[#a4a496]">
              {language === 'ar'
                ? 'فريق منصة سند جاهز لتقديم الدعم ومساعدة الجمعيات والمجموعات التطوعية.'
                : 'Our platform team is here to assist individuals, clinics, and non-profits.'}
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 bg-[#2a2a20] border border-[#5a5a40] rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#a8a880] mx-auto" />
              <p className="font-bold text-sm text-[#ecece0]">
                {language === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Your message has been received!'}
              </p>
              <p className="text-xs text-[#cfcfb4]">
                {language === 'ar' ? 'سيتواصل معك فريق الدعم خلال 24 ساعة.' : 'Our team will get back to you within 24 hours.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder={language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#2c2c24] border border-[#3d3d32] text-sm text-[#f5f5f0] placeholder-[#888878] focus:outline-none focus:border-[#5a5a40]"
              />
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder={language === 'ar' ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email address or Phone'}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#2c2c24] border border-[#3d3d32] text-sm text-[#f5f5f0] placeholder-[#888878] focus:outline-none focus:border-[#5a5a40]"
              />
              <textarea
                required
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder={language === 'ar' ? 'اكتب استفسارك أو رسالتك هنا...' : 'Write your inquiry or proposal here...'}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#2c2c24] border border-[#3d3d32] text-sm text-[#f5f5f0] placeholder-[#888878] focus:outline-none focus:border-[#5a5a40] resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-bold text-sm bg-[#5a5a40] hover:bg-[#484833] text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
