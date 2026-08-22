import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Award,
  Clock,
  Heart,
  Star,
  MapPin,
  Phone,
  DollarSign,
  Edit3,
  CheckCircle2,
  Lock,
  Eye,
  FileText,
  Download,
  Calendar,
  Sparkles,
  Share2,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReviewModal } from '../modals/ReviewModal';

export const ProfileView: React.FC = () => {
  const {
    t,
    language,
    currentUser,
    updateUserProfile,
    requests,
    applications,
    reviews,
    theme,
    setTheme,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reviews' | 'certificate'>('overview');

  // Edit form state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '');
  const [instaPayHandle, setInstaPayHandle] = useState(currentUser?.instaPayHandle || '');
  const [locationCity, setLocationCity] = useState(currentUser?.locationCity || 'Cairo');
  const [locationDistrict, setLocationDistrict] = useState(currentUser?.locationDistrict || '');
  const [skillsInput, setSkillsInput] = useState(currentUser?.skills?.join(', ') || '');
  const [organizationOrJob, setOrganizationOrJob] = useState(currentUser?.organizationOrJob || '');

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<{
    targetUserId: string;
    targetUserName: string;
    requestId: string;
    requestTitle: string;
  } | null>(null);

  if (!currentUser) return null;

  const isVolunteer = currentUser.role === 'volunteer';
  const isOwner = currentUser.role === 'owner';

  // Requests created by this owner
  const myCreatedRequests = requests.filter((r) => r.ownerId === currentUser.id);

  // Applications/tasks for this volunteer
  const myVolunteerApps = applications.filter((a) => a.volunteerId === currentUser.id);
  const completedVolunteerApps = myVolunteerApps.filter((a) => a.status === 'accepted');

  // Reviews for this user
  const userReviews = reviews.filter((r) => r.targetUserId === currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsInput
      ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    updateUserProfile({
      fullName,
      bio,
      mobileNumber,
      instaPayHandle,
      locationCity,
      locationDistrict,
      skills,
      organizationOrJob,
    });

    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left rtl:sm:text-right">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#5a5a40]/20 shadow-md"
              />
              {isOwner && currentUser.ownerStatus === 'approved' && (
                <div
                  className="absolute -bottom-2 -right-2 rtl:-right-auto rtl:-left-2 bg-[#5a5a40] text-white p-1.5 rounded-xl shadow-xs"
                  title={t('verifiedBadge')}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {currentUser.fullName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    isVolunteer
                      ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                      : isOwner
                      ? 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
                      : 'bg-[#eaeae2] text-[#4d4d42] dark:bg-[#2c2c24] dark:text-[#cfcfbe]'
                  }`}
                >
                  {currentUser.role}
                </span>

                {isOwner && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      currentUser.ownerStatus === 'approved'
                        ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                        : 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
                    }`}
                  >
                    {currentUser.ownerStatus === 'approved' ? t('verifiedBadge') : t('pendingBadge')}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#7c7c6e]">
                @{currentUser.username} • {currentUser.email}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#4d4d42] dark:text-[#cfcfbe] pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                  {currentUser.locationCity || 'Cairo'} {currentUser.locationDistrict ? `(${currentUser.locationDistrict})` : ''}
                </span>
                {currentUser.mobileNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                    {currentUser.mobileNumber}
                  </span>
                )}
                {currentUser.rating && (
                  <span className="flex items-center gap-1 font-bold text-[#b58840]">
                    <Star className="w-3.5 h-3.5 fill-[#b58840]" />
                    {currentUser.rating.toFixed(1)} ({userReviews.length} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action: Edit Profile Button */}
          <button
            id="edit-profile-toggle"
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#eaeae2] dark:bg-[#2c2c24] hover:bg-[#dcdcd4] dark:hover:bg-[#383830] text-[#2c2c2c] dark:text-[#f3f3ed] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? (language === 'ar' ? 'إلغاء التعديل' : 'Cancel Edit') : t('editProfileBtn')}</span>
          </button>
        </div>

        {/* Volunteer Stats Row (Hours, Points, Badges) */}
        {isVolunteer && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#f8f8f5] dark:bg-[#2c2c24] border border-[#e2e2d9] dark:border-[#383830]">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#7c7c6e]">{t('totalHours')}</span>
              <p className="text-xl font-bold text-[#5a5a40] dark:text-[#a8a880]">
                {currentUser.volunteerHours || 0} Hours
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#7c7c6e]">{t('totalPoints')}</span>
              <p className="text-xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                {currentUser.volunteerPoints || 0} Pts
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#7c7c6e]">{t('badgeGold')}</span>
              <p className="text-xs font-bold text-[#94672e] dark:text-[#e0b992] flex items-center gap-1 mt-1">
                <Award className="w-4 h-4" />
                <span>Active Hero</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#7c7c6e]">{t('tasksCompleted')}</span>
              <p className="text-xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                {completedVolunteerApps.length} Tasks
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Form Section */}
      {isEditing && (
        <div className="bg-white dark:bg-[#24241f] rounded-3xl border border-[#5a5a40]/50 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-[#5a5a40] dark:text-[#a8a880] font-bold text-base">
            <Edit3 className="w-5 h-5" />
            <h3 className="font-serif">{t('editProfileBtn')}</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('fullNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('mobileRequiredForOwner')}
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('bioLabel')}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a brief overview about your background or why you volunteer..."
                className="w-full p-3 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40] resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('locationCityRequired')}
                </label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('locationDistrictLabel')}
                </label>
                <input
                  type="text"
                  value={locationDistrict}
                  onChange={(e) => setLocationDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('instaPayLink')}
                </label>
                <input
                  type="text"
                  value={instaPayHandle}
                  onChange={(e) => setInstaPayHandle(e.target.value)}
                  placeholder="e.g. username@instapay"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>
            </div>

            {isVolunteer && (
              <div>
                <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('skillsLabel')} (Comma separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dcdcd4] font-semibold transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl font-bold text-white bg-[#5a5a40] hover:bg-[#484833] shadow-xs transition cursor-pointer"
              >
                {t('saveProfileBtn')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs: Overview, History / My Requests, Reviews, Volunteer Certificate */}
      <div className="flex items-center gap-2 border-b border-[#e2e2d9] dark:border-[#383830] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dcdcd4]'
          }`}
        >
          {language === 'ar' ? 'نظرة عامة' : 'Overview'}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dcdcd4]'
          }`}
        >
          {isOwner ? (language === 'ar' ? 'طلباتي المنشورة' : 'My Requests') : (language === 'ar' ? 'سجل المهام والتطوع' : 'Volunteer History')}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dcdcd4]'
          }`}
        >
          {t('ratingReviewsTitle')} ({userReviews.length})
        </button>

        {isVolunteer && (
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-[#5a5a40] text-white shadow-xs'
                : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dcdcd4]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#b58840]" />
            <span>{t('volunteerCertificate')}</span>
          </button>
        )}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About / Bio */}
          <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] space-y-3">
            <h3 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {t('bioLabel')}
            </h3>
            <p className="text-xs text-[#4d4d42] dark:text-[#cfcfbe] leading-relaxed">
              {currentUser.bio || (language === 'ar' ? 'لم تتم إضافة نبذة بعد.' : 'No biography added yet.')}
            </p>
          </div>

          {/* Skills / Badges */}
          <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] space-y-4">
            <h3 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {isVolunteer ? t('skillsLabel') : t('safetyTitle')}
            </h3>
            {isVolunteer ? (
              <div className="flex flex-wrap gap-2">
                {currentUser.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#e2e7dc] dark:bg-[#2b3524] border border-[#cbd5c3] dark:border-[#3a4731] text-xs text-[#3f4a35] dark:text-[#c7d5bb] rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#4d4d42] dark:text-[#cfcfbe]">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                  <span>Document verified by platform moderation</span>
                </p>
                <p className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                  <span>Mobile number privacy shield active</span>
                </p>
              </div>
            )}
          </div>

          {/* Appearance & Interface Theme Preferences */}
          <div className="md:col-span-2 bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {language === 'ar' ? 'مظهر وتفضيلات النظام' : 'Appearance & Theme'}
                </h3>
                <p className="text-xs text-[#7c7c6e] mt-0.5">
                  {language === 'ar'
                    ? 'اختر المظهر المفضل لتجربة استخدام مريحة للعين'
                    : 'Select your preferred visual mode for comfortable browsing'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
                  theme === 'light'
                    ? 'border-[#5a5a40] bg-[#f5f5f0] ring-2 ring-[#5a5a40]/20'
                    : 'border-[#e2e2d9] dark:border-[#383830] hover:bg-[#fafaf7] dark:hover:bg-[#2c2c24]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#e8e8df] text-[#5a5a40] flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed]">{t('lightMode')}</p>
                  <p className="text-[10px] text-[#7c7c6e]">{language === 'ar' ? 'ألوان ترابية دافئة' : 'Warm natural daylight'}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
                  theme === 'dark'
                    ? 'border-[#828260] bg-[#2c2c23] ring-2 ring-[#828260]/30'
                    : 'border-[#e2e2d9] dark:border-[#383830] hover:bg-[#fafaf7] dark:hover:bg-[#2c2c24]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#38382e] text-[#d4d4b8] flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed]">{t('darkMode')}</p>
                  <p className="text-[10px] text-[#7c7c6e]">{language === 'ar' ? 'مريح للعين ليلاً' : 'Eye-safe night mode'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY (OWNER OR VOLUNTEER) */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] space-y-4">
          <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {isOwner ? (language === 'ar' ? 'قائمة طلباتي' : 'My Requests') : (language === 'ar' ? 'سجل المهام التطوعية' : 'Completed & Active Volunteering')}
          </h3>

          {isOwner ? (
            myCreatedRequests.length === 0 ? (
              <p className="text-xs text-[#7c7c6e] py-6 text-center">No requests created yet.</p>
            ) : (
              <div className="space-y-3">
                {myCreatedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-[#e2e2d9] dark:border-[#383830] bg-[#f8f8f5] dark:bg-[#2c2c24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">{req.title}</h4>
                      <p className="text-[#7c7c6e] mt-0.5">{req.scheduledDate} • {req.ownerCity}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] capitalize">
                        {req.status.replace('_', ' ')}
                      </span>

                      {req.volunteersAssigned.length > 0 && (
                        <button
                          onClick={() =>
                            setReviewTarget({
                              targetUserId: req.volunteersAssigned[0],
                              targetUserName: 'Volunteer',
                              requestId: req.id,
                              requestTitle: req.title,
                            })
                          }
                          className="px-3 py-1.5 bg-[#5a5a40] hover:bg-[#484833] text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>{t('rateVolunteer')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            myVolunteerApps.length === 0 ? (
              <p className="text-xs text-[#7c7c6e] py-6 text-center">No volunteer tasks logged yet.</p>
            ) : (
              <div className="space-y-3">
                {myVolunteerApps.map((app) => {
                  const req = requests.find((r) => r.id === app.requestId);
                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border border-[#e2e2d9] dark:border-[#383830] bg-[#f8f8f5] dark:bg-[#2c2c24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">{req?.title || 'Help Request'}</h4>
                        <p className="text-[#7c7c6e] mt-0.5">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-md font-bold ${
                          app.status === 'accepted'
                            ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                            : 'bg-[#eaeae2] text-[#4d4d42] dark:bg-[#383830] dark:text-[#cfcfbe]'
                        }`}
                      >
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 3: REVIEWS & RATINGS */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] space-y-4">
          <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('ratingReviewsTitle')}
          </h3>

          {userReviews.length === 0 ? (
            <p className="text-xs text-[#7c7c6e] py-6 text-center">
              {language === 'ar' ? 'لا توجد تقييمات مسجلة بعد.' : 'No reviews received yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {userReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-[#e2e2d9] dark:border-[#383830] bg-[#f8f8f5] dark:bg-[#2c2c24] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">{rev.authorName}</span>
                      <span className="text-[10px] text-[#7c7c6e]">({rev.authorRole})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#b58840] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#b58840]" />
                      <span>{rev.rating} / 5</span>
                    </div>
                  </div>
                  <p className="text-[#4d4d42] dark:text-[#cfcfbe] italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OFFICIAL VOLUNTEER CERTIFICATE */}
      {activeTab === 'certificate' && isVolunteer && (
        <div className="bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-2 font-serif">
              <Award className="w-5 h-5 text-[#b58840]" />
              <span>{t('volunteerCertificate')}</span>
            </h3>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5a5a40] hover:bg-[#484833] text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('downloadCertificate')}</span>
            </button>
          </div>

          {/* Certificate Printable Canvas Box */}
          <div className="p-8 sm:p-12 rounded-2xl border-4 border-double border-[#5a5a40]/40 bg-[#f8f8f5] dark:bg-[#1a1a16] text-center space-y-6 shadow-inner">
            <div className="w-16 h-16 rounded-full bg-[#5a5a40] text-white flex items-center justify-center mx-auto shadow-md">
              <Heart className="w-8 h-8 fill-white/20" />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-[#5a5a40] dark:text-[#a8a880] font-bold">
                SANAD VOLUNTEER SOLIDARITY PLATFORM • شهادة تقدير وعطاء مجتمعي
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                Certificate of Volunteer Impact
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#4d4d42] dark:text-[#cfcfbe] max-w-xl mx-auto leading-relaxed">
              {language === 'ar'
                ? `تقديراً للجهود الإنسانية المتميزة والتفاني في خدمة المجتمع وتقديم يد العون للمحتاجين، تُمنح هذه الشهادة الرسمية للمتطوع:`
                : `In sincere recognition of outstanding humanitarian contribution, empathy, and active dedication to community service, this verified certificate is awarded to:`}
            </p>

            <h3 className="text-2xl sm:text-3xl font-black text-[#5a5a40] dark:text-[#bebea8] underline decoration-[#b58840] decoration-2 font-serif">
              {currentUser.fullName}
            </h3>

            <div className="grid grid-cols-2 max-w-sm mx-auto gap-4 p-3 rounded-xl bg-white dark:bg-[#24241f] border border-[#e2e2d9] dark:border-[#383830] text-xs">
              <div>
                <span className="text-[#7c7c6e] block">{t('totalHours')}</span>
                <span className="text-lg font-bold text-[#5a5a40] dark:text-[#a8a880]">
                  {currentUser.volunteerHours || 14} Hours
                </span>
              </div>
              <div>
                <span className="text-[#7c7c6e] block">{t('tasksCompleted')}</span>
                <span className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                  {completedVolunteerApps.length || 5} Resolved Tasks
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between text-xs text-[#7c7c6e] px-4">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span>Sanad Verification Seal #SN-2026-V88</span>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Review Modal */}
      {reviewTarget && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewTarget(null)}
          targetUserId={reviewTarget.targetUserId}
          targetUserName={reviewTarget.targetUserName}
          requestId={reviewTarget.requestId}
          requestTitle={reviewTarget.requestTitle}
        />
      )}
    </div>
  );
};
