import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, X, UserPlus, Filter, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function AdminChat() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [filterByMe, setFilterByMe] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery(
    filterByMe ? { assignedTo: Number(user?.id) || 0 } : undefined,
    { refetchInterval: 5000 }
  );

  const { data: allUsers } = trpc.admin.listUsers.useQuery();
  const staffUsers = allUsers?.filter(u => u.role === 'admin') || [];

  const { data: savedReplies } = trpc.savedReplies.list.useQuery({});

  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId, refetchInterval: 3000 }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      refetchConversations();
      scrollToBottom();
    },
  });

  const assignTo = trpc.chat.assignTo.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين الموظف للمحادثة بنجاح");
      refetchConversations();
    },
  });

  const closeConversation = trpc.chat.closeConversation.useMutation({
    onSuccess: () => {
      refetchConversations();
      setSelectedConversationId(null);
    },
  });

  const markAsRead = trpc.chat.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId) {
      markAsRead.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversationId) return;

    sendMessage.mutate({
      conversationId: selectedConversationId,
      senderType: "admin",
      messageType: "text",
      content: message,
    });
  };

  const handleAssign = (userId: number | null) => {
    if (!selectedConversationId) return;
    assignTo.mutate({
      conversationId: selectedConversationId,
      userId: userId
    });
  };

  const handleCloseConversation = () => {
    if (!selectedConversationId) return;
    if (confirm("Are you sure you want to close this conversation?")) {
      closeConversation.mutate({ conversationId: selectedConversationId });
    }
  };

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);
  const unreadCount = messages?.filter((m) => !m.isRead && m.senderType === "customer").length || 0;
  const assignedStaff = staffUsers.find(u => u.id === selectedConversation?.assignedTo);

  return (
    <div className="h-screen flex">
      {/* Conversations List */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              المحادثات
            </h2>
            <Button 
              variant={filterByMe ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterByMe(!filterByMe)}
              className="text-xs gap-1"
            >
              <Filter className="h-3 w-3" />
              {filterByMe ? "محادثاتي" : "الكل"}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {conversations?.filter((c) => c.status === "active").length || 0} نشطة
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations && conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              <p>لا توجد محادثات حالياً</p>
            </div>
          )}

          {conversations?.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversationId(conversation.id)}
              className={`w-full p-4 border-b text-left hover:bg-white transition ${
                selectedConversationId === conversation.id ? "bg-white border-l-4 border-l-pink-600" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{conversation.customerName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      conversation.assignedTo ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {conversation.assignedTo ? "موكلة" : "غير موكلة"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {conversation.status === "active" && (
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-1"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedConversationId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-24 w-24 mx-auto mb-4 text-gray-200" />
              <p className="text-lg font-medium">اختر محادثة للبدء</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">{selectedConversation?.customerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {assignedStaff ? `موكلة لـ: ${assignedStaff.name}` : "غير موكلة لأحد"}
                    </span>
                  </div>
                </div>
                
                {/* Assignment Dropdown (Simplified for demo) */}
                <div className="flex items-center gap-1">
                  <select 
                    className="text-xs border rounded p-1"
                    value={selectedConversation?.assignedTo || ""}
                    onChange={(e) => handleAssign(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">تعيين موظف...</option>
                    {staffUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseConversation}
                  disabled={selectedConversation?.status === "closed"}
                >
                  <X className="h-4 w-4 mr-1" />
                  إغلاق المحادثة
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.senderType === "admin"
                        ? "bg-pink-600 text-white"
                        : "bg-white text-gray-900 border"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedConversation?.status === "active" && (
              <div className="border-t bg-white p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700"
                    disabled={sendMessage.isPending || !message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
