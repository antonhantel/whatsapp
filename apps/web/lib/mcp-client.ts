/**
 * WhatsApp MCP Client - HTTP-based (No native dependencies)
 *
 * This client communicates with the WhatsApp database through HTTP endpoints
 * instead of direct SQLite access, avoiding native module compilation issues.
 */

const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:8080';
const MCP_SERVER_URL = process.env.WHATSAPP_MCP_SERVER_URL || 'http://localhost:3001';

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
 * List all WhatsApp chats
 * Note: In production, you'll need to create a simple HTTP wrapper around the database
 * or use the MCP server's list_chats tool
 */
export async function listChats(): Promise<WhatsAppChat[]> {
  try {
    // Try to fetch from a hypothetical REST endpoint
    // You'll need to create this endpoint in your API routes
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/whatsapp/db/chats`);

    if (response.ok) {
      return await response.json();
    }

    // Fallback: return mock data for development
    console.warn('Database endpoint not available, using mock data');
    return [];
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    return [];
  }
}

/**
 * List messages from a specific chat
 */
export async function listMessages(
  chatJid: string,
  options?: {
    limit?: number;
    before?: string;
    after?: string;
  }
): Promise<WhatsAppMessage[]> {
  try {
    const params = new URLSearchParams();
    params.set('chat_jid', chatJid);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.before) params.set('before', options.before);
    if (options?.after) params.set('after', options.after);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/whatsapp/db/messages?${params}`
    );

    if (response.ok) {
      return await response.json();
    }

    console.warn('Messages endpoint not available');
    return [];
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
}

/**
 * Get group information
 */
export async function getGroupInfo(groupJid: string): Promise<GroupInfo | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/whatsapp/db/groups/${encodeURIComponent(groupJid)}`
    );

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch group info:', error);
    return null;
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
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to send message: ${error.message || response.statusText}`);
  }
}

/**
 * Search contacts by name or phone number
 */
export async function searchContacts(query: string): Promise<WhatsAppChat[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/whatsapp/db/contacts/search?q=${encodeURIComponent(query)}`
    );

    if (response.ok) {
      return await response.json();
    }

    return [];
  } catch (error) {
    console.error('Failed to search contacts:', error);
    return [];
  }
}
