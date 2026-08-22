import React, { useState, useMemo } from 'react';
import {
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  Download,
  FileText,
  Star,
  Activity,
  Heart,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Printer,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerCertificate, HelpRequest, VolunteerAssignment } from '../../types';
import { CertificateModal } from '../modals/CertificateModal';
import { ReviewVolunteerModal } from '../modals/ReviewVolunteerModal';

interface HistoryViewProps {
  onOpenRequestDetails: (requestId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onOpenRequestDetails }) => {
  const {
    currentUser,
    users,
    assignments,
    requests,
    certificates,
    activityLogs,
    reviews,
    language,
    t,
    generateCertificate,
    startOrGetConversation,
    deleteRequest,
  } = useApp();

  const [activeTab, setActiveHistoryTab] = useState<'tasks' | 'certificates' | 'activity' | 'reviews'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requestToDelete, setRequestToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modals
  const [selectedCert, setSelectedCert] = useState<VolunteerCertificate | null>(null);
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    requestId: string;
    targetUserId: string;
    targetUserName: string;
  }>({
    isOpen: false,
    requestId: '',
    targetUserId: '',
    targetUserName: '',
  });

  const isVolunteer = currentUser?.role === 'volunteer';
  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin';

  // Volunteer's history
  const volunteerAssignments = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return assignments;
    return assignments.filter((as) => as.volunteerId === currentUser.id);
  }, [assignments, currentUser, isAdmin]);

  // Owner's history
  const ownerRequests = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return requests;
    return requests.filter((r) => r.ownerId === currentUser.id);
  }, [requests, currentUser, isAdmin]);

  // User certificates
  const userCerts = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return certificates;
    return certificates.filter((c) => c.volunteerId === currentUser.id);
  }, [certificates, currentUser, isAdmin]);

  // User activity logs
  const userLogs = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return activityLogs;
    return activityLogs.filter((l) => l.userId === currentUser.id);
  }, [activityLogs, currentUser, isAdmin]);

  // User reviews
  const userReviews = useMemo(() => {
    if (!currentUser) return [];
    return reviews.filter((r) => r.toUserId === currentUser.id || r.fromUserId === currentUser.id);
  }, [reviews, currentUser]);

  // Filtered task records
  const filteredTasks = useMemo(() => {
    if (isOwner) {
      return ownerRequests.filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return r.title.toLowerCase().includes(q) || r.ownerCity.toLowerCase().includes(q);
        }
        return true;
      });
    }

    return volunteerAssignments.filter((as) => {
      if (statusFilter !== 'all' && as.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          as.requestTitle.toLowerCase().includes(q) ||
          as.ownerName.toLowerCase().includes(q) ||
          as.ownerCity?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [volunteerAssignments, ownerRequests, isOwner, statusFilter, searchQuery]);

  // Generate certificate on demand
  const handleRequestCertificate = () => {
    if (!currentUser) return;
    const cert = generateCertificate(currentUser.id);
    if (cert) {
      setSelectedCert(cert);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#5a5a40] dark:text-[#a8a880] uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>{language === 'ar' ? 'السجل والتوثيق والشهادات' : 'History & Verified Achievements'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {isOwner
              ? language === 'ar' ? 'سجل طلبات المساعدة والمراجعات' : 'My Requests & Help History'
              : language === 'ar' ? 'سجل الساعات والمهام التطوعية' : 'Volunteer Hours & Service History'}
          </h1>
          <p className="text-xs text-[#6e6e60] dark:text-[#a6a698] mt-1 max-w-xl">
            {language === 'ar'
              ? 'سجل متكامل يوثق جميع مساهماتك التطوعية، الساعات المعتمدة، الشهادات الرسمية، والتقييمات المتبادلة.'
              : 'Official audit log of your verified volunteer hours, completed assignments, certificates, and reviews.'}
          </p>
        </div>

        {isVolunteer && (
          <button
            onClick={handleRequestCertificate}
            className="px-5 py-2.5 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Award className="w-4 h-4" />
            <span>{language === 'ar' ? 'إصدار شهادة تطوع رسمية' : 'Generate Official Certificate'}</span>
          </button>
        )}
      </div>

      {/* Summary KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xs">
          <div className="flex items-center justify-between text-[#5a5a40] dark:text-[#a8a880] mb-2">
            <span className="text-xs font-bold">
              {isOwner ? (language === 'ar' ? 'الطلبات المنجزة' : 'Completed Requests') : (language === 'ar' ? 'ساعات التطوع' : 'Total Hours')}
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {isOwner
              ? ownerRequests.filter((r) => r.status === 'completed').length
              : currentUser?.volunteerHours || 0}
          </p>
          <span className="text-[10px] text-[#7c7c6e] dark:text-[#9e9e90]">
            {language === 'ar' ? 'ساعات معتمدة رسمياً' : 'Verified and certified'}
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xs">
          <div className="flex items-center justify-between text-[#5a5a40] dark:text-[#a8a880] mb-2">
            <span className="text-xs font-bold">
              {language === 'ar' ? 'المهام المكتملة' : 'Tasks Completed'}
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {isOwner
              ? ownerRequests.length
              : currentUser?.completedTasksCount || volunteerAssignments.filter((as) => as.status === 'completed').length}
          </p>
          <span className="text-[10px] text-[#7c7c6e] dark:text-[#9e9e90]">
            {language === 'ar' ? 'خدمة ومساعدة ناجحة' : 'Successful assistance'}
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xs">
          <div className="flex items-center justify-between text-[#5a5a40] dark:text-[#a8a880] mb-2">
            <span className="text-xs font-bold">
              {language === 'ar' ? 'رصيد النقاط' : 'Points Balance'}
            </span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[#5a5a40] dark:text-[#d6d6b8] font-serif">
            {currentUser?.points || 0}
          </p>
          <span className="text-[10px] text-[#7c7c6e] dark:text-[#9e9e90]">
            {language === 'ar' ? 'نقاط التميز المجتمعي' : 'Community impact points'}
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xs">
          <div className="flex items-center justify-between text-[#d4a853] mb-2">
            <span className="text-xs font-bold text-[#5a5a40] dark:text-[#a8a880]">
              {language === 'ar' ? 'معدل التقييم' : 'Average Rating'}
            </span>
            <Star className="w-4 h-4 fill-current" />
          </div>
          <p className="text-2xl font-black text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {currentUser?.ratingsAvg ? `${currentUser.ratingsAvg} ★` : '5.0 ★'}
          </p>
          <span className="text-[10px] text-[#7c7c6e] dark:text-[#9e9e90]">
            {currentUser?.ratingsCount || 0} {language === 'ar' ? 'تقييم ومراجعة' : 'reviews received'}
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e2d9] dark:border-[#383830] pb-2">
        <button
          onClick={() => setActiveHistoryTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isOwner ? (language === 'ar' ? 'جدول الطلبات' : 'Requests Table') : (language === 'ar' ? 'جدول المهام والساعات' : 'Tasks & Hours Table')}</span>
        </button>

        <button
          onClick={() => setActiveHistoryTab('certificates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{language === 'ar' ? 'الشهادات الرسمية' : 'Official Certificates'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'certificates' ? 'bg-white/20' : 'bg-[#e2e2d6] dark:bg-[#383830]'}`}>
            {userCerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveHistoryTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل النشاط الزمني' : 'Activity Timeline'}</span>
        </button>

        <button
          onClick={() => setActiveHistoryTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>{language === 'ar' ? 'المراجعات والتقييمات' : 'Reviews & Feedback'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'reviews' ? 'bg-white/20' : 'bg-[#e2e2d6] dark:bg-[#383830]'}`}>
            {userReviews.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Tasks / Requests Table */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-4 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 text-[#7c7c6e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث في السجل...' : 'Search records...'}
                className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
            >
              <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
              <option value="completed">{t('statusCompleted')}</option>
              <option value="in_progress">{t('statusInProgress')}</option>
              <option value="cancelled">{t('statusCancelled')}</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-[#f8f8f5] dark:bg-[#20201a] border-b border-[#e2e2d9] dark:border-[#383830] text-[#555546] dark:text-[#b4b4a6] font-bold">
                  <tr>
                    <th className="p-4">{language === 'ar' ? 'المهمة / الطلب' : 'Task / Request'}</th>
                    <th className="p-4">{isOwner ? (language === 'ar' ? 'المتطوعون' : 'Volunteers') : (language === 'ar' ? 'صاحب الطلب' : 'Requester')}</th>
                    <th className="p-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="p-4">{language === 'ar' ? 'الساعات والنقاط' : 'Hours & Pts'}</th>
                    <th className="p-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="p-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecece4] dark:divide-[#33332a]">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#7c7c6e] dark:text-[#9e9e90]">
                        {language === 'ar' ? 'لا توجد سجلات تطابق البحث.' : 'No records found matching filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((item: any) => {
                      const isCompleted = item.status === 'completed';
                      const title = item.requestTitle || item.title;
                      const reqId = item.requestId || item.id;
                      const date = item.completedAt || item.createdAt || item.assignedAt;

                      return (
                        <tr key={item.id} className="hover:bg-[#fcfcf9] dark:hover:bg-[#282822] transition">
                          <td className="p-4 font-bold text-[#2c2c2c] dark:text-[#f3f3ed] max-w-xs truncate">
                            {title}
                          </td>
                          <td className="p-4 text-[#5c5c50] dark:text-[#b4b4a6]">
                            {isOwner ? (
                              item.volunteersAssigned?.length > 0 ? (
                                <span className="font-semibold text-[#5a5a40] dark:text-[#a8a880]">
                                  {item.volunteersAssigned.length} {language === 'ar' ? 'متطوع' : 'volunteers'}
                                </span>
                              ) : (
                                <span className="text-[#888878]">{language === 'ar' ? 'لم يُعيّن' : 'None'}</span>
                              )
                            ) : (
                              item.ownerName || 'User'
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isCompleted
                                  ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                                  : item.status === 'in_progress'
                                  ? 'bg-[#faede1] text-[#9c5821] dark:bg-[#382618] dark:text-[#e09963]'
                                  : 'bg-[#faecec] text-[#a83232] dark:bg-[#382020] dark:text-[#df7272]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-[#5a5a40] dark:text-[#d6d6b8]">
                            {item.actualHours ? `${item.actualHours} hrs` : '-'}
                            {item.pointsEarned ? ` • +${item.pointsEarned} pts` : ''}
                          </td>
                          <td className="p-4 text-[#7c7c6e] text-[11px]">
                            {date ? new Date(date).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onOpenRequestDetails(reqId)}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#f0f0ea] dark:bg-[#2d2d26] hover:bg-[#e4e4dc] text-[#4e4e42] dark:text-[#cecebd] transition cursor-pointer"
                              >
                                {language === 'ar' ? 'عرض' : 'View'}
                              </button>

                              {(isOwner || isAdmin) && (
                                <button
                                  onClick={() => setRequestToDelete({ id: reqId, title })}
                                  className="p-1 text-[11px] font-semibold rounded-lg text-[#a84438] hover:bg-[#faecec] dark:hover:bg-[#382020] transition cursor-pointer"
                                  title={t('deleteRequest')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {isCompleted && (
                                <button
                                  onClick={() =>
                                    setReviewModalState({
                                      isOpen: true,
                                      requestId: reqId,
                                      targetUserId: isOwner ? (item.volunteersAssigned?.[0] || '') : (item.ownerId || ''),
                                      targetUserName: isOwner ? 'Volunteer' : (item.ownerName || 'Requester'),
                                    })
                                  }
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#e5e5dc] text-[#3c3c2e] hover:bg-[#d8d8cb] transition cursor-pointer"
                                >
                                  {language === 'ar' ? 'تقييم' : 'Review'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Certificates Showcase */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {userCerts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] space-y-3">
              <Award className="w-12 h-12 mx-auto text-[#a8a896] dark:text-[#505044]" />
              <h3 className="text-base font-bold font-serif">{language === 'ar' ? 'لا توجد شهادات معتمدة صادرة بعد' : 'No certificates issued yet'}</h3>
              <p className="text-xs text-[#7c7c6e] max-w-md mx-auto">
                {language === 'ar'
                  ? 'أتمم مهامك التطوعية المفتوحة ووثق ساعاتك لإصدار شهادة رسمية معتمدة من شبكة سند.'
                  : 'Complete your volunteer tasks and log hours to unlock and download verified certificates.'}
              </p>
              {isVolunteer && (
                <button
                  onClick={handleRequestCertificate}
                  className="px-4 py-2 rounded-xl bg-[#5a5a40] text-white text-xs font-bold hover:bg-[#484833] transition cursor-pointer"
                >
                  {language === 'ar' ? 'إصدار شهادة اعتماد الساعات الحالية' : 'Generate Certificate with Current Hours'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="p-6 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#5a5a40] text-white flex items-center justify-center shadow-xs">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm font-serif text-[#2c2c2c] dark:text-[#f3f3ed]">
                          {language === 'ar' ? (cert.titleAr || 'شهادة تطوع معتمدة') : (cert.titleEn || 'Verified Volunteer Certificate')}
                        </h4>
                        <span className="text-[10px] font-mono text-[#7c7c6e]">
                          #{cert.certificateNumber}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]">
                      {language === 'ar' ? 'موثقة' : 'Verified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-[#f8f8f5] dark:bg-[#1e1e18] rounded-xl border border-[#ecece4] dark:border-[#33332a]">
                    <div>
                      <span className="text-[10px] text-[#7c7c6e] block">{language === 'ar' ? 'إجمالي الساعات' : 'Total Hours'}</span>
                      <span className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">{cert.totalHours} {language === 'ar' ? 'ساعة' : 'Hrs'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7c7c6e] block">{language === 'ar' ? 'المهام المنجزة' : 'Tasks'}</span>
                      <span className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">{cert.tasksCompleted} {language === 'ar' ? 'مهمة' : 'Tasks'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#ecece4] dark:border-[#33332a] pt-3">
                    <span className="text-[10px] text-[#7c7c6e]">
                      {cert.issueDate}
                    </span>
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض والطباعة' : 'View & Print'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Activity Timeline */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] font-serif flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
            <span>{language === 'ar' ? 'التسلسل الزمني للأنشطة والمكافآت' : 'Activity & Reward Timeline'}</span>
          </h3>

          {userLogs.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#7c7c6e]">
              {language === 'ar' ? 'لا توجد أنشطة مسجلة حتى الآن.' : 'No logged activity yet.'}
            </p>
          ) : (
            <div className="relative border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#e2e2d9] dark:border-[#383830] ml-3 rtl:ml-0 rtl:mr-3 space-y-6 py-2">
              {userLogs.map((log) => (
                <div key={log.id} className="relative pl-6 rtl:pl-0 rtl:pr-6">
                  {/* Dot */}
                  <div className="absolute -left-1.5 rtl:-left-auto rtl:-right-1.5 top-1 w-3 h-3 rounded-full bg-[#5a5a40] border-2 border-white dark:border-[#20201a]" />
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {language === 'ar' ? log.titleAr : log.titleEn}
                    </h4>
                    {log.pointsDelta && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]">
                        +{log.pointsDelta} pts
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] mt-0.5">
                    {language === 'ar' ? log.descriptionAr : log.descriptionEn}
                  </p>
                  <span className="text-[10px] text-[#888878] block mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Reviews & Ratings */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {userReviews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] text-xs text-[#7c7c6e]">
              {language === 'ar' ? 'لا توجد تقييمات متبادلة مسجلة بعد.' : 'No reviews recorded yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed]">
                        {rev.requestTitle}
                      </h4>
                      <p className="text-[10px] text-[#7c7c6e]">
                        {language === 'ar' ? `من: ${rev.fromUserName}` : `From: ${rev.fromUserName}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[#d4a853]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-xs">{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#4e4e42] dark:text-[#d0d0be] leading-relaxed italic bg-[#f8f8f5] dark:bg-[#1e1e18] p-3 rounded-xl">
                    "{rev.comment}"
                  </p>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rev.tags.map((tg, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e5e5dc] text-[#3c3c2e] dark:bg-[#333329] dark:text-[#d0d0be]"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-[#888878] block">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
      />

      {/* Review Modal */}
      <ReviewVolunteerModal
        isOpen={reviewModalState.isOpen}
        requestId={reviewModalState.requestId}
        targetUserId={reviewModalState.targetUserId}
        targetUserName={reviewModalState.targetUserName}
        onClose={() => setReviewModalState({ isOpen: false, requestId: '', targetUserId: '', targetUserName: '' })}
      />

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-md w-full p-6 border border-[#e2e2d9] dark:border-[#383830] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faecec] dark:bg-[#3d2424] text-[#a83232] dark:text-[#df7272] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {t('deleteRequestConfirmTitle')}
                </h3>
                <p className="text-xs text-[#7c7c6e]">
                  {requestToDelete.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] leading-relaxed">
              {t('deleteRequestConfirmDesc')}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setRequestToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#eaeae2] dark:hover:bg-[#35352c] transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                id="confirm-history-delete-btn"
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!requestToDelete) return;
                  setIsDeleting(true);
                  try {
                    await deleteRequest(requestToDelete.id);
                    setRequestToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#a83232] hover:bg-[#882828] text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? (language === 'ar' ? 'جارِ الحذف...' : 'Deleting...') : t('confirmDeleteBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
