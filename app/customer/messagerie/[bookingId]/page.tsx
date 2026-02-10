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
  Search, 
  Star, 
  Video, 
  Settings,
  Camera,
  MapPin,
  Smile,
  CheckCheck,
  Truck,
  Wrench,
  AlertTriangle
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
  equipment?: string;
  job_title?: string;
}

interface Conversation {
  id: string;
  other_user: OtherUser;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_active: boolean;
}

export default function CustomerBookingMessagerie({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { bookingId } = params;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for conversations - in real app this would come from Supabase
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        other_user: {
          id: 'driver1',
          full_name: 'Mohamed - Caterpillar 966',
          rating: 4.9,
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVxi7M88j9qS50ca7okF5D_-fvxNr_ZBRnoxxSixzRFJ2OvhgdsGzzn1WzkKnWigppmoFvwnF8lFrs5YXk5agmcfvDfExRJrFSGMMHYwqcHrV6uhPEgrNtTgOnjDC0bhw7HX4oT9PlenWZ5oCO7f5sAUh6gUd5944HmG1Adt45TVbtD7YfUC9uoCGmJadAWHLH9NiSXja-8Hwc8644rI8-ZL6RqMgZhWUheal_ePEWm2mu3sosN1ya0RHxeNNKmzInKTemmC2GUZ8',
          role: 'driver',
          equipment: 'Caterpillar 966',
          job_title: 'Heavy Equipment Operator'
        },
        last_message: 'I\'m arriving at the site in 5 minutes.',
        last_message_time: '2:45 PM',
        unread_count: 1,
        is_active: true
      },
      {
        id: '2',
        other_user: {
          id: 'driver2',
          full_name: 'Alex - Tow Truck',
          rating: 4.7,
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7PqjN0MtQZ82DXeF_XImSWkETR3w0EIGPwtnGGp71haB9u-PYx11aRV_O0UGJIsv6BXLebJWabV4o66OOb0vOndzFvpKe1TvgXVmIC03tlVopGGqqOMm4ePK76vRmLBSNPSf4emzd82JvZPlLMzl4nLGhr_X4c2nKw3ywxKg4GYuwKrx70_ozyoz5UgSMky1btUbXW1HyDo8YrjRrCgNZgFGuO7nzK15ADfJ2tLxFczANAArjPdvtJMH8F6Oshrnxc7GdtsKqVfU',
          role: 'driver',
          equipment: 'Tow Truck',
          job_title: 'Truck Driver'
        },
        last_message: 'The vehicle is securely loaded now.',
        last_message_time: 'Yesterday',
        unread_count: 0,
        is_active: false
      },
      {
        id: '3',
        other_user: {
          id: 'driver3',
          full_name: 'David - Mobile Crane',
          rating: 4.8,
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAeCUlYLJ1pThyPZpWMROE7P5iYfognoTeWeaqKuYQFs1Ow0KRA74rJv6DRMyk6kEAvoYYHFmTlLchqfw7CaOOzWPknH08orAumFsklaQShbvKDDjOfk4Wd8Pyyy-JF9P20tVCgg5FEZ9tQve3uduultdW0Gou0qm4TGkkf0Xs2J7BbcQ4wrUBNWZJMS8psPruRktk5MJG59OH5ELS7QWrLY7OAq3zTKpP6mrEqOMecJ7EDirZwUR0UezbOdtR6ty5QZOafJ6Qews',
          role: 'driver',
          equipment: 'Mobile Crane',
          job_title: 'Crane Operator'
        },
        last_message: 'Please confirm the lift weight.',
        last_message_time: 'Oct 24',
        unread_count: 0,
        is_active: false
      },
      {
        id: '4',
        other_user: {
          id: 'support1',
          full_name: 'Sarah - Support',
          rating: 4.9,
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNDMw2m8SK3W1Ht_70z9v1TEvwB6M0BpqS897lRz-1-IyZO5RP5ZmXBbwptILu6LEbMMXhlJLKPftJ9SIgAD1VHb-HLAzFrE9kFJLMtWlMH1rlYts9wQwfbov8QGFqvRcdUJQ-cx9LOwiVLrRJ12xaRW9f_gTEe73etgqC_pfrK55HvehFZ-Jbi-VL9pxzKb9FR2IdCTtZYNTthlutj4qKcxN03i1QAcrOnWlAPWiVjO_Jlvn5qjT8y7QJsG925q6FX45sTjuHqpY',
          role: 'support',
          job_title: 'Support Specialist'
        },
        last_message: 'Your request has been processed.',
        last_message_time: 'Oct 22',
        unread_count: 0,
        is_active: false
      }
    ];
    
    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0]);
    }
    setLoading(false);
  }, [bookingId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      // In a real app, this would fetch from Supabase
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: 'driver1',
          recipient_id: user?.id || '',
          content: 'Hello! I have picked up the Caterpillar 966. On my way to your location now.',
          is_read: true,
          created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          id: '2',
          sender_id: user?.id || '',
          recipient_id: 'driver1',
          content: 'Great. Here\'s a photo of the gate where you need to enter. It\'s the North Entrance.',
          is_read: true,
          created_at: new Date(Date.now() - 3500000).toISOString() // 50 minutes ago
        },
        {
          id: '3',
          sender_id: 'driver1',
          recipient_id: user?.id || '',
          content: 'Got it, thank you. I\'m arriving at the site in 5 minutes.',
          is_read: false,
          created_at: new Date().toISOString() // now
        }
      ];
      
      setMessages(mockMessages);
    }
  }, [selectedConversation, user, bookingId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !selectedConversation) return;

    setSending(true);

    try {
      // In a real app, this would send to Supabase
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        recipient_id: selectedConversation.other_user.id,
        content: newMessage,
        is_read: false,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Update conversation list with new message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? {...conv, last_message: newMessage, last_message_time: 'Just now'} 
          : conv
      ));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
            <div className="mt-4 space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Conversation List */}
        <aside className="w-80 md:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800">Messages</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search drivers or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="relative">
                  <img
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                    src={conversation.other_user.avatar_url}
                    alt={`Portrait of ${conversation.other_user.full_name}`}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-semibold truncate text-gray-900">
                      {conversation.other_user.full_name}
                    </h3>
                    <span className="text-xs text-gray-500">{conversation.last_message_time}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{conversation.last_message}</p>
                </div>
                {conversation.unread_count > 0 && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </aside>
        
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-50 relative">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <header className="h-20 flex items-center justify-between px-6 bg-white border-b border-gray-200 z-10">
                <div className="flex items-center gap-4">
                  <img
                    className="w-10 h-10 rounded-lg object-cover bg-gray-200"
                    src={selectedConversation.other_user.avatar_url}
                    alt={`Portrait of ${selectedConversation.other_user.full_name}`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900">{selectedConversation.other_user.full_name}</h2>
                      <div className="flex items-center bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 text-xs font-bold">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {selectedConversation.other_user.rating}
                      </div>
                    </div>
                    <p className="text-xs text-green-600 font-medium">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Call Button (Disabled by Admin Example) */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed transition-all" title="Calls disabled by administrator">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs font-semibold hidden sm:inline">Call</span>
                  </button>
                  {/* WhatsApp Button (Enabled) */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-sm">
                    <Video className="h-4 w-4 text-xs" />
                    <span className="text-xs font-semibold hidden sm:inline">WhatsApp</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </header>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {/* Date Separator */}
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-gray-200 rounded-full text-xs uppercase font-bold text-gray-500 tracking-wider">Today</span>
                </div>
                
                {/* System Message */}
                <div className="flex justify-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3">
                    <LocalShipping className="h-4 w-4 text-blue-500" />
                    <p className="text-xs text-gray-600">
                      Driver started the trip to <span className="font-semibold">Main Construction Site A</span>
                    </p>
                  </div>
                </div>
                
                {/* Messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-3 max-w-[80%] ${
                      message.sender_id === user?.id ? 'self-end flex-row-reverse' : ''
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <img
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        src={selectedConversation.other_user.avatar_url}
                        alt={`Portrait of ${selectedConversation.other_user.full_name}`}
                      />
                    )}
                    
                    {message.sender_id === user?.id && (
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">ME</span>
                      </div>
                    )}
                    
                    <div className={`${message.sender_id === user?.id ? 'flex flex-col items-end' : ''}`}>
                      <div
                        className={`p-3 rounded-xl shadow-sm ${
                          message.sender_id === user?.id
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${message.sender_id === user?.id ? 'mr-1' : 'ml-1'}`}>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {message.sender_id === user?.id && (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="flex items-end gap-3">
                  {/* Attachment Buttons */}
                  <div className="flex gap-1">
                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Attach Photos">
                      <Camera className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Share Location">
                      <Location className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Input Area */}
                  <div className="flex-1 relative">
                    <textarea
                      className="w-full bg-gray-100 border-none rounded-xl py-3 px-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-32"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                      rows={1}
                    />
                    <button className="absolute right-3 bottom-2.5 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <Smile className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="w-11 h-11 flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Quick Suggestion chips */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {['Thank you!', 'Where are you?', 'Call me please', 'Site is ready'].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-600 transition-colors border border-gray-200"
                      onClick={() => setNewMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </main>
        
        {/* Right Details Pane (Visible on Large Desktops) */}
        {selectedConversation && (
          <aside className="hidden xl:flex w-72 flex-shrink-0 bg-white border-l border-gray-200 flex-col">
            <div className="p-6 flex flex-col items-center text-center border-b border-gray-200">
              <img
                className="w-24 h-24 rounded-2xl object-cover bg-gray-200 shadow-md mb-4"
                src={selectedConversation.other_user.avatar_url}
                alt={`Portrait of ${selectedConversation.other_user.full_name}`}
              />
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {selectedConversation.other_user.full_name.split(' - ')[0]}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{selectedConversation.other_user.job_title}</p>
              <div className="flex items-center gap-1 text-blue-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <span className="text-xs text-gray-500 ml-1 font-semibold">
                  ({Math.floor(Math.random() * 100) + 30})
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Active Job</h4>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-700">Excavation Phase 2</p>
                  <p className="text-xs text-gray-500 mt-1">Order #88392-XC</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Equipment</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Engineering className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{selectedConversation.other_user.equipment}</p>
                    <p className="text-xs text-gray-500">Wheel Loader</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Media Shared</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      className="w-full h-full object-cover opacity-75 hover:opacity-100 cursor-pointer transition-opacity"
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                      alt="Shared media"
                    />
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      className="w-full h-full object-cover opacity-75 hover:opacity-100 cursor-pointer transition-opacity"
                      src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                      alt="Shared media"
                    />
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                    +12 more
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                <ReportProblem className="h-4 w-4" />
                Report Issue
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}