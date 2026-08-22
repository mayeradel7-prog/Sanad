import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import {
  INITIAL_REQUESTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_APPLICATIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_COMMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_REVIEWS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_BADGES,
  INITIAL_LEVELS,
  INITIAL_CERTIFICATES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_POINT_LOGS,
  INITIAL_POINT_RULES,
} from './src/data/initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface AppStore {
  requests: any[];
  users: any[];
  categories: any[];
  applications: any[];
  assignments: any[];
  comments: any[];
  conversations: any[];
  messages: any[];
  reviews: any[];
  reports: any[];
  notifications: any[];
  badges: any[];
  levels: any[];
  certificates: any[];
  activityLogs: any[];
  pointLogs: any[];
  pointRules: any;
  version: number;
}

function getInitialStore(): AppStore {
  return {
    requests: INITIAL_REQUESTS,
    users: INITIAL_USERS,
    categories: INITIAL_CATEGORIES,
    applications: INITIAL_APPLICATIONS,
    assignments: INITIAL_ASSIGNMENTS,
    comments: INITIAL_COMMENTS,
    conversations: INITIAL_CONVERSATIONS,
    messages: INITIAL_MESSAGES,
    reviews: INITIAL_REVIEWS,
    reports: INITIAL_REPORTS,
    notifications: INITIAL_NOTIFICATIONS,
    badges: INITIAL_BADGES,
    levels: INITIAL_LEVELS,
    certificates: INITIAL_CERTIFICATES,
    activityLogs: INITIAL_ACTIVITY_LOGS,
    pointLogs: INITIAL_POINT_LOGS,
    pointRules: INITIAL_POINT_RULES,
    version: Date.now(),
  };
}

function mergeUsers(current: any[] = [], incoming: any[] = []): any[] {
  const map = new Map<string, any>();
  for (const item of current) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of incoming) {
    if (item && item.id) {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        // If existing is approved and incoming is pending, preserve 'approved'
        const ownerStatus =
          existing.ownerStatus === 'approved' && item.ownerStatus === 'pending'
            ? 'approved'
            : item.ownerStatus || existing.ownerStatus;

        map.set(item.id, {
          ...existing,
          ...item,
          ownerStatus,
        });
      }
    }
  }
  return Array.from(map.values());
}

function mergeById<T extends { id: string }>(current: T[] = [], incoming: T[] = []): T[] {
  const map = new Map<string, T>();
  for (const item of current) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of incoming) {
    if (item && item.id) {
      const existing = map.get(item.id);
      map.set(item.id, { ...(existing || {}), ...item });
    }
  }
  return Array.from(map.values());
}

let store: AppStore;

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const initial = getInitialStore();
    store = {
      ...initial,
      ...parsed,
      requests: mergeById(initial.requests, parsed.requests || []),
      users: mergeUsers(initial.users, parsed.users || []),
      categories: mergeById(initial.categories, parsed.categories || []),
      applications: mergeById(initial.applications, parsed.applications || []),
      assignments: mergeById(initial.assignments, parsed.assignments || []),
      comments: mergeById(initial.comments, parsed.comments || []),
      conversations: mergeById(initial.conversations, parsed.conversations || []),
      messages: mergeById(initial.messages, parsed.messages || []),
      reviews: mergeById(initial.reviews, parsed.reviews || []),
      reports: mergeById(initial.reports, parsed.reports || []),
      notifications: mergeById(initial.notifications, parsed.notifications || []),
      activityLogs: mergeById(initial.activityLogs, parsed.activityLogs || []),
    };
  } else {
    store = getInitialStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  }
} catch (e) {
  console.error('Failed to load store.json, using defaults:', e);
  store = getInitialStore();
}

function saveStore() {
  try {
    store.version = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
    broadcastEvent('update', { version: store.version });
  } catch (e) {
    console.error('Failed to save store.json:', e);
  }
}

// SSE Clients
type SSEClient = { id: number; res: express.Response };
const sseClients: SSEClient[] = [];
let nextClientId = 1;

