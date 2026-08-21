import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Clock,
  Star,
  Search,
  Filter,
  Medal,
  Flame,
  ShieldCheck,
  Eye,
  EyeOff,
  User as UserIcon,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LeaderboardView: React.FC = () => {
  const { users, currentUser, language, t, updateProfile, startOrGetConversation } = useApp();
  const [timeframe, setTimeframe] = useState<'all' | 'monthly' | 'weekly'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter volunteers only and sort by points
  const volunteers = useMemo(() => {
    return users
      .filter((u) => u.role === 'volunteer' || u.points > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [users]);

  const filteredVolunteers = useMemo(() => {
    if (!searchQuery.trim()) return volunteers;
    const q = searchQuery.toLowerCase();
    return volunteers.filter(
      (v) =>
        v.fullName.toLowerCase().includes(q) ||
        v.locationCity?.toLowerCase().includes(q) ||
        v.level?.toLowerCase().includes(q)
    );
  }, [volunteers, searchQuery]);

  const top3 = filteredVolunteers.slice(0, 3);
  const remaining = filteredVolunteers.slice(3);

  const toggleLeaderboardPrivacy = () => {
    if (!currentUser) return;
    updateProfile({
      privacySettings: {
        ...currentUser.privacySettings,
        showOnLeaderboard: !currentUser.privacySettings?.showOnLeaderboard,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#5a5a40] dark:text-[#a8a880] uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-[#d4a853]" />
            <span>{language === 'ar' ? 'لوحة الشرف والتميز' : 'Hall of Impact & Honor'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {language === 'ar' ? 'لوحة متصدري العمل التطوعي' : 'Volunteer Leaderboard'}
          </h1>
          <p className="text-xs text-[#6e6e60] dark:text-[#a6a698] mt-1 max-w-xl">
            {language === 'ar'
              ? 'نحتفي برواد العطاء المجتمعي الأكثر تأثيراً وإنجازاً لساعات العمل الإنساني والخيري.'
              : 'Celebrating community heroes dedicating the most verified hours to helping others in need.'}
          </p>
        </div>

        {currentUser?.role === 'volunteer' && (
          <button
            onClick={toggleLeaderboardPrivacy}
            className="px-4 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-xs font-semibold text-[#4e4e42] dark:text-[#cecebd] hover:bg-[#ecece4] transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            {currentUser.privacySettings?.showOnLeaderboard !== false ? (
              <>
                <Eye className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                <span>{language === 'ar' ? 'اسمي ظاهر للعامة' : 'Public Profile'}</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#a83232]" />
                <span>{language === 'ar' ? 'اسمي مجهول (Anonymous)' : 'Anonymous Mode'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 text-[#7c7c6e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث باسم المتطوع أو المدينة...' : 'Search volunteer name or city...'}
            className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#f0f0ea] dark:bg-[#2c2c24] rounded-xl border border-[#dfdfd5] dark:border-[#3c3c32]">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              timeframe === 'all'
                ? 'bg-white dark:bg-[#1a1a16] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-2xs'
                : 'text-[#6c6c5c] hover:text-[#2c2c2c]'
            }`}
          >
            {language === 'ar' ? 'كل الأوقات' : 'All-Time'}
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              timeframe === 'monthly'
                ? 'bg-white dark:bg-[#1a1a16] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-2xs'
                : 'text-[#6c6c5c] hover:text-[#2c2c2c]'
            }`}
          >
            {language === 'ar' ? 'هذا الشهر' : 'This Month'}
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              timeframe === 'weekly'
                ? 'bg-white dark:bg-[#1a1a16] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-2xs'
                : 'text-[#6c6c5c] hover:text-[#2c2c2c]'
            }`}
          >
            {language === 'ar' ? 'هذا الأسبوع' : 'This Week'}
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* #2 Silver (First on desktop left in LTR or right in RTL) */}
          {top3[1] && (
            <div className="p-6 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs text-center flex flex-col items-center justify-between space-y-3 relative order-2 md:order-1">
              <div className="w-8 h-8 rounded-full bg-[#d0d0c8] text-[#333329] font-black text-sm flex items-center justify-center absolute -top-3 shadow-sm font-mono">
                2
              </div>
              <img
                src={top3[1].avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={top3[1].fullName}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[#d0d0c8]/50 mt-2"
              />
              <div>
                <h3 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                  {top3[1].privacySettings?.showOnLeaderboard === false ? (language === 'ar' ? 'فاعل خير (مجهول)' : 'Anonymous Volunteer') : top3[1].fullName}
                </h3>
                <span className="text-[11px] text-[#7c7c6e] block">
                  {top3[1].locationCity || 'Cairo'} • {top3[1].level || 'Silver'}
                </span>
              </div>
              <div className="p-2.5 w-full bg-[#f8f8f5] dark:bg-[#1e1e18] rounded-xl border border-[#ecece4] dark:border-[#33332a]">
                <p className="text-lg font-black text-[#5a5a40] dark:text-[#d6d6b8] font-serif">
                  {top3[1].points || 0} pts
                </p>
                <span className="text-[10px] text-[#7c7c6e]">
                  {top3[1].volunteerHours || 0} {language === 'ar' ? 'ساعة تطوع' : 'hours'}
                </span>
              </div>
              {currentUser && currentUser.id !== top3[1].id && (
                <button
                  onClick={() => startOrGetConversation(top3[1].id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#ecece4] dark:bg-[#2e2e26] hover:bg-[#5a5a40] hover:text-white text-[#2c2c2c] dark:text-[#f3f3ed] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'مراسلة' : 'Message'}</span>
                </button>
              )}
            </div>
          )}

          {/* #1 Gold (Center, prominent) */}
          {top3[0] && (
            <div className="p-6 bg-gradient-to-b from-[#faf8ee] to-white dark:from-[#2a2920] dark:to-[#24241f] rounded-3xl border-2 border-[#d4a853]/60 shadow-md text-center flex flex-col items-center justify-between space-y-3 relative order-1 md:order-2 md:-mt-4">
              <div className="w-9 h-9 rounded-full bg-[#d4a853] text-[#22221b] font-black text-base flex items-center justify-center absolute -top-4 shadow-md font-mono">
                👑 1
              </div>
              <img
                src={top3[0].avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={top3[0].fullName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#d4a853]/60 mt-2"
              />
              <div>
                <h3 className="font-extrabold text-base text-[#2c2c2c] dark:text-[#f3f3ed]">
                  {top3[0].privacySettings?.showOnLeaderboard === false ? (language === 'ar' ? 'فاعل خير (مجهول)' : 'Anonymous Volunteer') : top3[0].fullName}
                </h3>
                <span className="text-xs text-[#7c7c6e] block">
                  {top3[0].locationCity || 'Cairo'} • {top3[0].level || 'Gold'}
                </span>
              </div>
              <div className="p-3 w-full bg-[#f8f8f5] dark:bg-[#1e1e18] rounded-xl border border-[#d4a853]/30">
                <p className="text-2xl font-black text-[#5a5a40] dark:text-[#d6d6b8] font-serif">
                  {top3[0].points || 0} pts
                </p>
                <span className="text-[10px] text-[#7c7c6e]">
                  {top3[0].volunteerHours || 0} {language === 'ar' ? 'ساعة تطوع معتمدة' : 'verified hours'}
                </span>
              </div>
              {currentUser && currentUser.id !== top3[0].id && (
                <button
                  onClick={() => startOrGetConversation(top3[0].id)}
                  className="w-full py-2 px-3 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'مراسلة المتصدر' : 'Message'}</span>
                </button>
              )}
            </div>
          )}

          {/* #3 Bronze */}
          {top3[2] && (
            <div className="p-6 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs text-center flex flex-col items-center justify-between space-y-3 relative order-3">
              <div className="w-8 h-8 rounded-full bg-[#cd7f32] text-white font-black text-sm flex items-center justify-center absolute -top-3 shadow-sm font-mono">
                3
              </div>
              <img
                src={top3[2].avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={top3[2].fullName}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[#cd7f32]/50 mt-2"
              />
              <div>
                <h3 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                  {top3[2].privacySettings?.showOnLeaderboard === false ? (language === 'ar' ? 'فاعل خير (مجهول)' : 'Anonymous Volunteer') : top3[2].fullName}
                </h3>
                <span className="text-[11px] text-[#7c7c6e] block">
                  {top3[2].locationCity || 'Cairo'} • {top3[2].level || 'Bronze'}
                </span>
              </div>
              <div className="p-2.5 w-full bg-[#f8f8f5] dark:bg-[#1e1e18] rounded-xl border border-[#ecece4] dark:border-[#33332a]">
                <p className="text-lg font-black text-[#5a5a40] dark:text-[#d6d6b8] font-serif">
                  {top3[2].points || 0} pts
                </p>
                <span className="text-[10px] text-[#7c7c6e]">
                  {top3[2].volunteerHours || 0} {language === 'ar' ? 'ساعة تطوع' : 'hours'}
                </span>
              </div>
              {currentUser && currentUser.id !== top3[2].id && (
                <button
                  onClick={() => startOrGetConversation(top3[2].id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#ecece4] dark:bg-[#2e2e26] hover:bg-[#5a5a40] hover:text-white text-[#2c2c2c] dark:text-[#f3f3ed] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'مراسلة' : 'Message'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ranked Table for 4+ */}
      {remaining.length > 0 && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs overflow-hidden">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-[#f8f8f5] dark:bg-[#20201a] border-b border-[#e2e2d9] dark:border-[#383830] text-[#555546] dark:text-[#b4b4a6] font-bold">
              <tr>
                <th className="p-4 w-16 text-center">{language === 'ar' ? 'الترتيب' : 'Rank'}</th>
                <th className="p-4">{language === 'ar' ? 'المتطوع' : 'Volunteer'}</th>
                <th className="p-4">{language === 'ar' ? 'المستوى' : 'Level'}</th>
                <th className="p-4">{language === 'ar' ? 'ساعات التطوع' : 'Hours'}</th>
                <th className="p-4">{language === 'ar' ? 'المهام المنجزة' : 'Tasks'}</th>
                <th className="p-4 text-right rtl:text-left">{language === 'ar' ? 'النقاط' : 'Points'}</th>
                <th className="p-4 text-center">{language === 'ar' ? 'تواصل' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece4] dark:divide-[#33332a]">
              {remaining.map((vol, index) => {
                const rank = index + 4;
                const isAnonymous = vol.privacySettings?.showOnLeaderboard === false;

                return (
                  <tr key={vol.id} className="hover:bg-[#fcfcf9] dark:hover:bg-[#282822] transition">
                    <td className="p-4 text-center font-mono font-bold text-[#7c7c6e]">
                      #{rank}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={vol.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-[#d8d8cc]"
                        />
                        <div>
                          <span className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed] block">
                            {isAnonymous ? (language === 'ar' ? 'فاعل خير (مجهول)' : 'Anonymous') : vol.fullName}
                          </span>
                          <span className="text-[10px] text-[#7c7c6e]">
                            {vol.locationCity || 'Cairo'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[#5a5a40] dark:text-[#a8a880]">
                      {vol.level || 'Bronze'}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {vol.volunteerHours || 0} hrs
                    </td>
                    <td className="p-4 font-mono text-[#5c5c50] dark:text-[#b4b4a6]">
                      {vol.completedTasksCount || 0}
                    </td>
                    <td className="p-4 text-right rtl:text-left font-black text-sm font-serif text-[#5a5a40] dark:text-[#d6d6b8]">
                      {vol.points || 0} pts
                    </td>
                    <td className="p-4 text-center">
                      {currentUser && currentUser.id !== vol.id && (
                        <button
                          onClick={() => startOrGetConversation(vol.id)}
                          className="p-1.5 rounded-lg bg-[#ecece4] dark:bg-[#33332a] hover:bg-[#5a5a40] hover:text-white text-[#555546] dark:text-[#d0d0be] transition cursor-pointer"
                          title={language === 'ar' ? 'بدء محادثة' : 'Send message'}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
