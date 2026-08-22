import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Heart,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Share2,
  Calendar,
  Layers,
  ArrowUpDown,
  Flame,
  Trash2,
  Globe,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HelpRequest, UrgencyLevel, RequestStatus } from '../../types';

interface HomeFeedProps {
  onOpenCreateRequest: () => void;
  onOpenRequestDetails: (requestId: string) => void;
  onOpenApplyModal: (requestId: string) => void;
  onOpenReportModal: (targetId: string, excerpt: string, ownerId?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  onOpenCreateRequest,
  onOpenRequestDetails,
  onOpenApplyModal,
  onOpenReportModal,
  onOpenAuth,
}) => {
  const {
    t,
    language,
    requests,
    categories,
    currentUser,
    toggleSaveRequest,
    applications,
    deleteRequest,
  } = useApp();

  // Search & Filter State
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'recommended' | 'saved' | 'my_requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [onlyWithDonation, setOnlyWithDonation] = useState(false);
  const [reqToDelete, setReqToDelete] = useState<HelpRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<'urgent' | 'newest' | 'volunteers'>('urgent');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [copiedRequestId, setCopiedRequestId] = useState<string | null>(null);

  const handleShareRequest = (e: React.MouseEvent, reqId: string, title: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#request-${reqId}`;
    if (navigator.share) {
      navigator.share({
        title: `${title} - Sanad Community Platform`,
        text: `Community help request: ${title}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedRequestId(reqId);
      setTimeout(() => setCopiedRequestId(null), 2500);
    }
  };

  // Volunteer's applied request IDs
  const userAppliedRequestIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    return new Set(
      applications
        .filter((a) => a.volunteerId === currentUser.id)
        .map((a) => a.requestId)
    );
  }, [applications, currentUser]);

  // Compute smart match score for a request relative to the current volunteer
  const getMatchScore = (req: HelpRequest): number => {
    if (!currentUser || currentUser.role !== 'volunteer') return 0;
    let score = 50;

    // Category match (+25)
    if (currentUser.preferredCategories?.includes(req.categoryId)) {
      score += 25;
    }

    // Skills match (+20)
    const userSkills = currentUser.skills || [];
    const hasSkillMatch = req.requiredSkills.some((reqSkill) =>
      userSkills.some((userSkill) =>
        userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    if (hasSkillMatch) score += 20;

    // Location match (+15)
    if (currentUser.locationCity && req.ownerCity.toLowerCase() === currentUser.locationCity.toLowerCase()) {
      score += 15;
    }

    // Emergency urgency (+10)
    if (req.urgency === 'emergency') score += 10;

    return Math.min(score, 100);
  };

  // Filtered & Sorted Requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // Sub-tabs
        if (activeSubTab === 'saved') {
          if (!currentUser || !req.savedByUsers.includes(currentUser.id)) return false;
        } else if (activeSubTab === 'my_requests') {
          if (!currentUser || req.ownerId !== currentUser.id) return false;
        } else if (activeSubTab === 'recommended') {
          if (!currentUser || currentUser.role !== 'volunteer') return true;
          return getMatchScore(req) >= 65;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = req.title.toLowerCase().includes(q);
          const matchDesc = req.description.toLowerCase().includes(q);
          const matchSkills = req.requiredSkills.some((s) => s.toLowerCase().includes(q));
          const matchCity = req.ownerCity.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSkills && !matchCity) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && req.categoryId !== selectedCategory) {
          return false;
        }

        // Urgency filter
        if (selectedUrgency !== 'all' && req.urgency !== selectedUrgency) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && req.status !== selectedStatus) {
          return false;
        }

        // City filter
        if (selectedCity !== 'all' && req.ownerCity !== selectedCity) {
          return false;
        }

        // Donation filter
        if (onlyWithDonation && !req.isDonationRequested) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgent') {
          const urgencyOrder: Record<UrgencyLevel, number> = {
            emergency: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'volunteers') {
          return b.volunteersNeeded - a.volunteersNeeded;
        }
        return 0;
      });
  }, [
    requests,
    activeSubTab,
    searchQuery,
    selectedCategory,
    selectedUrgency,
    selectedStatus,
    selectedCity,
    onlyWithDonation,
    sortBy,
    currentUser,
  ]);

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94] ring-1 ring-[#c8766a] animate-pulse">
            <Flame className="w-3.5 h-3.5 text-[#a84438]" />
            {t('urgencyEmergency')}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#8c5a2c]" />
            {t('urgencyHigh')}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6ebf0] text-[#28445c] dark:bg-[#222d36] dark:text-[#a8c2d6]">
            {t('urgencyMedium')}
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#eaeae2] text-[#424232] dark:bg-[#2e2e25] dark:text-[#cfcfbe]">
            {t('urgencyLow')}
          </span>
        );
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="text-[11px] font-semibold text-[#3f4a35] dark:text-[#c7d5bb] bg-[#e2e7dc] dark:bg-[#2b3524] px-2 py-0.5 rounded-md">
            {t('statusOpen')}
          </span>
        );
      case 'volunteer_assigned':
        return (
          <span className="text-[11px] font-semibold text-[#2c3d4a] dark:text-[#a8c2d6] bg-[#dde4ea] dark:bg-[#222d36] px-2 py-0.5 rounded-md">
            {t('statusAssigned')}
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[11px] font-semibold text-[#544834] dark:text-[#dfd4be] bg-[#eae5d8] dark:bg-[#383327] px-2 py-0.5 rounded-md">
            {t('statusInProgress')}
          </span>
        );
      case 'completed':
        return (
          <span className="text-[11px] font-semibold text-[#4d3a5a] dark:text-[#d3c2de] bg-[#e9e4ec] dark:bg-[#312638] px-2 py-0.5 rounded-md">
            {t('statusCompleted')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-semibold text-[#7c7c6e] bg-[#eaeae2] dark:bg-[#2c2c24] px-2 py-0.5 rounded-md">
            {t('statusCancelled')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner with Create Request Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#24241f] p-5 rounded-2xl border border-[#e2e2d9] dark:border-[#383830] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('feedTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#7c7c6e] mt-0.5">
            {t('feedSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            currentUser.role === 'volunteer' ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#eaeae2] dark:bg-[#2c2c24] text-xs font-semibold text-[#5a5a40] dark:text-[#bebea8] border border-[#dcdcd0] dark:border-[#383830]">
                <Sparkles className="w-4 h-4 text-[#8c8c50]" />
                <span>{language === 'ar' ? 'حساب متطوع - تصفح الفرص وقدم المساعدة' : 'Volunteer Account - Explore & Assist'}</span>
              </div>
            ) : (
              <button
                id="create-request-btn"
                onClick={onOpenCreateRequest}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#5a5a40] hover:bg-[#484833] text-white shadow-md shadow-[#5a5a40]/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('createNewRequest')}</span>
              </button>
            )
          ) : (
            <button
              id="create-request-btn-guest"
              onClick={() => onOpenAuth('register', 'owner')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#5a5a40] hover:bg-[#484833] text-white shadow-md shadow-[#5a5a40]/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-[#d99890]" />
              <span>{t('landingCtaSeekHelp')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs: All, Recommended for You, My Requests, Saved */}
      <div className="flex items-center justify-between border-b border-[#e2e2d9] dark:border-[#383830] pb-2">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            id="tab-all-requests"
            onClick={() => setActiveSubTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-[#5a5a40] text-white shadow-xs'
                : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#bebea8] hover:bg-[#dfdfe2] dark:hover:bg-[#35352c]'
            }`}
          >
            {t('allRequestsTab')} ({requests.length})
          </button>

          {currentUser && currentUser.role !== 'volunteer' && (
            <button
              id="tab-my-requests"
              onClick={() => setActiveSubTab('my_requests')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'my_requests'
                  ? 'bg-[#5a5a40] text-white shadow-xs'
                  : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#bebea8] hover:bg-[#dfdfe2] dark:hover:bg-[#35352c]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {language === 'ar' ? 'طلباتي المنشورة' : 'My Requests'} ({requests.filter((r) => r.ownerId === currentUser.id).length})
              </span>
            </button>
          )}

          {currentUser && currentUser.role === 'volunteer' && (
            <button
              id="tab-recommended-requests"
              onClick={() => setActiveSubTab('recommended')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'recommended'
                  ? 'bg-[#5a5a40] text-white shadow-xs'
                  : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#bebea8] hover:bg-[#dfdfe2] dark:hover:bg-[#35352c]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4d4a0]" />
              <span>{t('recommendedTab')}</span>
            </button>
          )}

          {currentUser && (
            <button
              id="tab-saved-requests"
              onClick={() => setActiveSubTab('saved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'saved'
                  ? 'bg-[#5a5a40] text-white shadow-xs'
                  : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#bebea8] hover:bg-[#dfdfe2] dark:hover:bg-[#35352c]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t('savedRequestsTab')}</span>
            </button>
          )}
        </div>

        {/* Filter Toggle on mobile */}
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="p-2 text-xs font-medium text-[#5c5c50] dark:text-[#bebea8] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] rounded-lg flex items-center gap-1 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
          <span className="hidden sm:inline">{language === 'ar' ? 'تصفية وبحث' : 'Filters'}</span>
        </button>
      </div>

      {/* Search & Comprehensive Filters Panel */}
      <div className="bg-white dark:bg-[#24241f] rounded-2xl p-4 sm:p-5 border border-[#e2e2d9] dark:border-[#383830] shadow-xs space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 text-[#7c7c6e]" />
          <input
            id="feed-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 rtl:pl-3.5 rtl:pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40] transition"
          />
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#2c2c2c] text-white dark:bg-[#f3f3ed] dark:text-[#2c2c2c]'
                : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#bebea8] hover:bg-[#dfdfe2]'
            }`}
          >
            {t('filterAllCategories')}
          </button>
          {categories.filter((c) => c.isActive).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#5a5a40] text-white shadow-xs'
                  : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#bebea8] hover:bg-[#dfdfe2]'
              }`}
            >
              <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls (Urgency, City, Status, Sort, Donation) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-[#ecece4] dark:border-[#33332a]">
          {/* Urgency */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7c7c6e] mb-1">
              {t('filterUrgency')}
            </label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed]"
            >
              <option value="all">{t('filterAllUrgencies')}</option>
              <option value="emergency">{t('urgencyEmergency')}</option>
              <option value="high">{t('urgencyHigh')}</option>
              <option value="medium">{t('urgencyMedium')}</option>
              <option value="low">{t('urgencyLow')}</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7c7c6e] mb-1">
              {t('filterCity')}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed]"
            >
              <option value="all">{t('filterAllCities')}</option>
              <option value="Cairo">Cairo (القاهرة)</option>
              <option value="Giza">Giza (الجيزة)</option>
              <option value="Alexandria">Alexandria (الإسكندرية)</option>
              <option value="Mansoura">Mansoura (المنصورة)</option>
              <option value="Tanta">Tanta (طنطا)</option>
              <option value="Assiut">Assiut (أسيوط)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7c7c6e] mb-1">
              {t('filterStatus')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed]"
            >
              <option value="all">{t('filterAllStatuses')}</option>
              <option value="open">{t('statusOpen')}</option>
              <option value="volunteer_assigned">{t('statusAssigned')}</option>
              <option value="in_progress">{t('statusInProgress')}</option>
              <option value="completed">{t('statusCompleted')}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7c7c6e] mb-1">
              {t('sortBy')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed]"
            >
              <option value="urgent">{t('sortUrgent')}</option>
              <option value="newest">{t('sortNewest')}</option>
              <option value="volunteers">{t('sortVolunteersNeeded')}</option>
            </select>
          </div>

          {/* Donation Toggle */}
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#4d4d42] dark:text-[#bebea8]">
              <input
                type="checkbox"
                checked={onlyWithDonation}
                onChange={(e) => setOnlyWithDonation(e.target.checked)}
                className="w-4 h-4 rounded text-[#5a5a40] focus:ring-[#5a5a40]"
              />
              <span>{t('filterDonation')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Requests Feed List */}
      {filteredRequests.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#24241f] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] p-8 space-y-3">
          <Heart className="w-12 h-12 text-[#a8a896] mx-auto" />
          <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('noRequestsFound')}
          </h3>
          <p className="text-xs text-[#7c7c6e] max-w-sm mx-auto">
            {language === 'ar'
              ? 'جرب إعادة تعيين معايير البحث أو تصفح كافة التصنيفات والمحافظات.'
              : 'Try clearing your search filters or browse all categories.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => {
            const category = categories.find((c) => c.id === req.categoryId);
            const isSaved = currentUser ? req.savedByUsers.includes(currentUser.id) : false;
            const hasApplied = userAppliedRequestIds.has(req.id);
            const isAssignedToMe = currentUser ? req.volunteersAssigned.includes(currentUser.id) : false;
            const isOwnerOfPost = currentUser ? req.ownerId === currentUser.id : false;
            const matchScore = getMatchScore(req);

            return (
              <div
                key={req.id}
                id={`request-card-${req.id}`}
                className={`bg-white dark:bg-[#24241f] rounded-2xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group ${
                  req.urgency === 'emergency'
                    ? 'border-[#d9a8a0] dark:border-[#52302b] ring-1 ring-[#c8766a]/30'
                    : 'border-[#e2e2d9] dark:border-[#383830]'
                }`}
              >
                {/* Image Banner (if available) */}
                {req.images && req.images.length > 0 && (
                  <div className="relative h-44 w-full bg-[#eaeae2] dark:bg-[#2a2a22] overflow-hidden">
                    <img
                      src={req.images[0]}
                      alt={req.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5">
                      {getUrgencyBadge(req.urgency)}
                    </div>
                    {currentUser?.role === 'volunteer' && matchScore >= 75 && (
                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#5a5a40] text-white shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#e2e2b8]" />
                        <span>{matchScore}% {t('compatibilityScore')}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Top Metadata */}
                  <div>
                    {!req.images?.length && (
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {getUrgencyBadge(req.urgency)}
                        {currentUser?.role === 'volunteer' && matchScore >= 75 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#eaeae2] text-[#424232] dark:bg-[#2e2e25] dark:text-[#cfcfbe] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#5a5a40] dark:text-[#a8a880]" />
                            <span>{matchScore}% {t('compatibilityScore')}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-[#7c7c6e] mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#5a5a40] dark:text-[#a8a880]">
                          {category ? (language === 'ar' ? category.nameAr : category.nameEn) : req.categoryId}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eef1e8] dark:bg-[#283022] text-[#4d5d3b] dark:text-[#b8cfa3]">
                          <Globe className="w-2.5 h-2.5" />
                          <span>{language === 'ar' ? 'عام' : 'Public'}</span>
                        </span>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <h3
                      onClick={() => onOpenRequestDetails(req.id)}
                      className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] group-hover:text-[#5a5a40] dark:group-hover:text-[#a8a880] transition-colors line-clamp-2 cursor-pointer font-serif"
                    >
                      {req.title}
                    </h3>

                    <p className="text-xs text-[#5c5c50] dark:text-[#a6a698] line-clamp-3 mt-2 leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  {/* Details (Skills, Location, Date, Donation) */}
                  <div className="space-y-2.5 pt-2 border-t border-[#ecece4] dark:border-[#33332a]">
                    {/* Skills Chips */}
                    {req.requiredSkills && req.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {req.requiredSkills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#eaeae2] dark:bg-[#2c2c24] text-[11px] text-[#4d4d42] dark:text-[#cfcfbe] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Location & Time */}
                    <div className="flex items-center justify-between text-xs text-[#7c7c6e]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#7c7c6e]" />
                        {req.ownerCity} {req.ownerDistrict ? `(${req.ownerDistrict})` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#7c7c6e]" />
                        {req.scheduledDate}
                      </span>
                    </div>

                    {/* Volunteers Count Needed */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                        <span>
                          {req.volunteersNeeded} {t('volunteersNeededText')}
                        </span>
                      </span>
                      <span className="text-[11px] text-[#7c7c6e]">
                        {req.volunteersAssigned.length} {t('volunteersAssignedText')}
                      </span>
                    </div>

                    {/* Optional Donation / InstaPay Tag */}
                    {req.isDonationRequested && (
                      <div className="p-2 rounded-lg bg-[#eae5d8] dark:bg-[#383327] border border-[#d8cebe] dark:border-[#4d4432] flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-[#544834] dark:text-[#dfd4be] flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#7a6442]" />
                          <span>{t('financialAssistanceNote')}</span>
                        </span>
                        {req.donationGoal && (
                          <span className="text-[10px] font-bold text-[#544834] dark:text-[#dfd4be]">
                            {req.donationRaised || 0} / {req.donationGoal} EGP
                          </span>
                        )}
                      </div>
                    )}

                    {/* Posted by Owner info */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={req.ownerAvatar}
                          alt={req.ownerName}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-[#d8d8cc] dark:ring-[#444438]"
                        />
                        <span className="text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] truncate max-w-[130px]">
                          {req.ownerName}
                        </span>
                        {req.ownerIsVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" title={t('verifiedBadge')} />
                        )}
                      </div>

                      {/* Favorite & Report & Delete actions */}
                      <div className="flex items-center gap-1">
                        {(isOwnerOfPost || currentUser?.role === 'admin') && (
                          <button
                            id={`feed-delete-btn-${req.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setReqToDelete(req);
                            }}
                            className="p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#a84438] hover:bg-[#fceded] dark:hover:bg-[#3d2424] transition cursor-pointer"
                            title={currentUser?.role === 'admin' ? t('adminDeleteRequest') : t('deleteRequest')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleShareRequest(e, req.id, req.title)}
                          className="p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#5a5a40] dark:hover:text-[#a8a880] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                          title={language === 'ar' ? 'مشاركة الطلب العام' : 'Share Public Request'}
                        >
                          {copiedRequestId === req.id ? (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleSaveRequest(req.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isSaved
                              ? 'text-[#a84438] bg-[#f5e4e2] dark:bg-[#3d2624]'
                              : 'text-[#7c7c6e] hover:text-[#2c2c2c] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24]'
                          }`}
                          title={isSaved ? t('savedPost') : t('savePost')}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenReportModal(req.id, req.title, req.ownerId)}
                          className="p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#a84438] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                          title={t('reportPost')}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-[#f8f8f5] dark:bg-[#20201a] border-t border-[#ecece4] dark:border-[#33332a] flex items-center gap-2">
                  <button
                    onClick={() => onOpenRequestDetails(req.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] border border-[#d8d8cc] dark:border-[#3d3d32] hover:bg-[#eaeae2] dark:hover:bg-[#383830] transition text-center cursor-pointer"
                  >
                    {t('viewDetails')}
                  </button>

                  {isOwnerOfPost ? (
                    <span className="px-3 py-2 text-xs font-semibold text-[#544834] dark:text-[#dfd4be] bg-[#eae5d8] dark:bg-[#383327] rounded-xl">
                      {language === 'ar' ? 'طلبك أنت' : 'Your Request'}
                    </span>
                  ) : isAssignedToMe ? (
                    <span className="px-3 py-2 text-xs font-semibold text-[#3f4a35] dark:text-[#c7d5bb] bg-[#e2e7dc] dark:bg-[#2b3524] rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('assignedToYou')}
                    </span>
                  ) : hasApplied ? (
                    <span className="px-3 py-2 text-xs font-semibold text-[#2c3d4a] dark:text-[#a8c2d6] bg-[#dde4ea] dark:bg-[#222d36] rounded-xl">
                      {t('alreadyApplied')}
                    </span>
                  ) : currentUser ? (
                    <button
                      id={`apply-btn-${req.id}`}
                      onClick={() => onOpenApplyModal(req.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5a5a40] hover:bg-[#484833] text-white shadow-xs transition cursor-pointer"
                    >
                      {t('applyToHelp')}
                    </button>
                  ) : (
                    <button
                      id={`apply-btn-guest-${req.id}`}
                      onClick={() => onOpenAuth('register')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#5a5a40] hover:bg-[#484833] text-white shadow-xs transition cursor-pointer"
                    >
                      {t('applyToHelp')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reqToDelete && (
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
                  {reqToDelete.title}
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
                onClick={() => setReqToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#eaeae2] dark:hover:bg-[#35352c] transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                id="confirm-feed-delete-btn"
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!reqToDelete) return;
                  setIsDeleting(true);
                  try {
                    await deleteRequest(reqToDelete.id);
                    setReqToDelete(null);
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
