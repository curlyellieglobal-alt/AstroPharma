import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, X } from "lucide-react";

export default function AdminChat() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery(
    undefined,
    { refetchInterval: 5000 } // Poll every 5 seconds
  );

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

  const handleCloseConversation = () => {
    if (!selectedConversationId) return;
    if (confirm("Are you sure you want to close this conversation?")) {
      closeConversation.mutate({ conversationId: selectedConversationId });
    }
  };

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);
  const unreadCount = messages?.filter((m) => !m.isRead && m.senderType === "customer").length || 0;

  return (
    <div className="h-screen flex">
      {/* Conversations List */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer Conversations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {conversations?.filter((c) => c.status === "active").length || 0} active
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations && conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              <p>No conversations yet</p>
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
                  {conversation.customerEmail && (
                    <p className="text-xs text-gray-600 truncate">{conversation.customerEmail}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conversation.lastMessageAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      conversation.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {conversation.status}
                  </span>
                </div>
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
              <MessageCircle className="h-48 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedConversation?.customerName}</h3>
                {selectedConversation?.customerEmail && (
                  <p className="text-sm text-gray-600">{selectedConversation.customerEmail}</p>
                )}
                {selectedConversation?.customerPhone && (
                  <p className="text-sm text-gray-600">{selectedConversation.customerPhone}</p>
                )}
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded">
                    {unreadCount} unread
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseConversation}
                  disabled={selectedConversation?.status === "closed"}
                >
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages && messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-8">
                  <p>No messages yet</p>
                </div>
              )}

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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium opacity-70">
                        {msg.senderType === "admin" ? "You" : selectedConversation?.customerName}
                      </span>
                      {!msg.isRead && msg.senderType === "customer" && (
                        <span className="text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded">New</span>
                      )}
                    </div>
                    {msg.messageType === "text" && <p className="text-sm">{msg.content}</p>}
                    {msg.messageType === "image" && msg.mediaUrl && (
                      <div>
                        <img src={msg.mediaUrl} alt="Shared image" className="rounded max-w-full" />
                        {msg.content && <p className="text-sm mt-2">{msg.content}</p>}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                      {msg.senderType === "admin" && (
                        <span className="text-xs opacity-70">
                          {msg.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedConversation?.status === "active" && (
              <div className="border-t bg-white">
                {/* Saved Replies Quick Select */}
                {showSavedReplies && savedReplies && savedReplies.length > 0 && (
                  <div className="p-4 border-b bg-gray-50 max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Quick Replies</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSavedReplies(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {savedReplies.map((reply) => (
                        <button
                          key={reply.id}
                          type="button"
                          onClick={() => {
                            if (reply.replyType === "text") {
                              setMessage(reply.content);
                            } else if (reply.replyType === "link" && reply.linkUrl) {
                              setMessage(`${reply.content}\n${reply.linkUrl}`);
                            }
                            setShowSavedReplies(false);
                          }}
                          className="w-full text-left p-2 text-sm bg-white hover:bg-gray-100 rounded border"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">
                              {reply.replyType}
                            </span>
                            <span className="truncate">{reply.content.substring(0, 50)}...</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="p-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSavedReplies(!showSavedReplies)}
                      className="shrink-0"
                    >
                      💬
                    </Button>
                    <Input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="bg-pink-600 hover:bg-pink-700"
                      disabled={sendMessage.isPending || !message.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
