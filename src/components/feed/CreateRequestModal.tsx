import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileImage,
  AlertTriangle,
  Heart,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UrgencyLevel } from '../../types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, language, categories, currentUser, createRequest } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'medical');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [volunteersNeeded, setVolunteersNeeded] = useState(1);
  const [locationCity, setLocationCity] = useState(currentUser?.locationCity || 'Cairo');
  const [locationDistrict, setLocationDistrict] = useState(currentUser?.locationDistrict || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [isDonationRequested, setIsDonationRequested] = useState(false);
  const [donationGoal, setDonationGoal] = useState<number | ''>('');
  const [ownerInstaPay, setOwnerInstaPay] = useState(currentUser?.instaPayHandle || '');
  const [mobileVisibility, setMobileVisibility] = useState<'accepted_only' | 'registered' | 'public'>('accepted_only');
  const [images, setImages] = useState<string[]>([]);
  const [imageName, setImageName] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Dedicated notice if a volunteer opens this modal
  if (currentUser.role === 'volunteer') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1a1a16]/80 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-[#e2e2d9] dark:border-[#383830] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-[#8c5a2c]" />
          </div>

          <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {language === 'ar' ? 'نشر الطلبات غير متاح للمتطوعين' : 'Volunteers Cannot Create Help Requests'}
          </h3>

          <p className="text-xs text-[#6e6e62] dark:text-[#a4a496] leading-relaxed">
            {language === 'ar'
              ? 'حسابك مسجل كـ "متطوع" لتقديم المساعدة وإنجاز المهام. نشر طلبات المساعدة مخصص لحسابات طالبي المساعدة والمستفيدين والمشرفين فقط.'
              : 'Your account is registered as a Volunteer to offer help. Publishing help requests is designated exclusively for Help Seekers (Beneficiaries) and Administrators.'}
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#5a5a40] hover:bg-[#484833] text-white shadow-xs transition cursor-pointer"
          >
            {language === 'ar' ? 'تصفح الفرص التطوعية' : 'Browse Volunteer Opportunities'}
          </button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImages([url]);
      setImageName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'volunteer') return;
    if (!title.trim() || !description.trim()) return;

    const skills = skillsInput
      ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : ['General Assistance'];

    createRequest({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      urgency,
      volunteersNeeded: Number(volunteersNeeded) || 1,
      ownerCity: locationCity,
      ownerDistrict: locationDistrict.trim() || undefined,
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: scheduledTime.trim() || undefined,
      requiredSkills: skills,
      images: images.length > 0 ? images : undefined,
      isDonationRequested,
      donationGoal: isDonationRequested && donationGoal ? Number(donationGoal) : undefined,
      ownerInstaPay: isDonationRequested ? ownerInstaPay : undefined,
      ownerMobileVisibility: mobileVisibility,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1a1a16]/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#24241f] rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#e2e2d9] dark:border-[#383830] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-lg text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#eaeae2] text-[#5a5a40] dark:bg-[#2c2c24] dark:text-[#bebea8] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-[#a84438]" />
          </div>
          <h3 className="text-xl font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
            {t('createRequestModalTitle')}
          </h3>
          <p className="text-xs text-[#7c7c6e]">
            {language === 'ar'
              ? 'انشر طلبك وسيتم إشعاره للمتطوعين المتوافقين في منطقتك'
              : 'Post your need to reach compassionate, verified volunteers in your area'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
              {t('fieldRequestTitle')} <span className="text-[#a84438]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need volunteer for hospital transport / مساعدة في توصيل أدوية لمريض"
              className="w-full px-3.5 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
              {t('fieldRequestDescription')} <span className="text-[#a84438]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('fieldRequestDescPlaceholder')}
              className="w-full p-3 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40] resize-none"
            ></textarea>
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('fieldCategory')} <span className="text-[#a84438]">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('fieldUrgency')} <span className="text-[#a84438]">*</span>
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              >
                <option value="low">{t('urgencyLow')}</option>
                <option value="medium">{t('urgencyMedium')}</option>
                <option value="high">{t('urgencyHigh')}</option>
                <option value="emergency">{t('urgencyEmergency')}</option>
              </select>
            </div>
          </div>

          {/* Location & Volunteers Needed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('locationCityRequired')} <span className="text-[#a84438]">*</span>
              </label>
              <select
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
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
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('locationDistrictLabel')}
              </label>
              <input
                type="text"
                value={locationDistrict}
                onChange={(e) => setLocationDistrict(e.target.value)}
                placeholder="e.g. Nasr City"
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('fieldVolunteersNeeded')} <span className="text-[#a84438]">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={volunteersNeeded}
                onChange={(e) => setVolunteersNeeded(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>
          </div>

          {/* Date & Time & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('fieldScheduledDate')}
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('fieldScheduledTime')}
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="e.g. 4:00 PM / عصراً"
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                {t('skillsLabel')}
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Driving, First Aid"
                className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>
          </div>

          {/* Image Proof (Optional) */}
          <div>
            <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
              {language === 'ar' ? 'صورة توضيحية أو إثبات حالة (اختياري)' : 'Photo / Prescription / Context Image (Optional)'}
            </label>
            <div className="border border-dashed border-[#d8d8cc] dark:border-[#3d3d32] rounded-xl p-3 text-center bg-[#f8f8f5] dark:bg-[#2c2c24]">
              <input
                type="file"
                id="request-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="request-image-upload" className="cursor-pointer flex items-center justify-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#7c7c6e]" />
                <span className="text-[#4d4d42] dark:text-[#cfcfbe]">
                  {imageName ? imageName : (language === 'ar' ? 'اختر صورة من جهازك' : 'Choose image')}
                </span>
              </label>
            </div>
          </div>

          {/* Financial Aid / InstaPay Option */}
          <div className="p-4 rounded-xl bg-[#f8f8f5] dark:bg-[#2c2c24] border border-[#e2e2d9] dark:border-[#383830] space-y-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
              <input
                type="checkbox"
                checked={isDonationRequested}
                onChange={(e) => setIsDonationRequested(e.target.checked)}
                className="w-4 h-4 text-[#5a5a40] rounded focus:ring-[#5a5a40]"
              />
              <span>{t('requestFinancialDonation')}</span>
            </label>

            {isDonationRequested && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                    {t('donationGoal')} (EGP / ج.م)
                  </label>
                  <input
                    type="number"
                    value={donationGoal}
                    onChange={(e) => setDonationGoal(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
                    {t('instaPayLink')}
                  </label>
                  <input
                    type="text"
                    value={ownerInstaPay}
                    onChange={(e) => setOwnerInstaPay(e.target.value)}
                    placeholder="e.g. user@instapay"
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Phone Settings */}
          <div>
            <label className="block font-semibold text-[#4d4d42] dark:text-[#cfcfbe] mb-1">
              {language === 'ar' ? 'إعدادات خصوصية رقم الهاتف' : 'Phone Privacy Setting'}
            </label>
            <select
              value={mobileVisibility}
              onChange={(e) => setMobileVisibility(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
            >
              <option value="accepted_only">{language === 'ar' ? 'فقط للمتطوع المقبول رسمياً (الأكثر أماناً)' : 'Only accepted volunteers (Recommended & Most Secure)'}</option>
              <option value="registered">{language === 'ar' ? 'لجميع الأعضاء المسجلين' : 'All registered members'}</option>
              <option value="public">{language === 'ar' ? 'عام (ظاهر للجميع)' : 'Public'}</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold bg-[#eaeae2] dark:bg-[#2c2c24] text-[#4d4d42] dark:text-[#cfcfbe] hover:bg-[#dfdfe2] cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#5a5a40] hover:bg-[#484833] shadow-md shadow-[#5a5a40]/20 cursor-pointer"
            >
              {t('submitRequest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
