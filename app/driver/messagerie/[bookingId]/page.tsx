'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  MoreVertical, 
  Settings,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  Truck,
  MapPin,
  Package,
  FileText,
  CheckCheck
} from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  service_id: string;
  location: string;
  service_date: string;
  quantity: number;
  customer_id: string;
  status: string;
}

interface OtherUser {
  id: string;
  full_name: string;
  rating: number;
  avatar_url?: string;
  role: string;
}

interface ActiveOrder {
  id: string;
  customer_name: string;
  customer_avatar: string;
  estimated_arrival: string;
  address: string;
  city: string;
  units_required: number;
  service_category: string;
  special_notes: string;
  status: 'in_progress' | 'completed' | 'pending';
}

export default function DriverBookingMessagerie({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { bookingId } = params;
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [quickReply, setQuickReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for active order - in real app this would come from Supabase
  useEffect(() => {
    const mockOrder: ActiveOrder = {
      id: bookingId || '88294',
      customer_name: 'Jane Doe',
      customer_avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtna1zbZb45ehEA839sGczEbBsN9JpAI4m9QY2EhcE1RHSXy00OyMofh9I8BYcGKXnkFBSp1q6DZ5TrjtfrNn1CFDtOEEeuiXXHVjglu9LB8JnCMfbNGwx3LLiDlqhC_fmKhn-qE6_XvsHCAVVPSO2GiDnE-T50PpZPLbsPdFElsGI7QeJSYQO3KXYB9cMThqwyIzUZmfKe3exHjy8_N5mLSb2GGjw9IFhVDkDGNUbLimoEw7zVFvqRPiU8DnPqjxqGWAVB_7lGTw',
      estimated_arrival: '12 mins',
      address: '742 Evergreen Terrace',
      city: 'Springfield, OR 97403',
      units_required: 4,
      service_category: 'Premium Setup',
      special_notes: 'Please use the side entrance. The doorbell is broken, so kindly knock or message upon arrival.',
      status: 'in_progress'
    };
    
    setActiveOrder(mockOrder);
    
    // Mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        sender_id: 'customer1',
        recipient_id: user?.id || '',
        content: 'Hi there! Just wanted to make sure you saw the note about the broken doorbell?',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: '2',
        sender_id: user?.id || '',
        recipient_id: 'customer1',
        content: 'Yes, I\'ve got it! I\'ll knock when I arrive at the side entrance. Should be there in about 12 minutes.',
        is_read: true,
        created_at: new Date(Date.now() - 3500000).toISOString() // 50 minutes ago
      },
      {
        id: '3',
        sender_id: 'customer1',
        recipient_id: user?.id || '',
        content: 'Perfect, thank you! See you soon.',
        is_read: false,
        created_at: new Date().toISOString() // now
      }
    ];
    
    setMessages(mockMessages);
    setLoading(false);
  }, [user, bookingId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !activeOrder) return;

    setSending(true);

    try {
      // In a real app, this would send to Supabase
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        recipient_id: 'customer1', // Mock customer ID
        content: newMessage,
        is_read: false,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setQuickReply(reply);
    setNewMessage(reply);
  };

  if (loading) {
    return (
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold leading-tight">Order #{activeOrder?.id || '...'}</h2>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-green-500"></div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Loading...</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 text-gray-600"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-base font-bold leading-tight">Order #{activeOrder?.id}</h2>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-blue-100 text-blue-600 gap-2 text-sm font-bold">
            <Phone className="h-4 w-4" />
            <span>Call Customer</span>
          </button>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 text-gray-600">
            <MoreVertical className="h-5 w-5" />
          </button>
          <div className="h-8 w-px bg-gray-200 mx-1"></div>
          <div className="size-10 rounded-full bg-gray-200 overflow-hidden">
            <img 
              className="h-full w-full object-cover" 
              src={user?.avatar_url || 'https://via.placeholder.com/40x40'} 
              alt="Driver profile avatar" 
            />
          </div>
        </div>
      </header>
      
      {/* Main Content Area: Split Pane */}
      <main className="flex flex-1 overflow-hidden">
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
                      <h3 className="text-lg font-bold">{activeOrder?.customer_name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Estimated Arrival</p>
                      <p className="text-lg font-bold text-blue-500">{activeOrder?.estimated_arrival}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{activeOrder?.address}</p>
                        <p className="text-xs text-gray-500">{activeOrder?.city}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{activeOrder?.units_required} Units Required</p>
                        <p className="text-xs text-gray-500">Service Category: {activeOrder?.service_category}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 w-full">
                        <p className="text-xs text-gray-600 leading-relaxed italic">"{activeOrder?.special_notes}"</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-5 md:w-64 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-center">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5" />
                    <span>Complete Service</span>
                  </button>
                  <button className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg text-sm">
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Right Pane: Docked Chat Window */}
        <aside className="w-[400px] flex flex-col bg-white">
          {/* Chat Header */}
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gray-200 overflow-hidden relative">
                <img 
                  className="h-full w-full object-cover" 
                  src={activeOrder?.customer_avatar} 
                  alt="Customer chat avatar" 
                />
                <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
              <div>
                <p className="text-sm font-bold">{activeOrder?.customer_name}</p>
                <p className="text-xs text-green-500 font-medium">Customer • Online</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <div className="flex flex-col items-center py-2">
              <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-bold text-gray-500 uppercase">Today</span>
            </div>
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 max-w-[85%] ${
                  message.sender_id === user?.id ? 'self-end' : ''
                }`}
              >
                {message.sender_id !== user?.id && (
                  <div className="size-6 rounded-full bg-gray-300 shrink-0">
                    <img 
                      className="rounded-full" 
                      src={activeOrder?.customer_avatar} 
                      alt="Customer avatar small" 
                    />
                  </div>
                )}
                
                <div className={`flex flex-col gap-1 ${message.sender_id === user?.id ? 'items-end' : ''}`}>
                  <div
                    className={`p-3 rounded-xl shadow-sm ${
                      message.sender_id === user?.id
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.sender_id === user?.id && (
                      <CheckCheck className="h-3 w-3 text-blue-500 fill-current" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {['I\'ve arrived', 'Running late', 'OK'].map((reply) => (
                  <button
                    key={reply}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center">
                <button className="absolute left-3 text-gray-400 hover:text-blue-500">
                  <PlusCircle className="h-5 w-5" />
                </button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="w-full pl-10 pr-12 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-3 text-blue-500 disabled:opacity-50"
                >
                  <Send className="h-5 w-5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
      
      {/* Sidebar (Minimal Dashboard Nav) */}
      <nav className="absolute left-0 top-16 bottom-0 w-16 flex flex-col items-center py-6 bg-white border-r border-gray-200 z-20">
        <div className="flex flex-col gap-6">
          <button className="flex size-10 items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard h-5 w-5">
              <rect width="7" height="9" x="3" y="3" rx="1"></rect>
              <rect width="7" height="5" x="14" y="3" rx="1"></rect>
              <rect width="7" height="9" x="14" y="12" rx="1"></rect>
              <rect width="7" height="5" x="3" y="16" rx="1"></rect>
            </svg>
          </button>
          <button className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list h-5 w-5 fill-current">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <path d="M12 11h4"></path>
              <path d="M12 16h4"></path>
              <path d="M8 11h.01"></path>
              <path d="M8 16h.01"></path>
            </svg>
          </button>
          <button className="flex size-10 items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history h-5 w-5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M12 7v5l4 2"></path>
            </svg>
          </button>
          <button className="flex size-10 items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card h-5 w-5">
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-6">
          <button className="flex size-10 items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell h-5 w-5">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <button className="flex size-10 items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-5 w-5">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </nav>
    </div>
  );
}