function broadcastEvent(type: string, data: any) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.res.write(message);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // SSE stream for real-time live sync across all devices
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    const clientId = nextClientId++;
    sseClients.push({ id: clientId, res });

    // Send initial ping
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, version: store.version })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.findIndex((c) => c.id === clientId);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // GET users
  app.get('/api/users', (_req, res) => {
    res.json({
      status: 'ok',
      users: store.users || [],
      version: store.version,
    });
  });

  // POST create / upsert user
  app.post('/api/users', (req, res) => {
    const user = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    const idx = store.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      store.users[idx] = {
        ...store.users[idx],
        ...user,
        // Preserve approved status unless explicitly changed to rejected with reason
        ownerStatus:
          store.users[idx].ownerStatus === 'approved' && user.ownerStatus === 'pending'
            ? 'approved'
            : user.ownerStatus || store.users[idx].ownerStatus,
      };
    } else {
      store.users.unshift(user);
    }

    saveStore();
    res.json({ status: 'ok', user: idx >= 0 ? store.users[idx] : user, version: store.version });
  });

  // PUT update user (e.g. admin approval, role change, ban, profile update)
  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const idx = store.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    store.users[idx] = {
      ...store.users[idx],
      ...updates,
    };

    saveStore();
    res.json({ status: 'ok', user: store.users[idx], version: store.version });
  });

  // DELETE user - for admin removal
  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = store.users.length;
    store.users = store.users.filter((u) => u.id !== id);

    // Also clean up any associated requests, assignments, applications if necessary
    store.requests = store.requests.filter((r) => r.ownerId !== id);
    store.applications = store.applications.filter((a) => a.volunteerId !== id);

    saveStore();
    res.json({
      status: 'ok',
      deletedId: id,
      success: store.users.length < initialLen,
      version: store.version,
    });
  });

  // GET full state sync
  app.get('/api/sync', (_req, res) => {
    res.json({
      status: 'ok',
      data: store,
    });
  });

  // GET requests
  app.get('/api/requests', (_req, res) => {
    res.json({
      status: 'ok',
      requests: store.requests || [],
      version: store.version,
    });
  });

  // POST create request - accessible and seen across all devices
  app.post('/api/requests', (req, res) => {
    const newRequest = req.body;
    if (!newRequest || !newRequest.id || !newRequest.title) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const existingIndex = store.requests.findIndex((r) => r.id === newRequest.id);
    if (existingIndex >= 0) {
      store.requests[existingIndex] = newRequest;
    } else {
      store.requests.unshift(newRequest);
    }

    saveStore();
    res.json({ status: 'ok', request: newRequest, version: store.version });
  });

  // PUT update request
  app.put('/api/requests/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const idx = store.requests.findIndex((r) => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    store.requests[idx] = {
      ...store.requests[idx],
      ...updates,
    };

    saveStore();
    res.json({ status: 'ok', request: store.requests[idx], version: store.version });
  });

  // DELETE request - for owner or admin removal
  app.delete('/api/requests/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = store.requests.length;
    store.requests = store.requests.filter((r) => r.id !== id);

    // Also remove related applications, assignments, and comments
    store.applications = store.applications.filter((a) => a.requestId !== id);
    store.assignments = store.assignments.filter((a) => a.requestId !== id);
    store.comments = store.comments.filter((c) => c.requestId !== id);

    saveStore();
    res.json({
      status: 'ok',
      deletedId: id,
      success: store.requests.length < initialLen,
      version: store.version,
    });
  });

  // POST apply to request
  app.post('/api/applications', (req, res) => {
    const appData = req.body;
    if (!appData || !appData.id) {
      return res.status(400).json({ error: 'Invalid application' });
    }

    const idx = store.applications.findIndex((a) => a.id === appData.id);
    if (idx >= 0) {
      store.applications[idx] = appData;
    } else {
      store.applications.unshift(appData);
    }

    saveStore();
    res.json({ status: 'ok', application: appData, version: store.version });
  });

  // PUT application status
  app.put('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const idx = store.applications.findIndex((a) => a.id === id);
    if (idx !== -1) {
      store.applications[idx].status = status;
      saveStore();
      return res.json({ status: 'ok', application: store.applications[idx] });
    }
    res.status(404).json({ error: 'Application not found' });
  });

  // POST comments
  app.post('/api/comments', (req, res) => {
    const comment = req.body;
    if (!comment || !comment.id) {
      return res.status(400).json({ error: 'Invalid comment' });
    }
    store.comments.unshift(comment);
    saveStore();
    res.json({ status: 'ok', comment });
  });

  // POST assignments
  app.post('/api/assignments', (req, res) => {
    const assignment = req.body;
    if (!assignment || !assignment.id) {
      return res.status(400).json({ error: 'Invalid assignment' });
    }
    const idx = store.assignments.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) {
      store.assignments[idx] = assignment;
    } else {
      store.assignments.unshift(assignment);
    }
    saveStore();
    res.json({ status: 'ok', assignment });
  });

  // POST conversation - create or update conversation
  app.post('/api/conversations', (req, res) => {
    const conv = req.body;
    if (!conv || !conv.id) {
      return res.status(400).json({ error: 'Invalid conversation' });
    }
    const idx = store.conversations.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      store.conversations[idx] = { ...store.conversations[idx], ...conv };
    } else {
      store.conversations.unshift(conv);
    }
    saveStore();
    res.json({ status: 'ok', conversation: conv, version: store.version });
  });

  // POST message - send chat message
  app.post('/api/messages', (req, res) => {
    const msg = req.body;
    if (!msg || !msg.id || !msg.conversationId) {
      return res.status(400).json({ error: 'Invalid message' });
    }
    const idx = store.messages.findIndex((m) => m.id === msg.id);
    if (idx >= 0) {
      store.messages[idx] = msg;
    } else {
      store.messages.push(msg);
    }

    // Also update lastMessage & lastMessageAt on the conversation
    const cIdx = store.conversations.findIndex((c) => c.id === msg.conversationId);
    if (cIdx >= 0) {
      store.conversations[cIdx].lastMessage = msg.text;
      store.conversations[cIdx].lastMessageAt = msg.timestamp || new Date().toISOString();
      store.conversations[cIdx].updatedAt = msg.timestamp || new Date().toISOString();
    }

    saveStore();
    res.json({ status: 'ok', message: msg, version: store.version });
  });

  // POST full state batch sync (from client mutations)
  app.post('/api/sync', (req, res) => {
    const incoming = req.body;
    if (incoming) {
      if (Array.isArray(incoming.requests)) {
        store.requests = incoming.replace ? incoming.requests : mergeById(store.requests, incoming.requests);
      }
      if (Array.isArray(incoming.users)) {
        store.users = incoming.replace ? incoming.users : mergeUsers(store.users, incoming.users);
      }
      if (Array.isArray(incoming.applications)) {
        store.applications = incoming.replace ? incoming.applications : mergeById(store.applications, incoming.applications);
      }
      if (Array.isArray(incoming.assignments)) {
        store.assignments = incoming.replace ? incoming.assignments : mergeById(store.assignments, incoming.assignments);
      }
      if (Array.isArray(incoming.comments)) {
        store.comments = incoming.replace ? incoming.comments : mergeById(store.comments, incoming.comments);
      }
      if (Array.isArray(incoming.conversations)) {
        store.conversations = incoming.replace ? incoming.conversations : mergeById(store.conversations, incoming.conversations);
      }
      if (Array.isArray(incoming.messages)) {
        store.messages = incoming.replace ? incoming.messages : mergeById(store.messages, incoming.messages);
      }
      if (Array.isArray(incoming.reviews)) {
        store.reviews = incoming.replace ? incoming.reviews : mergeById(store.reviews, incoming.reviews);
      }
      if (Array.isArray(incoming.reports)) {
        store.reports = incoming.replace ? incoming.reports : mergeById(store.reports, incoming.reports);
      }
      if (Array.isArray(incoming.notifications)) {
        store.notifications = incoming.replace ? incoming.notifications : mergeById(store.notifications, incoming.notifications);
      }
      if (Array.isArray(incoming.activityLogs)) {
        store.activityLogs = incoming.replace ? incoming.activityLogs : mergeById(store.activityLogs, incoming.activityLogs);
      }
      if (Array.isArray(incoming.categories)) {
        store.categories = incoming.replace ? incoming.categories : mergeById(store.categories, incoming.categories);
      }
      if (Array.isArray(incoming.badges)) {
        store.badges = incoming.replace ? incoming.badges : mergeById(store.badges, incoming.badges);
      }
      if (incoming.pointRules) store.pointRules = incoming.pointRules;
      saveStore();
    }
    res.json({ status: 'ok', version: store.version });
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', devicesConnected: sseClients.length, requestsCount: store.requests.length });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
