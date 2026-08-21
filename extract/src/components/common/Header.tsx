import React, { useState } from 'react';
import {
  Heart,
  Globe,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Layers,
  FileCheck,
  Users,
  Trophy,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const {
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    switchDemoUser,
    users,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // User-specific notifications
  const userNotifs = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id).slice(0, 5)
    : [];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e5e5dc] text-[#3c3c2e] dark:bg-[#333329] dark:text-[#d0d0be]">
            <ShieldCheck className="w-3 h-3 text-[#5a5a40] dark:text-[#a8a885]" />
            {t('roleAdmin')}
          </span>
        );
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eae5d8] text-[#544834] dark:bg-[#383327] dark:text-[#dfd4be]">
            <Heart className="w-3 h-3 text-[#7a6442] dark:text-[#c5aa80]" />
            {t('roleOwner')}
          </span>
        );
      case 'volunteer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]">
            <Sparkles className="w-3 h-3 text-[#5a5a40] dark:text-[#9ea880]" />
            {t('roleVolunteer')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fafaf7]/95 dark:bg-[#20201a]/95 backdrop-blur border-b border-[#e2e2d9] dark:border-[#36362e] transition-colors">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab(currentUser ? 'home' : 'landing')}
              className="flex items-center gap-2.5 text-left rtl:text-right group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#5a5a40] text-white flex items-center justify-center shadow-md shadow-[#5a5a40]/25 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white/20 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl tracking-tight text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                    {t('appName')}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#eaeae2] text-[#4d4d3a] dark:bg-[#34342a] dark:text-[#d6d6c2] font-semibold">
                    سند
                  </span>
                </div>
                <p className="text-[11px] text-[#6e6e62] dark:text-[#a4a496] leading-none hidden sm:block">
                  {t('appTagline')}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!currentUser ? (
              <>
                <button
                  id="nav-landing-btn"
                  onClick={() => handleNavClick('landing')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'landing'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be] font-bold'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navHome')}
                </button>
                <button
                  id="nav-browse-requests-btn"
                  onClick={() => handleNavClick('home')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be] font-bold'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navRequests')}
                </button>
                <button
                  id="nav-leaderboard-btn"
                  onClick={() => handleNavClick('leaderboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'leaderboard'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be] font-bold'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'المتصدرين' : 'Leaderboard'}
                </button>
              </>
            ) : currentUser.role === 'admin' ? (
              <>
                <button
                  id="nav-admin-dash-btn"
                  onClick={() => handleNavClick('dashboard')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'dashboard' || activeTab === 'admin'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navDashboard')}
                </button>
                <button
                  id="nav-admin-assignments-btn"
                  onClick={() => handleNavClick('assignments')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'assignments' || activeTab === 'my_assignments'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'المهام' : 'Assignments'}
                </button>
                <button
                  id="nav-admin-feed-btn"
                  onClick={() => handleNavClick('home')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navRequests')}
                </button>
                <button
                  id="nav-admin-rewards-btn"
                  onClick={() => handleNavClick('rewards')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'rewards'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'المكافآت' : 'Rewards'}
                </button>
                <button
                  id="nav-admin-leaderboard-btn"
                  onClick={() => handleNavClick('leaderboard')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'leaderboard'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'المتصدرين' : 'Leaderboard'}
                </button>
                <button
                  id="nav-admin-history-btn"
                  onClick={() => handleNavClick('history')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navHistory')}
                </button>
                <button
                  id="nav-admin-messages-btn"
                  onClick={() => handleNavClick('messages')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'messages' || activeTab === 'chat'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navMessages')}
                </button>
              </>
            ) : currentUser.role === 'owner' ? (
              <>
                <button
                  id="nav-owner-feed-btn"
                  onClick={() => handleNavClick('home')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navHome')}
                </button>
                <button
                  id="nav-owner-assignments-btn"
                  onClick={() => handleNavClick('assignments')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'assignments' || activeTab === 'my_assignments'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'متابعة المتطوعين والمهام' : 'Manage Assignments'}
                </button>
                <button
                  id="nav-owner-messages-btn"
                  onClick={() => handleNavClick('messages')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'messages' || activeTab === 'chat'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navMessages')}
                </button>
                <button
                  id="nav-owner-history-btn"
                  onClick={() => handleNavClick('history')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navHistory')}
                </button>
              </>
            ) : (
              /* Volunteer Navigation */
              <>
                <button
                  id="nav-vol-feed-btn"
                  onClick={() => handleNavClick('home')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navHome')}
                </button>
                <button
                  id="nav-vol-assignments-btn"
                  onClick={() => handleNavClick('assignments')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'assignments' || activeTab === 'my_assignments'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'مهام التطوع' : 'Assignments'}
                </button>
                <button
                  id="nav-vol-rewards-btn"
                  onClick={() => handleNavClick('rewards')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'rewards'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'المكافآت والنقاط' : 'Rewards'}
                </button>
                <button
                  id="nav-vol-leaderboard-btn"
                  onClick={() => handleNavClick('leaderboard')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'leaderboard'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {language === 'ar' ? 'المتصدرين' : 'Leaderboard'}
                </button>
                <button
                  id="nav-vol-history-btn"
                  onClick={() => handleNavClick('history')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navHistory')}
                </button>
                <button
                  id="nav-vol-messages-btn"
                  onClick={() => handleNavClick('messages')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'messages' || activeTab === 'chat'
                      ? 'bg-[#ecece4] text-[#474732] dark:bg-[#323226] dark:text-[#d6d6be]'
                      : 'text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b23]'
                  }`}
                >
                  {t('navMessages')}
                </button>
              </>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <button
              id="lang-toggle-button"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23] transition cursor-pointer"
              title="Toggle Arabic / English"
            >
              <Globe className="w-4 h-4" />
              <span>{t('langSwitch')}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23] transition cursor-pointer"
              title={theme === 'light' ? t('darkMode') : t('lightMode')}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#d4a853]" />}
            </button>

            {currentUser ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    id="notifications-toggle-btn"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23] rounded-lg transition cursor-pointer"
                    title={t('navNotifications')}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#b34033] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#20201a] animate-pulse">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div
                      className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white dark:bg-[#24241f] rounded-xl shadow-xl border border-[#e2e2d9] dark:border-[#383830] py-2 z-50`}
                    >
                      <div className="px-4 py-2 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                          {t('notificationsTitle')}
                        </span>
                        {unreadNotificationsCount > 0 && (
                          <button
                            id="mark-all-read-btn"
                            onClick={() => markAllNotificationsRead()}
                            className="text-xs text-[#5a5a40] dark:text-[#a8a882] hover:underline cursor-pointer"
                          >
                            {t('markAllAsRead')}
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-[#ecece4] dark:divide-[#33332a]">
                        {userNotifs.length === 0 ? (
                          <div className="py-8 text-center text-xs text-[#7e7e72]">
                            {t('noNotifications')}
                          </div>
                        ) : (
                          userNotifs.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markNotificationRead(notif.id);
                                if (notif.link) {
                                  setActiveTab(notif.link);
                                }
                                setIsNotificationsOpen(false);
                              }}
                              className={`p-3.5 hover:bg-[#f5f5f0] dark:hover:bg-[#2c2c24] cursor-pointer transition flex items-start gap-3 ${
                                !notif.isRead ? 'bg-[#f4f4ec] dark:bg-[#2d2d23]' : ''
                              }`}
                            >
                              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#5a5a40]"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] truncate">
                                  {language === 'ar' ? notif.titleAr : notif.titleEn}
                                </p>
                                <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] line-clamp-2 mt-0.5">
                                  {language === 'ar' ? notif.messageAr : notif.messageEn}
                                </p>
                                <span className="text-[10px] text-[#8c8c7d] mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    id="profile-toggle-btn"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#ecece6] dark:hover:bg-[#2c2c23] transition cursor-pointer"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#d4d4c8] dark:ring-[#444438]"
                    />
                    <div className="hidden lg:block text-left rtl:text-right">
                      <p className="text-xs font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] truncate max-w-[120px]">
                        {currentUser.fullName}
                      </p>
                      <div className="flex items-center gap-1">
                        {getRoleBadge(currentUser.role)}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888878]" />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-64 bg-white dark:bg-[#24241f] rounded-xl shadow-xl border border-[#e2e2d9] dark:border-[#383830] py-2 z-50`}
                    >
                      <div className="px-4 py-2.5 border-b border-[#ecece4] dark:border-[#33332a]">
                        <p className="font-semibold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] truncate font-serif">
                          {currentUser.fullName}
                        </p>
                        <p className="text-xs text-[#7c7c6e] truncate">{currentUser.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {getRoleBadge(currentUser.role)}
                          {currentUser.points !== undefined && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]">
                              {currentUser.points} pts
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          id="menu-profile-btn"
                          onClick={() => {
                            setActiveTab('profile');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs text-left rtl:text-right flex items-center gap-2 text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#f5f5f0] dark:hover:bg-[#2c2c23] transition cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-[#888878]" />
                          {t('navProfile')}
                        </button>

                        <button
                          id="menu-assignments-btn"
                          onClick={() => {
                            setActiveTab('assignments');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs text-left rtl:text-right flex items-center gap-2 text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#f5f5f0] dark:hover:bg-[#2c2c23] transition cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-[#5a5a40]" />
                          {language === 'ar' ? 'مهام التطوع المخصصة' : 'My Assignments'}
                        </button>

                        <button
                          id="menu-rewards-btn"
                          onClick={() => {
                            setActiveTab('rewards');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs text-left rtl:text-right flex items-center gap-2 text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#f5f5f0] dark:hover:bg-[#2c2c23] transition cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#d4a853]" />
                          {language === 'ar' ? 'المكافآت والمستويات' : 'Rewards & Badges'}
                        </button>

                        <button
                          id="menu-history-btn"
                          onClick={() => {
                            setActiveTab('history');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs text-left rtl:text-right flex items-center gap-2 text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#f5f5f0] dark:hover:bg-[#2c2c23] transition cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-[#a88242]" />
                          {t('navHistory')}
                        </button>

                        {currentUser.role === 'admin' && (
                          <button
                            id="menu-admin-dash-btn"
                            onClick={() => {
                              setActiveTab('dashboard');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-xs text-left rtl:text-right flex items-center gap-2 text-[#5a5a40] dark:text-[#a8a882] hover:bg-[#f5f5f0] dark:hover:bg-[#2c2c23] transition font-semibold cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {t('navDashboard')}
                          </button>
                        )}
                      </div>

                      <div className="border-t border-[#ecece4] dark:border-[#33332a] pt-1">
                        <button
                          id="menu-logout-btn"
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs text-left rtl:text-right flex items-center gap-2 text-[#a83232] dark:text-[#df7272] hover:bg-[#faecec] dark:hover:bg-[#382020] transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Public / Guest Actions */
              <div className="flex items-center gap-2">
                <button
                  id="login-header-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </button>
                <button
                  id="register-header-btn"
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-[#5a5a40] hover:bg-[#484833] text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23] cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#fafaf7] dark:bg-[#20201a] border-b border-[#e2e2d9] dark:border-[#36362e] px-4 pt-2 pb-4 space-y-1">
          {!currentUser ? (
            <>
              <button
                onClick={() => handleNavClick('landing')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {t('navHome')}
              </button>
              <button
                onClick={() => handleNavClick('home')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {t('navRequests')}
              </button>
              <button
                onClick={() => handleNavClick('leaderboard')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard'}
              </button>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2 rounded-lg text-center font-medium bg-[#ecece6] dark:bg-[#2c2c23] text-[#2c2c2c] dark:text-[#f3f3ed]"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="flex-1 py-2 rounded-lg text-center font-medium bg-[#5a5a40] text-white"
                >
                  {t('register')}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('home')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {t('navHome')}
              </button>
              <button
                onClick={() => handleNavClick('assignments')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {language === 'ar' ? 'مهام التطوع المخصصة' : 'Assignments'}
              </button>
              <button
                onClick={() => handleNavClick('rewards')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {language === 'ar' ? 'المكافآت والأوسمة' : 'Rewards & Badges'}
              </button>
              <button
                onClick={() => handleNavClick('leaderboard')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard'}
              </button>
              <button
                onClick={() => handleNavClick('messages')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {t('navMessages')}
              </button>
              <button
                onClick={() => handleNavClick('history')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {t('navHistory')}
              </button>
              <button
                onClick={() => handleNavClick('profile')}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#ecece6] dark:hover:bg-[#2c2c23]"
              >
                {t('navProfile')}
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-[#5a5a40] dark:text-[#a8a882]"
                >
                  {t('navDashboard')}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
