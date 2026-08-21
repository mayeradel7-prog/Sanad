import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Phone,
  DollarSign,
  AlertTriangle,
  Send,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Share2,
  ExternalLink,
  Lock,
  Heart,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus } from '../../types';

interface RequestDetailsModalProps {
  requestId: string | null;
  onClose: () => void;
  onOpenApplyModal: (requestId: string) => void;
  onOpenReportModal: (targetId: string, excerpt: string, ownerId?: string) => void;
  onOpenDirectChat: (participantId: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  requestId,
  onClose,
  onOpenApplyModal,
  onOpenReportModal,
  onOpenDirectChat,
  onOpenAuth,
}) => {
  const {
    t,
    language,
    requests,
    categories,
    currentUser,
    applications,
    updateApplicationStatus,
    acceptApplication,
    rejectApplication,
    addCommentToRequest,
    addComment,
    comments,
    users,
    updateRequestStatus,
    deleteRequest,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!requestId) return null;

  const request = requests.find((r) => r.id === requestId);
  if (!request) return null;

  const category = categories.find((c) => c.id === request.categoryId);
  const isOwner = currentUser?.id === request.ownerId;
  const isVolunteer = currentUser?.role === 'volunteer';
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteRequest(request.id);
      if (res.success) {
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setDeleteError(res.message || 'Failed to delete request');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  // Request's applications
  const reqApplications = applications.filter((a) => a.requestId === request.id);
  const myApplication = applications.find(
    (a) => a.requestId === request.id && a.volunteerId === currentUser?.id
  );

  const requestComments = comments ? comments.filter((c) => c.requestId === request.id) : [];

  const isAssignedToMe = currentUser
    ? request.volunteersAssigned.includes(currentUser.id)
    : false;

  // Can view owner's mobile number:
  // Allowed if: owner itself, or admin, or accepted volunteer, or owner chose to make it public
  const canViewMobile =
    isOwner ||
    isAdmin ||
    isAssignedToMe ||
    request.ownerMobileVisibility === 'public' ||
    (request.ownerMobileVisibility === 'registered' && !!currentUser);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (addCommentToRequest) {
      addCommentToRequest(request.id, commentText.trim());
    } else if (addComment) {
      addComment(request.id, commentText.trim());
    }
    setCommentText('');
  };

  const handleUpdateApp = (appId: string, status: 'accepted' | 'rejected') => {
    if (status === 'accepted') {
      if (acceptApplication) acceptApplication(appId);
      else if (updateApplicationStatus) updateApplicationStatus(appId, 'accepted');
    } else {
      if (rejectApplication) rejectApplication(appId);
      else if (updateApplicationStatus) updateApplicationStatus(appId, 'rejected');
    }
  };

  const handleCopyShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1a1a16]/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#e2e2d9] dark:border-[#383830] shadow-2xl relative flex flex-col">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#24241f]/95 backdrop-blur-md px-6 py-4 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#eaeae2] text-[#424232] dark:bg-[#2e2e25] dark:text-[#cfcfbe]">
              {category ? (language === 'ar' ? category.nameAr : category.nameEn) : request.categoryId}
            </span>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                request.urgency === 'emergency'
                  ? 'bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94]'
                  : 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
              }`}
            >
              {request.urgency.toUpperCase()}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#eef1e8] dark:bg-[#283022] text-[#4d5d3b] dark:text-[#b8cfa3]">
              <Globe className="w-3 h-3" />
              <span>{language === 'ar' ? 'طلب مجتمعي عام' : 'Public Community Request'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="p-2 rounded-lg text-[#7c7c6e] hover:text-[#5a5a40] dark:hover:text-[#a8a880] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition text-xs flex items-center gap-1 cursor-pointer"
              title={t('sharePost')}
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-[10px] text-[#5a5a40] dark:text-[#a8a880] font-semibold">{t('linkCopied')}</span>}
            </button>

            {canDelete ? (
              <button
                id="modal-delete-request-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg text-[#a84438] hover:text-[#882820] hover:bg-[#fceded] dark:hover:bg-[#3d2424] transition cursor-pointer"
                title={isAdmin ? t('adminDeleteRequest') : t('deleteRequest')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onOpenReportModal(request.id, request.title, request.ownerId)}
                className="p-2 rounded-lg text-[#7c7c6e] hover:text-[#a84438] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                title={t('reportPost')}
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Images (if any) */}
          {request.images && request.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {request.images.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden h-56 bg-[#eaeae2] dark:bg-[#2a2a22] border border-[#e2e2d9] dark:border-[#383830]">
                  <img src={img} alt="Help request proof" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {request.title}
            </h2>
            <p className="text-sm text-[#5c5c50] dark:text-[#cfcfbe] mt-3 leading-relaxed whitespace-pre-line">
              {request.description}
            </p>
          </div>

          {/* Key Parameter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#f8f8f5] dark:bg-[#2c2c24] border border-[#e2e2d9] dark:border-[#383830] text-xs">
            <div>
              <span className="text-[#7c7c6e] block mb-0.5">{language === 'ar' ? 'الموقع' : 'Location'}</span>
              <span className="font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                {request.ownerCity} {request.ownerDistrict ? `(${request.ownerDistrict})` : ''}
              </span>
            </div>

            <div>
              <span className="text-[#7c7c6e] block mb-0.5">{language === 'ar' ? 'الموعد المجدول' : 'Date / Time'}</span>
              <span className="font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                {request.scheduledDate} {request.scheduledTime || ''}
              </span>
            </div>

            <div>
              <span className="text-[#7c7c6e] block mb-0.5">{t('volunteersNeededText')}</span>
              <span className="font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#5a5a40] dark:text-[#a8a880]" />
                {request.volunteersAssigned.length} / {request.volunteersNeeded}
              </span>
            </div>

            <div>
              <span className="text-[#7c7c6e] block mb-0.5">{language === 'ar' ? 'الحالة الحالية' : 'Status'}</span>
              <span className="font-semibold text-[#2c2c2c] dark:text-[#f3f3ed] capitalize">
                {request.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Required Skills */}
          {request.requiredSkills && request.requiredSkills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#2c2c2c] dark:text-[#f3f3ed] mb-2 font-serif">
                {t('skillsLabel')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {request.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#eaeae2] dark:bg-[#2c2c24] border border-[#d8d8cc] dark:border-[#3d3d32] text-xs text-[#4d4d42] dark:text-[#cfcfbe] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner Profile & Contact Shield Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#24241f] border border-[#e2e2d9] dark:border-[#383830] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={request.ownerAvatar}
                  alt={request.ownerName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#5a5a40]/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {request.ownerName}
                    </span>
                    {request.ownerIsVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#5a5a40] dark:text-[#a8a880]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t('verifiedBadge')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7c7c6e]">
                    {language === 'ar' ? 'طالب مساعدة موثق على منصة سند' : 'Verified Community Member'}
                  </p>
                </div>
              </div>

              {currentUser && !isOwner && (
                <button
                  onClick={() => onOpenDirectChat(request.ownerId)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#eaeae2] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#5a5a40] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{t('chatTab')}</span>
                </button>
              )}
            </div>

            {/* Privacy-Protected Mobile Number */}
            <div className="pt-2 border-t border-[#ecece4] dark:border-[#33332a] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#4d4d42] dark:text-[#cfcfbe]">
                <Phone className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                <span className="font-semibold">{t('mobileRequiredForOwner')}:</span>
                {canViewMobile ? (
                  <span className="font-bold text-[#5a5a40] dark:text-[#a8a880] tracking-wider font-mono">
                    {request.ownerMobile}
                  </span>
                ) : (
                  <span className="text-[#7c7c6e] flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {language === 'ar'
                      ? 'محمي: يظهر فقط بعد قبول تطوعك'
                      : 'Hidden until application is accepted'}
                  </span>
                )}
              </div>
            </div>

            {/* Optional Direct InstaPay Support */}
            {request.isDonationRequested && request.ownerInstaPay && (
              <div className="p-3 rounded-xl bg-[#eae5d8] dark:bg-[#383327] border border-[#d8cebe] dark:border-[#4d4432] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1 text-[#544834] dark:text-[#dfd4be] font-bold">
                    <DollarSign className="w-4 h-4 text-[#7a6442]" />
                    <span>{t('instaPaySectionTitle')}</span>
                  </div>
                  <p className="text-[11px] text-[#706045] dark:text-[#cfc4ac] mt-0.5">
                    {t('instaPayDescription')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#2c2c2c] dark:text-[#f3f3ed] bg-white dark:bg-[#24241f] px-3 py-1 rounded-lg border border-[#d8cebe] dark:border-[#4d4432]">
                    {request.ownerInstaPay}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* OWNER MANAGEMENT SECTION: Applications Review */}
          {isOwner && (
            <div className="p-4 rounded-xl bg-[#f8f8f5] dark:bg-[#2c2c24] border border-[#e2e2d9] dark:border-[#383830] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-2 font-serif">
                  <Users className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                  <span>{t('applicationsTitle')} ({reqApplications.length})</span>
                </h4>

                <div className="flex items-center gap-2">
                  {/* Change Request Status */}
                  <select
                    value={request.status}
                    onChange={(e) => updateRequestStatus(request.id, e.target.value as any)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed]"
                  >
                    <option value="open">{t('statusOpen')}</option>
                    <option value="volunteer_assigned">{t('statusAssigned')}</option>
                    <option value="in_progress">{t('statusInProgress')}</option>
                    <option value="completed">{t('statusCompleted')}</option>
                    <option value="cancelled">{t('statusCancelled')}</option>
                  </select>

                  {/* Delete Request Button */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-2.5 py-1 text-xs rounded-lg font-bold text-[#7a2e26] dark:text-[#df9b94] bg-[#f5e4e2] dark:bg-[#3d2624] hover:bg-[#ebd0cc] flex items-center gap-1 transition cursor-pointer"
                    title={t('deleteRequest')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('deleteRequest')}</span>
                  </button>
                </div>
              </div>

              {reqApplications.length === 0 ? (
                <p className="text-xs text-[#7c7c6e] py-2">
                  {language === 'ar' ? 'لم يتقدم أي متطوع بعد. سيظهر المتطوعون هنا فور تقديمهم.' : 'No volunteer applications yet.'}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {reqApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-lg bg-white dark:bg-[#24241f] border border-[#e2e2d9] dark:border-[#383830] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.volunteerAvatar}
                          alt={app.volunteerName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                              {app.volunteerName}
                            </span>
                            <span className="text-[10px] text-[#7a6442] dark:text-[#dfd4be] font-bold">
                              ★ {app.volunteerRating}
                            </span>
                          </div>
                          <p className="text-[#5c5c50] dark:text-[#cfcfbe] line-clamp-1">
                            "{app.message}"
                          </p>
                        </div>
                      </div>

                      {/* Application Actions */}
                      <div className="flex items-center gap-2">
                        {app.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateApp(app.id, 'accepted')}
                              className="px-3 py-1.5 rounded-lg font-bold text-white bg-[#5a5a40] hover:bg-[#484833] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t('acceptApplicant')}</span>
                            </button>
                            <button
                              onClick={() => handleUpdateApp(app.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg font-bold text-[#7a2e26] dark:text-[#df9b94] bg-[#f5e4e2] dark:bg-[#3d2624] hover:bg-[#ebd0cc] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{t('rejectApplicant')}</span>
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              app.status === 'accepted'
                                ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                                : 'bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94]'
                            }`}
                          >
                            {app.status.toUpperCase()}
                          </span>
                        )}

                        <button
                          onClick={() => onOpenDirectChat(app.volunteerId)}
                          className="p-1.5 rounded-lg bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:text-[#5a5a40] cursor-pointer"
                          title="Message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments & Question Discussion */}
          <div className="space-y-4 pt-4 border-t border-[#ecece4] dark:border-[#33332a]">
            <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-2 font-serif">
              <MessageCircle className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
              <span>{t('commentsTitle')} ({requestComments.length})</span>
            </h4>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {requestComments.length > 0 ? (
                requestComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-[#f8f8f5] dark:bg-[#2c2c24] border border-[#ecece4] dark:border-[#33332a] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={comment.userName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                          {comment.userName}
                        </span>
                        {comment.userRole === 'owner' && (
                          <span className="text-[10px] text-[#7a6442] dark:text-[#dfd4be] font-semibold">({t('roleOwner')})</span>
                        )}
                        {comment.userRole === 'admin' && (
                          <span className="text-[10px] text-[#5a5a40] dark:text-[#d4d4b8] font-semibold">({t('roleAdmin')})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#7c7c6e]">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#5c5c50] dark:text-[#cfcfbe] pl-7 rtl:pl-0 rtl:pr-7">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#7c7c6e] py-2">
                  {language === 'ar' ? 'لا توجد تعليقات بعد. اطرح سؤالاً أو استفساراً.' : 'No comments yet. Feel free to ask a question.'}
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            {currentUser ? (
              <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('commentPlaceholder')}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5a5a40] hover:bg-[#484833] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('postComment')}</span>
                </button>
              </form>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs text-[#5a5a40] dark:text-[#a8a880] font-semibold hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'سجل الدخول لإضافة استفسار أو تعليق' : 'Sign in to add a comment'}
              </button>
            )}
          </div>
        </div>

        {/* Modal Bottom Sticky CTA */}
        <div className="sticky bottom-0 bg-[#f8f8f5] dark:bg-[#20201a] backdrop-blur-md px-6 py-4 border-t border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] border border-[#d8d8cc] dark:border-[#3d3d32] hover:bg-[#eaeae2] dark:hover:bg-[#35352c] cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                id="applyToHelp-guest"
                onClick={() => onOpenAuth('register')}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5a5a40] hover:bg-[#484833] shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#d99890]" />
                <span>{t('applyToHelp')}</span>
              </button>
            ) : isOwner ? (
              <span className="text-xs text-[#7c7c6e] font-medium">
                {language === 'ar' ? 'أنت صاحب هذا الطلب' : 'You are the author of this request'}
              </span>
            ) : isAssignedToMe ? (
              <span className="px-4 py-2 rounded-xl text-xs font-bold text-[#3f4a35] dark:text-[#c7d5bb] bg-[#e2e7dc] dark:bg-[#2b3524] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('assignedToYou')}</span>
              </span>
            ) : myApplication ? (
              <span className="px-4 py-2 rounded-xl text-xs font-bold text-[#2c3d4a] dark:text-[#a8c2d6] bg-[#dde4ea] dark:bg-[#222d36]">
                {t('alreadyApplied')} ({myApplication.status})
              </span>
            ) : (
              <button
                id="applyToHelp"
                onClick={() => onOpenApplyModal(request.id)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5a5a40] hover:bg-[#484833] shadow-md shadow-[#5a5a40]/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#e2e2b8]" />
                <span>{t('applyToHelp')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                  {request.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5c5c50] dark:text-[#b4b4a6] leading-relaxed">
              {t('deleteRequestConfirmDesc')}
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-[#faecec] dark:bg-[#3d2424] text-[#a83232] dark:text-[#df7272] text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#eaeae2] dark:hover:bg-[#35352c] transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                id="confirm-delete-request-btn"
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
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
