import React from 'react';
import {
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Flame,
  Zap,
  Info,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IconRenderer } from '../common/IconRenderer';

export const RewardsView: React.FC = () => {
  const {
    currentUser,
    badges,
    levels,
    pointRules,
    language,
    t,
    activityLogs,
    setActiveTab,
  } = useApp();

  const userPoints = currentUser?.points || 0;
  const currentLevelIndex = levels.findIndex((l) => l.nameEn === (currentUser?.level || 'Bronze'));
  const currentLevel = levels[currentLevelIndex !== -1 ? currentLevelIndex : 0];
  const nextLevel = levels[currentLevelIndex + 1] || null;

  // Level progress percentage
  let progressPercent = 100;
  let pointsNeeded = 0;

  if (nextLevel) {
    const minP = currentLevel?.minPoints || 0;
    const maxP = nextLevel.minPoints;
    pointsNeeded = Math.max(0, maxP - userPoints);
    progressPercent = Math.min(100, Math.max(0, ((userPoints - minP) / (maxP - minP)) * 100));
  }

  // Badges unlocked by user
  const userBadgeIds = currentUser?.badges || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#5a5a40] dark:text-[#a8a880] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ar' ? 'نظام النقاط والمستويات والأوسمة' : 'Rewards, Badges & Leveling'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {language === 'ar' ? 'الإنجازات والمكافآت التقديرية' : 'Volunteer Rewards & Progression'}
          </h1>
          <p className="text-xs text-[#6e6e60] dark:text-[#a6a698] mt-1 max-w-xl">
            {language === 'ar'
              ? 'اكسب النقاط مع كل ساعة عمل تطوعي، ارتقِ في المستويات، وافتح أوسمة التقدير المرموقة.'
              : 'Earn points with every completed volunteer hour, level up your badge rank, and unlock special honors.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className="px-4 py-2.5 rounded-xl bg-[#ecece4] dark:bg-[#2e2e26] hover:bg-[#dfdfd6] text-[#2c2c2c] dark:text-[#f3f3ed] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
            <span>{language === 'ar' ? 'لوحة المتصدرين' : 'View Leaderboard'}</span>
          </button>
        </div>
      </div>

      {/* Main Level Progress Card */}
      <div className="p-6 bg-[#fafaf7] dark:bg-[#20201a] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#5a5a40] text-white flex items-center justify-center shadow-md">
              <IconRenderer name={currentLevel?.badgeIcon} className="w-8 h-8 text-white" fallback={<Sparkles className="w-8 h-8" />} />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-[#7c7c6e] tracking-wider block">
                {language === 'ar' ? 'المستوى الحالي' : 'Current Tier Level'}
              </span>
              <h2 className="text-2xl font-black text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                {language === 'ar' ? currentLevel?.nameAr : currentLevel?.nameEn}
              </h2>
              <p className="text-xs text-[#5a5a40] dark:text-[#d6d6b8] font-bold">
                {userPoints} {language === 'ar' ? 'نقطة مكتسبة' : 'Total Points'}
              </p>
            </div>
          </div>

          {nextLevel ? (
            <div className="text-left rtl:text-right sm:text-right rtl:sm:text-left">
              <span className="text-[11px] text-[#7c7c6e] block">
                {language === 'ar' ? 'المستوى التالي' : 'Next Tier'}
              </span>
              <p className="text-sm font-bold text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-1.5 justify-start sm:justify-end rtl:sm:justify-start">
                <IconRenderer name={nextLevel.badgeIcon} className="w-4 h-4 text-[#5a5a40] dark:text-[#bebea8]" />
                <span>{language === 'ar' ? nextLevel.nameAr : nextLevel.nameEn}</span>
              </p>
              <span className="text-xs text-[#707060] dark:text-[#b4b4a6]">
                {language === 'ar' ? `تبقى ${pointsNeeded} نقطة للترقية` : `${pointsNeeded} points needed`}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] text-xs font-bold">
              {language === 'ar' ? 'أعلى مستوى تشريفي ✨' : 'Maximum Tier Achieved ✨'}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-[#e2e2d9] dark:bg-[#33332a] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#7a7a58] to-[#5a5a40] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#7c7c6e]">
            <span>{currentLevel?.minPoints || 0} pts</span>
            <span>{Math.round(progressPercent)}%</span>
            <span>{nextLevel ? `${nextLevel.minPoints} pts` : 'Max'}</span>
          </div>
        </div>

        {/* All Tier Steps Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#e2e2d9] dark:border-[#383830]">
          {levels.map((lvl, idx) => {
            const isReached = userPoints >= lvl.minPoints;
            return (
              <div
                key={lvl.id}
                className={`p-3 rounded-2xl border text-center transition ${
                  isReached
                    ? 'bg-white dark:bg-[#24241f] border-[#5a5a40]/50 shadow-2xs'
                    : 'bg-[#f0f0ea]/50 dark:bg-[#1a1a16]/50 border-dashed border-[#d8d8cc] dark:border-[#383830] opacity-60'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  <IconRenderer name={lvl.badgeIcon} className="w-6 h-6 text-[#5a5a40] dark:text-[#bebea8]" />
                </div>
                <h4 className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed]">
                  {language === 'ar' ? lvl.nameAr : lvl.nameEn}
                </h4>
                <span className="text-[10px] text-[#7c7c6e] block font-mono">
                  {lvl.minPoints}+ pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif flex items-center gap-2">
            <Award className="w-5 h-5 text-[#5a5a40] dark:text-[#a8a880]" />
            <span>{language === 'ar' ? 'معرض الأوسمة والشارات المتاحة' : 'Badges & Achievements Gallery'}</span>
          </h3>
          <span className="text-xs font-bold text-[#5a5a40] dark:text-[#d6d6b8]">
            {userBadgeIds.length} / {badges.length} {language === 'ar' ? 'أوسمة مكتسبة' : 'Badges unlocked'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const isUnlocked = userBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition flex items-start gap-4 ${
                  isUnlocked
                    ? 'bg-white dark:bg-[#24241f] border-[#5a5a40]/40 shadow-xs ring-1 ring-[#5a5a40]/10'
                    : 'bg-[#f4f4ec]/60 dark:bg-[#1f1f1a] border-[#e2e2d9] dark:border-[#33332a] opacity-75'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs flex-shrink-0 ${
                    isUnlocked
                      ? 'bg-[#e2e7dc] dark:bg-[#2b3524]'
                      : 'bg-[#e5e5dc] dark:bg-[#2c2c24] grayscale'
                  }`}
                >
                  <IconRenderer
                    name={badge.icon}
                    className={`w-6 h-6 ${
                      isUnlocked
                        ? 'text-[#3f4a35] dark:text-[#c7d5bb]'
                        : 'text-[#6c6c5c] dark:text-[#888878]'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#2c2c2c] dark:text-[#f3f3ed] truncate">
                      {language === 'ar' ? badge.nameAr : badge.nameEn}
                    </h4>
                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {language === 'ar' ? 'مكتسب' : 'Unlocked'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e5e5dc] text-[#6c6c5c] dark:bg-[#333329] dark:text-[#a0a090] flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        {language === 'ar' ? 'مقفل' : 'Locked'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#6e6e60] dark:text-[#a8a898] line-clamp-2 leading-relaxed">
                    {language === 'ar' ? badge.descriptionAr : badge.descriptionEn}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#5a5a40] dark:text-[#d6d6b8] font-bold">
                    <span>+{badge.pointsReward} {language === 'ar' ? 'نقطة مكافأة' : 'bonus pts'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Rules Guide Table */}
      <div className="p-6 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] font-serif flex items-center gap-2">
          <Info className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
          <span>{language === 'ar' ? 'دليل وقواعد احتساب النقاط' : 'Points Calculation System'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#f8f8f5] dark:bg-[#1e1e18] border border-[#ecece4] dark:border-[#33332a] space-y-1">
            <span className="text-[11px] text-[#7c7c6e] block">{language === 'ar' ? 'إنجاز مهمة مساعدة' : 'Completed Task Base'}</span>
            <p className="text-lg font-bold text-[#5a5a40] dark:text-[#d6d6b8]">+{pointRules.pointsPerTask || 100} pts</p>
            <span className="text-[10px] text-[#888878]">{language === 'ar' ? 'لكل مهمة تطوع مكتملة' : 'Per completed task'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f8f5] dark:bg-[#1e1e18] border border-[#ecece4] dark:border-[#33332a] space-y-1">
            <span className="text-[11px] text-[#7c7c6e] block">{language === 'ar' ? 'ساعة عمل تطوعي' : 'Volunteer Hour Rate'}</span>
            <p className="text-lg font-bold text-[#5a5a40] dark:text-[#d6d6b8]">+{pointRules.pointsPerHour || 15} pts</p>
            <span className="text-[10px] text-[#888878]">{language === 'ar' ? 'لكل ساعة فعلية موثقة' : 'Per actual logged hour'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f8f5] dark:bg-[#1e1e18] border border-[#ecece4] dark:border-[#33332a] space-y-1">
            <span className="text-[11px] text-[#7c7c6e] block">{language === 'ar' ? 'مكافأة الطوارئ والأولوية' : 'Emergency & Urgent Bonus'}</span>
            <p className="text-lg font-bold text-[#5a5a40] dark:text-[#d6d6b8]">+{pointRules.emergencyBonus || 50} pts</p>
            <span className="text-[10px] text-[#888878]">{language === 'ar' ? 'للحالات الطارئة والحرجة' : 'For critical urgent tasks'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
