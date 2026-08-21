import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Play,
  XCircle,
  MessageSquare,
  Eye,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  Filter,
  Users,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerAssignment } from '../../types';
import { CompleteAssignmentModal } from '../modals/CompleteAssignmentModal';
import { CancelAssignmentModal } from '../modals/CancelAssignmentModal';
import { IconRenderer } from '../common/IconRenderer';

interface AssignmentsViewProps {
  onOpenRequestDetails: (requestId: string) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  onOpenRequestDetails,
}) => {
  const {
    currentUser,
    assignments,
    startAssignment,
    startOrGetConversation,
    language,
    t,
    categories,
    setActiveTab,
    users,
    removeVolunteerFromAssignment,
  } = useApp();

  const [activeTab, setActiveAssignmentTab] = useState<'upcoming' | 'in_progress' | 'completed' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // Modals state
  const [selectedForComplete, setSelectedForComplete] = useState<VolunteerAssignment | null>(null);
  const [selectedForCancel, setSelectedForCancel] = useState<VolunteerAssignment | null>(null);

  // Filter user's assignments or all if admin
  const userAssignments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return assignments;
    }
    return assignments.filter((as) => as.volunteerId === currentUser.id || as.ownerId === currentUser.id);
  }, [assignments, currentUser]);

  // Tab categorization
  const filteredAssignments = useMemo(() => {
    return userAssignments.filter((as) => {
      // Tab filter
      if (activeTab === 'upcoming') {
        if (as.status !== 'applied' && as.status !== 'assigned') return false;
      } else if (activeTab === 'in_progress') {
        if (as.status !== 'in_progress') return false;
      } else if (activeTab === 'completed') {
        if (as.status !== 'completed') return false;
      } else if (activeTab === 'cancelled') {
        if (as.status !== 'cancelled' && as.status !== 'rejected') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = as.requestTitle.toLowerCase().includes(q);
        const matchesDesc = as.requestDescription?.toLowerCase().includes(q);
        const matchesOwner = as.ownerName.toLowerCase().includes(q);
        const matchesVolunteer = as.volunteerName?.toLowerCase().includes(q);
        const matchesCity = as.ownerCity?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesOwner && !matchesVolunteer && !matchesCity) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && as.categoryId !== categoryFilter) {
        return false;
      }

      // Urgency filter
      if (urgencyFilter !== 'all' && as.urgency !== urgencyFilter) {
        return false;
      }

      return true;
    });
  }, [userAssignments, activeTab, searchQuery, categoryFilter, urgencyFilter]);

  const counts = useMemo(() => {
    return {
      upcoming: userAssignments.filter((as) => as.status === 'applied' || as.status === 'assigned').length,
      in_progress: userAssignments.filter((as) => as.status === 'in_progress').length,
      completed: userAssignments.filter((as) => as.status === 'completed').length,
      cancelled: userAssignments.filter((as) => as.status === 'cancelled' || as.status === 'rejected').length,
    };
  }, [userAssignments]);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#faecec] text-[#a83232] dark:bg-[#382020] dark:text-[#df7272] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t('urgencyEmergency')}
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#faede1] text-[#9c5821] dark:bg-[#382618] dark:text-[#e09963]">
            {t('urgencyHigh')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecece6] text-[#555546] dark:bg-[#2e2e26] dark:text-[#bebeb0]">
            {t('urgencyNormal')}
          </span>
        );
    }
  };

  const getStatusBadge = (status: VolunteerAssignment['status']) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#faede1] text-[#9c5821] dark:bg-[#382618] dark:text-[#e09963] flex items-center gap-1">
            <Play className="w-3 h-3 fill-current" />
            {t('statusInProgress')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t('statusCompleted')}
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#faecec] text-[#a83232] dark:bg-[#382020] dark:text-[#df7272] flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {t('statusCancelled')}
          </span>
        );
      case 'assigned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e5e5dc] text-[#3c3c2e] dark:bg-[#333329] dark:text-[#d0d0be] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {language === 'ar' ? 'تم التعيين' : 'Assigned'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eae5d8] text-[#544834] dark:bg-[#383327] dark:text-[#dfd4be]">
            {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
          </span>
        );
    }
  };

  const handleOpenChat = (assignment: VolunteerAssignment) => {
    const otherId = currentUser?.id === assignment.volunteerId ? assignment.ownerId : assignment.volunteerId;
    startOrGetConversation(otherId, assignment.requestId, assignment.requestTitle);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#5a5a40] dark:text-[#a8a880] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ar' ? 'نظام إدارة المهام والتطوع' : 'Volunteer Assignment System'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {language === 'ar' ? 'مهام التطوع المخصصة' : 'My Volunteer Assignments'}
          </h1>
          <p className="text-xs text-[#6e6e60] dark:text-[#a6a698] mt-1 max-w-xl">
            {language === 'ar'
              ? 'تابع مراحل مهامك التطوعية من القبول والتنفيذ وحتى التوثيق واحتساب الساعات والنقاط المعتمدة.'
              : 'Track your assigned help tasks from start to completion, log hours, and collect official points.'}
          </p>
        </div>

        {currentUser?.role === 'volunteer' && (
          <button
            onClick={() => setActiveTab('home')}
            className="px-5 py-2.5 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Users className="w-4 h-4" />
            <span>{language === 'ar' ? 'استعراض طلبات جديدة' : 'Browse Open Requests'}</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e2d9] dark:border-[#383830] pb-2">
        <button
          onClick={() => setActiveAssignmentTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'ar' ? 'المهام القادمة والمقبولة' : 'Upcoming & Assigned'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'upcoming' ? 'bg-white/20' : 'bg-[#e2e2d6] dark:bg-[#383830]'}`}>
            {counts.upcoming}
          </span>
        </button>

        <button
          onClick={() => setActiveAssignmentTab('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'in_progress'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>{language === 'ar' ? 'قيد التنفيذ المباشر' : 'In Progress'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'in_progress' ? 'bg-white/20' : 'bg-[#e2e2d6] dark:bg-[#383830]'}`}>
            {counts.in_progress}
          </span>
        </button>

        <button
          onClick={() => setActiveAssignmentTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'ar' ? 'المهام المكتملة' : 'Completed'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-white/20' : 'bg-[#e2e2d6] dark:bg-[#383830]'}`}>
            {counts.completed}
          </span>
        </button>

        <button
          onClick={() => setActiveAssignmentTab('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'cancelled'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'text-[#5a5a4c] dark:text-[#cecebd] hover:bg-[#ecece6] dark:hover:bg-[#2b2b24]'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>{language === 'ar' ? 'الملغاة والمعتذر عنها' : 'Cancelled / Declined'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'cancelled' ? 'bg-white/20' : 'bg-[#e2e2d6] dark:bg-[#383830]'}`}>
            {counts.cancelled}
          </span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 text-[#7c7c6e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالعنوان، صاحب الطلب، أو المدينة...' : 'Search by title, owner, or location...'}
            className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
          >
            <option value="all">{language === 'ar' ? 'جميع المجالات' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'ar' ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
          >
            <option value="all">{language === 'ar' ? 'كل درجات الأولوية' : 'All Urgencies'}</option>
            <option value="emergency">{t('urgencyEmergency')}</option>
            <option value="high">{t('urgencyHigh')}</option>
            <option value="medium">{t('urgencyMedium')}</option>
            <option value="low">{t('urgencyLow')}</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] p-8 space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-[#a8a896] dark:text-[#505044]" />
          <h3 className="text-base font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {language === 'ar' ? 'لا توجد مهام في هذا القسم حالياً' : 'No assignments found in this tab'}
          </h3>
          <p className="text-xs text-[#7c7c6e] dark:text-[#a8a898] max-w-md mx-auto">
            {language === 'ar'
              ? 'تصفح طلبات المساعدة المفتوحة وتقدم للتطوع لإضافة مهام إلى جدولك وكسب النقاط وساعات الخدمة.'
              : 'Browse open help requests and apply to earn verified volunteer hours and badges.'}
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-4 py-2 rounded-xl bg-[#5a5a40] text-white text-xs font-bold transition hover:bg-[#484833] cursor-pointer"
          >
            {language === 'ar' ? 'استعراض الطلبات المتاحة' : 'Browse Requests'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => {
            const cat = categories.find((c) => c.id === assignment.categoryId);
            return (
              <div
                key={assignment.id}
                className="bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Top Card Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ecece4] text-[#4d4d3a] dark:bg-[#34342a] dark:text-[#d6d6c2] flex items-center gap-1">
                        {cat?.icon && <IconRenderer name={cat.icon} className="w-3 h-3 flex-shrink-0" />}
                        <span>{cat ? (language === 'ar' ? cat.nameAr : cat.nameEn) : assignment.categoryId}</span>
                      </span>
                      {getUrgencyBadge(assignment.urgency)}
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif leading-snug">
                    {assignment.requestTitle}
                  </h3>

                  {assignment.requestDescription && (
                    <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] line-clamp-2 leading-relaxed">
                      {assignment.requestDescription}
                    </p>
                  )}

                  {/* Owner and Location Details */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#6e6e60] dark:text-[#a8a898] border-t border-[#ecece4] dark:border-[#33332a] pt-3">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={assignment.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={assignment.ownerName}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="font-medium text-[#2c2c2c] dark:text-[#f3f3ed] truncate max-w-[120px]">
                        {assignment.ownerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <MapPin className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880] flex-shrink-0" />
                      <span>{assignment.ownerCity || 'Cairo'}{assignment.ownerDistrict ? `, ${assignment.ownerDistrict}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880] flex-shrink-0" />
                      <span>
                        {assignment.status === 'completed' && assignment.actualHours
                          ? `${assignment.actualHours} ${language === 'ar' ? 'ساعات موثقة' : 'hrs logged'}`
                          : `~${assignment.estimatedHours || 2} ${language === 'ar' ? 'ساعات تقديرية' : 'estimated hrs'}`}
                      </span>
                    </div>

                    {assignment.pointsEarned && (
                      <div className="flex items-center gap-1 text-[#5a5a40] dark:text-[#d6d6b8] font-bold whitespace-nowrap">
                        <Award className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>+{assignment.pointsEarned} {language === 'ar' ? 'نقطة' : 'pts'}</span>
                      </div>
                    )}
                  </div>

                  {/* Required skills */}
                  {assignment.requiredSkills && assignment.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {assignment.requiredSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#f0f0ea] dark:bg-[#2d2d26] text-[#555546] dark:text-[#c4c4b6]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cancellation Reason if cancelled */}
                  {assignment.cancellationReason && (
                    <div className="p-2.5 rounded-xl bg-[#faecec] dark:bg-[#382020] text-[#a83232] dark:text-[#df7272] text-xs">
                      <span className="font-bold">{language === 'ar' ? 'سبب الإلغاء:' : 'Cancellation Reason:'} </span>
                      <span>{assignment.cancellationReason}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Toolbar */}
                <div className="border-t border-[#ecece4] dark:border-[#33332a] pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenRequestDetails(assignment.requestId)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#4e4e42] dark:text-[#cecebd] bg-[#f0f0ea] dark:bg-[#2d2d26] hover:bg-[#e4e4dc] dark:hover:bg-[#383830] transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض الطلب' : 'View Details'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenChat(assignment)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#5a5a40] dark:text-[#d6d6b8] bg-[#e5e5dc]/50 dark:bg-[#333329] hover:bg-[#e5e5dc] transition flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'مراسلة' : 'Message'}</span>
                    </button>
                  </div>

                  {/* State-driven actions */}
                  <div className="flex items-center gap-2">
                    {/* If Assigned / Upcoming: can Start or Cancel */}
                    {assignment.status === 'assigned' && currentUser?.id === assignment.volunteerId && (
                      <>
                        <button
                          onClick={() => setSelectedForCancel(assignment)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl text-[#a83232] dark:text-[#df7272] hover:bg-[#faecec] dark:hover:bg-[#382020] transition cursor-pointer"
                        >
                          {language === 'ar' ? 'اعتذار' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => startAssignment(assignment.id)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{language === 'ar' ? 'بدء المهمة' : 'Start Task'}</span>
                        </button>
                      </>
                    )}

                    {/* If In Progress: can Complete or Cancel */}
                    {assignment.status === 'in_progress' && (
                      <>
                        {currentUser?.id === assignment.volunteerId && (
                          <button
                            onClick={() => setSelectedForCancel(assignment)}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl text-[#a83232] dark:text-[#df7272] hover:bg-[#faecec] dark:hover:bg-[#382020] transition cursor-pointer"
                          >
                            {language === 'ar' ? 'اعتذار' : 'Cancel'}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedForComplete(assignment)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#3f4a35] hover:bg-[#313b28] text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إتمام وتوثيق الساعات' : 'Complete & Log'}</span>
                        </button>
                      </>
                    )}

                    {/* Owner/Admin actions to remove volunteer if stuck */}
                    {(currentUser?.role === 'admin' || currentUser?.id === assignment.ownerId) &&
                      assignment.status !== 'completed' &&
                      assignment.status !== 'cancelled' && (
                        <button
                          onClick={() => removeVolunteerFromAssignment(assignment.id, 'Unassigned by owner/admin')}
                          className="p-1.5 text-[#a83232] hover:bg-[#faecec] dark:hover:bg-[#382020] rounded-lg transition"
                          title="Remove Volunteer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Modal */}
      <CompleteAssignmentModal
        assignment={selectedForComplete}
        isOpen={!!selectedForComplete}
        onClose={() => setSelectedForComplete(null)}
      />

      {/* Cancellation Modal */}
      <CancelAssignmentModal
        assignment={selectedForCancel}
        isOpen={!!selectedForCancel}
        onClose={() => setSelectedForCancel(null)}
      />
    </div>
  );
};
