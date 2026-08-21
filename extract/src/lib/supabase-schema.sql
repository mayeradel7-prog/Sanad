-- ==============================================================================
-- SANAD VOLUNTEER PLATFORM - ROBUST PRODUCTION SUPABASE SQL SCHEMA
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('volunteer', 'owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE owner_verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'emergency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('open', 'volunteer_assigned', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled_by_volunteer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
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

-- 4. CATEGORIES TABLE
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

-- 5. HELP REQUESTS TABLE
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

-- 6. VOLUNTEER APPLICATIONS TABLE
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

-- 7. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONVERSATIONS & MESSAGES TABLES
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

-- 9. REVIEWS TABLE
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

-- 10. REPORTS TABLE
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

-- 11. NOTIFICATIONS TABLE
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

-- 12. POINT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.point_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason_en TEXT NOT NULL,
    reason_ar TEXT NOT NULL,
    type TEXT DEFAULT 'earn',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BADGES TABLE
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    icon TEXT NOT NULL,
    points_required INTEGER NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FAST PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_category ON public.help_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_owner ON public.help_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_applications_request ON public.volunteer_applications(request_id);
CREATE INDEX IF NOT EXISTS idx_applications_volunteer ON public.volunteer_applications(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_request ON public.comments(request_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
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
ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to prevent conflicts on re-execution
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public read badges" ON public.badges;
DROP POLICY IF EXISTS "Public read help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Authenticated create requests" ON public.help_requests;
DROP POLICY IF EXISTS "Owner/Admin update requests" ON public.help_requests;
DROP POLICY IF EXISTS "Owner/Admin delete requests" ON public.help_requests;
DROP POLICY IF EXISTS "View applications" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Volunteer create application" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Update application" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Public read comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated insert comments" ON public.comments;
DROP POLICY IF EXISTS "Delete own comment or admin" ON public.comments;
DROP POLICY IF EXISTS "View conversations" ON public.conversations;
DROP POLICY IF EXISTS "Create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Update conversations" ON public.conversations;
DROP POLICY IF EXISTS "View messages" ON public.messages;
DROP POLICY IF EXISTS "Send messages" ON public.messages;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Create reports" ON public.reports;
DROP POLICY IF EXISTS "Admin view/manage reports" ON public.reports;
DROP POLICY IF EXISTS "User notifications" ON public.notifications;
DROP POLICY IF EXISTS "User view point logs" ON public.point_logs;

-- Profiles policies
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories & Badges policies
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public read badges" ON public.badges FOR SELECT USING (true);

-- Help Requests policies
CREATE POLICY "Public read help requests" ON public.help_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated create requests" ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner/Admin update requests" ON public.help_requests FOR UPDATE USING (
    auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Owner/Admin delete requests" ON public.help_requests FOR DELETE USING (
    auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Applications policies
CREATE POLICY "View applications" ON public.volunteer_applications FOR SELECT USING (
    auth.uid() = volunteer_id OR 
    EXISTS (SELECT 1 FROM public.help_requests WHERE id = request_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Volunteer create application" ON public.volunteer_applications FOR INSERT WITH CHECK (auth.uid() = volunteer_id);
CREATE POLICY "Update application" ON public.volunteer_applications FOR UPDATE USING (
    auth.uid() = volunteer_id OR 
    EXISTS (SELECT 1 FROM public.help_requests WHERE id = request_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comments policies
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own comment or admin" ON public.comments FOR DELETE USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Conversations & Messages policies
CREATE POLICY "View conversations" ON public.conversations FOR SELECT USING (auth.uid() = ANY(participants));
CREATE POLICY "Create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participants));
CREATE POLICY "Update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = ANY(participants));

CREATE POLICY "View messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND auth.uid() = ANY(participants))
);
CREATE POLICY "Send messages" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND auth.uid() = ANY(participants))
);

-- Reviews & Reports policies
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admin view/manage reports" ON public.reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications & Point logs policies
CREATE POLICY "User notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User view point logs" ON public.point_logs FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================================
-- FAIL-SAFE AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS INSERT
-- (Guaranteed never to crash user registration with Database Error)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_role user_role;
  v_avatar TEXT;
  v_city TEXT;
BEGIN
  -- Determine clean username
  v_username := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''), SPLIT_PART(COALESCE(NEW.email, 'user'), '@', 1));
  
  -- Prevent username duplicate key collisions by suffixing unique slice if exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username AND id != NEW.id) THEN
    v_username := v_username || '_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 6);
  END IF;

  -- Determine full name
  v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), v_username, 'Community Member');
  
  -- Determine role safely
  IF NEW.raw_user_meta_data->>'role' = 'owner' THEN
    v_role := 'owner'::user_role;
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    v_role := 'admin'::user_role;
  ELSE
    v_role := 'volunteer'::user_role;
  END IF;

  -- Determine avatar & city
  v_avatar := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''), 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80');
  v_city := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'location_city'), ''), 'Cairo');

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    role,
    avatar_url,
    mobile_number,
    organization_or_job,
    verification_doc_name,
    verification_doc_url,
    instapay_handle,
    location_city,
    location_district,
    owner_status,
    points,
    badges,
    ratings_avg,
    ratings_count
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, v_username || '@sanad.org'),
    v_username,
    v_full_name,
    v_role,
    v_avatar,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'mobile_number'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'organization_or_job'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'verification_doc_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'verification_doc_url'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'instapay_handle'), ''),
    v_city,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'location_district'), ''),
    CASE WHEN v_role = 'owner'::user_role THEN 'pending'::owner_verification_status ELSE 'approved'::owner_verification_status END,
    100,
    ARRAY['first_step'],
    5.0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Catch any unforeseen exception so auth.users signup NEVER aborts
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- GRANT PERMISSIONS
-- ==============================================================================
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- SEED INITIAL CATEGORIES & BADGES
-- ==============================================================================
INSERT INTO public.categories (id, name_en, name_ar, icon, color, description_en, description_ar, is_active)
VALUES
  ('food', 'Food & Meals', 'إطعام وتوزيع وجبات', 'Utensils', 'emerald', 'Meal prep, grocery shopping, food bank sorting and deliveries.', 'تجهيز وتوزيع الوجبات، شراء المؤن والمساعدات الغذائية.', true),
  ('elderly', 'Elderly Assistance', 'رعاية كبار السن', 'HeartHandshake', 'rose', 'Companionship, errands, home check-ins, reading, and gentle care.', 'المرافقة، قضاء الاحتياجات، الزيارات الودية والرعاية المنزلية.', true),
  ('medical', 'Medical & Health', 'رعاية صحية وطبية', 'Cross', 'red', 'Clinic escorts, medication delivery, first aid, healthcare support.', 'مرافقة العيادات، توصيل الأدوية، الإسعافات الأولية والدعم الصحي.', true),
  ('education', 'Tutoring & Literacy', 'تعليم ومحو أمية', 'BookOpen', 'blue', 'Homework help, adult literacy, digital skills, mentoring youth.', 'دروس تقوية، محو أمية للكبار، مهارات حاسوبية، إرشاد وتوجيه.', true),
  ('housing', 'Home Repair & Winterizing', 'ترميم وصيانة منازل', 'Home', 'amber', 'Light plumbing, painting, roof tarping, winter blankets delivery.', 'سباكة ودهانات خفيفة، ترميم أسقف، وتوزيع بطاطين ومستلزمات الشتاء.', true),
  ('clothing', 'Clothing & Supplies', 'كساء ومستلزمات', 'Shirt', 'indigo', 'Sorting clothes drives, distribution of seasonal coats and supplies.', 'فرز وتوزيع الملابس وتجهيز مستلزمات العائلات المتعففة.', true),
  ('crisis', 'Emergency Relief', 'إغاثة وطوارئ عاجلة', 'Flame', 'red', 'Rapid mobilization for sudden crises, hospital visits, critical aid.', 'استجابة سريعة للحالات الطارئة، الحوادث، والإنقاذ المجتمعي.', true)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active;

