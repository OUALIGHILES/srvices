'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  Search,
  Phone,
  Eye,
  MoreVertical,
  Check,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  Send,
  MessageCircle
} from 'lucide-react';

interface Conversation {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_avatar?: string;
  service_type: string;
  order_number: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: string;
  rating?: number;
  customer_id: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  image_url?: string;
}

export default function DriverMessagerie() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        console.log('No user authenticated');
        return;
      }

      try {
        console.log('Fetching conversations for user:', user.id);

        // Get all bookings for this driver with customer and service details
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            status,
            service_date,
            customer_id,
            customers (
              id,
              full_name,
              avatar_url,
              rating
            ),
            services (
              category
            )
          `)
          .eq('driver_id', user.id)
          .order('service_date', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          throw bookingsError;
        }

        console.log('Fetched bookings:', bookings);

        if (!bookings || bookings.length === 0) {
          console.log('No bookings found for this driver');
          setConversations([]);
          return;
        }

        // For each booking, get the last message and unread count
        const formattedConversations: Conversation[] = await Promise.all(
          bookings.map(async (booking) => {
            const customer = booking.customers as any;
            const service = booking.services as any;

            // Get last message for this booking
            const { data: lastMessage, error: msgError } = await supabase
              .from('messages')
              .select('content, created_at')
              .or(`sender_id.eq.${user.id},recipient_id.eq.${booking.customer_id}`)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (msgError) {
              console.warn('Error fetching last message:', msgError);
            }

            // Count unread messages
            const { count: unreadCount, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('recipient_id', user.id)
              .eq('is_read', false)
              .eq('sender_id', booking.customer_id);

            if (countError) {
              console.warn('Error counting unread messages:', countError);
            }

            return {
              id: booking.id,
              booking_id: booking.id,
              customer_id: booking.customer_id,
              customer_name: customer?.full_name || 'Customer',
              customer_avatar: customer?.avatar_url,
              service_type: service?.category || 'Service',
              order_number: `ORD-${booking.id.slice(-5).toUpperCase()}`,
              last_message: lastMessage?.content || 'No messages yet',
              last_message_time: lastMessage?.created_at || booking.service_date,
              unread_count: unreadCount || 0,
              status: booking.status,
              rating: customer?.rating,
            };
          })
        );

        console.log('Formatted conversations:', formattedConversations);
        setConversations(formattedConversations);

        // Select first conversation by default
        if (formattedConversations.length > 0) {
          setSelectedConversation(formattedConversations[0]);
        }
      } catch (error: any) {
        console.error('Error fetching conversations:', error?.message || error);
      }
    };

    fetchConversations();
  }, [user, supabase]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !selectedConversation) return;

      try {
        // Fetch messages between driver and customer
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${selectedConversation.customer_id}`)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          throw messagesError;
        }

        setMessages(messagesData || []);

        // Mark messages as read
        const { error: updateError } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('recipient_id', user.id)
          .eq('sender_id', selectedConversation.customer_id)
          .eq('is_read', false);

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }

        // Update conversation unread count
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      } catch (error: any) {
        console.error('Error fetching messages:', error?.message || error);
      }
    };

    fetchMessages();
  }, [selectedConversation, user, supabase]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Check if this message involves the current user
          if (newMsg.sender_id === user.id || newMsg.recipient_id === user.id) {
            // Add message to current conversation if it's open
            if (selectedConversation) {
              if (newMsg.sender_id === selectedConversation.customer_id || 
                  newMsg.recipient_id === selectedConversation.customer_id) {
                setMessages(prev => [...prev, newMsg]);
              }
            }

            // Update conversation list
            setConversations(prev =>
              prev.map(conv => {
                if (conv.customer_id === newMsg.sender_id || conv.customer_id === newMsg.recipient_id) {
                  return {
                    ...conv,
                    last_message: newMsg.content,
                    last_message_time: newMsg.created_at,
                    unread_count: newMsg.recipient_id === user.id && !newMsg.is_read ? conv.unread_count + 1 : conv.unread_count,
                  };
                }
                return conv;
              }).sort((a, b) => 
                new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !selectedConversation) return;

    setSending(true);

    try {
      // Send message
      const { data: messageData, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            recipient_id: selectedConversation.customer_id,
            content: newMessage,
            is_read: false,
            booking_id: selectedConversation.booking_id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      if (messageData) {
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');
        
        // Update conversation last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { 
                  ...conv, 
                  last_message: newMessage, 
                  last_message_time: new Date().toISOString(),
                  unread_count: 0,
                }
              : conv
          )
        );
      }
    } catch (error: any) {
      console.error('Error sending message:', error?.message || error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleViewOrder = () => {
    if (selectedConversation) {
      router.push(`/driver/accepted-order/${selectedConversation.booking_id}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="flex h-[calc(100vh-64px)]">
        {/* Left Pane: Conversation List */}
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full p-4 flex items-start gap-3 border-b border-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="size-12 rounded-lg bg-gray-200 overflow-hidden">
                      {conversation.customer_avatar ? (
                        <img
                          className="h-full w-full object-cover"
                          src={conversation.customer_avatar}
                          alt={conversation.customer_name}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm font-medium">
                          {conversation.customer_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 border-2 border-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {conversation.customer_name}
                      </span>
                      <span className={`text-xs ${conversation.unread_count > 0 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                        {formatTime(conversation.last_message_time)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {conversation.service_type} • {conversation.order_number}
                    </p>
                    <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conversation.last_message}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">
                  {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                </p>
                {!searchQuery && (
                  <p className="text-gray-400 text-xs mt-2">Messages will appear here once you have bookings</p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right Pane: Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-gray-200 overflow-hidden">
                  {selectedConversation.customer_avatar ? (
                    <img
                      className="h-full w-full object-cover"
                      src={selectedConversation.customer_avatar}
                      alt={selectedConversation.customer_name}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm font-medium">
                      {selectedConversation.customer_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {selectedConversation.customer_name}
                    </h3>
                    {selectedConversation.rating && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">{selectedConversation.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.order_number} • {selectedConversation.status === 'in_progress' ? 'In Transit' : selectedConversation.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Order
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                  <Phone className="h-4 w-4" />
                  Call
                </button>
                <button className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {/* Date Separator */}
              <div className="flex justify-center mb-6">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Today
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {messages.map((message) => {
                  const isFromMe = message.sender_id === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isFromMe ? 'flex-row-reverse' : ''}`}
                    >
                      {!isFromMe && (
                        <div className="size-8 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                          {selectedConversation.customer_avatar ? (
                            <img
                              className="h-full w-full object-cover"
                              src={selectedConversation.customer_avatar}
                              alt="Customer avatar"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-medium">
                              {selectedConversation.customer_name.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            isFromMe
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-xs text-gray-400">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isFromMe && (
                            message.is_read ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="h-3 w-3 text-gray-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-gray-400 text-xs mt-1">Start the conversation with your customer</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button
                  type="button"
                  className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  title="Send image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="size-12 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500 text-sm">Select a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
