'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomerHeader } from '@/components/customer-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
  is_current_user: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const fetchChatData = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          services(name),
          users(full_name)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      setBookingDetails(bookingData);

      // Fetch messages for this booking
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          users(full_name)
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw new Error(messagesError.message);
      }

      // Transform messages to include sender name and current user flag
      const transformedMessages: Message[] = messagesData.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: msg.users?.full_name || 'Unknown',
        created_at: msg.created_at,
        is_current_user: msg.sender_id === user.id
      }));

      setMessages(transformedMessages);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchChatData();
      
      // Subscribe to real-time messages
      const channel = supabase
        .channel(`chat-room-${bookingId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `booking_id=eq.${bookingId}`,
          },
          (payload) => {
            fetchChatData(); // Refresh messages when new one arrives
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Find the driver for this booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          customer_id,
          offers(driver_id)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      // Determine recipient (if current user is customer, recipient is driver and vice versa)
      let recipientId = bookingData.customer_id; // Default to customer
      if (bookingData.offers && bookingData.offers.length > 0) {
        // If there are offers, the first one determines the driver
        recipientId = bookingData.offers[0].driver_id;
      }

      // Insert the new message
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            booking_id: bookingId,
            sender_id: user.id,
            recipient_id: recipientId,
            content: newMessage.trim()
          }
        ]);

      if (error) {
        throw new Error(error.message);
      }

      // Clear the input
      setNewMessage('');
    } catch (err: any) {
      setError(err.message);
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <CustomerHeader />
        <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <CustomerHeader />
        <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="mt-4">
            <Button onClick={fetchChatData}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <CustomerHeader />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 h-[calc(100vh-200px)] flex flex-col">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chat for {bookingDetails?.services?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">Booking ID: {bookingId}</p>
        </div>

        <Card className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Service Provider</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Online now</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_current_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.is_current_user
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.is_current_user ? 'text-primary-foreground/70' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}