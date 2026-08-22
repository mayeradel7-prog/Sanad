import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  Mail,
  Phone,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Heart,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { SupabaseService } from '../../services/supabaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'volunteer',
}) => {
  const { t, language, login, register, switchDemoUser, users } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [instaPayHandle, setInstaPayHandle] = useState('');
  const [locationCity, setLocationCity] = useState('Cairo');
  const [locationDistrict, setLocationDistrict] = useState('');
  const [organizationOrJob, setOrganizationOrJob] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [docFile, setDocFile] = useState<{ name: string; url: string } | null>(null);

  if (!isOpen) return null;

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file upload URL
      setDocFile({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!username || !password) {
          setErrorMsg(
            language === 'ar'
              ? 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور'
              : 'Please enter username/email and password'
          );
          setIsSubmitting(false);
          return;
        }
        const res = await login(username, password);
        if (!res.success) {
          setErrorMsg(res.message || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
        } else {
          onClose();
        }
      } else if (mode === 'register') {
        if (!username.trim() || !fullName.trim() || !email.trim() || !password) {
          setErrorMsg(language === 'ar' ? 'يرجى ملء جميع الحقول الإجبارية' : 'Please fill all required fields');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg(
            language === 'ar'
              ? 'يجب ألا تقل كلمة المرور عن 6 أحرف'
              : 'Password must be at least 6 characters'
          );
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        if (role === 'owner') {
          if (!mobileNumber.trim()) {
            setErrorMsg(
              language === 'ar'
                ? 'رقم الهاتف إجباري لأصحاب طلبات المساعدة'
                : 'Mobile number is required for help seekers'
            );
            setIsSubmitting(false);
            return;
          }
          if (!docFile) {
            setErrorMsg(
              language === 'ar'
                ? 'يرجى رفع وثيقة إثبات الهوية أو العمل'
                : 'Please upload a proof of eligibility document'
            );
            setIsSubmitting(false);
            return;
          }
        }

        const skills = skillsInput
          ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
          : ['Community Support'];

        const res = await register(
          {
            username: username.trim(),
            fullName: fullName.trim(),
            email: email.trim(),
            mobileNumber: mobileNumber.trim() || undefined,
            instaPayHandle: instaPayHandle.trim() || undefined,
            locationCity,
            locationDistrict: locationDistrict.trim() || undefined,
            organizationOrJob: organizationOrJob.trim() || undefined,
            skills: role === 'volunteer' ? skills : undefined,
          },
          role,
          docFile || undefined,
          password
        );

        if (!res.success) {
          setErrorMsg(res.message || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
          setIsSubmitting(false);
          return;
        }
        const res = await SupabaseService.resetPassword(email.trim());
        if (res.error) {
          setErrorMsg(res.error.message || 'Failed to send reset email');
        } else {
          setSuccessMsg(
            language === 'ar'
              ? 'تم إرسال رابط استعادة كلمة المرور لبريدك الإلكتروني'
              : 'Password reset link sent to your email'
          );
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a16]/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e2e2d9] dark:border-[#383830] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#eaeae2] text-[#5a5a40] dark:bg-[#2c2c24] dark:text-[#bebea8] flex items-center justify-center mx-auto shadow-xs">
            {mode === 'register' && role === 'owner' ? (
              <Heart className="w-6 h-6 text-[#a84438]" />
            ) : mode === 'register' ? (
              <Sparkles className="w-6 h-6 text-[#5a5a40] dark:text-[#a8a880]" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {mode === 'login'
              ? t('tabLogin')
              : mode === 'register'
              ? t('tabRegister')
              : t('resetPasswordTitle')}
          </h3>
          <p className="text-xs text-[#7c7c6e]">
            {mode === 'login'
              ? t('authSubtitle')
              : mode === 'register'
              ? (language === 'ar' ? 'انضم إلى مجتمع سند الآمن للعطاء والمساعدة' : 'Join our verified solidarity network')
              : t('resetPasswordDesc')}
          </p>
        </div>

        {/* Mode Switch Tabs (Login / Register) */}
        {mode !== 'forgot' && (
          <div className="flex p-1 bg-[#eaeae2] dark:bg-[#2c2c24] rounded-xl mb-6 text-xs font-semibold">
            <button
              id="switch-login-tab"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#383830] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-xs'
                  : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
              }`}
            >
              {t('tabLogin')}
            </button>
            <button
              id="switch-register-tab"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#383830] text-[#2c2c2c] dark:text-[#f3f3ed] shadow-xs'
                  : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
              }`}
            >
              {t('tabRegister')}
            </button>
          </div>
        )}

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-[#f5e4e2] dark:bg-[#3d2624] border border-[#ebd0cc] dark:border-[#523431] text-[#7a2e26] dark:text-[#df9b94] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-[#e2e7dc] dark:bg-[#2b3524] border border-[#cbd5c3] dark:border-[#3a4731] text-[#3f4a35] dark:text-[#c7d5bb] text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* REGISTER: Role Selector */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe]">
                {t('chooseRoleLabel')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Volunteer Choice */}
                <div
                  id="role-select-volunteer"
                  onClick={() => setRole('volunteer')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    role === 'volunteer'
                      ? 'border-[#5a5a40] bg-[#e2e7dc]/40 dark:bg-[#2b3524]/40 ring-1 ring-[#5a5a40]'
                      : 'border-[#e2e2d9] dark:border-[#383830] hover:border-[#cfcfbe]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                    <span className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {t('roleVolunteer')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7c7c6e] leading-tight">
                    {t('roleVolDesc')}
                  </p>
                </div>

                {/* Owner Choice */}
                <div
                  id="role-select-owner"
                  onClick={() => setRole('owner')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    role === 'owner'
                      ? 'border-[#b58840] bg-[#f4ebe1]/50 dark:bg-[#3d3023]/40 ring-1 ring-[#b58840]'
                      : 'border-[#e2e2d9] dark:border-[#383830] hover:border-[#cfcfbe]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-[#a84438]" />
                    <span className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {t('roleOwner')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7c7c6e] leading-tight">
                    {t('roleOwnerDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Username & Full Name */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('fullNameLabel')} <span className="text-[#a84438]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Sarah Mansour"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
              {mode === 'login' ? (language === 'ar' ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or Email') : t('usernameLabel')}{' '}
              <span className="text-[#a84438]">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sarah_owner or tarek_vol"
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          {mode !== 'login' && (
            <div>
              <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('emailLabel')} <span className="text-[#a84438]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>
          )}

          {/* Password Fields */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe]">
                    {t('passwordLabel')} <span className="text-[#a84438]">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#5a5a40] dark:text-[#a8a880] hover:underline cursor-pointer"
                    >
                      {t('forgotPassword')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                    {t('confirmPasswordLabel')} <span className="text-[#a84438]">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              )}
            </div>
          )}

          {/* REGISTER AS OWNER SPECIFICS */}
          {mode === 'register' && role === 'owner' && (
            <div className="p-4 rounded-xl bg-[#f4ebe1]/60 dark:bg-[#3d3023]/40 border border-[#e2d5c3] dark:border-[#4d3d2e] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#704825] dark:text-[#e0b992]">
                <ShieldCheck className="w-4 h-4 text-[#94672e]" />
                <span>{language === 'ar' ? 'بيانات طالب المساعدة والتوثيق' : 'Owner & Verification Info'}</span>
              </div>

              {/* Mobile Number (REQUIRED) */}
              <div>
                <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('mobileRequiredForOwner')} <span className="text-[#a84438]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 rtl:left-auto rtl:right-3 top-3 text-[#7c7c6e]" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
                <p className="text-[10px] text-[#7c7c6e] mt-1">
                  {language === 'ar' ? 'محمي بالخصوصية: لا يظهر إلا للمتطوع المقبول رسمياً.' : 'Protected: visible only to officially accepted volunteers.'}
                </p>
              </div>

              {/* Document Upload (REQUIRED) */}
              <div>
                <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('ownerDocUploadLabel')} <span className="text-[#a84438]">*</span>
                </label>
                <div className="border-2 border-dashed border-[#d8d8cc] dark:border-[#3d3d32] rounded-lg p-3 text-center bg-white dark:bg-[#24241f] hover:bg-[#f8f8f5] transition">
                  <input
                    type="file"
                    id="owner-doc-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                  <label htmlFor="owner-doc-input" className="cursor-pointer space-y-1 block">
                    <UploadCloud className="w-6 h-6 text-[#7c7c6e] mx-auto" />
                    {docFile ? (
                      <p className="text-xs font-semibold text-[#5a5a40] dark:text-[#a8a880] flex items-center justify-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {docFile.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-[#4d4d42] dark:text-[#cfcfbe]">
                          {language === 'ar' ? 'اضغط لرفع وثيقة التوثيق' : 'Click to select ID / syndicate document'}
                        </p>
                        <p className="text-[10px] text-[#7c7c6e]">{t('ownerDocUploadHelp')}</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Optional Job/Org */}
              <div>
                <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {language === 'ar' ? 'المهنة أو جهة العمل/الجمعية (اختياري)' : 'Job Title / Organization (Optional)'}
                </label>
                <input
                  type="text"
                  value={organizationOrJob}
                  onChange={(e) => setOrganizationOrJob(e.target.value)}
                  placeholder="e.g. Doctor, Social Worker, Family Guardian"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              {/* Optional InstaPay */}
              <div>
                <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('instaPayOptional')}
                </label>
                <input
                  type="text"
                  value={instaPayHandle}
                  onChange={(e) => setInstaPayHandle(e.target.value)}
                  placeholder="e.g. username@instapay"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                    {t('locationCityRequired')}
                  </label>
                  <select
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  >
                    <option value="Cairo">Cairo (القاهرة)</option>
                    <option value="Giza">Giza (الجيزة)</option>
                    <option value="Alexandria">Alexandria (الإسكندرية)</option>
                    <option value="Mansoura">Mansoura (المنصورة)</option>
                    <option value="Tanta">Tanta (طنطا)</option>
                    <option value="Assiut">Assiut (أسيوط)</option>
                    <option value="Other">Other (أخرى)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                    {t('locationDistrictLabel')}
                  </label>
                  <input
                    type="text"
                    value={locationDistrict}
                    onChange={(e) => setLocationDistrict(e.target.value)}
                    placeholder="e.g. Nasr City"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* REGISTER AS VOLUNTEER SPECIFICS */}
          {mode === 'register' && role === 'volunteer' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                  {t('skillsLabel')}
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. First Aid, Driving, Tutoring, Food Packaging"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                    {t('locationCityRequired')}
                  </label>
                  <select
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  >
                    <option value="Cairo">Cairo (القاهرة)</option>
                    <option value="Giza">Giza (الجيزة)</option>
                    <option value="Alexandria">Alexandria (الإسكندرية)</option>
                    <option value="Mansoura">Mansoura (المنصورة)</option>
                    <option value="Tanta">Tanta (طنطا)</option>
                    <option value="Assiut">Assiut (أسيوط)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                    {t('locationDistrictLabel')}
                  </label>
                  <input
                    type="text"
                    value={locationDistrict}
                    onChange={(e) => setLocationDistrict(e.target.value)}
                    placeholder="e.g. Maadi"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-[#5a5a40] hover:bg-[#484833] disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-md shadow-[#5a5a40]/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'ar' ? 'جارٍ التحميل...' : 'Please wait...'}</span>
              </>
            ) : mode === 'login' ? (
              t('login')
            ) : mode === 'register' ? (
              t('register')
            ) : (
              t('sendResetLink')
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full py-1 text-xs text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer"
            >
              {t('backToLogin')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
