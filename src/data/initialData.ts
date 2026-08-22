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
} from '../types';

export interface PointRules {
  pointsPerTask: number;
  emergencyBonus: number;
  urgentBonus: number;
  pointsPerHour: number;
  positiveReviewBonus: number;
  recurringBonus: number;
  highSkillBonus: number;
}

export const INITIAL_POINT_RULES: PointRules = {
  pointsPerTask: 100,
  emergencyBonus: 50,
  urgentBonus: 25,
  pointsPerHour: 10,
  positiveReviewBonus: 10,
  recurringBonus: 20,
  highSkillBonus: 15,
};

export const INITIAL_LEVELS: VolunteerLevel[] = [
  {
    id: 'lvl_1',
    levelNumber: 1,
    nameEn: 'New Volunteer',
    nameAr: 'متطوع جديد',
    minPoints: 0,
    maxPoints: 249,
    badgeIcon: 'Sparkles',
    color: '#8c8c7d',
  },
  {
    id: 'lvl_2',
    levelNumber: 2,
    nameEn: 'Active Volunteer',
    nameAr: 'متطوع نشط',
    minPoints: 250,
    maxPoints: 749,
    badgeIcon: 'CheckCircle2',
    color: '#5a7a50',
  },
  {
    id: 'lvl_3',
    levelNumber: 3,
    nameEn: 'Trusted Volunteer',
    nameAr: 'متطوع موثوق',
    minPoints: 750,
    maxPoints: 1499,
    badgeIcon: 'ShieldCheck',
    color: '#42687a',
  },
  {
    id: 'lvl_4',
    levelNumber: 4,
    nameEn: 'Experienced Volunteer',
    nameAr: 'متطوع خبير',
    minPoints: 1500,
    maxPoints: 2999,
    badgeIcon: 'Award',
    color: '#7a5a3a',
  },
  {
    id: 'lvl_5',
    levelNumber: 5,
    nameEn: 'Community Hero',
    nameAr: 'بطل المجتمع',
    minPoints: 3000,
    maxPoints: 4999,
    badgeIcon: 'Heart',
    color: '#8a4055',
  },
  {
    id: 'lvl_6',
    levelNumber: 6,
    nameEn: 'Volunteer Champion',
    nameAr: 'نجم التطوع الذهبي',
    minPoints: 5000,
    maxPoints: 999999,
    badgeIcon: 'Crown',
    color: '#b8860b',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    nameEn: 'First Step',
    nameAr: 'الخطوة الأولى',
    descriptionEn: 'Complete your first volunteer assignment on Sanad',
    descriptionAr: 'إنجاز أول مهمة تطوعية على منصة سند',
    icon: 'Sparkles',
    category: 'assignments',
    requirementType: 'tasks_count',
    requirementValue: 1,
    pointsReward: 50,
    enabled: true,
  },
  {
    id: 'helping_hand',
    nameEn: 'Helping Hand',
    nameAr: 'يد العون',
    descriptionEn: 'Complete 5 volunteer assignments successfully',
    descriptionAr: 'إنجاز 5 مهام تطوعية بنجاح',
    icon: 'HeartHandshake',
    category: 'assignments',
    requirementType: 'tasks_count',
    requirementValue: 5,
    pointsReward: 100,
    enabled: true,
  },
  {
    id: 'community_hero',
    nameEn: 'Community Hero',
    nameAr: 'بطل المجتمع',
    descriptionEn: 'Complete 25 community volunteer assignments',
    descriptionAr: 'إنجاز 25 مهمة تطوعية مجتمعية',
    icon: 'Heart',
    category: 'assignments',
    requirementType: 'tasks_count',
    requirementValue: 25,
    pointsReward: 300,
    enabled: true,
  },
  {
    id: 'emergency_helper',
    nameEn: 'Emergency Helper',
    nameAr: 'منقذ الطوارئ',
    descriptionEn: 'Complete 5 emergency and rapid response requests',
    descriptionAr: 'إنجاز 5 مهام إغاثة وطوارئ عاجلة',
    icon: 'Flame',
    category: 'emergency',
    requirementType: 'emergency_count',
    requirementValue: 5,
    pointsReward: 150,
    enabled: true,
  },
  {
    id: 'time_giver_25',
    nameEn: 'Time Giver (25h)',
    nameAr: 'واهب الوقت (25 ساعة)',
    descriptionEn: 'Complete 25 certified volunteer hours',
    descriptionAr: 'إتمام 25 ساعة تطوعية معتمدة',
    icon: 'Clock',
    category: 'hours',
    requirementType: 'hours_count',
    requirementValue: 25,
    pointsReward: 150,
    enabled: true,
  },
  {
    id: 'time_giver_50',
    nameEn: 'Time Giver (50h)',
    nameAr: 'واهب الوقت (50 ساعة)',
    descriptionEn: 'Complete 50 certified volunteer hours',
    descriptionAr: 'إتمام 50 ساعة تطوعية معتمدة',
    icon: 'Award',
    category: 'hours',
    requirementType: 'hours_count',
    requirementValue: 50,
    pointsReward: 300,
    enabled: true,
  },
  {
    id: 'dedicated_volunteer',
    nameEn: 'Dedicated Volunteer',
    nameAr: 'المتطوع المثابر',
    descriptionEn: 'Volunteer for 10 consecutive weeks / recurring tasks',
    descriptionAr: 'التطوع المستمر لـ 10 أسابيع متتالية أو مهام دورية',
    icon: 'Calendar',
    category: 'streak',
    requirementType: 'streak_weeks',
    requirementValue: 10,
    pointsReward: 250,
    enabled: true,
  },
  {
    id: 'trusted_volunteer',
    nameEn: 'Trusted Volunteer',
    nameAr: 'المتطوع الموثوق (5 نجوم)',
    descriptionEn: 'Maintain a high 4.8+ average rating across reviews',
    descriptionAr: 'الحفاظ على متوسط تقييم 4.8 أو أعلى عبر التقييمات',
    icon: 'Star',
    category: 'rating',
    requirementType: 'rating_avg',
    requirementValue: 4.8,
    pointsReward: 200,
    enabled: true,
  },
  {
    id: 'super_volunteer',
    nameEn: 'Super Volunteer',
    nameAr: 'المتطوع الخارق (1,000 نقطة)',
    descriptionEn: 'Reach the 1,000 total volunteer points milestone',
    descriptionAr: 'الوصول إلى حاجز 1,000 نقطة تطوعية تراكمية',
    icon: 'Crown',
    category: 'points',
    requirementType: 'points_milestone',
    requirementValue: 1000,
    pointsReward: 200,
    enabled: true,
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'food',
    nameEn: 'Food & Meals',
    nameAr: 'إطعام وتوزيع وجبات',
    icon: 'Utensils',
    color: 'emerald',
    descriptionEn: 'Meal prep, grocery shopping, food bank sorting and deliveries.',
    descriptionAr: 'تجهيز وتوزيع الوجبات، شراء المؤن والمساعدات الغذائية.',
    isActive: true,
  },
  {
    id: 'elderly',
    nameEn: 'Elderly Assistance',
    nameAr: 'رعاية كبار السن',
    icon: 'HeartHandshake',
    color: 'rose',
    descriptionEn: 'Companionship, errands, home check-ins, reading, and gentle care.',
    descriptionAr: 'المرافقة، قضاء الاحتياجات، الزيارات الودية والرعاية المنزلية.',
    isActive: true,
  },
  {
    id: 'medical',
    nameEn: 'Medical & Health',
    nameAr: 'رعاية صحية وطبية',
    icon: 'Cross',
    color: 'red',
    descriptionEn: 'Clinic escorts, medication delivery, first aid, healthcare support.',
    descriptionAr: 'مرافقة العيادات، توصيل الأدوية، الإسعافات الأولية والدعم الصحي.',
    isActive: true,
  },
  {
    id: 'education',
    nameEn: 'Education & Tutoring',
    nameAr: 'تعليم ومحو أمية',
    icon: 'GraduationCap',
    color: 'indigo',
    descriptionEn: 'Academic tutoring, language learning, literacy, school supplies.',
    descriptionAr: 'دروس تقوية للطلاب، محو أمية، تعليم لغات وتجهيز الحقائب المدرسية.',
    isActive: true,
  },
  {
    id: 'transportation',
    nameEn: 'Transportation & Mobility',
    nameAr: 'توصيل وتنقلات',
    icon: 'Car',
    color: 'amber',
    descriptionEn: 'Rides to hospitals, moving lightweight equipment, logistics.',
    descriptionAr: 'توصيل للمستشفيات، نقل أجهزة خفيفة أو مستلزمات ضرورية.',
    isActive: true,
  },
  {
    id: 'technology',
    nameEn: 'Tech & Digital Support',
    nameAr: 'دعم تقني وتكنولوجي',
    icon: 'Laptop',
    color: 'blue',
    descriptionEn: 'Device setup, teaching smartphone basics, online form assistance.',
    descriptionAr: 'إعداد الأجهزة، تدريب على الهواتف الذكية، المساعدة في الخدمات الإلكترونية.',
    isActive: true,
  },
  {
    id: 'donations',
    nameEn: 'Donations & Clothing',
    nameAr: 'كساء وتبرعات عينية',
    icon: 'Gift',
    color: 'purple',
    descriptionEn: 'Sorting clothes, blankets distribution, furniture donations.',
    descriptionAr: 'فرز وتوزيع الملابس، الأغطية الشتوية، والأثاث للمستحقين.',
    isActive: true,
  },
  {
    id: 'community',
    nameEn: 'Community & Environment',
    nameAr: 'خدمة وتجميل المجتمع',
    icon: 'Trees',
    color: 'teal',
    descriptionEn: 'Neighborhood cleanups, tree planting, community center repairs.',
    descriptionAr: 'حملات النظافة والتشجير وصيانة المراكز المجتمعية.',
    isActive: true,
  },
  {
    id: 'emergency',
    nameEn: 'Emergency Relief',
    nameAr: 'إغاثة وطوارئ عاجلة',
    icon: 'AlertTriangle',
    color: 'orange',
    descriptionEn: 'Rapid response to urgent crises, disaster help, blood drives.',
    descriptionAr: 'استجابة سريعة للأزمات الإنسانية والنداءات العاجلة والتبرع بالدم.',
    isActive: true,
  },
];

