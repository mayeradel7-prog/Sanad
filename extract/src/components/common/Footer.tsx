import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Mail,
  Globe,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Lock,
  DollarSign,
  Award,
  FileCheck,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafetyPolicyModal, SafetyTopicId } from '../modals/SafetyPolicyModal';
import { ContactSupportModal } from '../modals/ContactSupportModal';

interface FooterProps {
  onOpenAuth?: (mode: 'login' | 'register', role?: 'volunteer' | 'owner') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  const { t, language, activeTab, setActiveTab } = useApp();
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [safetyTopic, setSafetyTopic] = useState<SafetyTopicId>('general');
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const navigateToSection = (sectionId: string) => {
    if (activeTab !== 'landing') {
      setActiveTab('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleOpenSafetyTopic = (topic: SafetyTopicId) => {
    setSafetyTopic(topic);
    setSafetyModalOpen(true);
  };

  return (
    <footer className="bg-[#21211b] text-[#b8b8a8] border-t border-[#36362b] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <button
              id="footer-brand-btn"
              onClick={() => {
                setActiveTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left rtl:text-right group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#5a5a40] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-[#f5f5f0] font-serif block">
                  {t('appName')} | سند
                </span>
                <span className="text-[11px] text-[#a4a496] block">{t('appTagline')}</span>
              </div>
            </button>
            <p className="text-xs text-[#a4a496] leading-relaxed">
              {t('appDesc')}
            </p>
            <button
              onClick={() => handleOpenSafetyTopic('general')}
              className="inline-flex items-center gap-2 text-xs text-[#cfcfb4] hover:text-white font-medium bg-[#2a2a22] hover:bg-[#34342a] px-3 py-1.5 rounded-lg border border-[#3d3d30] transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#a8a880]" />
              <span>{language === 'ar' ? 'منصة مجتمعية غير ربحية وآمنة' : 'Non-profit, secure community network'}</span>
            </button>
          </div>

          {/* Col 2: Fast Pathways */}
          <div>
            <h4 className="text-[#f5f5f0] font-semibold text-sm mb-4 font-serif">
              {language === 'ar' ? 'الروابط السريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-nav-requests"
                  onClick={() => {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[#b8b8a8] hover:text-[#f5f5f0] hover:translate-x-1 rtl:hover:-translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowIcon className="w-3 h-3 text-[#8c8c78]" />
                  <span>{t('navRequests')}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-how-it-works"
                  onClick={() => navigateToSection('how-it-works-section')}
                  className="text-[#b8b8a8] hover:text-[#f5f5f0] hover:translate-x-1 rtl:hover:-translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowIcon className="w-3 h-3 text-[#8c8c78]" />
                  <span>{t('navHowItWorks')}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-safety"
                  onClick={() => navigateToSection('safety-section')}
                  className="text-[#b8b8a8] hover:text-[#f5f5f0] hover:translate-x-1 rtl:hover:-translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowIcon className="w-3 h-3 text-[#8c8c78]" />
                  <span>{t('navSafety')}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-faq"
                  onClick={() => navigateToSection('faq-section')}
                  className="text-[#b8b8a8] hover:text-[#f5f5f0] hover:translate-x-1 rtl:hover:-translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowIcon className="w-3 h-3 text-[#8c8c78]" />
                  <span>{t('navFAQ')}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-leaderboard"
                  onClick={() => {
                    setActiveTab('leaderboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[#b8b8a8] hover:text-[#f5f5f0] hover:translate-x-1 rtl:hover:-translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowIcon className="w-3 h-3 text-[#8c8c78]" />
                  <span>{language === 'ar' ? 'لوحة الشرف والمتصدرين' : 'Community Leaderboard'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Safety Policies */}
          <div>
            <h4 className="text-[#f5f5f0] font-semibold text-sm mb-4 font-serif">
              {language === 'ar' ? 'الأمان والسياسات' : 'Safety & Integrity'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-safety-verification"
                  onClick={() => handleOpenSafetyTopic('verification')}
                  className="w-full text-left rtl:text-right text-[#b8b8a8] hover:text-[#f5f5f0] hover:bg-[#2b2b23] p-1.5 rounded-lg transition flex items-center gap-2 group cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#a8a880] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">
                    {language === 'ar' ? 'توثيق أصحاب الطلبات' : 'Owner Document Verification'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  id="footer-safety-privacy"
                  onClick={() => handleOpenSafetyTopic('privacy')}
                  className="w-full text-left rtl:text-right text-[#b8b8a8] hover:text-[#f5f5f0] hover:bg-[#2b2b23] p-1.5 rounded-lg transition flex items-center gap-2 group cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#a8a880] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">
                    {language === 'ar' ? 'حماية أرقام الهواتف' : 'Phone Privacy Shield'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  id="footer-safety-instapay"
                  onClick={() => handleOpenSafetyTopic('instapay')}
                  className="w-full text-left rtl:text-right text-[#b8b8a8] hover:text-[#f5f5f0] hover:bg-[#2b2b23] p-1.5 rounded-lg transition flex items-center gap-2 group cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-[#a8a880] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">
                    {language === 'ar' ? 'دعم إنستاباي الشفاف' : 'Direct InstaPay Support'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  id="footer-safety-certificates"
                  onClick={() => handleOpenSafetyTopic('certificates')}
                  className="w-full text-left rtl:text-right text-[#b8b8a8] hover:text-[#f5f5f0] hover:bg-[#2b2b23] p-1.5 rounded-lg transition flex items-center gap-2 group cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#a8a880] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">
                    {language === 'ar' ? 'شهادات تطوع معتمدة' : 'Official Volunteer Certificates'}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpdesk */}
          <div>
            <h4 className="text-[#f5f5f0] font-semibold text-sm mb-4 font-serif">
              {t('navContact')}
            </h4>
            <p className="text-xs text-[#a4a496] mb-3">
              {language === 'ar'
                ? 'فريق الدعم والإشراف متواجد للمساعدة وحل أي استفسارات على مدار الساعة.'
                : 'Our support and moderation team is available around the clock to assist you.'}
            </p>
            <div className="space-y-2 text-xs">
              <button
                id="footer-contact-email-btn"
                onClick={() => setContactModalOpen(true)}
                className="w-full text-left rtl:text-right flex items-center gap-2 text-[#dcdccf] hover:text-white hover:bg-[#2b2b23] p-1.5 rounded-lg transition group cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#a8a880] group-hover:scale-110 transition-transform" />
                <span className="truncate group-hover:underline">support.sanad.voulanteer@gmail.com</span>
              </button>

              <button
                id="footer-contact-location-btn"
                onClick={() => setContactModalOpen(true)}
                className="w-full text-left rtl:text-right flex items-center gap-2 text-[#dcdccf] hover:text-white hover:bg-[#2b2b23] p-1.5 rounded-lg transition group cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#a8a880] group-hover:scale-110 transition-transform" />
                <span>Cairo, Egypt & Regional MENA</span>
              </button>

              <div className="pt-1">
                <button
                  id="footer-open-support-modal-btn"
                  onClick={() => setContactModalOpen(true)}
                  className="w-full py-2 px-3 rounded-lg bg-[#5a5a40] hover:bg-[#484833] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تواصل مع الدعم الفني' : 'Contact Support Desk'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#36362b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8c8c7c]">
          <p>© 2026 Sanad (سند). All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with care for community solidarity</span>
            <Heart className="w-3.5 h-3.5 text-[#c8766a] inline fill-[#c8766a]" />
          </p>
        </div>
      </div>

      {/* Safety Policy Modal */}
      <SafetyPolicyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        initialTopic={safetyTopic}
        onOpenAuth={onOpenAuth}
      />

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </footer>
  );
};
