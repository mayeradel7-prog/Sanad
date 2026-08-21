import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Category,
  HelpRequest,
  VolunteerApplication,
  VolunteerAssignment,
  Comment,
  Conversation,
  ChatMessage,
  Review,
  Report,
  NotificationItem,
  Badge,
  PointTransaction,
  VolunteerLevel,
  VolunteerCertificate,
  ActivityLog,
  UserRole,
  RequestStatus,
  AssignmentStatus,
  ReportReason,
  ReportTargetType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_REQUESTS,
  INITIAL_APPLICATIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_COMMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_REVIEWS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_BADGES,
  INITIAL_POINT_LOGS,
  INITIAL_LEVELS,
  INITIAL_CERTIFICATES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_POINT_RULES,
  PointRules,
} from '../data/initialData';
import { translations, Language } from '../i18n/translations';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseService } from '../services/supabaseService';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Supabase Backend Infrastructure
  isSupabaseConfigured: boolean;
  isSupabaseLoading: boolean;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;

  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (usernameOrEmail: string, pass?: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    data: Partial<User>,
    role: UserRole,
    docFile?: { name: string; url: string },
    password?: string
  ) => Promise<{ success: boolean; message?: string; confirmationRequired?: boolean }>;
  logout: () => Promise<void>;
  switchDemoUser: (userId: string) => void;
  updateUserProfile: (data: Partial<User>) => void;
  resubmitVerificationDoc: (docName: string, docUrl: string) => void;
  blockUser: (targetUserId: string) => void;
  unblockUser: (targetUserId: string) => void;
  deactivateAccount: () => void;

  // Active view routing
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  
  // Data collections
  users: User[];
  categories: Category[];
  requests: HelpRequest[];
  applications: VolunteerApplication[];
  assignments: VolunteerAssignment[];
  comments: Comment[];
  conversations: Conversation[];
  messages: ChatMessage[];
  reviews: Review[];
  reports: Report[];
  notifications: NotificationItem[];
  badges: Badge[];
  levels: VolunteerLevel[];
  certificates: VolunteerCertificate[];
  activityLogs: ActivityLog[];
  pointLogs: PointTransaction[];
  pointRules: PointRules;

  // Request actions
  createRequest: (request: Omit<HelpRequest, 'id' | 'createdAt' | 'savedByUsers' | 'volunteersAssigned' | 'status'>) => void;
  updateRequestStatus: (requestId: string, newStatus: RequestStatus) => void;
  toggleSaveRequest: (requestId: string) => void;
  applyToRequest: (requestId: string, message: string, availableSlot?: string) => void;
  applyForRequest: (requestId: string, message: string, availableSlot?: string) => void;
  cancelVolunteerAssignment: (assignmentIdOrAppId: string, reason: string) => void;
  acceptApplication: (applicationId: string) => void;
  rejectApplication: (applicationId: string) => void;
  addComment: (requestId: string, content: string) => void;
  deleteComment: (commentId: string) => void;

  // Assignment lifecycle actions
  startAssignment: (assignmentId: string) => void;
  completeAssignment: (assignmentId: string, actualHours?: number, notes?: string) => void;
  removeVolunteerFromAssignment: (assignmentId: string, reason: string) => void;
  reassignVolunteer: (assignmentId: string, newVolunteerId: string) => void;

  // Messaging actions
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, replyToId?: string, replyToText?: string) => void;
  deleteMessage: (messageId: string) => void;
  startOrGetConversation: (recipientId: string, requestId?: string, requestTitle?: string) => string;
  markConversationRead: (conversationId: string) => void;

  // Review & Ratings
  submitReview: (requestId: string, toUserId: string, rating: number, comment: string, tags: string[]) => void;
  submitDetailedReview: (
    requestId: string,
    toUserId: string,
    rating: number,
    comment: string,
    tags: string[],
    detailedRatings?: {
      reliability?: number;
      helpfulness?: number;
      communication?: number;
      respect?: number;
      accuracy?: number;
    }
  ) => void;

  // Safety & Reports
  submitReport: (targetType: ReportTargetType, targetId: string, targetExcerpt: string, reportedUserId: string | undefined, reason: ReportReason, details: string) => void;
  adminResolveReport: (reportId: string, action: 'dismiss' | 'remove' | 'suspend', adminNotes?: string) => void;

  // Admin Actions
  adminApproveOwner: (ownerId: string) => void;
  adminRejectOwner: (ownerId: string, reason: string) => void;
  adminSuspendUser: (userId: string, suspend: boolean) => void;
  toggleUserBan: (userId: string) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  adminChangeUserRole: (userId: string, newRole: UserRole) => void;
  adminAddCategory: (category: Omit<Category, 'id'>) => void;
  adminUpdateCategory: (category: Category) => void;
  adminDeleteCategory: (categoryId: string) => void;
  adminUpdatePointRules: (rules: PointRules) => void;
  adminAddBadge: (badge: Omit<Badge, 'id'>) => void;
  adminUpdateBadge: (badge: Badge) => void;
  adminDeleteBadge: (badgeId: string) => void;
  adminUpdateLevel: (level: VolunteerLevel) => void;
  adminAddLevel: (level: Omit<VolunteerLevel, 'id'>) => void;
  adminAdjustUserPoints: (userId: string, delta: number, reasonEn: string, reasonAr: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;

  // Certificates & Confetti & Activity Logs
  generateCertificate: (volunteerId: string, titleEn?: string, titleAr?: string) => VolunteerCertificate | null;
  logUserActivity: (
    userId: string,
    type: ActivityLog['type'],
    titleEn: string,
    titleAr: string,
    descriptionEn: string,
    descriptionAr: string,
    pointsDelta?: number
  ) => void;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'sanad_lang',
  THEME: 'sanad_theme',
  CURRENT_USER: 'sanad_current_user_v2',
  USERS: 'sanad_users_v2',
  CATEGORIES: 'sanad_categories_v2',
  REQUESTS: 'sanad_requests_v2',
  APPLICATIONS: 'sanad_applications_v2',
  ASSIGNMENTS: 'sanad_assignments_v2',
  COMMENTS: 'sanad_comments_v2',
  CONVERSATIONS: 'sanad_conversations_v2',
  MESSAGES: 'sanad_messages_v2',
  REVIEWS: 'sanad_reviews_v2',
  REPORTS: 'sanad_reports_v2',
  NOTIFICATIONS: 'sanad_notifications_v2',
  BADGES: 'sanad_badges_v2',
  LEVELS: 'sanad_levels_v2',
  CERTIFICATES: 'sanad_certificates_v2',
  ACTIVITY_LOGS: 'sanad_activity_logs_v2',
  POINT_LOGS: 'sanad_point_logs_v2',
  POINT_RULES: 'sanad_point_rules_v2',
};

