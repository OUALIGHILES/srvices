'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  ArrowLeft,
  Send,
  Phone,
  Eye,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Check,
  CheckCheck,
  MapPin,
  Package,
  FileText,
  CheckCircle,
  AlertTriangle,
  LocateFixed,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  image_url?: string;
}

interface Customer {
  id: string;
  full_name: string;
  avatar_url?: string;
  rating: number;
}

interface Service {
  id: string;
  category: string;
}

interface Booking {
  id: string;
  service_id: string;
  location: string;
  service_date: string;
  quantity: number;
  customer_id: string;
  status: string;
  customers?: Customer;
  services?: Service;
}

export default function DriverBookingMessagerie({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { bookingId } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [completingService, setCompletingService] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Fetch booking and customer data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !bookingId) {
        console.log('Missing user or bookingId');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching booking:', bookingId, 'for user:', user.id);

        // Fetch booking with customer and service details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            service_id,
            location,
            service_date,
            quantity,
            customer_id,
            status,
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
          .eq('id', bookingId)
          .eq('driver_id', user.id)
          .single();

        if (bookingError) {
          console.error('Error fetching booking:', bookingError);
          throw bookingError;
        }

        console.log('Fetched booking:', bookingData);
        setBooking(bookingData);
        setCustomer(bookingData?.customers as Customer || null);
      } catch (error: any) {
        console.error('Error fetching booking:', error?.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, bookingId, supabase]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !booking) {
        return;
      }

      try {
        console.log('Fetching messages for booking:', booking.id);

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${booking.customer_id}`)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          throw messagesError;
        }

        console.log('Fetched messages:', messagesData);
        setMessages(messagesData || []);

        // Mark messages as read
        const { error: updateError } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('recipient_id', user.id)
          .eq('sender_id', booking.customer_id)
          .eq('is_read', false);

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      } catch (error: any) {
        console.error('Error fetching messages:', error?.message || error);
      }
    };

    fetchMessages();
  }, [user, booking, supabase]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user || !booking) return;

    const channel = supabase
      .channel('realtime-messages-booking')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Check if this message is for this conversation
          if (newMsg.sender_id === booking.customer_id || newMsg.recipient_id === booking.customer_id) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, booking, supabase]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Complete Service button
  const handleCompleteService = async () => {
    if (!user || !booking) return;

    if (!confirm('Are you sure you want to mark this service as complete?')) {
      return;
    }

    setCompletingService(true);

    try {
      // Update booking status to completed
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      alert('Service completed successfully!');

      // Redirect to dashboard
      router.push('/driver/dashboard');
    } catch (error: any) {
      console.error('Error completing service:', error?.message || error);
      alert('Failed to complete service. Please try again.');
    } finally {
      setCompletingService(false);
    }
  };

  // Handle Report Issue button
  const handleReportIssue = async (issueType: string = 'general') => {
    if (!user || !booking) return;

    const issueDescription = prompt('Please describe the issue:');
    if (!issueDescription) return;

    try {
      // Create an issue report
      const { error } = await supabase
        .from('issue_reports')
        .insert([{
          booking_id: bookingId,
          driver_id: user.id,
          issue_type: issueType,
          description: issueDescription,
          status: 'pending',
          reported_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Issue reported successfully. Our support team will review it shortly.');
    } catch (error: any) {
      console.error('Error reporting issue:', error?.message || error);
      alert('Failed to report issue. Please try again.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !booking) return;

    setSending(true);

    try {
      // Send message
      const { data: messageData, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            recipient_id: booking.customer_id,
            content: newMessage,
            is_read: false,
            booking_id: booking.id,
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
      }
    } catch (error: any) {
      console.error('Error sending message:', error?.message || error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!booking || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-500 mb-4">This order doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/driver/messagerie')}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="flex h-[calc(100vh-64px)]">
        {/* Left Pane: Map & Order Details */}
        <section className="relative flex flex-1 flex-col overflow-hidden border-r border-gray-200">
          {/* Map Background */}
          <div className="absolute inset-0 z-0 bg-gray-200">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1526871417913-205d5f1d1b15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80)'
              }}
              aria-label="Dynamic map showing delivery route"
            ></div>

            {/* Map Overlay Controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button className="flex size-10 items-center justify-center rounded-lg bg-white shadow-lg text-gray-700">
                <ZoomIn className="h-5 w-5" />
              </button>
              <button className="flex size-10 items-center justify-center rounded-lg bg-white shadow-lg text-gray-700">
                <ZoomOut className="h-5 w-5" />
              </button>
              <button className="flex size-10 items-center justify-center rounded-lg bg-blue-500 shadow-lg text-white mt-2">
                <LocateFixed className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Floating Order Info Card */}
          <div className="relative z-10 mt-auto p-6">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Customer</p>
                      <h3 className="text-lg font-bold">{customer.full_name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Service Date</p>
                      <p className="text-lg font-bold text-blue-500">
                        {new Date(booking.service_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{booking.location}</p>
                        <p className="text-xs text-gray-500">Delivery Location</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{booking.quantity} Units Required</p>
                        <p className="text-xs text-gray-500">Service Category: {booking.services?.category || 'Standard'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 w-full">
                        <p className="text-xs text-gray-600 leading-relaxed italic">
                          Contact customer for special instructions upon arrival.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-5 md:w-64 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-center">
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCompleteService}
                    disabled={completingService || booking.status === 'completed'}
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>{completingService ? 'Completing...' : booking.status === 'completed' ? 'Completed' : 'Complete Service'}</span>
                  </button>
                  <button
                    className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => handleReportIssue('general')}
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Pane: Chat Window */}
        <aside className="w-[450px] flex flex-col bg-white">
          {/* Chat Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/driver/messagerie')}
                className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-gray-200 overflow-hidden">
                  {customer.avatar_url ? (
                    <img
                      className="h-full w-full object-cover"
                      src={customer.avatar_url}
                      alt={customer.full_name}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm font-medium">
                      {customer.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">{customer.full_name}</h3>
                    {customer.rating && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">{customer.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    ORD-{booking.id.slice(-5).toUpperCase()} • {booking.status === 'in_progress' ? 'In Transit' : booking.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/driver/accepted-order/${bookingId}`)}
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
                        {customer.avatar_url ? (
                          <img
                            className="h-full w-full object-cover"
                            src={customer.avatar_url}
                            alt="Customer avatar"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-medium">
                            {customer.full_name.charAt(0)}
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
                          {formatTime(message.created_at)}
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
        </aside>
      </main>
    </div>
  );
}
