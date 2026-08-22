import React, { useState, useMemo } from 'react';
import {
  Send,
  MessageCircle,
  ShieldCheck,
  Search,
  User as UserIcon,
  Phone,
  Lock,
  Heart,
  AlertTriangle,
  Reply,
  X,
  Trash2,
  Calendar,
  Eye,
  CheckCheck,
  Plus,
  MessageSquarePlus,
  ArrowLeft,
  Users,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface ChatViewProps {
  onOpenReportModal: (targetId: string, excerpt: string, ownerId?: string) => void;
  onOpenRequestDetails?: (requestId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  onOpenReportModal,
  onOpenRequestDetails,
}) => {
  const {
    t,
    language,
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    currentUser,
    users,
    messages,
    deleteMessage,
    startOrGetConversation,
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userDirectorySearch, setUserDirectorySearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'volunteer' | 'owner' | 'admin'>('all');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  if (!currentUser) return null;

  // Filter conversations for the current user
  const userConversations = useMemo(() => {
    return conversations
      .filter((c) => c.participants.includes(currentUser.id))
      .sort((a, b) => {
        const timeA = new Date(b.updatedAt || b.lastMessageAt || 0).getTime();
        const timeB = new Date(a.updatedAt || a.lastMessageAt || 0).getTime();
        return timeA - timeB;
      });
  }, [conversations, currentUser]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return userConversations;
    const q = searchQuery.toLowerCase();
    return userConversations.filter((c) => {
      const otherId = c.participants.find((id) => id !== currentUser.id);
      const otherUser = users.find((u) => u.id === otherId);
      return (
        otherUser?.fullName.toLowerCase().includes(q) ||
        otherUser?.role.toLowerCase().includes(q) ||
        otherUser?.locationCity?.toLowerCase().includes(q) ||
        c.requestTitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    });
  }, [userConversations, searchQuery, users, currentUser]);

  const activeConv =
    userConversations.find((c) => c.id === activeConversationId) || userConversations[0];

  // Get recipient info
  const recipientId = activeConv?.participants.find((id) => id !== currentUser.id);
  const recipient = users.find((u) => u.id === recipientId);

  // Active messages
  const activeMessages = useMemo(() => {
    if (!activeConv) return [];
    return messages
      .filter((m) => m.conversationId === activeConv.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, activeConv]);

  // Filter available other users to message
  const directoryUsers = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUser.id && !u.isBanned)
      .filter((u) => {
        if (userRoleFilter === 'all') return true;
        return u.role === userRoleFilter;
      })
      .filter((u) => {
        if (!userDirectorySearch.trim()) return true;
        const q = userDirectorySearch.toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.locationCity?.toLowerCase().includes(q) ||
          u.locationDistrict?.toLowerCase().includes(q) ||
          u.bio?.toLowerCase().includes(q) ||
          u.skills?.some((s) => s.toLowerCase().includes(q))
        );
      });
  }, [users, currentUser, userRoleFilter, userDirectorySearch]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;
    sendMessage(
      activeConv.id,
      messageInput.trim(),
      replyingTo?.id,
      replyingTo?.text
    );
    setMessageInput('');
    setReplyingTo(null);
  };

  const handleStartChatWithUser = (user: User) => {
    const convId = startOrGetConversation(user.id);
    setActiveConversationId(convId);
    setIsNewChatModalOpen(false);
    setMobileShowChat(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-[#24241f] rounded-3xl border border-[#e2e2d9] dark:border-[#383830] shadow-sm overflow-hidden flex flex-col md:flex-row h-[78vh]">
        {/* Sidebar: Conversations List */}
        <div
          className={`w-full md:w-80 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-[#e2e2d9] dark:border-[#383830] flex flex-col ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-[#e2e2d9] dark:border-[#383830] space-y-3 bg-[#fafaf7] dark:bg-[#20201a]">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] flex items-center gap-2 font-serif">
                <MessageCircle className="w-4 h-4 text-[#5a5a40] dark:text-[#a8a880]" />
                <span>{t('chatTab')}</span>
              </h2>
              
              <button
                id="compose-new-message-btn"
                onClick={() => setIsNewChatModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={t('newMessage')}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('newMessage')}</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-[#7c7c6e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث في المحادثات...' : 'Search conversations...'}
                className="w-full pl-8 rtl:pl-3 rtl:pr-8 pr-3 py-1.5 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-white dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#eaeae2] dark:divide-[#383830]">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7c7c6e] space-y-3">
                <MessageCircle className="w-9 h-9 mx-auto text-[#b0b0a0] dark:text-[#525244]" />
                <p className="font-semibold">{language === 'ar' ? 'لا توجد محادثات بعد' : 'No messages yet.'}</p>
                <p className="text-[11px] leading-relaxed">
                  {language === 'ar'
                    ? 'يمكنك التواصل الفوري مع أي متطوع، صاحب طلب، أو عضو في المنصة.'
                    : 'Communicate directly with any volunteer, help seeker, or platform member.'}
                </p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#5a5a40] text-white text-xs font-bold hover:bg-[#484833] transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>{t('startNewChat')}</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherId = conv.participants.find((id) => id !== currentUser.id);
                const otherUser = users.find((u) => u.id === otherId);
                const isActive = activeConv?.id === conv.id;
                const unread = conv.unreadCount && conv.unreadCount[currentUser.id] > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setMobileShowChat(true);
                    }}
                    className={`p-3.5 cursor-pointer transition flex items-center gap-3 ${
                      isActive
                        ? 'bg-[#e2e7dc]/50 dark:bg-[#2b3524]/50 border-r-2 rtl:border-r-0 rtl:border-l-2 border-[#5a5a40]'
                        : 'hover:bg-[#f8f8f5] dark:hover:bg-[#2c2c24]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          otherUser?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
                        }
                        alt="User avatar"
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-[#d8d8cc] dark:ring-[#3d3d32] flex-shrink-0"
                      />
                      {otherUser?.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#5a5a40] text-white flex items-center justify-center text-[8px]">
                          ✓
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="font-bold text-xs text-[#2c2c2c] dark:text-[#f3f3ed] truncate">
                            {otherUser?.fullName || 'User'}
                          </h4>
                          {otherUser?.role && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-[#eaeae2] dark:bg-[#33332a] text-[#555546] dark:text-[#c4c4b2] capitalize shrink-0">
                              {otherUser.role === 'owner' ? (language === 'ar' ? 'صاحب طلب' : 'Seeker') : otherUser.role === 'admin' ? (language === 'ar' ? 'إدارة' : 'Admin') : (language === 'ar' ? 'متطوع' : 'Volunteer')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#7c7c6e] shrink-0">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      {conv.requestTitle && (
                        <span className="text-[10px] font-semibold text-[#5a5a40] dark:text-[#a8a880] truncate block">
                          📌 {conv.requestTitle}
                        </span>
                      )}

                      <p className={`text-[11px] truncate mt-0.5 ${unread ? 'font-bold text-[#2c2c2c] dark:text-[#f3f3ed]' : 'text-[#7c7c6e]'}`}>
                        {conv.lastMessage || (language === 'ar' ? 'بدء محادثة جديدة' : 'New message')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main: Active Chat Window */}
        {activeConv && recipient ? (
          <div
            className={`flex-1 flex flex-col bg-[#f8f8f5] dark:bg-[#1a1a16] ${
              !mobileShowChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-[#24241f] border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 rounded-lg text-[#7c7c6e] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                </button>

                <img
                  src={recipient.avatar}
                  alt={recipient.fullName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#5a5a40]/20 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-xs sm:text-sm text-[#2c2c2c] dark:text-[#f3f3ed]">
                      {recipient.fullName}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb] capitalize">
                      {recipient.role === 'owner' ? (language === 'ar' ? 'صاحب طلب' : 'Seeker') : recipient.role === 'admin' ? (language === 'ar' ? 'إدارة' : 'Admin') : (language === 'ar' ? 'متطوع' : 'Volunteer')}
                    </span>
                    {recipient.level && (
                      <span className="text-[10px] text-[#5a5a40] dark:text-[#a8a880] font-semibold">
                        • {recipient.level}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7c7c6e]">
                    {recipient.locationCity || 'Cairo'}{recipient.locationDistrict ? `, ${recipient.locationDistrict}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeConv.requestId && onOpenRequestDetails && (
                  <button
                    onClick={() => onOpenRequestDetails(activeConv.requestId!)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#ecece4] dark:bg-[#2e2e26] hover:bg-[#dfdfd6] text-[#2c2c2c] dark:text-[#f3f3ed] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'عرض الطلب' : 'Request'}</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    onOpenReportModal(
                      recipient.id,
                      `Chat with ${recipient.fullName}`,
                      recipient.id
                    )
                  }
                  className="p-1.5 text-[#7c7c6e] hover:text-[#a84438] rounded-lg hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                  title="Report User"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Linked Request Banner */}
            {activeConv.requestTitle && (
              <div className="px-4 py-2 bg-[#f0ede6] dark:bg-[#2b2b24] border-b border-[#dfdbcf] dark:border-[#3c3c32] text-xs text-[#555546] dark:text-[#d0d0be] flex items-center justify-between">
                <span className="truncate">
                  <strong className="font-bold">{language === 'ar' ? 'الموضوع:' : 'Regarding:'} </strong>
                  {activeConv.requestTitle}
                </span>
                {activeConv.requestId && onOpenRequestDetails && (
                  <button
                    onClick={() => onOpenRequestDetails(activeConv.requestId!)}
                    className="text-[11px] font-bold text-[#5a5a40] dark:text-[#c4c4aa] hover:underline flex-shrink-0 cursor-pointer"
                  >
                    {language === 'ar' ? 'التفاصيل' : 'Details'}
                  </button>
                )}
              </div>
            )}

            {/* Safety Reminder Banner */}
            <div className="px-4 py-1.5 bg-[#f4ebe1] dark:bg-[#3d3023] border-b border-[#e2d5c3] dark:border-[#4d3d2e] text-[11px] text-[#704825] dark:text-[#e0b992] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#94672e]" />
              <span>
                {language === 'ar'
                  ? 'من أجل سلامتك: لا تشارك أبداً كلمات المرور أو أرقام الحسابات البنكية السرية.'
                  : 'For your safety, never share bank OTPs or private passwords.'}
              </span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const senderName = isMe ? currentUser.fullName : recipient.fullName;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Reply banner quote if present */}
                    {msg.replyToText && (
                      <div
                        className={`text-[10px] p-2 rounded-t-xl mb-0.5 border-l-2 rtl:border-l-0 rtl:border-r-2 max-w-[80%] sm:max-w-md ${
                          isMe
                            ? 'bg-[#484833] text-[#e0e0d0] border-[#a0a088]'
                            : 'bg-[#ecece6] dark:bg-[#2a2a22] text-[#6c6c5c] dark:text-[#a0a090] border-[#5a5a40]'
                        }`}
                      >
                        <span className="font-bold block">↩ {language === 'ar' ? 'رداً على' : 'Replying to'}:</span>
                        <p className="truncate italic">{msg.replyToText}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Left action if me */}
                      {isMe && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#888878] hover:text-[#a83232] transition"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#5a5a40] text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#24241f] text-[#2c2c2c] dark:text-[#f3f3ed] rounded-bl-xs border border-[#e2e2d9] dark:border-[#383830] shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Reply button */}
                      <button
                        onClick={() =>
                          setReplyingTo({
                            id: msg.id,
                            text: msg.text,
                            senderName,
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#888878] hover:text-[#5a5a40] transition cursor-pointer"
                        title="Reply"
                      >
                        <Reply className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[10px] text-[#7c7c6e] mt-0.5 px-1 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isMe && <CheckCheck className="w-3 h-3 text-[#5a5a40] dark:text-[#a8a880]" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Replying banner indicator */}
            {replyingTo && (
              <div className="px-4 py-2 bg-[#f0ede6] dark:bg-[#282820] border-t border-[#dfdbcf] dark:border-[#3c3c32] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-[#5a5a40] flex-shrink-0" />
                  <span className="text-[11px] text-[#555546] dark:text-[#cecebd] truncate">
                    {language === 'ar' ? `الرد على ${replyingTo.senderName}: ` : `Replying to ${replyingTo.senderName}: `}
                    <span className="italic font-medium">"{replyingTo.text}"</span>
                  </span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-[#7c7c6e] hover:text-[#2c2c2c] transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white dark:bg-[#24241f] border-t border-[#e2e2d9] dark:border-[#383830] flex items-center gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={t('chatInputPlaceholder')}
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#5a5a40] hover:bg-[#484833] text-white rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#7c7c6e] space-y-3">
            <MessageSquarePlus className="w-12 h-12 text-[#b0b0a0] dark:text-[#525244]" />
            <p className="text-sm font-bold text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
              {language === 'ar' ? 'تواصل مع جميع أعضاء المجتمع' : 'Connect with any community account'}
            </p>
            <p className="text-xs max-w-sm">
              {language === 'ar' ? 'اختر محادثة من القائمة أو ابدأ محادثة مباشرة جديدة للتواصل الفوري.' : 'Select a conversation to start chatting or initiate a new direct conversation.'}
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newMessage')}</span>
            </button>
          </div>
        )}
      </div>

      {/* NEW MESSAGE / USER DIRECTORY MODAL */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#24241f] rounded-3xl max-w-2xl w-full border border-[#e2e2d9] dark:border-[#383830] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e2e2d9] dark:border-[#383830] flex items-center justify-between bg-[#fafaf7] dark:bg-[#20201a]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#e2e7dc] dark:bg-[#2b3524] text-[#3f4a35] dark:text-[#c7d5bb] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2c2c2c] dark:text-[#f3f3ed] font-serif">
                    {t('newMessage')}
                  </h3>
                  <p className="text-xs text-[#7c7c6e]">
                    {t('selectUserToMessage')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-2 rounded-xl text-[#7c7c6e] hover:bg-[#eaeae2] dark:hover:bg-[#2c2c24] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-[#e2e2d9] dark:border-[#383830] space-y-3 bg-[#fdfdfb] dark:bg-[#24241f]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 text-[#7c7c6e]" />
                <input
                  type="text"
                  value={userDirectorySearch}
                  onChange={(e) => setUserDirectorySearch(e.target.value)}
                  placeholder={t('searchUsersPlaceholder')}
                  className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 text-xs rounded-xl border border-[#d8d8cc] dark:border-[#3d3d32] bg-[#f8f8f5] dark:bg-[#2c2c24] text-[#2c2c2c] dark:text-[#f3f3ed] focus:outline-none focus:border-[#5a5a40]"
                  autoFocus
                />
              </div>

              {/* Role Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    userRoleFilter === 'all'
                      ? 'bg-[#5a5a40] text-white shadow-2xs'
                      : 'bg-[#f0f0ea] dark:bg-[#2c2c24] text-[#555546] dark:text-[#cecebd] hover:bg-[#e4e4db]'
                  }`}
                >
                  {t('allAccounts')} ({users.filter((u) => u.id !== currentUser.id && !u.isBanned).length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('volunteer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    userRoleFilter === 'volunteer'
                      ? 'bg-[#5a5a40] text-white shadow-2xs'
                      : 'bg-[#f0f0ea] dark:bg-[#2c2c24] text-[#555546] dark:text-[#cecebd] hover:bg-[#e4e4db]'
                  }`}
                >
                  {t('volunteersOnly')} ({users.filter((u) => u.id !== currentUser.id && u.role === 'volunteer' && !u.isBanned).length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('owner')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    userRoleFilter === 'owner'
                      ? 'bg-[#5a5a40] text-white shadow-2xs'
                      : 'bg-[#f0f0ea] dark:bg-[#2c2c24] text-[#555546] dark:text-[#cecebd] hover:bg-[#e4e4db]'
                  }`}
                >
                  {t('ownersOnly')} ({users.filter((u) => u.id !== currentUser.id && u.role === 'owner' && !u.isBanned).length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    userRoleFilter === 'admin'
                      ? 'bg-[#5a5a40] text-white shadow-2xs'
                      : 'bg-[#f0f0ea] dark:bg-[#2c2c24] text-[#555546] dark:text-[#cecebd] hover:bg-[#e4e4db]'
                  }`}
                >
                  {t('adminsOnly')} ({users.filter((u) => u.id !== currentUser.id && u.role === 'admin' && !u.isBanned).length})
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#ecece4] dark:divide-[#33332a]">
              {directoryUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7c7c6e] space-y-2">
                  <UserIcon className="w-8 h-8 mx-auto text-[#b0b0a0]" />
                  <p>{t('noUsersFound')}</p>
                </div>
              ) : (
                directoryUsers.map((u) => {
                  const hasActiveConv = userConversations.some((c) => c.participants.includes(u.id));

                  return (
                    <div
                      key={u.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-[#fafaf7] dark:hover:bg-[#292922] px-3 rounded-2xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={u.fullName}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#5a5a40]/20"
                          />
                          {u.isVerified && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#5a5a40] text-white flex items-center justify-center text-[9px] shadow-2xs">
                              ✓
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-[#2c2c2c] dark:text-[#f3f3ed] truncate">
                              {u.fullName}
                            </h4>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold capitalize ${
                                u.role === 'admin'
                                  ? 'bg-[#faecec] text-[#a83232] dark:bg-[#3d2424] dark:text-[#df7272]'
                                  : u.role === 'owner'
                                  ? 'bg-[#f4ebe1] text-[#704825] dark:bg-[#3d3023] dark:text-[#e0b992]'
                                  : 'bg-[#e2e7dc] text-[#3f4a35] dark:bg-[#2b3524] dark:text-[#c7d5bb]'
                              }`}
                            >
                              {u.role === 'owner' ? (language === 'ar' ? 'صاحب طلب' : 'Seeker') : u.role === 'admin' ? (language === 'ar' ? 'إدارة' : 'Admin') : (language === 'ar' ? 'متطوع' : 'Volunteer')}
                            </span>
                            {u.level && (
                              <span className="text-[10px] text-[#5a5a40] dark:text-[#a8a880] font-semibold">
                                • {u.level}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#7c7c6e]">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-[#949480]" />
                              {u.locationCity || 'Cairo'}{u.locationDistrict ? `, ${u.locationDistrict}` : ''}
                            </span>
                            {u.skills && u.skills.length > 0 && (
                              <span className="hidden sm:inline truncate max-w-[200px]">
                                • {u.skills.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>

                          {u.bio && (
                            <p className="text-[11px] text-[#5c5c50] dark:text-[#b4b4a6] line-clamp-1 italic">
                              "{u.bio}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        id={`chat-with-user-${u.id}`}
                        onClick={() => handleStartChatWithUser(u)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          hasActiveConv
                            ? 'bg-[#ecece4] dark:bg-[#303028] text-[#2c2c2c] dark:text-[#f3f3ed] hover:bg-[#deded4]'
                            : 'bg-[#5a5a40] hover:bg-[#484833] text-white shadow-xs'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{hasActiveConv ? (language === 'ar' ? 'فتح المحادثة' : 'Open Chat') : t('startChat')}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#fafaf7] dark:bg-[#20201a] border-t border-[#e2e2d9] dark:border-[#383830] text-center text-[11px] text-[#7c7c6e]">
              {language === 'ar'
                ? 'جميع المحادثات مشفرة وآمنة وفقاً لمعايير الخصوصية والأمان المجتمعي.'
                : 'All conversations are private and adhere to community safety guidelines.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

