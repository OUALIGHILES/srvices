import { createClient } from './supabase';
import { User } from '@supabase/supabase-js';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  location: string;
  service_date: string;
  quantity: number;
  customer_id: string;
  status: string;
}

export interface OtherUser {
  id: string;
  full_name: string;
  rating: number;
  avatar_url?: string;
  role: string;
  equipment?: string;
  job_title?: string;
}

export interface Conversation {
  id: string;
  booking_id: string;
  other_user: OtherUser;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_active: boolean;
}

/**
 * Fetches all conversations for the current user
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();

  // Get the most recent message for each conversation (booking) where the user is involved
  const { data: conversationData, error } = await supabase
    .from('messages')
    .select(`
      booking_id,
      sender_id,
      recipient_id,
      content,
      is_read,
      created_at
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversation data:', error);
    throw error;
  }

  // Extract unique booking IDs
  const bookingIds = [...new Set(conversationData.map(msg => msg.booking_id))];

  if (bookingIds.length === 0) {
    return []; // Return empty array if no conversations
  }

  // Get all messages for these bookings to properly calculate unread counts and last message
  const { data: allMessages, error: messagesError } = await supabase
    .from('messages')
    .select(`
      booking_id,
      sender_id,
      recipient_id,
      content,
      is_read,
      created_at
    `)
    .in('booking_id', bookingIds)
    .order('created_at', { ascending: false });

  if (messagesError) {
    console.error('Error fetching all messages for conversations:', messagesError);
    throw messagesError;
  }

  // Group messages by booking_id to form conversations
  const groupedMessages = allMessages.reduce((acc, message) => {
    if (!acc[message.booking_id]) {
      acc[message.booking_id] = [];
    }
    acc[message.booking_id].push(message);
    return acc;
  }, {} as Record<string, typeof allMessages>);

  // Extract unique user IDs (excluding the current user) to fetch user details
  const userIds = [...new Set(allMessages.flatMap(msg => 
    msg.sender_id === userId ? msg.recipient_id : msg.sender_id
  ))];

  // Fetch user details for all other users in the conversations
  let otherUsers: any[] = [];
  if (userIds.length > 0) {
    const { data: fetchedUsers, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, user_type, rating')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching other users:', usersError);
      throw usersError;
    }
    
    otherUsers = fetchedUsers || [];
  }

  // Build conversations
  const conversations: Conversation[] = [];

  for (const bookingId of bookingIds) {
    const messagesForBooking = groupedMessages[bookingId];
    if (!messagesForBooking || messagesForBooking.length === 0) continue;

    // Find the most recent message in this conversation
    const sortedMessages = messagesForBooking.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestMessage = sortedMessages[0];

    // Determine the other user in this conversation
    const otherUserId = latestMessage.sender_id === userId ? latestMessage.recipient_id : latestMessage.sender_id;
    const otherUser = otherUsers.find(user => user.id === otherUserId);

    if (!otherUser) continue; // Skip if we can't find the other user

    // Count unread messages for this conversation (messages sent by others that haven't been read)
    const unreadCount = messagesForBooking.filter(msg => 
      msg.sender_id !== userId && !msg.is_read
    ).length;

    conversations.push({
      id: bookingId,
      booking_id: bookingId,
      other_user: {
        id: otherUser.id,
        full_name: otherUser.full_name || 'Unknown User',
        rating: otherUser.rating || 0,
        avatar_url: otherUser.avatar_url,
        role: otherUser.user_type,
        job_title: otherUser.user_type === 'driver' ? 'Service Provider' : 'User'
      },
      last_message: latestMessage.content,
      last_message_time: formatDateForDisplay(new Date(latestMessage.created_at)),
      unread_count: unreadCount,
      is_active: true
    });
  }

  // Since we want the most recent conversations first, and we already have the conversation data
  // ordered by created_at descending, we can just return the conversations in the order
  // they appear in the original bookingIds array (which preserves the ordering)
  
  // Create a map for quick lookup
  const conversationMap = new Map(conversations.map(conv => [conv.booking_id, conv]));
  
  // Return conversations in the order of appearance in the original data (most recent first)
  const orderedConversations = bookingIds
    .filter(bookingId => conversationMap.has(bookingId))
    .map(bookingId => conversationMap.get(bookingId)!);
  
  return orderedConversations;
}

/**
 * Fetches messages for a specific conversation (booking)
 */
export async function getConversationMessages(userId: string, bookingId: string): Promise<Message[]> {
  const supabase = createClient();

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }

  return messages || [];
}

/**
 * Sends a new message
 */
export async function sendMessage(
  senderId: string,
  recipientId: string,
  bookingId: string,
  content: string
): Promise<Message> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: senderId,
      recipient_id: recipientId,
      booking_id: bookingId,
      content,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
}

/**
 * Marks messages as read
 */
export async function markMessagesAsRead(userId: string, senderId: string, bookingId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('sender_id', senderId)
    .eq('booking_id', bookingId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Formats date for display in the chat interface
 */
function formatDateForDisplay(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Same day - show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays <= 7) {
    // Within a week - show day of week
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    // Older - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}