// Clean baseline initial data for production
export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_motakademgawy',
    email: 'motakademgawy@gmail.com',
    username: 'motakademgawy',
    fullName: 'Motakadem Gawy (Admin)',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Sanad Platform Administrator & Lead Coordinator',
    mobileNumber: '+201000000000',
    organizationOrJob: 'Sanad Volunteer Network',
    locationCity: 'Cairo',
    locationDistrict: 'Maadi',
    points: 10000,
    badges: ['first_step', 'community_hero', 'trusted_volunteer', 'super_volunteer'],
    ratingsAvg: 5.0,
    ratingsCount: 48,
    createdAt: '2024-01-01T00:00:00.000Z',
    isSuspended: false,
    blockedUserIds: [],
    privacy: {
      showPhoneToPublic: true,
      showPhoneToAssignedOnly: false,
      showInstaPay: true,
      showApproximateLocationOnly: false,
      allowDirectMessages: true,
      showOnPublicLeaderboard: true,
    },
  },
];

export const INITIAL_REQUESTS: HelpRequest[] = [];

export const INITIAL_APPLICATIONS: VolunteerApplication[] = [];

export const INITIAL_ASSIGNMENTS: VolunteerAssignment[] = [];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_REPORTS: Report[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_POINT_LOGS: PointTransaction[] = [];

export const INITIAL_CERTIFICATES: VolunteerCertificate[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