INSERT INTO public.badges (id, name_en, name_ar, description_en, description_ar, icon, points_required)
VALUES
  ('first_step', 'First Helping Hand', 'أول يد عون', 'Completed the first volunteer task on Sanad', 'أتم أول مهمة تطوعية على منصة سند', 'Sparkles', 50),
  ('emergency_hero', 'Rapid Responder', 'مستجيب الطوارئ السريع', 'Successfully resolved an emergency urgency request', 'استجاب وأنجز طلب طوارئ عاجل بنجاح', 'Flame', 150),
  ('hours_25', 'Bronze Contributor', 'المساهم البرونزي (25 ساعة)', 'Logged 25+ certified community volunteer hours', 'سجل أكثر من 25 ساعة تطوعية معتمدة', 'Award', 300),
  ('hours_50', 'Community Pillar', 'عماد المجتمع (50 ساعة)', 'Logged 50+ hours of dedicated community service', 'سجل أكثر من 50 ساعة خدمة مجتمعية متفانية', 'ShieldCheck', 600),
  ('top_rated', '5-Star Champion', 'بطل التقييم الممتاز', 'Maintained a 5-star rating across multiple completed tasks', 'حافظ على تقييم 5 نجوم عبر عدة مهام منجزة', 'Star', 250),
  ('mentor_master', 'Knowledge Giver', 'ناشر العلم والمعرفة', 'Completed 5+ education or tech tutoring requests', 'أنجز 5 مهام تعليمية أو تدريب تقني', 'BookOpen', 400)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  icon = EXCLUDED.icon,
  points_required = EXCLUDED.points_required;

-- ENABLE REALTIME ON KEY TABLES
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_applications;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
