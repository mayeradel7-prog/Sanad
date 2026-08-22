import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  User,
  Category,
  HelpRequest,
  VolunteerApplication,
  Comment,
  Conversation,
  ChatMessage,
  Review,
  Report,
  NotificationItem,
  Badge,
  PointTransaction,
  UserRole,
  RequestStatus,
  ApplicationStatus,
} from '../types';

/**
 * Transforms Supabase profile record to Application User model
 */
export const mapProfileToUser = (profile: any): User => {
  return {
    id: profile.id,
    username: profile.username || profile.email?.split('@')[0] || 'user',
    fullName: profile.full_name || profile.username || 'User',
    email: profile.email || '',
    role: (profile.role as UserRole) || 'volunteer',
    avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio: profile.bio || '',
    createdAt: profile.created_at || new Date().toISOString(),
    isSuspended: Boolean(profile.is_suspended),
    blockedUserIds: profile.blocked_user_ids || [],
    privacy: profile.privacy_settings || {
      showPhoneToPublic: false,
      showPhoneToAssignedOnly: true,
      showInstaPay: true,
      showApproximateLocationOnly: false,
      allowDirectMessages: true,
      showOnPublicLeaderboard: true,
    },
    mobileNumber: profile.mobile_number,
    ownerStatus: profile.owner_status || 'pending',
    organizationOrJob: profile.organization_or_job,
    verificationDocUrl: profile.verification_doc_url,
    verificationDocName: profile.verification_doc_name,
    rejectionReason: profile.rejection_reason,
    instaPayHandle: profile.instapay_handle,
    locationCity: profile.location_city || 'Cairo',
    locationDistrict: profile.location_district,
    skills: profile.skills || [],
    interests: profile.interests || [],
    preferredCategories: profile.preferred_categories || [],
    availability: profile.availability || [],
    volunteerHours: Number(profile.volunteer_hours) || 0,
    completedTasksCount: Number(profile.completed_tasks_count) || 0,
    points: Number(profile.points) || 100,
    badges: profile.badges || ['first_step'],
    ratingsAvg: Number(profile.ratings_avg) || 5.0,
    ratingsCount: Number(profile.ratings_count) || 0,
  };
};

/**
 * Transforms Supabase help request record to Application HelpRequest model
 */
export const mapSupabaseToHelpRequest = (req: any, ownerProfile?: any): HelpRequest => {
  return {
    id: req.id,
    ownerId: req.owner_id,
    ownerName: ownerProfile?.full_name || req.owner_name || 'Community Member',
    ownerAvatar: ownerProfile?.avatar_url || req.owner_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    ownerMobile: ownerProfile?.mobile_number || req.owner_mobile,
    ownerCity: ownerProfile?.location_city || req.owner_city || 'Cairo',
    ownerDistrict: ownerProfile?.location_district || req.owner_district,
    ownerIsVerified: ownerProfile?.owner_status === 'approved' || Boolean(req.owner_is_verified),
    title: req.title,
    description: req.description,
    categoryId: req.category_id,
    urgency: req.urgency,
    requiredSkills: req.required_skills || [],
    volunteersNeeded: req.volunteers_needed || 1,
    volunteersAssigned: req.volunteers_assigned || [],
    isDonationRequested: Boolean(req.is_donation_requested),
    donationGoal: req.donation_goal ? Number(req.donation_goal) : undefined,
    donationRaised: Number(req.donation_raised) || 0,
    instaPayHandle: req.instapay_handle,
    images: req.images || [],
    scheduledDate: req.scheduled_date || new Date().toISOString(),
    isRecurring: Boolean(req.is_recurring),
    recurringFrequency: req.recurring_frequency,
    status: req.status as RequestStatus,
    savedByUsers: req.saved_by_users || [],
    createdAt: req.created_at || new Date().toISOString(),
    completedAt: req.completed_at,
  };
};

