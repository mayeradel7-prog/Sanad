import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { HomeFeed } from './components/feed/HomeFeed';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ChatView } from './components/chat/ChatView';
import { ProfileView } from './components/profile/ProfileView';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { HistoryView } from './components/history/HistoryView';
import { RewardsView } from './components/rewards/RewardsView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { AuthModal } from './components/auth/AuthModal';
import { RequestDetailsModal } from './components/feed/RequestDetailsModal';
import { CreateRequestModal } from './components/feed/CreateRequestModal';
import { ApplyVolunteerModal } from './components/feed/ApplyVolunteerModal';
import { ReportModal } from './components/modals/ReportModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { UserRole } from './types';
import {
  Compass,
  Home,
  MessageCircle,
  User as UserIcon,
  ShieldCheck,
  PlusCircle,
  LogIn,
  Calendar,
  Award,
  Trophy,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    t,
    language,
    activeTab,
    setActiveTab,
    currentUser,
    selectedRequestId,
    setSelectedRequestId,
    startOrGetConversation,
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
  } = useApp();

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('volunteer');

  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [applyModalRequestId, setApplyModalRequestId] = useState<string | null>(null);

  const [reportModalState, setReportModalState] = useState<{
    isOpen: boolean;
    targetId: string | null;
    targetExcerpt?: string;
    reportedUserId?: string;
    type?: 'request' | 'user' | 'message';
  }>({
    isOpen: false,
    targetId: null,
  });

  const handleOpenAuth = (mode: 'login' | 'register', role?: UserRole) => {
    setAuthMode(mode);
    if (role) setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  const handleOpenReport = (targetId: string, excerpt: string, ownerId?: string) => {
    setReportModalState({
      isOpen: true,
      targetId,
      targetExcerpt: excerpt,
      reportedUserId: ownerId,
      type: 'request',
    });
  };

  const handleOpenDirectChat = (participantId: string, requestId?: string, requestTitle?: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    startOrGetConversation(participantId, requestId, requestTitle);
    setSelectedRequestId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f0] dark:bg-[#1a1a16] text-[#2c2c2c] dark:text-[#f3f3ed] transition-colors duration-200">
      {/* Top Main Navigation Bar */}
      <Header onOpenAuth={handleOpenAuth} />

      {/* Main Page Body Switcher */}
      <main className="flex-1 pb-16 sm:pb-8">
        {activeTab === 'landing' && (
          <LandingPage onOpenAuth={handleOpenAuth} />
        )}

        {activeTab === 'home' && (
          <HomeFeed
            onOpenCreateRequest={() => setIsCreateRequestOpen(true)}
            onOpenRequestDetails={(id) => setSelectedRequestId(id)}
            onOpenApplyModal={(id) => setApplyModalRequestId(id)}
            onOpenReportModal={handleOpenReport}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {(activeTab === 'assignments' || activeTab === 'my_assignments') && (
          currentUser ? (
            <AssignmentsView
              onOpenRequestDetails={(id) => setSelectedRequestId(id)}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] text-center space-y-4 shadow-sm">
              <Calendar className="w-12 h-12 text-[#5a5a40] dark:text-[#a8a882] mx-auto" />
              <h2 className="text-xl font-bold font-serif">{t('authRequired')}</h2>
              <p className="text-xs text-[#66665c] dark:text-[#a6a698]">
                {language === 'ar'
                  ? 'سجل دخولك لعرض ومتابعة مهامك التطوعية المخصصة وتوثيق الساعات.'
                  : 'Sign in to manage assigned volunteer tasks and log hours.'}
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-2.5 bg-[#5a5a40] hover:bg-[#484833] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          )
        )}

        {activeTab === 'history' && (
          currentUser ? (
            <HistoryView
              onOpenRequestDetails={(id) => setSelectedRequestId(id)}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] text-center space-y-4 shadow-sm">
              <Award className="w-12 h-12 text-[#5a5a40] dark:text-[#a8a882] mx-auto" />
              <h2 className="text-xl font-bold font-serif">{t('authRequired')}</h2>
              <p className="text-xs text-[#66665c] dark:text-[#a6a698]">
                {language === 'ar'
                  ? 'سجل دخولك لعرض سجل الساعات، الشهادات، والمراجعات.'
                  : 'Sign in to access your volunteer hours history, certificates, and ratings.'}
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-2.5 bg-[#5a5a40] hover:bg-[#484833] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          )
        )}

        {activeTab === 'rewards' && (
          <RewardsView />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView />
        )}

        {(activeTab === 'admin' || activeTab === 'dashboard') && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] text-center space-y-4 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-[#5a5a40] dark:text-[#a8a882] mx-auto" />
              <h2 className="text-xl font-bold font-serif">{t('adminOnlyNote')}</h2>
              <p className="text-xs text-[#66665c] dark:text-[#a6a698]">
                {language === 'ar'
                  ? 'يرجى تسجيل الدخول بحساب المشرف (Admin).'
                  : 'Please sign in as Admin.'}
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-2.5 bg-[#5a5a40] hover:bg-[#484833] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          )
        )}

        {(activeTab === 'chat' || activeTab === 'messages') && (
          currentUser ? (
            <ChatView
              onOpenReportModal={handleOpenReport}
              onOpenRequestDetails={(id) => setSelectedRequestId(id)}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] text-center space-y-4 shadow-sm">
              <MessageCircle className="w-12 h-12 text-[#5a5a40] dark:text-[#a8a882] mx-auto" />
              <h2 className="text-xl font-bold font-serif">{t('authRequired')}</h2>
              <p className="text-xs text-[#66665c] dark:text-[#a6a698]">
                {language === 'ar'
                  ? 'سجل دخولك لتتمكن من مراسلة المتطوعين وأصحاب طلبات المساعدة وتنسيق العمل الخيري.'
                  : 'Sign in to chat and coordinate volunteer assistance directly.'}
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-2.5 bg-[#5a5a40] hover:bg-[#484833] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          )
        )}

        {activeTab === 'profile' && (
          currentUser ? (
            <ProfileView />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] text-center space-y-4 shadow-sm">
              <UserIcon className="w-12 h-12 text-[#5a5a40] dark:text-[#a8a882] mx-auto" />
              <h2 className="text-xl font-bold font-serif">{t('authRequired')}</h2>
              <p className="text-xs text-[#66665c] dark:text-[#a6a698]">
                {language === 'ar'
                  ? 'سجل دخولك لعرض ملفك الشخصي وسجل ساعاتك وشهادات التطوع.'
                  : 'Sign in to access your profile, volunteer hours, and certificates.'}
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-2.5 bg-[#5a5a40] hover:bg-[#484833] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          )
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f5f5f0]/95 dark:bg-[#1e1e1a]/95 backdrop-blur-md border-t border-[#e2e2d9] dark:border-[#33332a] px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'home' ? 'text-[#5a5a40] dark:text-[#d4d4b8]' : 'text-[#8c8c7d]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('navRequests')}</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setActiveTab('assignments');
            } else {
              handleOpenAuth('login');
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'assignments' || activeTab === 'my_assignments'
              ? 'text-[#5a5a40] dark:text-[#d4d4b8]'
              : 'text-[#8c8c7d]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>{language === 'ar' ? 'المهام' : 'Tasks'}</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setActiveTab('messages');
            } else {
              handleOpenAuth('login');
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'messages' || activeTab === 'chat'
              ? 'text-[#5a5a40] dark:text-[#d4d4b8]'
              : 'text-[#8c8c7d]'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t('chatTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'leaderboard' ? 'text-[#5a5a40] dark:text-[#d4d4b8]' : 'text-[#8c8c7d]'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>{language === 'ar' ? 'المتصدرين' : 'Ranks'}</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setActiveTab('profile');
            } else {
              handleOpenAuth('login');
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'profile' ? 'text-[#5a5a40] dark:text-[#d4d4b8]' : 'text-[#8c8c7d]'
          }`}
        >
          {currentUser ? <UserIcon className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          <span>{currentUser ? t('navProfile') : t('login')}</span>
        </button>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        initialRole={authInitialRole}
      />

      <RequestDetailsModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        onOpenApplyModal={(id) => {
          setSelectedRequestId(null);
          setApplyModalRequestId(id);
        }}
        onOpenReportModal={handleOpenReport}
        onOpenDirectChat={handleOpenDirectChat}
        onOpenAuth={handleOpenAuth}
      />

      <CreateRequestModal
        isOpen={isCreateRequestOpen}
        onClose={() => setIsCreateRequestOpen(false)}
      />

      <ApplyVolunteerModal
        requestId={applyModalRequestId}
        isOpen={!!applyModalRequestId}
        onClose={() => setApplyModalRequestId(null)}
      />

      <ReportModal
        isOpen={reportModalState.isOpen}
        onClose={() =>
          setReportModalState({ isOpen: false, targetId: null })
        }
        targetId={reportModalState.targetId}
        targetExcerpt={reportModalState.targetExcerpt}
        reportedUserId={reportModalState.reportedUserId}
        type={reportModalState.type}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
