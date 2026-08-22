import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileCheck,
  AlertTriangle,
  Layers,
  BarChart3,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Search,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Award,
  Clock,
  Phone,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, ReportStatus } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

export const AdminDashboard: React.FC = () => {
  const {
    t,
    language,
    currentUser,
    users,
    requests,
    reports,
    categories,
    adminApproveOwner,
    adminRejectOwner,
    adminSuspendUser,
    verifyOwnerDocument,
    toggleUserBan,
    handleReportAction,
    addCategory,
    toggleCategoryStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'reports' | 'categories' | 'stats'>('verifications');
  const [ownerVerifFilter, setOwnerVerifFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ url: string; name: string; ownerName: string } | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<{ [userId: string]: string }>({});
  const [userSearch, setUserSearch] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');

  // Owner verification groups
  const allOwners = users.filter((u) => u.role === 'owner');
  const pendingOwners = allOwners.filter((u) => u.ownerStatus === 'pending');
  const approvedOwners = allOwners.filter((u) => u.ownerStatus === 'approved');
  const rejectedOwners = allOwners.filter((u) => u.ownerStatus === 'rejected');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const displayedVerifOwners =
    ownerVerifFilter === 'pending'
      ? pendingOwners
      : ownerVerifFilter === 'approved'
      ? approvedOwners
      : ownerVerifFilter === 'rejected'
      ? rejectedOwners
      : allOwners;

  const handleApprove = (ownerId: string) => {
    if (adminApproveOwner) {
      adminApproveOwner(ownerId);
    } else if (verifyOwnerDocument) {
      verifyOwnerDocument(ownerId, 'approved');
    }
  };

  const handleReject = (ownerId: string) => {
    const reason =
      rejectionNotes[ownerId]?.trim() ||
      (language === 'ar' ? 'الوثيقة المرفقة غير مكتملة أو غير واضحة.' : 'Incomplete or unreadable document.');
    if (adminRejectOwner) {
      adminRejectOwner(ownerId, reason);
    } else if (verifyOwnerDocument) {
      verifyOwnerDocument(ownerId, 'rejected', reason);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameEn.trim() || !newCatNameAr.trim()) return;
    addCategory({
      nameEn: newCatNameEn.trim(),
      nameAr: newCatNameAr.trim(),
      descriptionEn: 'Community support category',
      descriptionAr: 'تصنيف دعم مجتمعي',
      icon: 'Layers',
    });
    setNewCatNameEn('');
    setNewCatNameAr('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title & Summary Stats */}
      <div className="bg-[#24241f] text-[#f3f3ed] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#383830] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5a5a40]/30 text-[#dfdfc8] border border-[#5a5a40]/50">
              <ShieldCheck className="w-4 h-4 text-[#cfcfbe]" />
              <span>{t('adminDashboardTitle')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-[#f3f3ed]">
              {t('adminOverview')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#2c2c24] text-xs font-semibold text-[#cfcfbe] border border-[#3d3d32]">
              System Live & Verified
            </span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#2c2c24] p-4 rounded-xl border border-[#3d3d32] space-y-1">
            <span className="text-xs text-[#a0a090]">{t('adminPendingDocs')}</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#e8c07d] font-mono">{pendingOwners.length}</span>
              <FileCheck className="w-5 h-5 text-[#e8c07d]" />
            </div>
          </div>

          <div className="bg-[#2c2c24] p-4 rounded-xl border border-[#3d3d32] space-y-1">
            <span className="text-xs text-[#a0a090]">{t('adminTotalUsers')}</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#f3f3ed] font-mono">{users.length}</span>
              <Users className="w-5 h-5 text-[#bebea8]" />
            </div>
          </div>

          <div className="bg-[#2c2c24] p-4 rounded-xl border border-[#3d3d32] space-y-1">
            <span className="text-xs text-[#a0a090]">{t('adminActiveRequests')}</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#f3f3ed] font-mono">{requests.length}</span>
              <BarChart3 className="w-5 h-5 text-[#a8c2d6]" />
            </div>
          </div>

          <div className="bg-[#2c2c24] p-4 rounded-xl border border-[#3d3d32] space-y-1">
            <span className="text-xs text-[#a0a090]">{t('adminOpenReports')}</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#df9b94] font-mono">{pendingReports.length}</span>
              <AlertTriangle className="w-5 h-5 text-[#df9b94]" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e2d9] dark:border-[#383830] pb-2 overflow-x-auto">
        <button
          id="admin-tab-verifications"
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#deded4]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{t('adminTabVerifications')}</span>
          {pendingOwners.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#e8c07d] text-[#2c2c2c] font-bold">
              {pendingOwners.length}
            </span>
          )}
        </button>

        <button
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#deded4]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('adminTabUsers')}</span>
        </button>

        <button
          id="admin-tab-reports"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#deded4]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t('adminTabReports')}</span>
          {pendingReports.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#a84438] text-white font-bold">
              {pendingReports.length}
            </span>
          )}
        </button>

        <button
          id="admin-tab-categories"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#deded4]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('adminTabCategories')}</span>
        </button>

        <button
          id="admin-tab-stats"
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-[#5a5a40] text-white shadow-xs'
              : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#deded4]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('adminTabStats')}</span>
        </button>
      </div>

      {/* TAB 1: OWNER DOCUMENT VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {language === 'ar' ? 'بوابة توثيق أصحاب طلبات المساعدة' : 'Owner Document Verification & Approval Portal'}
                </h3>
                <p className="text-xs text-[#7c7c6e]">
                  {language === 'ar'
                    ? 'فحص الوثائق المرفقة، وتوثيق أصحاب الطلبات (adminApproveOwner) أو رفض التوثيق مع ذكر السبب (adminRejectOwner).'
                    : 'Inspect uploaded eligibility documents, approve help seekers (adminApproveOwner), or reject with feedback (adminRejectOwner).'}
                </p>
              </div>

              {/* Sub-filter tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#f8f8f5] dark:bg-[#2c2c24] rounded-xl border border-[#e2e2d9] dark:border-[#383830] text-xs">
                <button
                  onClick={() => setOwnerVerifFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    ownerVerifFilter === 'pending'
                      ? 'bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-xs'
                      : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
                  }`}
                >
                  <span>{language === 'ar' ? 'بانتظار المراجعة' : 'Pending'}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]">
                    {pendingOwners.length}
                  </span>
                </button>

                <button
                  onClick={() => setOwnerVerifFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    ownerVerifFilter === 'approved'
                      ? 'bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-xs'
                      : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
                  }`}
                >
                  <span>{language === 'ar' ? 'المعتمدون' : 'Approved'}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]">
                    {approvedOwners.length}
                  </span>
                </button>

                <button
                  onClick={() => setOwnerVerifFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    ownerVerifFilter === 'rejected'
                      ? 'bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-xs'
                      : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
                  }`}
                >
                  <span>{language === 'ar' ? 'المرفوضون' : 'Rejected'}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94]">
                    {rejectedOwners.length}
                  </span>
                </button>

                <button
                  onClick={() => setOwnerVerifFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    ownerVerifFilter === 'all'
                      ? 'bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-xs'
                      : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
                  }`}
                >
                  {language === 'ar' ? 'الكل' : 'All'} ({allOwners.length})
                </button>
              </div>
            </div>

            {displayedVerifOwners.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#5a5a40] dark:text-[#a8a880] mx-auto" />
                <p className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                  {ownerVerifFilter === 'pending'
                    ? (language === 'ar' ? 'لا توجد طلبات توثيق معلقة حالياً' : 'All owner verification requests have been processed!')
                    : (language === 'ar' ? 'لا توجد حسابات تطابق هذا التصنيف' : 'No accounts found under this category.')}
                </p>
                <p className="text-xs text-[#7c7c6e]">
                  {language === 'ar' ? 'قائمة المراجعة مكتملة ومنتظمة.' : 'The verification queue is up to date.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedVerifOwners.map((owner) => (
                  <div
                    key={owner.id}
                    className="p-5 rounded-xl border border-[#e2e2d9] dark:border-[#383830] bg-[#f8f8f5] dark:bg-[#2c2c24] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={owner.avatar}
                          alt={owner.fullName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#e8c07d]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                              {owner.fullName}
                            </h4>
                            <span className="text-xs text-[#7c7c6e]">(@{owner.username})</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                owner.ownerStatus === 'approved'
                                  ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                                  : owner.ownerStatus === 'rejected'
                                  ? 'bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94]'
                                  : 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
                              }`}
                            >
                              {owner.ownerStatus}
                            </span>
                          </div>
                          <p className="text-xs text-[#5c5c50] dark:text-[#cfcfbe]">
                            {owner.organizationOrJob || 'Help Seeker'} • {owner.locationCity || 'Cairo'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[#7c7c6e] mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#5a5a40] dark:text-[#a8a880]" />
                              {owner.mobileNumber || 'N/A'}
                            </span>
                            {owner.instaPayHandle && (
                              <span className="flex items-center gap-1 font-mono text-[#5a5a40] dark:text-[#a8a880]">
                                <DollarSign className="w-3 h-3" />
                                {owner.instaPayHandle}
                              </span>
                            )}
                          </div>
                          {owner.rejectionReason && (
                            <p className="text-[11px] text-[#7a2e26] dark:text-[#df9b94] mt-1 bg-[#f5e4e2] dark:bg-[#3d2624] px-2 py-0.5 rounded inline-block">
                              {language === 'ar' ? 'سبب الرفض السابق: ' : 'Previous rejection reason: '} {owner.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Document Viewer Button */}
                      {owner.verificationDocument && (
                        <button
                          onClick={() =>
                            setSelectedDocPreview({
                              url: owner.verificationDocument!.url,
                              name: owner.verificationDocument!.name,
                              ownerName: owner.fullName,
                            })
                          }
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] border border-[#d8d8cc] dark:border-[#3d3d32] hover:bg-[#eaeae2] flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                          <span>{t('adminViewDoc')} ({owner.verificationDocument.name})</span>
                        </button>
                      )}
                    </div>

                    {/* Rejection Note & Actions */}
                    <div className="pt-3 border-t border-[#ecece4] dark:border-[#33332a] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'سبب الرفض (في حال عدم القبول)' : 'Optional rejection reason'}
                        value={rejectionNotes[owner.id] ?? (owner.rejectionReason || '')}
                        onChange={(e) =>
                          setRejectionNotes({
                            ...rejectionNotes,
                            [owner.id]: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(owner.id)}
                          className="px-5 py-2 rounded-xl font-bold text-white bg-[#5a5a40] hover:bg-[#484833] flex items-center gap-1.5 shadow-xs cursor-pointer"
                          title="adminApproveOwner"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('adminApproveOwner')}</span>
                        </button>

                        <button
                          onClick={() => handleReject(owner.id)}
                          className="px-4 py-2 rounded-xl font-bold text-[#7a2e26] dark:text-[#df9b94] bg-[#f5e4e2] dark:bg-[#3d2624] hover:bg-[#ebd0cc] flex items-center gap-1.5 cursor-pointer"
                          title="adminRejectOwner"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{t('adminRejectOwner')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & ACCESS CONTROL */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                {t('adminTabUsers')} ({users.length})
              </h3>
              <p className="text-xs text-[#7c7c6e]">
                {language === 'ar' ? 'إدارة حسابات المتطوعين، أصحاب الطلبات، وصلاحيات التوثيق والإشراف.' : 'Manage accounts, verification status, and moderation permissions.'}
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-[#7c7c6e]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search user or email...'}
                className="pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-1.5 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#7c7c6e] border-b border-[#e2e2d9] dark:border-[#383830]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Location / Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Volunteer Stats / Docs</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ecece4] dark:divide-[#33332a]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8f8f5] dark:hover:bg-[#2c2c24]/60 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">{u.fullName}</p>
                          <p className="text-[11px] text-[#7c7c6e]">@{u.username} • {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${
                          u.role === 'admin'
                            ? 'bg-[#e5dce8] text-[#4d3654] dark:bg-[#322338] dark:text-[#d3bcd9]'
                            : u.role === 'owner'
                            ? 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
                            : 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-[#5c5c50] dark:text-[#cfcfbe]">
                      <p>{u.locationCity || 'N/A'}</p>
                      <p className="text-[10px] text-[#7c7c6e]">{u.mobileNumber || 'Private'}</p>
                    </td>
                    <td className="p-3">
                      {Boolean(u.isSuspended || (u as any).isBanned) ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94] font-bold text-[10px] inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          {language === 'ar' ? 'محظور' : 'Banned'}
                        </span>
                      ) : u.role === 'owner' ? (
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            u.ownerStatus === 'approved'
                              ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                              : u.ownerStatus === 'rejected'
                              ? 'bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94]'
                              : 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
                          }`}
                        >
                          {u.ownerStatus || 'pending'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] font-bold text-[10px]">
                          {language === 'ar' ? 'نشط' : 'Active'}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.role === 'volunteer' ? (
                        <div>
                          <p className="font-semibold text-[#5a5a40] dark:text-[#a8a880]">{u.volunteerHours || 0} hrs</p>
                          <p className="text-[10px] text-[#7c7c6e]">{u.volunteerPoints || 0} pts • ★ {u.rating || 5.0}</p>
                        </div>
                      ) : u.role === 'owner' && u.verificationDocument ? (
                        <button
                          onClick={() =>
                            setSelectedDocPreview({
                              url: u.verificationDocument!.url,
                              name: u.verificationDocument!.name,
                              ownerName: u.fullName,
                            })
                          }
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#5a5a40] dark:text-[#a8a880] hover:underline cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{u.verificationDocument.name}</span>
                        </button>
                      ) : (
                        <span className="text-[#7c7c6e]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === 'owner' && (
                          <>
                            {u.ownerStatus !== 'approved' && (
                              <button
                                onClick={() => handleApprove(u.id)}
                                title="Approve Owner (adminApproveOwner)"
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] hover:bg-[#cbd5c3] flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{language === 'ar' ? 'توثيق' : 'Approve'}</span>
                              </button>
                            )}
                            {u.ownerStatus !== 'rejected' && (
                              <button
                                onClick={() => handleReject(u.id)}
                                title="Reject Owner (adminRejectOwner)"
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94] hover:bg-[#ebd0cc] flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>{language === 'ar' ? 'رفض' : 'Reject'}</span>
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (toggleUserBan) {
                              toggleUserBan(u.id);
                            } else if (adminSuspendUser) {
                              adminSuspendUser(u.id, !Boolean(u.isSuspended || (u as any).isBanned));
                            }
                          }}
                          disabled={u.id === currentUser?.id}
                          title={u.id === currentUser?.id ? 'Cannot ban your own account' : undefined}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            Boolean(u.isSuspended || (u as any).isBanned)
                              ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] hover:bg-[#cbd5c3]'
                              : 'bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94] hover:bg-[#ebd0cc]'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {Boolean(u.isSuspended || (u as any).isBanned) ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>{t('unbanUser')}</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>{t('banUser')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT MODERATION & REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {t('adminTabReports')} ({reports.length})
            </h3>
            <p className="text-xs text-[#7c7c6e]">
              {language === 'ar' ? 'متابعة البلاغات والشكاوى المتعلقة بالطلبات والمنشورات المخالفة.' : 'Review reports filed against spam, abuse, or fraud.'}
            </p>
          </div>

          {reports.length === 0 ? (
            <p className="text-xs text-[#7c7c6e] py-8 text-center">No reports submitted.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-[#e2e2d9] dark:border-[#383830] bg-[#f8f8f5] dark:bg-[#2c2c24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#f5e4e2] text-[#7a2e26] dark:bg-[#3d2624] dark:text-[#df9b94] font-bold uppercase text-[10px]">
                        {rep.reason.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-[#2c2c2c] dark:text-[#f3f3ed]">
                        Target Type: {rep.type} (ID: {rep.targetId})
                      </span>
                    </div>
                    {rep.details && <p className="text-[#5c5c50] dark:text-[#cfcfbe]">"{rep.details}"</p>}
                    <p className="text-[10px] text-[#7c7c6e]">
                      Reported by: {rep.reportedByName} • {new Date(rep.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleReportAction(rep.id, 'resolved', 'delete_request')}
                          className="px-3 py-1.5 rounded-lg font-bold text-white bg-[#a84438] hover:bg-[#8f392f] text-xs cursor-pointer"
                        >
                          Remove Request
                        </button>
                        <button
                          onClick={() => handleReportAction(rep.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-lg font-semibold bg-[#eaeae2] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#deded4] text-xs cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#eaeae2] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] capitalize">
                        {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {t('adminTabCategories')}
            </h3>
            <p className="text-xs text-[#7c7c6e]">
              {language === 'ar' ? 'إضافة أو تعطيل مجالات التطوع المتاحة على المنصة.' : 'Add and manage volunteer categories.'}
            </p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-[#f8f8f5] dark:bg-[#2c2c24] border border-[#e2e2d9] dark:border-[#383830] flex flex-col sm:flex-row items-end gap-3 text-xs">
            <div className="flex-1 w-full">
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                Name in English
              </label>
              <input
                type="text"
                required
                value={newCatNameEn}
                onChange={(e) => setNewCatNameEn(e.target.value)}
                placeholder="e.g. Animal Welfare"
                className="w-full px-3 py-2 rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            <div className="flex-1 w-full">
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                الاسم بالعربية
              </label>
              <input
                type="text"
                required
                value={newCatNameAr}
                onChange={(e) => setNewCatNameAr(e.target.value)}
                placeholder="مثال: رعاية الحيوان"
                className="w-full px-3 py-2 rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#5a5a40] hover:bg-[#484833] text-white rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </form>

          {/* Category List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-[#e2e2d9] dark:border-[#383830] bg-white dark:bg-[#24241f] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#f0f0ea] dark:bg-[#2e2e26] text-[#5a5a40] dark:text-[#bebea8] flex items-center justify-center flex-shrink-0">
                    <IconRenderer name={cat.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed] truncate">
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </h4>
                    <p className="text-[10px] text-[#7c7c6e] truncate">
                      {language === 'ar' ? cat.nameEn : cat.nameAr}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleCategoryStatus ? toggleCategoryStatus(cat.id) : undefined}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer flex-shrink-0 ml-2 rtl:ml-0 rtl:mr-2 ${
                    cat.isActive
                      ? 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                      : 'bg-[#eaeae2] dark:bg-[#2c2c24] text-[#7c7c6e]'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLATFORM IMPACT & STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white dark:bg-[#24241f] rounded-2xl p-6 border border-[#e2e2d9] dark:border-[#383830] shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {t('adminTabStats')}
            </h3>
            <p className="text-xs text-[#7c7c6e]">
              {language === 'ar' ? 'مؤشرات الأداء المجتمعي وإحصائيات التطوع المعتمدة.' : 'Community metrics, hours, and feedback stats.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#e2e7dc] dark:bg-[#2b3524] border border-[#cbd5c3] dark:border-[#3a4731] space-y-1">
              <span className="text-[#5c5c50] dark:text-[#bebea8]">Approved Help Seekers</span>
              <p className="text-2xl font-bold text-[#3f4a35] dark:text-[#c7d5bb] font-mono">{approvedOwners.length}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#dde4ea] dark:bg-[#222d36] border border-[#c5d3df] dark:border-[#31414e] space-y-1">
              <span className="text-[#5c5c50] dark:text-[#bebea8]">Active Volunteers</span>
              <p className="text-2xl font-bold text-[#2c3d4a] dark:text-[#a8c2d6] font-mono">
                {users.filter((u) => u.role === 'volunteer').length}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#eae5d8] dark:bg-[#383327] border border-[#d8cebe] dark:border-[#4d4432] space-y-1">
              <span className="text-[#5c5c50] dark:text-[#bebea8]">Total Volunteer Hours Logged</span>
              <p className="text-2xl font-bold text-[#544834] dark:text-[#dfd4be] font-mono">
                {users.reduce((acc, u) => acc + (u.volunteerHours || 0), 0)} Hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a16]/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e2e2d9] dark:border-[#383830] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                  {selectedDocPreview.ownerName} — {selectedDocPreview.name}
                </h4>
                <p className="text-xs text-[#7c7c6e]">Verification Document (Confidential)</p>
              </div>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="p-1 text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-[#f8f8f5] dark:bg-[#2c2c24] p-4 max-h-[60vh] flex items-center justify-center border border-[#ecece4] dark:border-[#33332a]">
              <img
                src={selectedDocPreview.url}
                alt="Document preview"
                className="max-h-[50vh] object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 bg-[#eaeae2] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] rounded-xl text-xs font-semibold hover:bg-[#deded4] cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
