"use client"

import { useState } from "react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Send, Trash2, Archive, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const MOCK_MESSAGES = [
  {
    id: "1",
    senderName: "James",
    contact: "+1 (555) 123-4567",
    method: "whatsapp",
    message: "Hi, are you available today?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    adId: "1",
  },
  {
    id: "2",
    senderName: "Michael",
    contact: "michael_l",
    method: "wechat",
    message: "Looking to book for this weekend",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    adId: "1",
  },
  {
    id: "3",
    senderName: "David",
    contact: "+1 (555) 987-6543",
    method: "whatsapp",
    message: "Do you offer outcall?",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    adId: "1",
  },
  {
    id: "4",
    senderName: "Robert",
    contact: "robert_77",
    method: "wechat",
    message: "What's your rate for overnight?",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    adId: "1",
  },
]

export default function MessagesPage() {
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const unreadCount = MOCK_MESSAGES.filter(m => !m.read).length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <PageShell
        title="Messages"
        description="Contact requests and inquiries from clients."
      >
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Messages</p>
            <p className="text-2xl font-bold text-foreground mt-1">{MOCK_MESSAGES.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground font-medium">Unread</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{unreadCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground font-medium">This Month</p>
            <p className="text-2xl font-bold text-foreground mt-1">{MOCK_MESSAGES.length}</p>
          </div>
        </div>

        {/* Messages list and detail view */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Messages list */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <div className="px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="text-sm font-bold">Inbox</h3>
              </div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {MOCK_MESSAGES.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMsg(selectedMsg === msg.id ? null : msg.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 transition-colors border-none hover:bg-muted/50",
                      selectedMsg === msg.id && "bg-muted",
                      !msg.read && "bg-pink-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn("text-sm font-semibold", !msg.read && "text-foreground")}>
                        {msg.senderName}
                      </p>
                      {!msg.read && (
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {msg.timestamp.toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message detail */}
          <div className="lg:col-span-2">
            {selectedMsg ? (
              (() => {
                const msg = MOCK_MESSAGES.find(m => m.id === selectedMsg)
                if (!msg) return null
                return (
                  <div className="border border-border rounded-lg overflow-hidden bg-card flex flex-col h-full">
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                          {msg.senderName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{msg.senderName}</p>
                          <p className="text-xs text-muted-foreground">
                            {msg.method === 'whatsapp' ? 'WhatsApp' : 'WeChat'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Archive className="h-4 w-4" />
                        </button>
                        <button className="text-destructive hover:text-destructive/90 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Message content */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-foreground mb-2">{msg.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="px-4 py-3 border-t border-border bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-2">Contact:</p>
                      <div className="flex items-center gap-2">
                        {msg.method === 'whatsapp' ? (
                          <>
                            <Phone className="h-4 w-4 text-[#25D366]" />
                            <a
                              href={`https://wa.me/${msg.contact.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#25D366] hover:underline"
                            >
                              {msg.contact}
                            </a>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 text-[#07C160]" />
                            <span className="text-sm text-foreground">{msg.contact}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Reply form */}
                    <div className="px-4 py-4 border-t border-border">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                        />
                        <Button
                          size="sm"
                          className="bg-foreground text-background hover:bg-foreground/90"
                          disabled={!replyText.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Replies are sent via {msg.method === 'whatsapp' ? 'WhatsApp' : 'WeChat'}
                      </p>
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="border border-dashed border-border rounded-lg p-8 text-center flex flex-col items-center justify-center h-full">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-foreground">No message selected</p>
                <p className="text-xs text-muted-foreground mt-1">Click a message to view details and reply</p>
              </div>
            )}
          </div>
        </div>
      </PageShell>
    </div>
  )
}
