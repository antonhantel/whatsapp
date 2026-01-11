import sqlite3 from 'better-sqlite3';
import path from 'path';

// Path to the WhatsApp MCP messages database
const MESSAGES_DB_PATH = path.join(process.cwd(), '..', '..', 'whatsapp-mcp', 'whatsapp-bridge', 'store', 'messages.db');
const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:8080';

export interface WhatsAppChat {
  jid: string;
  name: string | null;
  is_group: boolean;
  last_message_time: string | null;
  message_count_24h?: number;
  participant_count?: number;
}

export interface WhatsAppMessage {
  id: string;
  chat_jid: string;
  sender: string;
  sender_name?: string;
  content: string;
  timestamp: string;
  is_from_me: boolean;
  media_type: string | null;
  filename: string | null;
}

export interface GroupInfo {
  jid: string;
  name: string;
  participant_count: number;
  participants?: string[];
}

/**
 * List all WhatsApp chats from the database
 */
export async function listChats(): Promise<WhatsAppChat[]> {
  const db = sqlite3(MESSAGES_DB_PATH, { readonly: true });

  try {
    const chats = db.prepare(`
      SELECT
        c.jid,
        c.name,
        c.last_message_time,
        COUNT(DISTINCT CASE
          WHEN m.timestamp >= datetime('now', '-1 day')
          THEN m.id
        END) as message_count_24h
      FROM chats c
      LEFT JOIN messages m ON c.jid = m.chat_jid
      GROUP BY c.jid, c.name, c.last_message_time
      ORDER BY c.last_message_time DESC
    `).all() as any[];

    return chats.map(chat => ({
      jid: chat.jid,
      name: chat.name,
      is_group: chat.jid.endsWith('@g.us'),
      last_message_time: chat.last_message_time,
      message_count_24h: chat.message_count_24h || 0,
    }));
  } finally {
    db.close();
  }
}

/**
 * List messages from a specific chat with optional filters
 */
export async function listMessages(
  chatJid: string,
  options?: {
    limit?: number;
    before?: string;
    after?: string;
  }
): Promise<WhatsAppMessage[]> {
  const db = sqlite3(MESSAGES_DB_PATH, { readonly: true });
  const limit = options?.limit || 100;

  try {
    let query = `
      SELECT
        m.id,
        m.chat_jid,
        m.sender,
        m.content,
        m.timestamp,
        m.is_from_me,
        m.media_type,
        m.filename
      FROM messages m
      WHERE m.chat_jid = ?
    `;

    const params: any[] = [chatJid];

    if (options?.after) {
      query += ` AND m.timestamp >= ?`;
      params.push(options.after);
    }

    if (options?.before) {
      query += ` AND m.timestamp <= ?`;
      params.push(options.before);
    }

    query += ` ORDER BY m.timestamp DESC LIMIT ?`;
    params.push(limit);

    const messages = db.prepare(query).all(...params) as any[];

    return messages.map(msg => ({
      id: msg.id,
      chat_jid: msg.chat_jid,
      sender: msg.sender,
      content: msg.content || '',
      timestamp: msg.timestamp,
      is_from_me: Boolean(msg.is_from_me),
      media_type: msg.media_type,
      filename: msg.filename,
    }));
  } finally {
    db.close();
  }
}

/**
 * Get group information
 */
export async function getGroupInfo(groupJid: string): Promise<GroupInfo | null> {
  const db = sqlite3(MESSAGES_DB_PATH, { readonly: true });

  try {
    const chat = db.prepare(`
      SELECT jid, name FROM chats WHERE jid = ?
    `).get(groupJid) as any;

    if (!chat) {
      return null;
    }

    // Count unique participants
    const participantCount = db.prepare(`
      SELECT COUNT(DISTINCT sender) as count
      FROM messages
      WHERE chat_jid = ?
    `).get(groupJid) as any;

    return {
      jid: chat.jid,
      name: chat.name || chat.jid,
      participant_count: participantCount?.count || 0,
    };
  } finally {
    db.close();
  }
}

/**
 * Send a message via the WhatsApp bridge
 */
export async function sendMessage(jid: string, text: string): Promise<void> {
  const response = await fetch(`${BRIDGE_URL}/api/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: jid,
      message: text
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send message: ${error.message || response.statusText}`);
  }
}

/**
 * Search contacts by name or phone number
 */
export async function searchContacts(query: string): Promise<WhatsAppChat[]> {
  const db = sqlite3(MESSAGES_DB_PATH, { readonly: true });

  try {
    const contacts = db.prepare(`
      SELECT
        c.jid,
        c.name,
        c.last_message_time
      FROM chats c
      WHERE
        (c.name LIKE ? OR c.jid LIKE ?)
        AND c.jid LIKE '%@s.whatsapp.net'
      ORDER BY c.last_message_time DESC
      LIMIT 20
    `).all(`%${query}%`, `%${query}%`) as any[];

    return contacts.map(contact => ({
      jid: contact.jid,
      name: contact.name,
      is_group: false,
      last_message_time: contact.last_message_time,
    }));
  } finally {
    db.close();
  }
}
