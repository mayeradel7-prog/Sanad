import {
  HelpRequest,
  VolunteerApplication,
  VolunteerAssignment,
  Comment,
  User,
  NotificationItem,
  Conversation,
  ChatMessage,
} from '../types';

export interface ServerSyncData {
  requests: HelpRequest[];
  users: User[];
  categories: any[];
  applications: VolunteerApplication[];
  assignments: VolunteerAssignment[];
  comments: Comment[];
  conversations: any[];
  messages: any[];
  reviews: any[];
  reports: any[];
  notifications: NotificationItem[];
  badges: any[];
  levels: any[];
  certificates: any[];
  activityLogs: any[];
  pointLogs: any[];
  pointRules: any;
  version: number;
}

export const serverSync = {
  async fetchSync(): Promise<ServerSyncData | null> {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async postRequest(request: HelpRequest): Promise<boolean> {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postRequest:', e);
      return false;
    }
  },

  async updateRequest(requestId: string, updates: Partial<HelpRequest>): Promise<boolean> {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on updateRequest:', e);
      return false;
    }
  },

  async deleteRequest(requestId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on deleteRequest:', e);
      return false;
    }
  },

  async postUser(user: User): Promise<boolean> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postUser:', e);
      return false;
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on updateUser:', e);
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on deleteUser:', e);
      return false;
    }
  },

  async postApplication(application: VolunteerApplication): Promise<boolean> {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postApplication:', e);
      return false;
    }
  },

  async updateApplication(id: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on updateApplication:', e);
      return false;
    }
  },

  async postAssignment(assignment: VolunteerAssignment): Promise<boolean> {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postAssignment:', e);
      return false;
    }
  },

  async postComment(comment: Comment): Promise<boolean> {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postComment:', e);
      return false;
    }
  },

  async postConversation(conversation: Conversation): Promise<boolean> {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postConversation:', e);
      return false;
    }
  },

  async postMessage(message: ChatMessage): Promise<boolean> {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postMessage:', e);
      return false;
    }
  },

  async postFullSync(payload: Partial<ServerSyncData>): Promise<boolean> {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync error on postFullSync:', e);
      return false;
    }
  },

  subscribeToEvents(onUpdate: (version: number) => void): () => void {
    try {
      const eventSource = new EventSource('/api/events');

      eventSource.addEventListener('update', (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data.version || Date.now());
        } catch {
          onUpdate(Date.now());
        }
      });

      eventSource.onerror = () => {
        // EventSource will automatically retry in the background
      };

      return () => {
        eventSource.close();
      };
    } catch {
      return () => {};
    }
  },
};