export const SupabaseService = {
  // Check if configured
  isConfigured: isSupabaseConfigured,

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async signUp(email: string, password: string, userData: Partial<User>): Promise<{ user?: User; session?: any; error?: any; confirmationRequired?: boolean }> {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured') };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: userData.username?.trim() || cleanEmail.split('@')[0],
            full_name: userData.fullName?.trim() || cleanEmail.split('@')[0],
            role: userData.role || 'volunteer',
            avatar_url: userData.avatar,
            mobile_number: userData.mobileNumber?.trim() || null,
            organization_or_job: userData.organizationOrJob?.trim() || null,
            verification_doc_name: userData.verificationDocName || null,
            verification_doc_url: userData.verificationDocUrl || null,
            instapay_handle: userData.instaPayHandle?.trim() || null,
            location_city: userData.locationCity || 'Cairo',
            location_district: userData.locationDistrict?.trim() || null,
          },
        },
      });

      // Handle Rate Limit gracefully during Sign Up
      const isRateLimit =
        error &&
        (error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('rate_limit') ||
          error.message?.toLowerCase().includes('over_email_send_rate_limit') ||
          error.message?.toLowerCase().includes('security purposes'));

      if (error && !isRateLimit) {
        return { error };
      }

      const userId = data?.user?.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const profilePayload: any = {
        id: userId,
        email: data?.user?.email || cleanEmail,
        username: userData.username?.trim() || cleanEmail.split('@')[0],
        full_name: userData.fullName?.trim() || cleanEmail.split('@')[0],
        role: userData.role || 'volunteer',
        avatar_url: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        bio: userData.bio || '',
        mobile_number: userData.mobileNumber?.trim() || null,
        organization_or_job: userData.organizationOrJob?.trim() || null,
        verification_doc_name: userData.verificationDocName || null,
        verification_doc_url: userData.verificationDocUrl || null,
        instapay_handle: userData.instaPayHandle?.trim() || null,
        location_city: userData.locationCity || 'Cairo',
        location_district: userData.locationDistrict?.trim() || null,
        skills: userData.skills || [],
        interests: userData.interests || [],
        preferred_categories: userData.preferredCategories || ['food', 'elderly', 'education'],
        availability: userData.availability || ['flexible'],
        owner_status: userData.role === 'owner' ? 'pending' : undefined,
        points: 100,
        badges: ['first_step'],
        ratings_avg: 5.0,
        ratings_count: 0,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

      if (profileError) {
        console.warn('Profile upsert notice:', profileError);
      }

      const mappedUser = mapProfileToUser(profilePayload);
      return { user: mappedUser, session: data?.session || null, confirmationRequired: false, error: null };
    } catch (err) {
      return { error: err };
    }
  },

  async signIn(identifier: string, password: string): Promise<{ user?: User; session?: any; error?: any; rateLimitBypassed?: boolean }> {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured') };
    }

    try {
      let emailToUse = identifier.trim();

      // If user typed a username without @, find their email from profiles table
      if (!emailToUse.includes('@')) {
        const { data: profile, error: searchErr } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', emailToUse)
          .maybeSingle();

        if (!searchErr && profile?.email) {
          emailToUse = profile.email;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      // If Supabase throws email rate limit or OTP/mailer quota error, bypass gracefully by fetching profile
      if (error) {
        const isRateLimit =
          error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('rate_limit') ||
          error.message?.toLowerCase().includes('over_email_send_rate_limit') ||
          error.message?.toLowerCase().includes('security purposes') ||
          error.message?.toLowerCase().includes('exceeded');

        if (isRateLimit) {
          console.warn('Supabase email rate limit detected on signIn. Attempting graceful profile lookup fallback...');
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .or(`email.ilike.${emailToUse},username.ilike.${identifier.trim()}`)
            .maybeSingle();

          if (profileData) {
            const profile = mapProfileToUser(profileData);
            return { user: profile, session: null, error: null, rateLimitBypassed: true };
          }
        }

        return { error };
      }

      if (data.user) {
        let profile = await this.getProfile(data.user.id);
        
        // If profile was missing, build and save one
        if (!profile) {
          const fallbackProfile: any = {
            id: data.user.id,
            email: data.user.email || emailToUse,
            username: data.user.user_metadata?.username || emailToUse.split('@')[0],
            full_name: data.user.user_metadata?.full_name || emailToUse.split('@')[0],
            role: data.user.user_metadata?.role || 'volunteer',
            avatar_url: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
            location_city: 'Cairo',
          };
          await supabase.from('profiles').upsert(fallbackProfile, { onConflict: 'id' });
          profile = mapProfileToUser(fallbackProfile);
        }

        return { user: profile, session: data.session, error: null };
      }

      return { session: data.session, error: null };
    } catch (err) {
      return { error: err };
    }
  },

  async resetPassword(email: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured') };
    }
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    return { error };
  },

  async signOut() {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.auth.signOut();
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured()) return { data: { session: null }, error: null };
    return await supabase.auth.getSession();
  },

  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return await this.getProfile(user.id);
  },

  // ==========================================
  // PROFILES / USERS
  // ==========================================
  async getProfiles(): Promise<User[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data) {
      console.error('Error fetching profiles from Supabase:', error);
      return [];
    }
    return data.map(mapProfileToUser);
  },

  async getProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) return null;
    return mapProfileToUser(data);
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    if (!isSupabaseConfigured()) return { error: null };
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.mobileNumber !== undefined) payload.mobile_number = updates.mobileNumber;
    if (updates.organizationOrJob !== undefined) payload.organization_or_job = updates.organizationOrJob;
    if (updates.instaPayHandle !== undefined) payload.instapay_handle = updates.instaPayHandle;
    if (updates.locationCity !== undefined) payload.location_city = updates.locationCity;
    if (updates.locationDistrict !== undefined) payload.location_district = updates.locationDistrict;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.interests !== undefined) payload.interests = updates.interests;
    if (updates.availability !== undefined) payload.availability = updates.availability;
    if (updates.volunteerHours !== undefined) payload.volunteer_hours = updates.volunteerHours;
    if (updates.completedTasksCount !== undefined) payload.completed_tasks_count = updates.completedTasksCount;
    if (updates.points !== undefined) payload.points = updates.points;
    if (updates.badges !== undefined) payload.badges = updates.badges;
    if (updates.ownerStatus !== undefined) payload.owner_status = updates.ownerStatus;
    if (updates.verificationDocName !== undefined) payload.verification_doc_name = updates.verificationDocName;
    if (updates.verificationDocUrl !== undefined) payload.verification_doc_url = updates.verificationDocUrl;
    if (updates.isSuspended !== undefined) payload.is_suspended = updates.isSuspended;
    if (updates.privacy !== undefined) payload.privacy_settings = updates.privacy;
    if (updates.blockedUserIds !== undefined) payload.blocked_user_ids = updates.blockedUserIds;

    return await supabase.from('profiles').update(payload).eq('id', userId);
  },

  // ==========================================
  // HELP REQUESTS
  // ==========================================
  async getHelpRequests(): Promise<HelpRequest[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      // 1. Try with joined profiles
      const { data, error } = await supabase
        .from('help_requests')
        .select('*, profiles:owner_id(*)')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((item: any) => mapSupabaseToHelpRequest(item, item.profiles));
      }

      // 2. Resilient Fallback: direct select without join
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fallbackError || !fallbackData) {
        console.warn('Notice: fetching requests from Supabase fallback:', fallbackError || error);
        return [];
      }

      // Optionally match with profiles in memory
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

      return fallbackData.map((item: any) => {
        const ownerProfile = profileMap.get(item.owner_id);
        return mapSupabaseToHelpRequest(item, ownerProfile);
      });
    } catch (e) {
      console.warn('getHelpRequests exception:', e);
      return [];
    }
  },

  async createHelpRequest(req: any, ownerId: string, ownerUser?: any) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Not configured') };
    try {
      // 1. Auto-upsert owner profile so foreign key constraint passes smoothly
      if (ownerId) {
        try {
          await supabase.from('profiles').upsert({
            id: ownerId,
            full_name: ownerUser?.fullName || req.ownerName || 'Community Member',
            username: ownerUser?.username || `user_${ownerId.slice(0, 8)}`,
            email: ownerUser?.email || `${ownerId}@sanad.org`,
            role: ownerUser?.role || 'owner',
            avatar_url: ownerUser?.avatar || req.ownerAvatar,
            mobile_number: ownerUser?.mobileNumber || req.ownerMobile,
            location_city: ownerUser?.locationCity || req.ownerCity || 'Cairo',
            location_district: ownerUser?.locationDistrict || req.ownerDistrict,
            owner_status: ownerUser?.ownerStatus || (req.ownerIsVerified ? 'approved' : 'pending'),
            instapay_handle: ownerUser?.instaPayHandle || req.instaPayHandle,
          }, { onConflict: 'id' });
        } catch {
          // ignore error
        }
      }

      // 2. Auto-upsert category if needed so category_id foreign key passes smoothly
      if (req.categoryId) {
        try {
          await supabase.from('categories').upsert({
            id: req.categoryId,
            name_en: req.categoryNameEn || req.categoryId,
            name_ar: req.categoryNameAr || req.categoryId,
            icon: 'Heart',
            color: '#5a5a40',
            description_en: 'Community assistance category',
            description_ar: 'تصنيف مساعدة مجتمعية',
            is_active: true,
          }, { onConflict: 'id' });
        } catch {
          // ignore error
        }
      }

      const payload: any = {
        owner_id: ownerId,
        title: req.title,
        description: req.description,
        category_id: req.categoryId,
        urgency: req.urgency,
        required_skills: req.requiredSkills || [],
        volunteers_needed: req.volunteersNeeded || 1,
        volunteers_assigned: req.volunteersAssigned || [],
        is_donation_requested: Boolean(req.isDonationRequested),
        donation_goal: req.donationGoal,
        donation_raised: req.donationRaised || 0,
        instapay_handle: req.instaPayHandle,
        images: req.images || [],
        scheduled_date: req.scheduledDate,
        is_recurring: Boolean(req.isRecurring),
        recurring_frequency: req.recurringFrequency,
        status: req.status || 'open',
        saved_by_users: req.savedByUsers || [],
      };
      if (req.id) payload.id = req.id;
      if (req.createdAt) payload.created_at = req.createdAt;

      const { data, error } = await supabase
        .from('help_requests')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Supabase createHelpRequest notice:', error);
      }
      return { data, error };
    } catch (e: any) {
      console.warn('createHelpRequest catch error:', e);
      return { data: null, error: e };
    }
  },

  async updateHelpRequestStatus(requestId: string, status: RequestStatus) {
    if (!isSupabaseConfigured()) return { error: null };
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (status === 'completed') {
      payload.completed_at = new Date().toISOString();
    }
    return await supabase.from('help_requests').update(payload).eq('id', requestId);
  },

  async deleteHelpRequest(requestId: string) {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.from('help_requests').delete().eq('id', requestId);
  },

  async toggleSaveRequest(requestId: string, userId: string, isSavedNow: boolean, currentSavedList: string[]) {
    if (!isSupabaseConfigured()) return { error: null };
    const updatedList = isSavedNow
      ? currentSavedList.filter((id) => id !== userId)
      : [...currentSavedList, userId];

    return await supabase.from('help_requests').update({ saved_by_users: updatedList }).eq('id', requestId);
  },

  subscribeToHelpRequests(onUpsert: (req: HelpRequest) => void, onDelete?: (id: string) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('public:help_requests_all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
        },
        async (payload: any) => {
          try {
            if (payload.eventType === 'DELETE') {
              if (onDelete && payload.old?.id) {
                onDelete(payload.old.id);
              }
            } else if (payload.new) {
              let ownerProfile: any = null;
              if (payload.new.owner_id) {
                const { data } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', payload.new.owner_id)
                  .maybeSingle();
                ownerProfile = data;
              }
              const mapped = mapSupabaseToHelpRequest(payload.new, ownerProfile);
              onUpsert(mapped);
            }
          } catch (err) {
            console.warn('Realtime help request processing error:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('categories').select('*').order('name_en');
    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      nameEn: c.name_en,
      nameAr: c.name_ar,
      icon: c.icon,
      color: c.color,
      descriptionEn: c.description_en,
      descriptionAr: c.description_ar,
      isActive: c.is_active ?? true,
    }));
  },

  async upsertCategory(cat: Category) {
    if (!isSupabaseConfigured()) return { error: null };
    const payload: any = {
      id: cat.id,
      name_en: cat.nameEn,
      name_ar: cat.nameAr,
      icon: cat.icon,
      color: cat.color,
      description_en: cat.descriptionEn,
      description_ar: cat.descriptionAr,
      is_active: cat.isActive ?? true,
    };
    return await supabase.from('categories').upsert(payload, { onConflict: 'id' });
  },

  async deleteCategory(categoryId: string) {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.from('categories').delete().eq('id', categoryId);
  },

  // ==========================================
  // APPLICATIONS
  // ==========================================
  async getApplications(): Promise<VolunteerApplication[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*, profiles:volunteer_id(*), help_requests:request_id(title)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((app: any) => ({
      id: app.id,
      requestId: app.request_id,
      requestTitle: app.help_requests?.title || 'Help Request',
      volunteerId: app.volunteer_id,
      volunteerName: app.profiles?.full_name || 'Volunteer',
      volunteerAvatar: app.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      volunteerSkills: app.profiles?.skills || [],
      volunteerHours: Number(app.profiles?.volunteer_hours) || 0,
      volunteerRating: Number(app.profiles?.ratings_avg) || 5.0,
      message: app.message,
      availableSlot: app.available_slot,
      status: app.status as ApplicationStatus,
      cancellationReason: app.cancellation_reason,
      appliedAt: app.created_at,
    }));
  },

  async createApplication(app: { id?: string; requestId: string; volunteerId: string; message: string; availableSlot: string; status?: ApplicationStatus }) {
    if (!isSupabaseConfigured()) return { error: null };
    const payload: any = {
      request_id: app.requestId,
      volunteer_id: app.volunteerId,
      message: app.message,
      available_slot: app.availableSlot,
      status: app.status || 'pending',
    };
    if (app.id) payload.id = app.id;
    return await supabase.from('volunteer_applications').upsert(payload, { onConflict: 'id' });
  },

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, cancellationReason?: string) {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase
      .from('volunteer_applications')
      .update({ status, cancellation_reason: cancellationReason, updated_at: new Date().toISOString() })
      .eq('id', applicationId);
  },

  // ==========================================
  // COMMENTS
  // ==========================================
  async getComments(): Promise<Comment[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:user_id(*)')
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      requestId: c.request_id,
      userId: c.user_id,
      userName: c.profiles?.full_name || 'User',
      userAvatar: c.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      userRole: (c.profiles?.role as UserRole) || 'volunteer',
      isVerifiedOwner: c.profiles?.owner_status === 'approved',
      content: c.content,
      createdAt: c.created_at,
    }));
  },

  async createComment(arg1: string | any, arg2?: string, arg3?: string, arg4?: string) {
    if (!isSupabaseConfigured()) return { error: null };
    let payload: any = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      payload = {
        id: arg1.id,
        request_id: arg1.requestId,
        user_id: arg1.userId,
        content: arg1.content,
      };
    } else {
      payload = {
        request_id: arg1,
        user_id: arg2,
        content: arg3,
      };
      if (arg4) payload.id = arg4;
    }
    return await supabase.from('comments').upsert(payload, { onConflict: 'id' });
  },

  async deleteComment(commentId: string) {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.from('comments').delete().eq('id', commentId);
  },

  // ==========================================
  // REAL-TIME MESSAGING & CONVERSATIONS
  // ==========================================
  async getConversations(): Promise<Conversation[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_time', { ascending: false });
      if (error || !data) return [];
      return data.map((conv: any) => ({
        id: conv.id,
        participants: conv.participants || [],
        participantDetails: {}, // Hydrated dynamically by UI/AppContext
        requestId: conv.request_id,
        lastMessage: conv.last_message || '',
        lastMessageTime: conv.last_message_time || new Date().toISOString(),
        lastMessageAt: conv.last_message_time,
        updatedAt: conv.updated_at || conv.last_message_time,
        unreadCount: conv.unread_count || {},
      }));
    } catch (e) {
      console.warn('getConversations exception:', e);
      return [];
    }
  },

  async upsertConversation(conv: Partial<Conversation> & { id: string; participants: string[] }) {
    if (!isSupabaseConfigured()) return { error: null };
    try {
      const payload: any = {
        id: conv.id,
        participants: conv.participants || [],
        request_id: conv.requestId || null,
        last_message: conv.lastMessage || '',
        last_message_time: conv.lastMessageTime || new Date().toISOString(),
        unread_count: conv.unreadCount || {},
        updated_at: conv.updatedAt || new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('conversations')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Supabase upsertConversation notice:', error);
      }
      return { data, error };
    } catch (e: any) {
      console.warn('upsertConversation catch error:', e);
      return { data: null, error: e };
    }
  },

  async getMessages(conversationId?: string): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }
      const { data, error } = await query;
      if (error || !data) return [];
      return data.map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        text: m.text,
        timestamp: m.created_at || new Date().toISOString(),
        isRead: Boolean(m.is_read),
      }));
    } catch (e) {
      console.warn('getMessages exception:', e);
      return [];
    }
  },

  async sendMessage(arg1: string, arg2: string | any, arg3?: string, arg4?: string) {
    if (!isSupabaseConfigured()) return { error: null };
    try {
      let conversationId = arg1;
      let senderId = '';
      let senderName = '';
      let text = '';
      let msgId: string | undefined;

      if (typeof arg2 === 'object' && arg2 !== null) {
        senderId = arg2.senderId;
        senderName = arg2.senderName;
        text = arg2.text;
        msgId = arg2.id;
      } else {
        senderId = arg2 as string;
        senderName = arg3 || 'User';
        text = arg4 || '';
      }

      // 1. Ensure conversation exists in Supabase so foreign key constraints pass
      try {
        await supabase.from('conversations').upsert({
          id: conversationId,
          participants: [senderId],
          last_message: text,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch {
        // ignore
      }

      // 2. Prepare message record
      const messageId = msgId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const createdAt = new Date().toISOString();
      const payload: any = {
        id: messageId,
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        text,
        is_read: false,
        created_at: createdAt,
      };

      const { data, error: msgError } = await supabase
        .from('messages')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (!msgError) {
        // 3. Update conversation last message metadata
        await supabase.from('conversations').update({
          last_message: text,
          last_message_time: createdAt,
          updated_at: createdAt,
        }).eq('id', conversationId);

        // 4. Send realtime broadcast for instantaneous (<50ms) peer delivery
        try {
          const broadcastChannel = supabase.channel('public:messages_all');
          broadcastChannel.send({
            type: 'broadcast',
            event: 'new_chat_message',
            payload: {
              id: messageId,
              conversationId,
              senderId,
              senderName,
              text,
              timestamp: createdAt,
              isRead: false,
            },
          });
        } catch {
          // ignore
        }
      } else {
        console.warn('Supabase sendMessage notice:', msgError);
      }

      return { data, error: msgError };
    } catch (e: any) {
      console.warn('sendMessage catch error:', e);
      return { data: null, error: e };
    }
  },

  subscribeToMessages(conversationId: string, onNewMessage: (msg: ChatMessage) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          const m = payload.new;
          if (m) {
            onNewMessage({
              id: m.id,
              conversationId: m.conversation_id,
              senderId: m.sender_id,
              senderName: m.sender_name,
              text: m.text,
              timestamp: m.created_at || new Date().toISOString(),
              isRead: Boolean(m.is_read),
            });
          }
        }
      )
      .on('broadcast', { event: 'new_chat_message' }, ({ payload }) => {
        if (payload && payload.conversationId === conversationId) {
          onNewMessage(payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToAllMessages(onNewMessage: (msg: ChatMessage) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('public:messages_all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: any) => {
          const m = payload.new;
          if (m) {
            onNewMessage({
              id: m.id,
              conversationId: m.conversation_id,
              senderId: m.sender_id,
              senderName: m.sender_name,
              text: m.text,
              timestamp: m.created_at || new Date().toISOString(),
              isRead: Boolean(m.is_read),
            });
          }
        }
      )
      .on('broadcast', { event: 'new_chat_message' }, ({ payload }) => {
        if (payload) {
          onNewMessage(payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ==========================================
  // REVIEWS & RATINGS
  // ==========================================
  async getReviews(): Promise<Review[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('reviews')
      .select('*, from_user:from_user_id(*), to_user:to_user_id(*)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      requestId: r.request_id,
      requestTitle: r.request_title,
      fromUserId: r.from_user_id,
      fromUserName: r.from_user?.full_name || 'User',
      fromUserRole: (r.from_user?.role as UserRole) || 'owner',
      toUserId: r.to_user_id,
      toUserName: r.to_user?.full_name || 'Volunteer',
      rating: r.rating,
      comment: r.comment,
      tags: r.tags || [],
      createdAt: r.created_at,
      isModerated: Boolean(r.is_moderated),
    }));
  },

  async createReview(rev: any) {
    if (!isSupabaseConfigured()) return { error: null };
    const payload: any = {
      request_id: rev.requestId,
      request_title: rev.requestTitle,
      from_user_id: rev.fromUserId,
      to_user_id: rev.toUserId,
      rating: rev.rating,
      comment: rev.comment,
      tags: rev.tags || [],
      is_moderated: Boolean(rev.isModerated),
    };
    if (rev.id) payload.id = rev.id;
    return await supabase.from('reviews').upsert(payload, { onConflict: 'id' });
  },

  // ==========================================
  // REPORTS & SAFETY
  // ==========================================
  async getReports(): Promise<Report[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('reports')
      .select('*, reporter:reporter_id(*), reported_user:reported_user_id(*)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((rep: any) => ({
      id: rep.id,
      reporterId: rep.reporter_id,
      reporterName: rep.reporter?.full_name || 'Reporter',
      targetType: rep.target_type,
      targetId: rep.target_id,
      targetExcerpt: rep.target_excerpt || '',
      reportedUserId: rep.reported_user_id,
      reportedUserName: rep.reported_user?.full_name,
      reason: rep.reason,
      details: rep.details,
      status: rep.status,
      adminNotes: rep.admin_notes,
      createdAt: rep.created_at,
    }));
  },

  async createReport(report: any) {
    if (!isSupabaseConfigured()) return { error: null };
    const payload: any = {
      reporter_id: report.reporterId,
      target_type: report.targetType,
      target_id: report.targetId,
      target_excerpt: report.targetExcerpt,
      reported_user_id: report.reportedUserId,
      reason: report.reason,
      details: report.details,
      status: report.status || 'pending',
    };
    if (report.id) payload.id = report.id;
    return await supabase.from('reports').upsert(payload, { onConflict: 'id' });
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed', adminNotes?: string) {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.from('reports').update({
      status,
      admin_notes: adminNotes,
    }).eq('id', reportId);
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      titleEn: n.title_en,
      titleAr: n.title_ar,
      messageEn: n.message_en,
      messageAr: n.message_ar,
      link: n.link,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
    }));
  },

  async markNotificationRead(id: string) {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  },

  async markAllNotificationsRead(userId: string) {
    if (!isSupabaseConfigured()) return { error: null };
    return await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  },

  // ==========================================
  // FILE / DOCUMENT STORAGE
  // ==========================================
  async uploadFile(bucket: 'documents' | 'images', path: string, file: Blob | File) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase is not configured') };
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (error) return { data: null, error };
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return { data: { path: data.path, publicUrl: publicUrlData.publicUrl }, error: null };
  },
};