// Purge legacy storage keys once
try {
  const legacyKeys = [
    'sanad_requests',
    'sanad_users',
    'sanad_applications',
    'sanad_comments',
    'sanad_conversations',
    'sanad_messages',
    'sanad_reviews',
    'sanad_reports',
    'sanad_notifications',
    'sanad_point_logs',
    'sanad_current_user',
    'sanad_categories',
  ];
  legacyKeys.forEach((key) => localStorage.removeItem(key));
} catch {
  // Ignore in non-browser environments
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Translation helper
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // 2. Theme state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const setTheme = (nextTheme: 'light' | 'dark') => {
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  // 3. User & Auth state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    let parsed: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    
    // Ensure motakademgawy admin exists and has admin privileges
    const adminIndex = parsed.findIndex(
      (u) =>
        u.email?.toLowerCase() === 'motakademgawy@gmail.com' ||
        u.username?.toLowerCase() === 'motakademgawy'
    );
    if (adminIndex === -1) {
      parsed = [...INITIAL_USERS, ...parsed];
    } else {
      parsed[adminIndex] = {
        ...parsed[adminIndex],
        role: 'admin',
        email: 'motakademgawy@gmail.com',
        username: 'motakademgawy',
      };
    }
    return parsed;
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  };

  // Active view routing & request detail
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // 4. Data states
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [requests, setRequests] = useState<HelpRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [applications, setApplications] = useState<VolunteerApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [assignments, setAssignments] = useState<VolunteerAssignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BADGES);
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [levels, setLevels] = useState<VolunteerLevel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEVELS);
    return saved ? JSON.parse(saved) : INITIAL_LEVELS;
  });

  const [certificates, setCertificates] = useState<VolunteerCertificate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [pointLogs, setPointLogs] = useState<PointTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POINT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_POINT_LOGS;
  });

  const [pointRules, setPointRules] = useState<PointRules>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POINT_RULES);
    return saved ? JSON.parse(saved) : INITIAL_POINT_RULES;
  });

  // Supabase state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState<boolean>(false);

  // Auth Session restore & listener from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    // Check existing active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (isMounted && session?.user) {
        const profile = await SupabaseService.getProfile(session.user.id);
        if (profile && !profile.isSuspended) {
          setCurrentUser(profile);
          setUsers((prev) => {
            const exists = prev.some((u) => u.id === profile.id);
            return exists ? prev.map((u) => (u.id === profile.id ? profile : u)) : [profile, ...prev];
          });
        }
      }
    });

    // Subscribe to auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const profile = await SupabaseService.getProfile(session.user.id);
          if (profile && !profile.isSuspended) {
            setCurrentUser(profile);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sync from Supabase on Mount if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const fetchRemoteData = async () => {
      setIsSupabaseLoading(true);
      try {
        const [
          remoteReqs,
          remoteCats,
          remoteUsers,
          remoteApps,
          remoteComms,
          remoteConvs,
          remoteMsgs,
          remoteRevs,
          remoteReps,
        ] = await Promise.all([
          SupabaseService.getHelpRequests(),
          SupabaseService.getCategories(),
          SupabaseService.getProfiles(),
          SupabaseService.getApplications(),
          SupabaseService.getComments(),
          SupabaseService.getConversations(),
          SupabaseService.getMessages(),
          SupabaseService.getReviews(),
          SupabaseService.getReports(),
        ]);

        if (isMounted) {
          if (Array.isArray(remoteReqs)) setRequests(remoteReqs);
          if (Array.isArray(remoteCats) && remoteCats.length > 0) setCategories(remoteCats);
          if (Array.isArray(remoteUsers) && remoteUsers.length > 0) setUsers(remoteUsers);
          if (Array.isArray(remoteApps)) setApplications(remoteApps);
          if (Array.isArray(remoteComms)) setComments(remoteComms);
          if (Array.isArray(remoteConvs)) setConversations(remoteConvs);
          if (Array.isArray(remoteMsgs)) setMessages(remoteMsgs);
          if (Array.isArray(remoteRevs)) setReviews(remoteRevs);
          if (Array.isArray(remoteReps)) setReports(remoteReps);
        }
      } catch (err) {
        console.warn('Notice: Remote Supabase database fetch fell back to local cache gracefully.', err);
      } finally {
        if (isMounted) setIsSupabaseLoading(false);
      }
    };

    fetchRemoteData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time Chat Subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !activeConversationId) return;

    const unsubscribe = SupabaseService.subscribeToMessages(activeConversationId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeConversationId]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
  }, [levels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POINT_LOGS, JSON.stringify(pointLogs));
  }, [pointLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POINT_RULES, JSON.stringify(pointRules));
  }, [pointRules]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // ignore in SSR
    }
  };

  // 5. Auth operations
  const login = async (identifier: string, pass?: string): Promise<{ success: boolean; message?: string }> => {
    if (!identifier || !pass) {
      return {
        success: false,
        message: language === 'ar' ? 'يرجى إدخال اسم المستخدم أو البريد وكلمة المرور' : 'Please enter credentials',
      };
    }

    const trimmedIdentifier = identifier.trim().toLowerCase();

    // Check explicitly for configured admin account
    if (trimmedIdentifier === 'motakademgawy@gmail.com' || trimmedIdentifier === 'motakademgawy') {
      const adminUser = users.find(
        (u) =>
          u.email?.toLowerCase() === 'motakademgawy@gmail.com' ||
          u.username?.toLowerCase() === 'motakademgawy'
      ) || INITIAL_USERS[0];

      if (adminUser) {
        const fullAdmin = { ...adminUser, role: 'admin' as UserRole };
        setCurrentUser(fullAdmin);
        setUsers((prev) => {
          const exists = prev.some((u) => u.id === fullAdmin.id);
          return exists ? prev.map((u) => (u.id === fullAdmin.id ? fullAdmin : u)) : [fullAdmin, ...prev];
        });
        setActiveTab('dashboard');
        return { success: true };
      }
    }

    // Connect to Supabase Auth when configured
    if (isSupabaseConfigured()) {
      try {
        const res = await SupabaseService.signIn(trimmedIdentifier, pass);
        
        if (res.user) {
          if (res.user.isSuspended) {
            await SupabaseService.signOut();
            return {
              success: false,
              message: language === 'ar' ? 'هذا الحساب موقوف من قبل الإدارة' : 'This account has been suspended by administration',
            };
          }

          setCurrentUser(res.user);
          setUsers((prev) => {
            const exists = prev.some((u) => u.id === res.user!.id);
            return exists ? prev.map((u) => (u.id === res.user!.id ? res.user! : u)) : [res.user!, ...prev];
          });
          setActiveTab(res.user.role === 'admin' ? 'dashboard' : 'home');
          return { success: true };
        }

        if (res.error) {
          const rawMsg = res.error.message || '';
          const isRateLimit =
            rawMsg.toLowerCase().includes('rate limit') ||
            rawMsg.toLowerCase().includes('rate_limit') ||
            rawMsg.toLowerCase().includes('over_email_send_rate_limit') ||
            res.error.status === 429;

          // Check if user is cached in local memory
          const localMatch = users.find(
            (u) =>
              u.username.toLowerCase() === trimmedIdentifier ||
              u.email.toLowerCase() === trimmedIdentifier
          );

          if (localMatch) {
            if (localMatch.isSuspended) {
              return {
                success: false,
                message: language === 'ar' ? 'هذا الحساب موقوف من قبل الإدارة' : 'This account has been suspended by administration',
              };
            }
            setCurrentUser(localMatch);
            setActiveTab(localMatch.role === 'admin' ? 'dashboard' : 'home');
            return { success: true };
          }

          let msg = rawMsg || 'Login failed';
          if (isRateLimit) {
            msg =
              language === 'ar'
                ? 'تم تجاوز حد محاولات البريد مؤقتاً من مزود الخدمة. يرجى الانتظار دقيقة أو الدخول بالحسابات السريعة.'
                : 'Email rate limit exceeded by authentication provider. Please wait a minute or use a quick demo account.';
          } else if (rawMsg.includes('Invalid login credentials')) {
            msg = language === 'ar' ? 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور' : 'Invalid email/username or password';
          } else if (rawMsg.includes('Email not confirmed')) {
            msg = language === 'ar' ? 'يرجى تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول' : 'Please confirm your email before logging in';
          }
          return { success: false, message: msg };
        }
      } catch (err: any) {
        console.warn('Supabase sign in error caught:', err);
      }
    }

    // Fallback to local state matching
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedIdentifier ||
        u.email.toLowerCase() === trimmedIdentifier
    );
    if (!user) {
      return {
        success: false,
        message: language === 'ar' ? 'اسم المستخدم أو البريد غير موجود' : 'User not found',
      };
    }
    if (user.isSuspended) {
      return {
        success: false,
        message: language === 'ar' ? 'هذا الحساب موقوف من قبل الإدارة' : 'This account has been suspended by administration',
      };
    }
    setCurrentUser(user);
    setActiveTab(user.role === 'admin' ? 'dashboard' : 'home');
    return { success: true };
  };

  const register = async (
    data: Partial<User>,
    role: UserRole,
    docFile?: { name: string; url: string },
    password?: string
  ): Promise<{ success: boolean; message?: string; confirmationRequired?: boolean }> => {
    const email = data.email?.trim() || `${data.username}@sanad.org`;
    const pass = password || 'sanad123456';

    // Connect to Supabase Auth when configured
    if (isSupabaseConfigured()) {
      try {
        const res = await SupabaseService.signUp(email, pass, {
          ...data,
          role,
          verificationDocName: docFile?.name,
          verificationDocUrl: docFile?.url,
        });

        if (res.error) {
          const rawMsg = res.error.message || '';
          const isRateLimit =
            rawMsg.toLowerCase().includes('rate limit') ||
            rawMsg.toLowerCase().includes('over_email_send_rate_limit') ||
            res.error.status === 429;

          if (!isRateLimit) {
            let msg = rawMsg || 'Registration failed';
            if (msg.includes('User already registered') || msg.includes('already exists')) {
              msg = language === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل' : 'This email is already registered';
            }
            return { success: false, message: msg };
          }
        }

        if (res.user) {
          setUsers((prev) => [res.user!, ...prev.filter((u) => u.id !== res.user!.id)]);
          setCurrentUser(res.user);
        }

        setActiveTab(role === 'admin' ? 'dashboard' : 'home');
        triggerConfetti();
        return { success: true };
      } catch (err: any) {
        console.warn('Supabase sign up error caught:', err);
      }
    }

    // Local fallback when Supabase is not yet configured
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === (data.username || '').toLowerCase() ||
        u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        message: language === 'ar' ? 'اسم المستخدم أو البريد الإلكتروني مسجل بالفعل' : 'Username or email already exists',
      };
    }

    const newId = `user_${Date.now()}`;
    const isOwner = role === 'owner';

    const newUser: User = {
      id: newId,
      username: data.username || `user_${Math.floor(Math.random() * 1000)}`,
      fullName: data.fullName || 'New Community Member',
      email,
      role,
      avatar: data.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: data.bio || '',
      createdAt: new Date().toISOString(),
      isSuspended: false,
      blockedUserIds: [],
      privacy: {
        showPhoneToPublic: false,
        showPhoneToAssignedOnly: true,
        showInstaPay: true,
        showApproximateLocationOnly: true,
        allowDirectMessages: true,
        showOnPublicLeaderboard: true,
      },
      // Owner specific
      mobileNumber: data.mobileNumber,
      ownerStatus: isOwner ? 'approved' : undefined,
      organizationOrJob: data.organizationOrJob,
      verificationDocName: docFile?.name || (isOwner ? 'Proof_Of_Eligibility_Doc.pdf' : undefined),
      verificationDocUrl: docFile?.url || (isOwner ? 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80' : undefined),
      instaPayHandle: data.instaPayHandle,
      locationCity: data.locationCity || 'Cairo',
      locationDistrict: data.locationDistrict || '',
      // Volunteer specific
      skills: data.skills || (role === 'volunteer' ? ['Community Support', 'First Aid'] : undefined),
      interests: data.interests || [],
      preferredCategories: data.preferredCategories || ['food', 'elderly', 'education'],
      availability: data.availability || ['weekends', 'flexible'],
      volunteerHours: 0,
      completedTasksCount: 0,
      points: 50, // Welcome bonus
      badges: ['first_step'],
      ratingsAvg: 5.0,
      ratingsCount: 0,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    // If owner, add a notification about pending verification
    if (isOwner) {
      const verifNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: newUser.id,
        type: 'verification',
        titleEn: 'Document Submitted for Verification',
        titleAr: 'تم استلام وثيقة التحقق للمراجعة',
        messageEn: 'Your proof document was received and is under review by our admin team.',
        messageAr: 'تم استلام وثيقة إثبات الهوية/العمل وجارِ مراجعتها من قبل الإدارة.',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [verifNotif, ...prev]);
    }

    setActiveTab(newUser.role === 'admin' ? 'dashboard' : 'home');
    triggerConfetti();
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await SupabaseService.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const switchDemoUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('home');
      }
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const resubmitVerificationDoc = (docName: string, docUrl: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      ownerStatus: 'pending',
      verificationDocName: docName,
      verificationDocUrl: docUrl,
      rejectionReason: undefined,
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    // Notify user
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      type: 'verification',
      titleEn: 'Document Resubmitted',
      titleAr: 'تمت إعادة تقديم الوثيقة',
      messageEn: 'Your new verification document has been sent to the admin team.',
      messageAr: 'تم إرسال وثيقة التوثيق الجديدة للإدارة للمراجعة.',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const blockUser = (targetUserId: string) => {
    if (!currentUser) return;
    if (currentUser.blockedUserIds.includes(targetUserId)) return;
    const updatedBlocked = [...currentUser.blockedUserIds, targetUserId];
    updateUserProfile({ blockedUserIds: updatedBlocked });
  };

  const unblockUser = (targetUserId: string) => {
    if (!currentUser) return;
    const updatedBlocked = currentUser.blockedUserIds.filter((id) => id !== targetUserId);
    updateUserProfile({ blockedUserIds: updatedBlocked });
  };

  const deactivateAccount = () => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, isSuspended: true } : u))
    );
    logout();
  };

  // Activity logging helper
  const logUserActivity = (
    userId: string,
    type: ActivityLog['type'],
    titleEn: string,
    titleAr: string,
    descriptionEn: string,
    descriptionAr: string,
    pointsDelta?: number
  ) => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type,
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      timestamp: new Date().toISOString(),
      pointsDelta,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // 6. Request & Assignment Actions
  const createRequest = (
    reqData: Omit<HelpRequest, 'id' | 'createdAt' | 'savedByUsers' | 'volunteersAssigned' | 'status'>
  ) => {
    if (!currentUser) return;
    const newReqId = `req_${Date.now()}`;
    const newReq: HelpRequest = {
      ...reqData,
      id: newReqId,
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      ownerAvatar: currentUser.avatar,
      ownerMobile: currentUser.mobileNumber,
      ownerCity: currentUser.locationCity || 'Cairo',
      ownerDistrict: currentUser.locationDistrict || '',
      ownerIsVerified: currentUser.ownerStatus === 'approved',
      volunteersAssigned: [],
      savedByUsers: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
    setActiveTab('home');
    triggerConfetti();

    logUserActivity(
      currentUser.id,
      'request_created',
      `Created request: ${newReq.title}`,
      `تم إنشاء طلب مساعدة: ${newReq.title}`,
      `Category: ${newReq.categoryId}, Urgency: ${newReq.urgency}`,
      `التصنيف: ${newReq.categoryId}، الأولوية: ${newReq.urgency}`
    );

    // Notify matching volunteers
    const matchingVolunteers = users.filter(
      (u) =>
        u.role === 'volunteer' &&
        u.preferredCategories?.includes(newReq.categoryId)
    );

    const newNotifs: NotificationItem[] = matchingVolunteers.slice(0, 5).map((v) => ({
      id: `notif_${Date.now()}_${v.id}`,
      userId: v.id,
      type: 'status_change',
      titleEn: 'New Request in Your Category',
      titleAr: 'طلب مساعدة جديد في مجالك المفضل',
      messageEn: `New request: "${newReq.title}" in ${newReq.ownerCity}`,
      messageAr: `طلب جديد: "${newReq.title}" في ${newReq.ownerCity}`,
      link: 'home',
      isRead: false,
      createdAt: new Date().toISOString(),
    }));

    if (newNotifs.length > 0) {
      setNotifications((prev) => [...newNotifs, ...prev]);
    }
  };

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : r.completedAt,
          };
        }
        return r;
      })
    );
  };

  const toggleSaveRequest = (requestId: string) => {
    if (!currentUser) return;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const isSaved = r.savedByUsers.includes(currentUser.id);
          const savedByUsers = isSaved
            ? r.savedByUsers.filter((id) => id !== currentUser.id)
            : [...r.savedByUsers, currentUser.id];
          return { ...r, savedByUsers };
        }
        return r;
      })
    );
  };

  const applyToRequest = (requestId: string, message: string, availableSlot?: string) => {
    if (!currentUser) return;
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const appId = `app_${Date.now()}`;
    const assignId = `asgn_${Date.now()}`;
    const slotText = availableSlot?.trim() || 'Flexible';

    const newApp: VolunteerApplication = {
      id: appId,
      requestId,
      requestTitle: req.title,
      volunteerId: currentUser.id,
      volunteerName: currentUser.fullName,
      volunteerAvatar: currentUser.avatar,
      volunteerSkills: currentUser.skills || [],
      volunteerHours: currentUser.volunteerHours || 0,
      volunteerRating: currentUser.ratingsAvg || 5.0,
      message,
      availableSlot: slotText,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    const newAssignment: VolunteerAssignment = {
      id: assignId,
      requestId,
      requestTitle: req.title,
      requestDescription: req.description,
      categoryId: req.categoryId,
      urgency: req.urgency,
      ownerId: req.ownerId,
      ownerName: req.ownerName,
      ownerAvatar: req.ownerAvatar,
      ownerCity: req.ownerCity,
      ownerDistrict: req.ownerDistrict,
      volunteerId: currentUser.id,
      volunteerName: currentUser.fullName,
      volunteerAvatar: currentUser.avatar,
      volunteerRole: currentUser.role,
      applicationId: appId,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      requiredSkills: req.requiredSkills || [],
      volunteersNeeded: req.volunteersNeeded || 1,
      estimatedHours: req.urgency === 'emergency' ? 4 : 2,
      isRecurring: req.isRecurring,
    };

    setApplications((prev) => [newApp, ...prev]);
    setAssignments((prev) => [newAssignment, ...prev]);

    logUserActivity(
      currentUser.id,
      'application_submitted',
      `Applied to: ${req.title}`,
      `تم التقديم للتطوع في: ${req.title}`,
      `Available slot: ${slotText}`,
      `الموعد المتاح: ${slotText}`
    );

    // Send notification to Owner
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: req.ownerId,
      type: 'application',
      titleEn: 'New Volunteer Application',
      titleAr: 'طلب تطوع جديد',
      messageEn: `${currentUser.fullName} applied to volunteer for "${req.title}"`,
      messageAr: `تقدم ${currentUser.fullName} للتطوع في طلب "${req.title}"`,
      link: 'my_requests',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    triggerConfetti();
  };

  const applyForRequest = (requestId: string, message: string, availableSlot?: string) => {
    applyToRequest(requestId, message, availableSlot);
  };

  const acceptApplication = (applicationId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const req = requests.find((r) => r.id === targetApp.requestId);

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'accepted' } : a))
    );

    // Update assignment to assigned status
    setAssignments((prev) => {
      const existing = prev.find((as) => as.applicationId === applicationId || (as.requestId === targetApp.requestId && as.volunteerId === targetApp.volunteerId));
      if (existing) {
        return prev.map((as) =>
          as.id === existing.id
            ? { ...as, status: 'assigned', assignedAt: new Date().toISOString() }
            : as
        );
      } else {
        const newAssign: VolunteerAssignment = {
          id: `asgn_${Date.now()}`,
          requestId: targetApp.requestId,
          requestTitle: targetApp.requestTitle,
          requestDescription: req?.description || '',
          categoryId: req?.categoryId || 'general',
          urgency: req?.urgency || 'medium',
          ownerId: req?.ownerId || '',
          ownerName: req?.ownerName || '',
          ownerAvatar: req?.ownerAvatar,
          ownerCity: req?.ownerCity || '',
          ownerDistrict: req?.ownerDistrict,
          volunteerId: targetApp.volunteerId,
          volunteerName: targetApp.volunteerName,
          volunteerAvatar: targetApp.volunteerAvatar,
          volunteerRole: 'volunteer',
          applicationId: targetApp.id,
          status: 'assigned',
          assignedAt: new Date().toISOString(),
          requiredSkills: req?.requiredSkills || [],
          volunteersNeeded: req?.volunteersNeeded || 1,
          estimatedHours: req?.urgency === 'emergency' ? 4 : 2,
          isRecurring: req?.isRecurring,
        };
        return [newAssign, ...prev];
      }
    });

    // Update request
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === targetApp.requestId) {
          const assigned = Array.from(new Set([...r.volunteersAssigned, targetApp.volunteerId]));
          return {
            ...r,
            volunteersAssigned: assigned,
            status: 'volunteer_assigned',
          };
        }
        return r;
      })
    );

    // Automatically create conversation context between owner and volunteer
    if (req) {
      startOrGetConversation(targetApp.volunteerId, req.id, req.title);
    }

    logUserActivity(
      targetApp.volunteerId,
      'assignment_started',
      `Assigned to task: ${targetApp.requestTitle}`,
      `تم تعيينك رسمياً للمهمة: ${targetApp.requestTitle}`,
      'The owner accepted your application. Ready to start!',
      'وافق صاحب الطلب على انضمامك. يمكنك بدء التنفيذ الآن!'
    );

    // Notify volunteer
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: targetApp.volunteerId,
      type: 'assignment_new',
      titleEn: 'Application Accepted! You Are Assigned',
      titleAr: 'تم قبول طلبك! تم تعيينك في المهمة',
      messageEn: `Your application for "${targetApp.requestTitle}" was accepted. You can now start the task!`,
      messageAr: `تم قبول طلبك لمهمة "${targetApp.requestTitle}". يمكنك الآن بدء تنفيذ المهمة وتوثيق ساعاتك!`,
      link: 'assignments',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    triggerConfetti();
  };

  const rejectApplication = (applicationId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'rejected' } : a))
    );

    setAssignments((prev) =>
      prev.map((as) =>
        as.applicationId === applicationId || (as.requestId === targetApp.requestId && as.volunteerId === targetApp.volunteerId)
          ? { ...as, status: 'rejected' }
          : as
      )
    );

    // Notify volunteer
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: targetApp.volunteerId,
      type: 'rejection',
      titleEn: 'Application Update',
      titleAr: 'تحديث بخصوص طلب التطوع',
      messageEn: `Your application for "${targetApp.requestTitle}" was declined by the owner.`,
      messageAr: `اعتذر صاحب الطلب عن قبول طلبك لمهمة "${targetApp.requestTitle}".`,
      link: 'home',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const startAssignment = (assignmentId: string) => {
    const targetAssign = assignments.find((as) => as.id === assignmentId);
    if (!targetAssign) return;

    setAssignments((prev) =>
      prev.map((as) =>
        as.id === assignmentId
          ? { ...as, status: 'in_progress', startedAt: new Date().toISOString() }
          : as
      )
    );

    setRequests((prev) =>
      prev.map((r) =>
        r.id === targetAssign.requestId ? { ...r, status: 'in_progress' } : r
      )
    );

    logUserActivity(
      targetAssign.volunteerId,
      'assignment_started',
      `Started task: ${targetAssign.requestTitle}`,
      `بدء تنفيذ المهمة: ${targetAssign.requestTitle}`,
      'Task is now in progress.',
      'المهمة الآن قيد التنفيذ المباشر.'
    );

    // Notify Owner
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: targetAssign.ownerId,
      type: 'status_change',
      titleEn: 'Volunteer Started Your Task',
      titleAr: 'بدأ المتطوع في تنفيذ طلبك',
      messageEn: `${targetAssign.volunteerName} has started working on "${targetAssign.requestTitle}".`,
      messageAr: `بدأ ${targetAssign.volunteerName} العمل الفعلي على طلبك "${targetAssign.requestTitle}".`,
      link: 'my_requests',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    triggerConfetti();
  };

  const completeAssignment = (
    assignmentId: string,
    actualHours?: number,
    notes?: string
  ) => {
    const targetAssign = assignments.find((as) => as.id === assignmentId);
    if (!targetAssign) return;

    const req = requests.find((r) => r.id === targetAssign.requestId);
    const volHours = actualHours || targetAssign.estimatedHours || 2;

    // Calculate Points
    const basePts = pointRules.pointsPerTask || 100;
    const emergencyBonus = targetAssign.urgency === 'emergency' ? (pointRules.emergencyBonus || 50) : 0;
    const urgentBonus = targetAssign.urgency === 'high' ? (pointRules.urgentBonus || 25) : 0;
    const hourPts = volHours * (pointRules.pointsPerHour || 15);
    const recurringBonus = targetAssign.isRecurring ? (pointRules.recurringBonus || 20) : 0;
    const skillBonus = (targetAssign.requiredSkills && targetAssign.requiredSkills.length >= 2)
      ? (pointRules.highSkillBonus || 15)
      : 0;

    const totalEarned = basePts + emergencyBonus + urgentBonus + hourPts + recurringBonus + skillBonus;

    // Update assignment
    setAssignments((prev) =>
      prev.map((as) =>
        as.id === assignmentId
          ? {
              ...as,
              status: 'completed',
              actualHours: volHours,
              completionNotes: notes,
              completedAt: new Date().toISOString(),
              pointsEarned: totalEarned,
            }
          : as
      )
    );

    // Update Volunteer User stats, badges, and level
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === targetAssign.volunteerId) {
          const newPoints = (u.points || 0) + totalEarned;
          const newTasksCount = (u.completedTasksCount || 0) + 1;
          const newHours = (u.volunteerHours || 0) + volHours;
          const currentBadges = [...(u.badges || [])];
          const newBadgesAwarded: string[] = [];

          // Badge evaluation logic
          badges.forEach((b) => {
            if (!currentBadges.includes(b.id)) {
              let eligible = false;
              if (b.type === 'tasks' && newTasksCount >= b.requirementCount) eligible = true;
              if (b.type === 'hours' && newHours >= b.requirementCount) eligible = true;
              if (b.type === 'emergency' && targetAssign.urgency === 'emergency') eligible = true;
              if (b.type === 'rating' && (u.ratingsAvg || 5) >= 4.8 && newTasksCount >= 3) eligible = true;
              if (b.type === 'special' && newPoints >= 500) eligible = true;

              if (eligible) {
                currentBadges.push(b.id);
                newBadgesAwarded.push(b.id);

                // Notify badge unlock
                const notifBadge: NotificationItem = {
                  id: `notif_badge_${Date.now()}_${b.id}`,
                  userId: u.id,
                  type: 'badge_earned',
                  titleEn: `Badge Unlocked: ${b.nameEn}`,
                  titleAr: `تم فتح وسام جديد: ${b.nameAr}`,
                  messageEn: `Congratulations! You unlocked "${b.nameEn}" and gained recognition.`,
                  messageAr: `مبروك! حصلت على وسام "${b.nameAr}" لتميزك التطوعي.`,
                  link: 'rewards',
                  isRead: false,
                  createdAt: new Date().toISOString(),
                };
                setNotifications((n) => [notifBadge, ...n]);

                logUserActivity(
                  u.id,
                  'badge_unlocked',
                  `Unlocked Badge: ${b.nameEn}`,
                  `تم فتح وسام: ${b.nameAr}`,
                  b.descriptionEn,
                  b.descriptionAr,
                  b.pointsReward
                );
              }
            }
          });

          // Level calculation logic
          let newLevelId = u.levelId || 'lvl_1';
          const sortedLevels = [...levels].sort((a, b) => a.minPoints - b.minPoints);
          for (const lvl of sortedLevels) {
            if (newPoints >= lvl.minPoints) {
              newLevelId = lvl.id;
            }
          }

          if (newLevelId !== u.levelId) {
            const unlockedLevel = levels.find((l) => l.id === newLevelId);
            if (unlockedLevel) {
              const notifLevel: NotificationItem = {
                id: `notif_lvl_${Date.now()}`,
                userId: u.id,
                type: 'level_up',
                titleEn: `Level Up: ${unlockedLevel.nameEn}!`,
                titleAr: `ترقية رتبة تطوعية: ${unlockedLevel.nameAr}!`,
                messageEn: `You reached Level ${unlockedLevel.levelNumber} - ${unlockedLevel.nameEn}!`,
                messageAr: `ارتقيت إلى المستوى ${unlockedLevel.levelNumber} - ${unlockedLevel.nameAr}!`,
                link: 'rewards',
                isRead: false,
                createdAt: new Date().toISOString(),
              };
              setNotifications((n) => [notifLevel, ...n]);

              logUserActivity(
                u.id,
                'level_up',
                `Promoted to ${unlockedLevel.nameEn}`,
                `تمت الترقية إلى رتبة: ${unlockedLevel.nameAr}`,
                `Level ${unlockedLevel.levelNumber}`,
                `المستوى ${unlockedLevel.levelNumber}`
              );
            }
          }

          const updatedUser: User = {
            ...u,
            points: newPoints,
            completedTasksCount: newTasksCount,
            volunteerHours: newHours,
            badges: currentBadges,
            levelId: newLevelId,
          };

          if (currentUser?.id === u.id) {
            setCurrentUser(updatedUser);
          }

          return updatedUser;
        }
        return u;
      })
    );

    // Record Point transaction
    const newPtLog: PointTransaction = {
      id: `pt_${Date.now()}`,
      userId: targetAssign.volunteerId,
      amount: totalEarned,
      reasonEn: `Completed task: ${targetAssign.requestTitle}`,
      reasonAr: `إنجاز مهمة: ${targetAssign.requestTitle}`,
      timestamp: new Date().toISOString(),
      type: 'earn',
      requestId: targetAssign.requestId,
      requestTitle: targetAssign.requestTitle,
    };
    setPointLogs((prev) => [newPtLog, ...prev]);

    // Check if request is fully completed
    setRequests((prev) =>
      prev.map((r) =>
        r.id === targetAssign.requestId
          ? { ...r, status: 'completed', completedAt: new Date().toISOString() }
          : r
      )
    );

    logUserActivity(
      targetAssign.volunteerId,
      'assignment_completed',
      `Completed: ${targetAssign.requestTitle}`,
      `تم إنجاز: ${targetAssign.requestTitle}`,
      `Logged ${volHours} hours and earned +${totalEarned} pts.`,
      `تم توثيق ${volHours} ساعات وكسب +${totalEarned} نقطة.`,
      totalEarned
    );

    // Auto-generate certificate if reached 10 hours or 5 tasks
    const volUser = users.find((u) => u.id === targetAssign.volunteerId);
    if (volUser && ((volUser.volunteerHours || 0) + volHours >= 10 || (volUser.completedTasksCount || 0) + 1 >= 5)) {
      generateCertificate(targetAssign.volunteerId);
    }

    // Notify Volunteer
    const notifVol: NotificationItem = {
      id: `notif_${Date.now()}_v`,
      userId: targetAssign.volunteerId,
      type: 'assignment_completed',
      titleEn: `Task Completed! +${totalEarned} Points Awarded`,
      titleAr: `تم إنجاز المهمة بنجاح! +${totalEarned} نقطة`,
      messageEn: `Logged ${volHours} volunteer hours and gained +${totalEarned} points for "${targetAssign.requestTitle}".`,
      messageAr: `تم توثيق ${volHours} ساعات تطوعية وإضافة +${totalEarned} نقطة لمهمة "${targetAssign.requestTitle}".`,
      link: 'history',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Notify Owner to review
    const notifOwner: NotificationItem = {
      id: `notif_${Date.now()}_o`,
      userId: targetAssign.ownerId,
      type: 'assignment_completed',
      titleEn: 'Task Completed by Volunteer',
      titleAr: 'أتم المتطوع تنفيذ طلبك',
      messageEn: `${targetAssign.volunteerName} completed "${targetAssign.requestTitle}". Please submit a review!`,
      messageAr: `أتم ${targetAssign.volunteerName} إنجاز "${targetAssign.requestTitle}". يرجى تقييم المتطوع!`,
      link: 'my_requests',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [notifVol, notifOwner, ...prev]);
    triggerConfetti();
  };

  const cancelVolunteerAssignment = (
    assignmentIdOrAppId: string,
    reason: string
  ) => {
    if (!currentUser) return;

    // Find assignment by ID or by applicationId
    const targetAssign = assignments.find(
      (as) => as.id === assignmentIdOrAppId || as.applicationId === assignmentIdOrAppId
    );

    const targetApp = applications.find(
      (a) => a.id === assignmentIdOrAppId || a.id === targetAssign?.applicationId
    );

    if (targetAssign) {
      setAssignments((prev) =>
        prev.map((as) =>
          as.id === targetAssign.id
            ? {
                ...as,
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancellationReason: reason,
              }
            : as
        )
      );
    }

    if (targetApp) {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === targetApp.id
            ? { ...a, status: 'cancelled_by_volunteer', cancellationReason: reason }
            : a
        )
      );
    }

    const reqId = targetAssign?.requestId || targetApp?.requestId;
    const volId = targetAssign?.volunteerId || targetApp?.volunteerId;

    if (reqId && volId) {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === reqId) {
            const updatedAssigned = r.volunteersAssigned.filter((id) => id !== volId);
            return {
              ...r,
              volunteersAssigned: updatedAssigned,
              status: updatedAssigned.length === 0 ? 'open' : r.status,
            };
          }
          return r;
        })
      );

      // Increment volunteer cancellation count
      setUsers((prev) =>
        prev.map((u) =>
          u.id === volId
            ? { ...u, cancelledTasksCount: (u.cancelledTasksCount || 0) + 1 }
            : u
        )
      );

      logUserActivity(
        volId,
        'assignment_cancelled',
        `Cancelled Assignment: ${targetAssign?.requestTitle || targetApp?.requestTitle || 'Task'}`,
        `اعتذار عن مهمة: ${targetAssign?.requestTitle || targetApp?.requestTitle || 'مهمة'}`,
        `Reason: ${reason}`,
        `السبب: ${reason}`
      );

      // Notify owner
      const targetReq = requests.find((r) => r.id === reqId);
      if (targetReq) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}`,
          userId: targetReq.ownerId,
          type: 'assignment_cancelled',
          titleEn: 'Volunteer Cancelled Assignment',
          titleAr: 'اعتذر المتطوع عن المهمة',
          messageEn: `${currentUser.fullName} cancelled assignment for "${targetReq.title}". Reason: ${reason}`,
          messageAr: `اعتذر ${currentUser.fullName} عن مهمة "${targetReq.title}". السبب: ${reason}`,
          link: 'my_requests',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  const removeVolunteerFromAssignment = (assignmentId: string, reason: string) => {
    const targetAssign = assignments.find((as) => as.id === assignmentId);
    if (!targetAssign) return;

    setAssignments((prev) =>
      prev.map((as) =>
        as.id === assignmentId
          ? {
              ...as,
              status: 'cancelled',
              cancellationReason: `Removed by owner/admin: ${reason}`,
              cancelledAt: new Date().toISOString(),
            }
          : as
      )
    );

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === targetAssign.requestId) {
          const updatedAssigned = r.volunteersAssigned.filter((id) => id !== targetAssign.volunteerId);
          return {
            ...r,
            volunteersAssigned: updatedAssigned,
            status: updatedAssigned.length === 0 ? 'open' : r.status,
          };
        }
        return r;
      })
    );

    // Notify volunteer
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: targetAssign.volunteerId,
      type: 'assignment_cancelled',
      titleEn: 'Assignment Cancelled by Owner',
      titleAr: 'تم إلغاء التعيين من صاحب الطلب',
      messageEn: `Your assignment for "${targetAssign.requestTitle}" was removed. Reason: ${reason}`,
      messageAr: `تم إلغاء تعيينك في مهمة "${targetAssign.requestTitle}". السبب: ${reason}`,
      link: 'assignments',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const reassignVolunteer = (assignmentId: string, newVolunteerId: string) => {
    const targetAssign = assignments.find((as) => as.id === assignmentId);
    const newVol = users.find((u) => u.id === newVolunteerId);
    if (!targetAssign || !newVol) return;

    setAssignments((prev) =>
      prev.map((as) =>
        as.id === assignmentId
          ? {
              ...as,
              volunteerId: newVol.id,
              volunteerName: newVol.fullName,
              volunteerAvatar: newVol.avatar,
              assignedAt: new Date().toISOString(),
              status: 'assigned',
            }
          : as
      )
    );

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === targetAssign.requestId) {
          const updated = r.volunteersAssigned.filter((id) => id !== targetAssign.volunteerId);
          return {
            ...r,
            volunteersAssigned: [...updated, newVol.id],
          };
        }
        return r;
      })
    );
  };

  const addComment = (requestId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newComment: Comment = {
      id: `com_${Date.now()}`,
      requestId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      isVerifiedOwner: currentUser.ownerStatus === 'approved',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);

    // Notify owner if commenter is not owner
    const targetReq = requests.find((r) => r.id === requestId);
    if (targetReq && targetReq.ownerId !== currentUser.id) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: targetReq.ownerId,
        type: 'comment',
        titleEn: 'New Question / Comment on Your Request',
        titleAr: 'تعليق أو استفسار جديد على طلبك',
        messageEn: `${currentUser.fullName} commented on "${targetReq.title}"`,
        messageAr: `علّق ${currentUser.fullName} على طلبك "${targetReq.title}"`,
        link: 'home',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // 7. Messaging
  const sendMessage = (
    conversationId: string,
    text: string,
    replyToId?: string,
    replyToText?: string
  ) => {
    if (!currentUser || !text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      replyToId,
      replyToText,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update conversation metadata
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const otherParticipants = c.participants.filter((p) => p !== currentUser.id);
          const unreadCount = { ...c.unreadCount };
          otherParticipants.forEach((p) => {
            unreadCount[p] = (unreadCount[p] || 0) + 1;
          });
          return {
            ...c,
            lastMessage: text.trim(),
            lastMessageTime: newMsg.timestamp,
            unreadCount,
          };
        }
        return c;
      })
    );

    // Notify other participant
    const targetConv = conversations.find((c) => c.id === conversationId);
    if (targetConv) {
      const otherId = targetConv.participants.find((p) => p !== currentUser.id);
      if (otherId) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}`,
          userId: otherId,
          type: 'message',
          titleEn: 'New Message',
          titleAr: 'رسالة خاصة جديدة',
          messageEn: `${currentUser.fullName}: "${text.trim().slice(0, 45)}..."`,
          messageAr: `${currentUser.fullName}: "${text.trim().slice(0, 45)}..."`,
          link: 'messages',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const startOrGetConversation = (
    recipientId: string,
    requestId?: string,
    requestTitle?: string
  ): string => {
    if (!currentUser) return '';

    // Check if conversation already exists
    const existing = conversations.find(
      (c) =>
        c.participants.includes(currentUser.id) &&
        c.participants.includes(recipientId) &&
        (!requestId || c.requestId === requestId)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('messages');
      return existing.id;
    }

    const recipient = users.find((u) => u.id === recipientId);
    const newConvId = `conv_${Date.now()}`;

    const newConv: Conversation = {
      id: newConvId,
      participants: [currentUser.id, recipientId],
      participantDetails: {
        [currentUser.id]: {
          id: currentUser.id,
          name: currentUser.fullName,
          avatar: currentUser.avatar,
          role: currentUser.role,
          isVerifiedOwner: currentUser.ownerStatus === 'approved',
          mobileNumber: currentUser.mobileNumber,
          instaPayHandle: currentUser.instaPayHandle,
          location: currentUser.locationCity,
        },
        [recipientId]: {
          id: recipientId,
          name: recipient ? recipient.fullName : 'User',
          avatar: recipient ? recipient.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          role: recipient ? recipient.role : 'volunteer',
          isVerifiedOwner: recipient?.ownerStatus === 'approved',
          mobileNumber: recipient?.mobileNumber,
          instaPayHandle: recipient?.instaPayHandle,
          location: recipient?.locationCity,
        },
      },
      requestId,
      requestTitle,
      lastMessage: 'Conversation initiated.',
      lastMessageTime: new Date().toISOString(),
      unreadCount: {
        [currentUser.id]: 0,
        [recipientId]: 0,
      },
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    setActiveTab('messages');
    return newConvId;
  };

  const markConversationRead = (conversationId: string) => {
    if (!currentUser) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: { ...c.unreadCount, [currentUser.id]: 0 },
          };
        }
        return c;
      })
    );

    setMessages((prev) =>
      prev.map((m) =>
        m.conversationId === conversationId && m.senderId !== currentUser.id
          ? { ...m, isRead: true }
          : m
      )
    );
  };

  // 8. Reviews
  const submitReview = (
    requestId: string,
    toUserId: string,
    rating: number,
    comment: string,
    tags: string[]
  ) => {
    submitDetailedReview(requestId, toUserId, rating, comment, tags);
  };

  const submitDetailedReview = (
    requestId: string,
    toUserId: string,
    rating: number,
    comment: string,
    tags: string[],
    detailedRatings?: {
      reliability?: number;
      helpfulness?: number;
      communication?: number;
      respect?: number;
      accuracy?: number;
    }
  ) => {
    if (!currentUser) return;

    // Check if already reviewed
    const existing = reviews.find(
      (r) => r.requestId === requestId && r.fromUserId === currentUser.id && r.toUserId === toUserId
    );
    if (existing) return;

    const req = requests.find((r) => r.id === requestId);
    const toUser = users.find((u) => u.id === toUserId);

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      requestId,
      requestTitle: req ? req.title : 'Completed Task',
      fromUserId: currentUser.id,
      fromUserName: currentUser.fullName,
      fromUserRole: currentUser.role,
      toUserId,
      toUserName: toUser ? toUser.fullName : 'User',
      rating,
      comment,
      tags,
      detailedRatings,
      createdAt: new Date().toISOString(),
      isModerated: false,
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate target user ratings
    if (toUser) {
      const userReviews = [...reviews.filter((r) => r.toUserId === toUserId), newReview];
      const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      
      // Bonus points for 5 star review
      const bonusPts = rating === 5 ? (pointRules.reviewBonus || 20) : 0;

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === toUserId) {
            const currentPoints = (u.points || 0) + bonusPts;
            return {
              ...u,
              ratingsAvg: Number(avg.toFixed(2)),
              ratingsCount: userReviews.length,
              points: currentPoints,
            };
          }
          return u;
        })
      );

      if (bonusPts > 0) {
        setPointLogs((prev) => [
          {
            id: `pt_${Date.now()}`,
            userId: toUserId,
            amount: bonusPts,
            reasonEn: `Received 5-star review from ${currentUser.fullName}`,
            reasonAr: `الحصول على تقييم 5 نجوم من ${currentUser.fullName}`,
            timestamp: new Date().toISOString(),
            type: 'bonus',
          },
          ...prev,
        ]);
      }

      logUserActivity(
        toUserId,
        'review_received',
        `Received ${rating}-Star Review`,
        `استلام تقييم ${rating} نجوم`,
        `From ${currentUser.fullName}: "${comment.slice(0, 45)}..."`,
        `من ${currentUser.fullName}: "${comment.slice(0, 45)}..."`,
        bonusPts
      );

      // Notify target user
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: toUserId,
        type: 'review',
        titleEn: 'New Review & Rating Received',
        titleAr: 'تقييم ومراجعة جديدة',
        messageEn: `${currentUser.fullName} gave you ${rating} stars: "${comment.slice(0, 45)}..."`,
        messageAr: `قيّمك ${currentUser.fullName} بـ ${rating} نجوم: "${comment.slice(0, 45)}..."`,
        link: 'history',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    triggerConfetti();
  };

  // 9. Safety & Reporting
  const submitReport = (
    targetType: ReportTargetType,
    targetId: string,
    targetExcerpt: string,
    reportedUserId: string | undefined,
    reason: ReportReason,
    details: string
  ) => {
    if (!currentUser) return;
    const reportedUser = users.find((u) => u.id === reportedUserId);

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.fullName,
      targetType,
      targetId,
      targetExcerpt,
      reportedUserId,
      reportedUserName: reportedUser?.fullName,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);

    // Notify admins
    const admins = users.filter((u) => u.role === 'admin');
    const adminNotifs: NotificationItem[] = admins.map((adm) => ({
      id: `notif_${Date.now()}_${adm.id}`,
      userId: adm.id,
      type: 'admin_alert',
      titleEn: 'New Safety Report Submitted',
      titleAr: 'بلاغ أمان جديد بحاجة للمراجعة',
      messageEn: `Report on ${targetType} by ${currentUser.fullName} (${reason})`,
      messageAr: `بلاغ عن ${targetType} من ${currentUser.fullName} (السبب: ${reason})`,
      link: 'admin',
      isRead: false,
      createdAt: new Date().toISOString(),
    }));
    setNotifications((prev) => [...adminNotifs, ...prev]);
  };

  const adminResolveReport = (
    reportId: string,
    action: 'dismiss' | 'remove' | 'suspend',
    adminNotes?: string
  ) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: action === 'dismiss' ? 'dismissed' : 'resolved',
              adminNotes: adminNotes || `Action taken: ${action}`,
            }
          : r
      )
    );

    if (action === 'remove') {
      if (report.targetType === 'post') {
        setRequests((prev) => prev.filter((req) => req.id !== report.targetId));
      } else if (report.targetType === 'comment') {
        setComments((prev) => prev.filter((c) => c.id !== report.targetId));
      }
    } else if (action === 'suspend' && report.reportedUserId) {
      adminSuspendUser(report.reportedUserId, true);
    }
  };

  // 10. Admin Actions
  const adminApproveOwner = (ownerId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === ownerId
          ? { ...u, ownerStatus: 'approved', rejectionReason: undefined }
          : u
      )
    );

    if (currentUser?.id === ownerId) {
      setCurrentUser({
        ...currentUser,
        ownerStatus: 'approved',
        rejectionReason: undefined,
      });
    }

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: ownerId,
      type: 'verification',
      titleEn: 'Account Verified! You Can Now Post Requests',
      titleAr: 'تم توثيق وتفعيل حسابك بنجاح!',
      messageEn: 'Your eligibility document was approved. You can now publish volunteer help requests.',
      messageAr: 'تمت الموافقة على وثيقة التوثيق الخاصة بك. يمكنك الآن نشر طلبات المساعدة المجتمعية.',
      link: 'home',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    triggerConfetti();
  };

  const adminRejectOwner = (ownerId: string, reason: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === ownerId
          ? { ...u, ownerStatus: 'rejected', rejectionReason: reason }
          : u
      )
    );

    if (currentUser?.id === ownerId) {
      setCurrentUser({
        ...currentUser,
        ownerStatus: 'rejected',
        rejectionReason: reason,
      });
    }

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: ownerId,
      type: 'rejection',
      titleEn: 'Document Verification Rejected',
      titleAr: 'تم رفض وثيقة التوثيق',
      messageEn: `Reason: ${reason}. Please update and resubmit your document in Profile Settings.`,
      messageAr: `السبب: ${reason}. يرجى تصحيح الوثيقة وإعادة تقديمها عبر الملف الشخصي.`,
      link: 'profile',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const adminSuspendUser = (userId: string, suspend: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: suspend } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, isSuspended: suspend });
    }

    // Best-effort database sync if Supabase is active
    if (isSupabaseConfigured) {
      SupabaseService.updateProfile(userId, { isSuspended: suspend }).catch((err) => {
        console.warn('Could not sync user suspension to Supabase:', err);
      });
    }

    // Log admin activity
    const targetUser = users.find((u) => u.id === userId);
    const targetName = targetUser?.fullName || targetUser?.username || userId;
    logUserActivity(
      currentUser?.id || 'admin',
      'admin_action',
      suspend ? `User Banned: ${targetName}` : `User Unbanned: ${targetName}`,
      suspend ? `تم حظر المستخدم: ${targetName}` : `تم إلغاء حظر المستخدم: ${targetName}`,
      suspend ? `Admin restricted access for ${targetName}` : `Admin restored access for ${targetName}`,
      suspend ? `قامت الإدارة بإيقاف حساب ${targetName}` : `قامت الإدارة بإعادة تفعيل حساب ${targetName}`
    );

    // Send notification to the user
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId,
      type: 'system',
      titleEn: suspend ? 'Account Suspended' : 'Account Reinstated',
      titleAr: suspend ? 'تم إيقاف حسابك' : 'تمت إعادة تفعيل حسابك',
      messageEn: suspend
        ? 'Your account has been banned / suspended by the administrator.'
        : 'Your account suspension has been lifted. You can now use all platform features.',
      messageAr: suspend
        ? 'تم حظر حسابك من قبل إدارة المنصة. يرجى التواصل مع الدعم الفني للاستفسار.'
        : 'تم رفع الحظر عن حسابك ويمكنك الآن استخدام كافة خدمات المنصة.',
      link: 'profile',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const toggleUserBan = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    adminSuspendUser(userId, !target.isSuspended);
  };

  const banUser = (userId: string) => {
    adminSuspendUser(userId, true);
  };

  const unbanUser = (userId: string) => {
    adminSuspendUser(userId, false);
  };

  const adminChangeUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const adminAddCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const adminUpdateCategory = (category: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
  };

  const adminDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const adminUpdatePointRules = (rules: PointRules) => {
    setPointRules(rules);
  };

  const adminAddBadge = (badgeData: Omit<Badge, 'id'>) => {
    const newBadge: Badge = {
      ...badgeData,
      id: `badge_${Date.now()}`,
    };
    setBadges((prev) => [...prev, newBadge]);
  };

  const adminUpdateBadge = (badge: Badge) => {
    setBadges((prev) => prev.map((b) => (b.id === badge.id ? badge : b)));
  };

  const adminDeleteBadge = (badgeId: string) => {
    setBadges((prev) => prev.filter((b) => b.id !== badgeId));
  };

  const adminUpdateLevel = (level: VolunteerLevel) => {
    setLevels((prev) => prev.map((l) => (l.id === level.id ? level : l)));
  };

  const adminAddLevel = (levelData: Omit<VolunteerLevel, 'id'>) => {
    const newLvl: VolunteerLevel = {
      ...levelData,
      id: `lvl_${Date.now()}`,
    };
    setLevels((prev) => [...prev, newLvl]);
  };

  const adminAdjustUserPoints = (
    userId: string,
    delta: number,
    reasonEn: string,
    reasonAr: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedPoints = Math.max(0, (u.points || 0) + delta);
          return { ...u, points: updatedPoints };
        }
        return u;
      })
    );

    const log: PointTransaction = {
      id: `pt_${Date.now()}`,
      userId,
      amount: delta,
      reasonEn,
      reasonAr,
      timestamp: new Date().toISOString(),
      type: delta >= 0 ? 'bonus' : 'adjustment',
    };
    setPointLogs((prev) => [log, ...prev]);
  };

  // 11. Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  const unreadNotificationsCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length
    : 0;

  // 12. Certificates
  const generateCertificate = (
    volunteerId: string,
    titleEn?: string,
    titleAr?: string
  ): VolunteerCertificate | null => {
    const volunteer = users.find((u) => u.id === volunteerId);
    if (!volunteer) return null;

    const cert: VolunteerCertificate = {
      id: `cert_${Date.now()}`,
      volunteerId: volunteer.id,
      volunteerName: volunteer.fullName,
      totalHours: volunteer.volunteerHours || 0,
      tasksCompleted: volunteer.completedTasksCount || 0,
      issueDate: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      issuedBy: 'Sanad Volunteer Network Authority',
      certificateNumber: `SANAD-VOL-${Math.floor(100000 + Math.random() * 900000)}`,
      verificationCode: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      titleEn: titleEn || 'Certified Community Volunteer',
      titleAr: titleAr || 'متطوع مجتمعي معتمد',
    };

    setCertificates((prev) => {
      const exists = prev.some((c) => c.volunteerId === volunteerId && c.tasksCompleted === cert.tasksCompleted);
      return exists ? prev : [cert, ...prev];
    });

    // Notify user
    const notif: NotificationItem = {
      id: `notif_cert_${Date.now()}`,
      userId: volunteer.id,
      type: 'badge_earned',
      titleEn: 'Official Volunteer Certificate Issued!',
      titleAr: 'تم إصدار شهادة تطوع معتمدة رسمية!',
      messageEn: `Your volunteer certificate #${cert.certificateNumber} is now ready to view & download in your History.`,
      messageAr: `شهادتك التطوعية برقم #${cert.certificateNumber} جاهزة الآن للعرض والتحميل في سجلك.`,
      link: 'history',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    logUserActivity(
      volunteer.id,
      'certificate_issued',
      `Certificate Issued: #${cert.certificateNumber}`,
      `تم إصدار شهادة رسمية: #${cert.certificateNumber}`,
      `${cert.tasksCompleted} Tasks, ${cert.totalHours} Hours`,
      `${cert.tasksCompleted} مهام، ${cert.totalHours} ساعات معتمدة`
    );

    return cert;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        toggleTheme,
        isSupabaseConfigured: isSupabaseConfigured(),
        isSupabaseLoading,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        currentUser,
        setCurrentUser,
        login,
        register,
        logout,
        switchDemoUser,
        updateUserProfile,
        resubmitVerificationDoc,
        blockUser,
        unblockUser,
        deactivateAccount,
        activeTab,
        setActiveTab,
        selectedRequestId,
        setSelectedRequestId,
        users,
        categories,
        requests,
        applications,
        assignments,
        comments,
        conversations,
        messages,
        reviews,
        reports,
        notifications,
        badges,
        levels,
        certificates,
        activityLogs,
        pointLogs,
        pointRules,
        createRequest,
        updateRequestStatus,
        toggleSaveRequest,
        applyToRequest,
        applyForRequest,
        cancelVolunteerAssignment,
        acceptApplication,
        rejectApplication,
        addComment,
        deleteComment,
        startAssignment,
        completeAssignment,
        removeVolunteerFromAssignment,
        reassignVolunteer,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        deleteMessage,
        startOrGetConversation,
        markConversationRead,
        submitReview,
        submitDetailedReview,
        submitReport,
        adminResolveReport,
        adminApproveOwner,
        adminRejectOwner,
        adminSuspendUser,
        toggleUserBan,
        banUser,
        unbanUser,
        adminChangeUserRole,
        adminAddCategory,
        adminUpdateCategory,
        adminDeleteCategory,
        adminUpdatePointRules,
        adminAddBadge,
        adminUpdateBadge,
        adminDeleteBadge,
        adminUpdateLevel,
        adminAddLevel,
        adminAdjustUserPoints,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
        generateCertificate,
        logUserActivity,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
