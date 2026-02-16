'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Eye, 
  Archive, 
  Reply,
  Clock,
  CheckCircle,
  CircleX
} from 'lucide-react'

interface SupportTicket {
  id: string
  user_id: string | null
  subject: string
  category: string
  status: 'open' | 'awaiting_reply' | 'resolved'
  description: string
  created_at: string
  updated_at: string
  users?: {
    email?: string
    full_name?: string
  } | null
  user_email: string
  user_full_name: string
}

export default function AdminSupportPage() {
  const { user, profile } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [viewDetailsModal, setViewDetailsModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Fetch tickets with user info where available
        const { data, error } = await supabase
          .from('support_tickets')
          .select(`
            *,
            users(email, full_name)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        const ticketsWithUserInfo = data.map(ticket => ({
          ...ticket,
          user_email: ticket.users?.email || (ticket.user_id ? 'User not found' : 'Anonymous'),
          user_full_name: ticket.users?.full_name || (ticket.user_id ? 'Unknown User' : 'Anonymous')
        }))

        setTickets(ticketsWithUserInfo)
        setFilteredTickets(ticketsWithUserInfo)
      } catch (error) {
        console.error('Error fetching support tickets:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTickets()
    }
  }, [user])

  useEffect(() => {
    let result = tickets
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter)
    }
    
    setFilteredTickets(result)
  }, [searchTerm, statusFilter, tickets])

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId)

      if (error) throw error

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus as any } : ticket
      ))
      
      // Close modal if ticket was resolved
      if (newStatus === 'resolved') {
        setViewDetailsModal(false)
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default'
      case 'awaiting_reply':
        return 'secondary'
      case 'resolved':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'awaiting_reply':
        return <Mail className="h-4 w-4 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600">Manage customer inquiries and support requests</p>
          </div>
        </div>
        
        <div className="animate-pulse">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage customer inquiries and support requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'open').length}</div>
            <p className="text-xs text-gray-500">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Awaiting Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'awaiting_reply').length}</div>
            <p className="text-xs text-gray-500">Response needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">All Tickets</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter by status:</span>
              <select
                className="bg-gray-100 border-none rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="awaiting_reply">Awaiting Reply</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No support tickets found
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span>#{ticket.id.substring(0, 8)}</span>
                    </div>
                    <div className="text-sm text-gray-600 truncate max-w-xs">{ticket.subject}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ticket.user_full_name}</div>
                    <div className="text-sm text-gray-500">{ticket.user_email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ticket.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{new Date(ticket.created_at).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={viewDetailsModal} onOpenChange={setViewDetailsModal}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket)
                          }}
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Support Ticket Details</DialogTitle>
                        </DialogHeader>
                        
                        {selectedTicket && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Ticket Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Ticket ID</p>
                                  <p className="font-medium">#{selectedTicket.id.substring(0, 8)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedTicket.status)}
                                    <Badge variant={getStatusBadgeVariant(selectedTicket.status)} className="capitalize">
                                      {selectedTicket.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Category</p>
                                  <p className="font-medium capitalize">{selectedTicket.category}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Date Created</p>
                                  <p className="font-medium">
                                    {new Date(selectedTicket.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{selectedTicket.user_full_name}</p>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{selectedTicket.user_email}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Subject</h3>
                              <p className="font-medium">{selectedTicket.subject}</p>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Description</h3>
                              <p className="whitespace-pre-line">{selectedTicket.description}</p>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Resolved
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleUpdateStatus(selectedTicket.id, 'awaiting_reply')}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Reply Later
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleUpdateStatus(selectedTicket.id, 'open')}
                              >
                                <CircleX className="h-4 w-4 mr-2" />
                                Reopen
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedTicket(ticket)
                          setViewDetailsModal(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'resolved')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'awaiting_reply')}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply Later
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}