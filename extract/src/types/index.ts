export type UserRole = 'volunteer' | 'owner' | 'admin';

export type OwnerVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserPrivacySettings {
  showPhoneToPublic: boolean;
  showPhoneToAssignedOnly: boolean;
  showInstaPay: boolean;
  showApproximateLocationOnly: boolean;
  allowDirectMessages: boolean;
  showOnPublicLeaderboard: boolean;
}

export interface Badge {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  category: 'assignments' | 'hours' | 'points' | 'emergency' | 'rating' | 'streak' | 'special';
  requirementType: 'tasks_count' | 'hours_count' | 'points_milestone' | 'emergency_count' | 'rating_avg' | 'streak_weeks' | 'manual';
  requirementValue: number;
  pointsReward?: number;
  pointsRequired?: number;
  enabled: boolean;
  unlockedAt?: string;
}

export interface VolunteerLevel {
  id: string;
  levelNumber: number;
  nameEn: string;
  nameAr: string;
  minPoints: number;
  maxPoints: number;
  badgeIcon: string;
  color: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  createdAt: string;
  isSuspended: boolean;
  blockedUserIds: string[];
  privacy: UserPrivacySettings;

  // Owner specific fields
  mobileNumber?: string;
  ownerStatus?: OwnerVerificationStatus;
  organizationOrJob?: string;
  verificationDocUrl?: string;
  verificationDocName?: string;
  rejectionReason?: string;
  instaPayHandle?: string;
  locationCity?: string;
  locationDistrict?: string;

  // Volunteer specific fields
  skills?: string[];
  interests?: string[];
  preferredCategories?: string[];
  availability?: string[]; // e.g. ['weekends', 'weekday_mornings', 'weekday_evenings', 'flexible']
  volunteerHours?: number;
  completedTasksCount?: number;
  cancelledTasksCount?: number;
  points?: number;
  volunteerPoints?: number;
  rating?: number;
  levelId?: string;
  badges?: string[]; // badge IDs
  ratingsAvg?: number;
  ratingsCount?: number;
  experienceBio?: string;
  activeStreakWeeks?: number;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  color: string;
  descriptionEn: string;
  descriptionAr: string;
  isActive: boolean;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export type RequestStatus = 'open' | 'volunteer_assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface HelpRequest {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerMobile?: string;
  ownerCity: string;
  ownerDistrict?: string;
  ownerIsVerified: boolean;
  title: string;
  description: string;
  categoryId: string;
  urgency: UrgencyLevel;
  requiredSkills: string[];
  volunteersNeeded: number;
  volunteersAssigned: string[]; // volunteer IDs
  
  // Financial / InstaPay details (optional)
  isDonationRequested: boolean;
  donationGoal?: number;
  donationRaised?: number;
  instaPayHandle?: string;
  
  images: string[];
  scheduledDate: string;
  estimatedHours?: number;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  recurringScheduleText?: string;
  
  status: RequestStatus;
  savedByUsers: string[];
  createdAt: string;
  completedAt?: string;
}

export type ApplicationStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'cancelled_by_volunteer';

export type AssignmentStatus = 
  | 'applied'
  | 'accepted'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface VolunteerApplication {
  id: string;
  requestId: string;
  requestTitle: string;
  volunteerId: string;
  volunteerName: string;
  volunteerAvatar: string;
  volunteerSkills: string[];
  volunteerHours: number;
  volunteerRating: number;
  message: string;
  availableSlot: string;
  status: ApplicationStatus;
  cancellationReason?: string;
  appliedAt: string;
}

export interface VolunteerAssignment {
  id: string;
  requestId: string;
  requestTitle: string;
  requestDescription?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  ownerMobile?: string;
  ownerCity?: string;
  ownerDistrict?: string;
  volunteerId: string;
  volunteerName: string;
  volunteerAvatar?: string;
  volunteerRole?: string;
  applicationId?: string;
  categoryId?: string;
  urgency?: UrgencyLevel;
  description?: string;
  requiredSkills?: string[];
  volunteersNeeded?: number;
  volunteersAssignedCount?: number;
  status: AssignmentStatus;
  scheduledDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  pointsEarned?: number;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  notes?: string;
  cancellationReason?: string;
  appliedAt?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface Comment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  isVerifiedOwner?: boolean;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  replyToId?: string;
  replyToText?: string;
  isDeleted?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  participantDetails: {
    [userId: string]: {
      id: string;
      name: string;
      avatar: string;
      role: UserRole;
      isVerifiedOwner?: boolean;
      mobileNumber?: string;
      instaPayHandle?: string;
      location?: string;
    };
  };
  requestId?: string;
  requestTitle?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageAt?: string;
  updatedAt?: string;
  unreadCount: { [userId: string]: number };
}

export interface Review {
  id: string;
  requestId: string;
  requestTitle: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserName: string;
  targetUserId?: string;
  targetUserName?: string;
  authorName?: string;
  authorRole?: string;
  rating: number; // 1-5
  reliabilityRating?: number;
  helpfulnessRating?: number;
  communicationRating?: number;
  respectRating?: number;
  accuracyRating?: number;
  detailedRatings?: {
    reliability?: number;
    communication?: number;
    punctuality?: number;
    helpfulness?: number;
    accuracy?: number;
    respect?: number;
  };
  comment: string;
  tags: string[];
  createdAt: string;
  isModerated: boolean;
}

export type ReportTargetType = 'post' | 'comment' | 'user' | 'message';
export type ReportReason = 'spam' | 'harassment' | 'fraud' | 'inappropriate' | 'safety' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetExcerpt: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'message' 
  | 'application' 
  | 'approval' 
  | 'rejection' 
  | 'verification' 
  | 'status_change' 
  | 'assignment_assigned'
  | 'assignment_new'
  | 'assignment_started'
  | 'assignment_status'
  | 'assignment_reminder'
  | 'assignment_completed'
  | 'assignment_cancelled'
  | 'comment' 
  | 'review' 
  | 'review_received'
  | 'badge_earned'
  | 'badge_unlocked'
  | 'level_up'
  | 'certificate_unlocked'
  | 'certificate_issued'
  | 'admin_alert'
  | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  reasonEn: string;
  reasonAr: string;
  timestamp: string;
  type: 'earn' | 'bonus' | 'certificate' | 'admin_adjustment' | 'adjustment';
  requestId?: string;
  requestTitle?: string;
}

export interface VolunteerCertificate {
  id: string;
  volunteerId: string;
  volunteerName: string;
  titleEn: string;
  titleAr: string;
  totalHours: number;
  tasksCompleted: number;
  pointsEarned?: number;
  levelNameEn?: string;
  levelNameAr?: string;
  issueDate: string;
  issuedBy: string;
  certificateNumber: string;
  verificationCode: string;
}

export type ActivityLogType =
  | 'assignment'
  | 'application'
  | 'points'
  | 'badge'
  | 'level'
  | 'review'
  | 'request'
  | 'request_created'
  | 'application_submitted'
  | 'assignment_started'
  | 'assignment_completed'
  | 'assignment_cancelled'
  | 'badge_unlocked'
  | 'level_up'
  | 'review_received'
  | 'certificate_issued'
  | 'admin_action';

export interface ActivityLog {
  id: string;
  userId: string;
  type: ActivityLogType;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  timestamp: string;
  link?: string;
  pointsDelta?: number;
}
