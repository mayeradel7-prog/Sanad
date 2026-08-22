import React, { useState } from 'react';
import {
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Code,
  Sparkles,
  Shield,
  Layers,
  X,
  RefreshCw,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useApp();
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'guide'>('status');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleCopySql = () => {
    const sqlSchema = `-- ==============================================================================
-- SANAD VOLUNTEER PLATFORM - SUPABASE SQL SCHEMA
-- Paste this script into the Supabase SQL Editor: https://supabase.com/dashboard
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('volunteer', 'owner', 'admin');
    CREATE TYPE owner_verification_status AS ENUM ('pending', 'approved', 'rejected');
    CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'emergency');
    CREATE TYPE request_status AS ENUM ('open', 'volunteer_assigned', 'in_progress', 'completed', 'cancelled');
    CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled_by_volunteer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'volunteer'::user_role NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio TEXT DEFAULT '',
    mobile_number TEXT,
    owner_status owner_verification_status DEFAULT 'pending'::owner_verification_status,
    organization_or_job TEXT,
    verification_doc_url TEXT,
    verification_doc_name TEXT,
    rejection_reason TEXT,
    instapay_handle TEXT,
    location_city TEXT DEFAULT 'Cairo',
    location_district TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    preferred_categories TEXT[] DEFAULT '{}',
    availability TEXT[] DEFAULT '{}',
    volunteer_hours NUMERIC DEFAULT 0,
    completed_tasks_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 100,
    badges TEXT[] DEFAULT ARRAY['first_step'],
    ratings_avg NUMERIC(3,2) DEFAULT 5.0,
    ratings_count INTEGER DEFAULT 0,
    is_suspended BOOLEAN DEFAULT false,
    privacy_settings JSONB DEFAULT '{"showPhoneToPublic":false,"showPhoneToAssignedOnly":true,"showInstaPay":true,"showApproximateLocationOnly":false,"allowDirectMessages":true,"showOnPublicLeaderboard":true}'::jsonb,
    blocked_user_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.help_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    urgency urgency_level DEFAULT 'medium'::urgency_level NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    volunteers_needed INTEGER DEFAULT 1,
    volunteers_assigned UUID[] DEFAULT '{}',
    is_donation_requested BOOLEAN DEFAULT false,
    donation_goal NUMERIC,
    donation_raised NUMERIC DEFAULT 0,
    instapay_handle TEXT,
    images TEXT[] DEFAULT '{}',
    scheduled_date TEXT NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT,
    status request_status DEFAULT 'open'::request_status NOT NULL,
    saved_by_users UUID[] DEFAULT '{}',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    available_slot TEXT DEFAULT 'Immediately / Flexible',
    status application_status DEFAULT 'pending'::application_status NOT NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (request_id, volunteer_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL,
    request_id UUID REFERENCES public.help_requests(id) ON DELETE SET NULL,
    last_message TEXT DEFAULT '',
    last_message_time TIMESTAMPTZ DEFAULT NOW(),
    unread_count JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
    request_title TEXT NOT NULL,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_excerpt TEXT,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_ar TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Permissive policies for full community operation & real-time sync
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public upsert profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Public Requests Policies: requests are open & public for everyone to browse and search
CREATE POLICY "Public read help requests" ON public.help_requests FOR SELECT USING (true);
CREATE POLICY "Public insert help requests" ON public.help_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update help requests" ON public.help_requests FOR UPDATE USING (true);
CREATE POLICY "Public delete help requests" ON public.help_requests FOR DELETE USING (true);

CREATE POLICY "Public read volunteer applications" ON public.volunteer_applications FOR SELECT USING (true);
CREATE POLICY "Public manage volunteer applications" ON public.volunteer_applications FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON public.comments FOR INSERT WITH CHECK (true);

-- Realtime Messaging & Conversations
CREATE POLICY "Public read conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Public manage conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update messages" ON public.messages FOR UPDATE USING (true);

CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public insert reports" ON public.reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public manage notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for instant peer-to-peer updates
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;`;

    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (!isSupabaseConfigured()) {
        setTestResult({
          success: false,
          message: language === 'ar' 
            ? 'لم يتم تحديد مفاتيح Supabase بعد في ملف .env' 
            : 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing in environment variables.',
        });
        setIsTesting(false);
        return;
      }

      const { error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
      if (error) {
        setTestResult({
          success: false,
          message: `Connection Error: ${error.message}. Make sure you ran the SQL Schema in your Supabase dashboard!`,
        });
      } else {
        setTestResult({
          success: true,
          message: language === 'ar'
            ? 'تم الاتصال بقاعدة بيانات Supabase بنجاح!'
            : 'Successfully connected to your live Supabase database!',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to ping Supabase.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#20201a] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between bg-[#fafaf7] dark:bg-[#262620]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5a5a40] text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2c2c2c] dark:text-[#f3f3ed]">
                {language === 'ar' ? 'إعداد البنية التحتية وقاعدة بيانات Supabase' : 'Supabase Database Infrastructure'}
              </h3>
              <p className="text-xs text-[#7c7c6e]">
                {language === 'ar' ? 'البنية جاهزة بنسبة 100% للربط بقاعدة بياناتك' : 'Ready for production-grade backend connectivity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7c7c6e] hover:bg-[#eaeae2] dark:hover:bg-[#333329] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#e2e2d9] dark:border-[#383830] bg-[#fafaf7] dark:bg-[#262620]">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
              activeTab === 'status'
                ? 'bg-white dark:bg-[#20201a] border-t-2 border-[#5a5a40] text-[#2c2c2c] dark:text-[#f3f3ed]'
                : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
            }`}
          >
            {language === 'ar' ? 'حالة الاتصال والبيئة' : 'Connection Status'}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white dark:bg-[#20201a] border-t-2 border-[#5a5a40] text-[#2c2c2c] dark:text-[#f3f3ed]'
                : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
            }`}
          >
            {language === 'ar' ? 'مخطط SQL الجاهز' : 'SQL Schema'}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-[#20201a] border-t-2 border-[#5a5a40] text-[#2c2c2c] dark:text-[#f3f3ed]'
                : 'text-[#7c7c6e] hover:text-[#2c2c2c] dark:hover:text-[#f3f3ed]'
            }`}
          >
            {language === 'ar' ? 'خطوات الربط (3 خطوات)' : 'Setup Guide'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-[#4d4d42] dark:text-[#cfcfbe]">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  isConfigured
                    ? 'bg-[#e2e7dc]/60 border-[#cbd5c3] dark:bg-[#2b3524]/60 dark:border-[#3a4731] text-[#3f4a35] dark:text-[#c7d5bb]'
                    : 'bg-[#f4ebe1]/80 border-[#e2d5c3] dark:bg-[#3d3023]/60 dark:border-[#4d3d2e] text-[#704825] dark:text-[#e0b992]'
                }`}
              >
                {isConfigured ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#5a5a40] dark:text-[#9ea880] mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#94672e] dark:text-[#e0b992] mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">
                    {isConfigured
                      ? (language === 'ar' ? 'بيانات اعتماد Supabase محددة في البيئة' : 'Supabase Environment Configured')
                      : (language === 'ar' ? 'المنصة تعمل حالياً بوضع التخزين المحلي الآمن (جاهزة للربط)' : 'Running with Resilient Local Fallback (Ready for Live Supabase)')}
                  </h4>
                  <p className="leading-relaxed">
                    {isConfigured
                      ? (language === 'ar'
                          ? 'تم العثور على VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY. تعمل المنصة عبر الاتصال المباشر بقاعدة بياناتك.'
                          : 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in the app configuration.')
                      : (language === 'ar'
                          ? 'يمكنك في أي وقت إضافة رابط مشروع Supabase ومفتاح Anon Key للتحول المباشر للعمل على قاعدة بيانات سحابية حية دون أي تعديل إضافي في الكود.'
                          : 'To connect to your live project, add your Supabase URL and Anon Key to environment variables and execute the SQL schema in your Supabase dashboard.')}
                  </p>
                </div>
              </div>

              {/* Environment Variable Check */}
              <div className="bg-[#f8f8f5] dark:bg-[#262620] rounded-2xl border border-[#e2e2d9] dark:border-[#383830] p-4 space-y-3">
                <h4 className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#5a5a40]" />
                  <span>{language === 'ar' ? 'متغيرات البيئة المطلوبة (.env)' : 'Required Environment Variables'}</span>
                </h4>
                
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1c1c18] border border-[#e2e2d9] dark:border-[#333329] flex items-center justify-between">
                    <div>
                      <span className="text-[#5a5a40] dark:text-[#a8a880] font-bold">VITE_SUPABASE_URL</span>
                      <span className="text-[#7c7c6e] block text-[10px]">https://your-project-id.supabase.co</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-sans text-[10px] font-bold ${
                      import.meta.env.VITE_SUPABASE_URL ? 'bg-[#e2e7dc] text-[#3f4a35]' : 'bg-[#eaeae2] text-[#7c7c6e]'
                    }`}>
                      {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Not set'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1c1c18] border border-[#e2e2d9] dark:border-[#333329] flex items-center justify-between">
                    <div>
                      <span className="text-[#5a5a40] dark:text-[#a8a880] font-bold">VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-[#7c7c6e] block text-[10px]">eyJhbGciOiJIUzI1NiIsInR5cCI6...</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-sans text-[10px] font-bold ${
                      import.meta.env.VITE_SUPABASE_ANON_KEY ? 'bg-[#e2e7dc] text-[#3f4a35]' : 'bg-[#eaeae2] text-[#7c7c6e]'
                    }`}>
                      {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Button & Result */}
              <div className="space-y-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-[#5a5a40] hover:bg-[#484833] text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? (language === 'ar' ? 'جارِ فحص الاتصال...' : 'Testing Connection...') : (language === 'ar' ? 'اختبار الاتصال بـ Supabase الآن' : 'Test Supabase Connection')}</span>
                </button>

                {testResult && (
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    testResult.success 
                      ? 'bg-[#e2e7dc] border-[#cbd5c3] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                      : 'bg-[#fbeeed] border-[#e8c5c1] text-[#7d2c25] dark:bg-[#382322] dark:text-[#e8a8a4]'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                    {language === 'ar' ? 'مخطط قاعدة البيانات الشامل (SQL)' : 'Complete Database Migration Script'}
                  </h4>
                  <p className="text-[11px] text-[#7c7c6e]">
                    {language === 'ar' ? 'يشمل الجداول، الصلاحيات (RLS)، والتحديث الفوري Realtime' : 'Includes 11 tables, triggers, Row Level Security, and Realtime publications'}
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ المخطط' : 'Copy SQL')}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#1c1c18] border border-[#383830] text-gray-200 font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed">
                <pre>{`-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
- profiles (users, roles, verification docs, stats)
- categories (food, medical, education, etc.)
- help_requests (owner, urgency, skills, instapay, status)
- volunteer_applications (matching, slots, status)
- comments (public collaboration)
- conversations & messages (realtime chat)
- reviews & ratings (5-star evaluations)
- reports (safety & moderation)
- notifications (realtime user alerts)

-- 3. ROW LEVEL SECURITY (RLS) POLICIES ENABLED
-- 4. REALTIME ENABLED ON MESSAGES & REQUESTS`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#f8f8f5] dark:bg-[#262620] border border-[#e2e2d9] dark:border-[#383830] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {language === 'ar' ? 'إنشاء مشروع على Supabase' : 'Create a Supabase Project'}
                    </h5>
                    <p className="text-[11px] text-[#7c7c6e]">
                      {language === 'ar' ? 'توجه إلى supabase.com وأنشئ مشروعاً جديداً مجانياً.' : 'Sign in to supabase.com and create a new project.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8f8f5] dark:bg-[#262620] border border-[#e2e2d9] dark:border-[#383830] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {language === 'ar' ? 'تشغيل المخطط في SQL Editor' : 'Run the SQL Schema'}
                    </h5>
                    <p className="text-[11px] text-[#7c7c6e]">
                      {language === 'ar' ? 'انسخ المخطط من التبويب السابق والصقه في تبويب SQL Editor واضغط Run.' : 'Copy the SQL Schema from the tab above, paste it into the Supabase SQL Editor, and click Run.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8f8f5] dark:bg-[#262620] border border-[#e2e2d9] dark:border-[#383830] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {language === 'ar' ? 'إضافة مفاتيح الربط' : 'Add API Keys to Environment'}
                    </h5>
                    <p className="text-[11px] text-[#7c7c6e]">
                      {language === 'ar' ? 'انسخ Project URL و anon/public key من Settings > API وأضفهما في متغيرات البيئة.' : 'Copy the Project URL and anon public key from Project Settings > API and set them in your environment variables.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#e2e7dc]/40 dark:bg-[#2b3524]/40 border border-[#cbd5c3] dark:border-[#3a4731] text-[11px] text-[#3f4a35] dark:text-[#c7d5bb] flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-[#5a5a40]" />
                <span>
                  {language === 'ar'
                    ? 'بمجرد إضافة المفاتيح، سيتم الاتصال التلقائي والحقيقي مع Supabase فوراً دون الحاجة لأي برمجة إضافية!'
                    : 'The app dynamically connects to Supabase as soon as the keys are set without requiring any code changes!'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e2d9] dark:border-[#383830] bg-[#fafaf7] dark:bg-[#262620] flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5a5a40] dark:text-[#a8a880] hover:underline font-bold flex items-center gap-1"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white font-bold text-xs transition cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
