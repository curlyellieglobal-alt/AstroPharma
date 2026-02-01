import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Image, Mic, Video, Camera } from "lucide-react";
import { RecordingModalEnhanced as RecordingModal } from "./RecordingModalEnhanced";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { SavedRepliesMenu } from "./SavedRepliesMenu";
import { toast } from "sonner";

// Voice message component with playback speed toggle
function VoiceMessage({ mediaUrl, content }: { mediaUrl: string; content?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleAudioError = (e: any) => {
    console.error('Audio playback error:', e);
    setAudioError('Unable to play audio');
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setAudioError(null);
  };

  if (audioError) {
    return (
      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
        Audio error: {audioError}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <audio
          ref={audioRef}
          controls
          src={mediaUrl}
          className="flex-1"
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.playbackRate = playbackRate;
            }
          }}
          onCanPlay={handleCanPlay}
          onError={handleAudioError}
          crossOrigin="anonymous"
        />
        <button
          onClick={toggleSpeed}
          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded font-mono disabled:opacity-50"
          disabled={isLoading}
        >
          {playbackRate}x
        </button>
      </div>
      {content && <p className="text-sm mt-2">{content}</p>}
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [translatedMessage, setTranslatedMessage] = useState<{ id: number; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Recording UI states
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingType, setRecordingType] = useState<'voice' | 'video' | 'snapshot' | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Network status monitoring
  const networkStatus = useNetworkStatus();
  const [showReconnecting, setShowReconnecting] = useState(false);

  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { 
      enabled: !!conversationId && networkStatus.isOnline, 
      refetchInterval: 3000, // Poll every 3 seconds
      retry: networkStatus.isOnline ? 3 : 0, // Don't retry if offline
    }
  );

  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.id);
      setIsStarted(true);
      localStorage.setItem("chatConversationId", data.id.toString());
      
      // Send auto-greeting after creating conversation
      setTimeout(() => {
        sendAutoGreeting.mutate({ conversationId: data.id });
      }, 500);
    },
    onError: (error) => {
      console.error("❌ Failed to create conversation:", error);
      alert(`Failed to start chat: ${error.message}`);
    },
  });

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      scrollToBottom();
    },
  });

  const sendAutoGreeting = trpc.chat.sendAutoGreeting.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  const detectIntentAndRespond = trpc.chat.detectIntentAndRespond.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  const escalateToHuman = trpc.chat.escalateToHuman.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  // Handle network reconnection
  useEffect(() => {
    if (networkStatus.wasOffline && networkStatus.isOnline) {
      console.log('[Chat] Network reconnected, refreshing messages...');
      setShowReconnecting(true);
      
      // Exponential backoff for reconnection
      const delay = Math.min(1000 * Math.pow(2, networkStatus.reconnectAttempts), 10000);
      
      setTimeout(() => {
        if (conversationId) {
          refetchMessages();
          networkStatus.resetReconnectAttempts();
        }
        setShowReconnecting(false);
      }, delay);
      
      networkStatus.incrementReconnectAttempts();
    }
  }, [networkStatus.isOnline, networkStatus.wasOffline, conversationId]);

  useEffect(() => {
    // Check if there's an existing conversation
    const savedConversationId = localStorage.getItem("chatConversationId");
    if (savedConversationId) {
      setConversationId(parseInt(savedConversationId));
      setIsStarted(true);
    }
  }, []);

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    createConversation.mutate({
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
    })
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId) return;

    const userMessage = message;
    
    // Clear input immediately
    setMessage("");
    
    sendMessage.mutate({
      conversationId,
      senderType: "customer",
      messageType: "text",
      content: userMessage,
    });
    
    // AI intent detection and auto-response
    setTimeout(() => {
      detectIntentAndRespond.mutate({
        conversationId,
        userMessage,
      });
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 overflow-hidden border-2 border-white"
        aria-label="Open chat"
      >
        <img src="/doctor-avatar.png" alt="Doctor Support" className="h-full w-full object-cover" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-pink-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <img src="/doctor-avatar.png" alt="Doctor" className="h-6 w-6 rounded-full object-cover" />
          <h3 className="font-semibold">Doctor Support</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-pink-700 rounded p-1 transition"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Network Status Banner */}
      {!networkStatus.isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-sm text-center">
          ⚠️ No internet connection. Trying to reconnect...
        </div>
      )}
      {showReconnecting && networkStatus.isOnline && (
        <div className="bg-blue-500 text-white px-4 py-2 text-sm text-center">
          🔄 Reconnecting... (Attempt {networkStatus.reconnectAttempts + 1})
        </div>
      )}

      {!isStarted ? (
        /* Start Chat Form */
        <form onSubmit={handleStartChat} className="flex-1 flex flex-col gap-4 p-4">
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div>
              <h4 className="font-semibold mb-2">Start a conversation</h4>
              <p className="text-sm text-gray-600 mb-4">
                We're here to help! Please provide your information to begin.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email (optional)</label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700"
            disabled={createConversation.isPending}
          >
            {createConversation.isPending ? "Starting..." : "Start Chat"}
          </Button>
        </form>
      ) : (
        /* Chat Interface */
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages && messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}

            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === "customer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 relative ${
                    msg.senderType === "customer"
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-900 border"
                  }`}
                  onTouchStart={async (e) => {
                    if (msg.messageType === "text" && msg.content) {
                      // Translate on touch
                      try {
                        const response = await fetch("/api/trpc/chat.translateMessage", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ text: msg.content }),
                        });
                        const data = await response.json();
                        setTranslatedMessage({ id: msg.id, text: data.result.data.translatedText });
                      } catch (err) {
                        console.error("Translation error:", err);
                      }
                    }
                  }}
                  onTouchEnd={() => {
                    // Hide translation on release
                    setTranslatedMessage(null);
                  }}
                  onMouseDown={async (e) => {
                    // Desktop: hold to translate
                    if (msg.messageType === "text" && msg.content) {
                      try {
                        const response = await fetch("/api/trpc/chat.translateMessage", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ text: msg.content }),
                        });
                        const data = await response.json();
                        setTranslatedMessage({ id: msg.id, text: data.result.data.translatedText });
                      } catch (err) {
                        console.error("Translation error:", err);
                      }
                    }
                  }}
                  onMouseUp={() => {
                    setTranslatedMessage(null);
                  }}
                  onMouseLeave={() => {
                    setTranslatedMessage(null);
                  }}
                >
                  {msg.messageType === "text" && (
                    <>
                      <p className="text-sm">{msg.content}</p>
                      {translatedMessage && translatedMessage.id === msg.id && (
                        <div className="absolute inset-0 bg-black/90 rounded-lg p-3 flex items-center justify-center">
                          <p className="text-white text-sm text-center">{translatedMessage.text}</p>
                        </div>
                      )}
                    </>
                  )}
                  {msg.messageType === "image" && msg.mediaUrl && (
                    <div>
                      <img src={msg.mediaUrl} alt="Shared image" className="rounded max-w-full" />
                      {msg.content && <p className="text-sm mt-2">{msg.content}</p>}
                    </div>
                  )}
                  {msg.messageType === "voice" && msg.mediaUrl && (
                    <VoiceMessage mediaUrl={msg.mediaUrl} content={msg.content} />
                  )}
                  {msg.messageType === "video" && msg.mediaUrl && (
                    <div>
                      <video controls src={msg.mediaUrl} className="rounded max-w-full" />
                      {msg.content && <p className="text-sm mt-2">{msg.content}</p>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                    {msg.senderType === "customer" && (
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

          {/* Escalate to Human Button */}
          <div className="px-4 pt-3 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (conversationId) {
                  escalateToHuman.mutate({ conversationId });
                }
              }}
              className="w-full text-sm"
            >
              👤 تحويل لموظف بشري / Escalate to Human
            </Button>
          </div>
          
          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white">
            <div className="flex gap-2 items-center">
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && conversationId) {
                    try {
                      // Compress image before upload
                      const { compressImage, calculateFileHash } = await import('@/lib/mediaUtils');
                      const compressedBlob = await compressImage(file);
                      
                      // Calculate file hash for deduplication
                      const fileHash = await calculateFileHash(compressedBlob);
                      
                      // Upload to S3 with binary data
                      const uploadResult = await fetch("/api/upload/media", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/octet-stream",
                          "x-conversation-id": String(conversationId),
                          "x-file-name": file.name,
                          "x-mime-type": compressedBlob.type,
                        },
                        body: compressedBlob,
                      });
                      const data = await uploadResult.json();
                      const mediaUrl = data.mediaUrl || data.result?.data?.mediaUrl;
                      const deduplicated = data.deduplicated || data.result?.data?.deduplicated;
                      
                      if (deduplicated) {
                        console.log("[Deduplication] Reused existing image");
                      }
                      
                      // Send message with media URL
                      await sendMessage.mutateAsync({
                        conversationId,
                        senderType: "customer",
                        messageType: "image",
                        content: "Image",
                        mediaUrl,
                      });
                    } catch (err) {
                      console.error("Image upload error:", err);
                    }
                  }
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && conversationId) {
                    try {
                      // Calculate file hash for deduplication
                      const { calculateFileHash, compressVideo, formatFileSize } = await import('@/lib/mediaUtils');
                      const fileHash = await calculateFileHash(file);
                      
                      // Check video size
                      const { needsRerecording } = await compressVideo(file);
                      if (needsRerecording) {
                        alert(`Video size is ${formatFileSize(file.size)}. Please record a shorter video (recommended: under 10MB).`);
                        return;
                      }
                      
                      // Upload to S3 with binary data
                      const uploadResult = await fetch("/api/upload/media", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/octet-stream",
                          "x-conversation-id": String(conversationId),
                          "x-file-name": file.name,
                          "x-mime-type": file.type,
                        },
                        body: file,
                      });
                      const data = await uploadResult.json();
                      const mediaUrl = data.mediaUrl || data.result?.data?.mediaUrl;
                      const deduplicated = data.deduplicated || data.result?.data?.deduplicated;
                      
                      if (deduplicated) {
                        console.log("[Deduplication] Reused existing video");
                      }
                      
                      // Send message with media URL
                      await sendMessage.mutateAsync({
                        conversationId,
                        senderType: "customer",
                        messageType: "video",
                        content: "Video",
                        mediaUrl,
                      });
                    } catch (err) {
                      console.error("Video upload error:", err);
                    }
                  }
                }}
              />

              {/* Upload buttons */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowRecordingModal(true);
                  setRecordingType('voice');
                }}
                title="Record voice"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowRecordingModal(true);
                  setRecordingType('video');
                }}
                title="Record video"
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowRecordingModal(true);
                  setRecordingType('snapshot');
                }}
                title="Take snapshot"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <SavedRepliesMenu
                onSelectReply={(text) => setMessage(text)}
                disabled={!conversationId}
              />

              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-pink-600 hover:bg-pink-700"
                disabled={sendMessage.isPending || !message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
      
      {/* Recording Modal with Progress Tracking */}
      {showRecordingModal && recordingType && (
        <RecordingModal
          type={recordingType}
          onClose={() => {
            setShowRecordingModal(false);
            setRecordingType(null);
          }}
          onSend={async (blob) => {
            if (!conversationId) {
              alert("No active conversation. Please start a chat first.");
              return;
            }
            
            try {
              // Calculate file hash for deduplication
              const { calculateFileHash } = await import('@/lib/mediaUtils');
              const fileHash = await calculateFileHash(blob);
              
              // Use FormData to avoid JSON size limits for large audio files
              
              const timestamp = Date.now();
              const fileExt = recordingType === 'voice' ? 'webm' : (recordingType === 'snapshot' ? 'png' : 'webm');
              const fileName = `recording-${timestamp}.${fileExt}`;
              let mimeType = blob.type || (recordingType === 'voice' ? 'audio/webm' : recordingType === 'snapshot' ? 'image/png' : 'video/webm');
              // Normalize MIME type by removing codec parameters (e.g., audio/webm;codecs=opus -> audio/webm)
              mimeType = mimeType.split(';')[0].trim().toLowerCase();
              const msgType = recordingType === 'snapshot' ? 'image' : recordingType;
              
              const formData = new FormData();
              formData.append('conversationId', conversationId.toString());
              formData.append('fileName', fileName);
              formData.append('mimeType', mimeType);
              formData.append('messageType', msgType);
              formData.append('file', blob, fileName);
              if (fileHash) formData.append('fileHash', fileHash);
              
              const uploadResult = await fetch("/api/upload/media", {
                method: "POST",
                headers: {
                  'x-conversation-id': conversationId.toString(),
                  'x-file-name': fileName,
                  'x-mime-type': mimeType,
                  'Content-Type': 'application/octet-stream',
                  ...(fileHash && { 'x-file-hash': fileHash }),
                },
                body: blob,
              });
              
              if (!uploadResult.ok) {
                const errorText = await uploadResult.text();
                console.error('[Chat Upload Error] Response:', errorText);
                throw new Error(`Upload failed: ${uploadResult.status} ${uploadResult.statusText}`);
              }
              
              const uploadData = await uploadResult.json();
              
              // Check for error response
              if (uploadData.error) {
                console.error('[Chat Upload Error] Error:', uploadData.error);
                throw new Error(`Upload error: ${uploadData.error}`);
              }
              
              const mediaUrl = uploadData.mediaUrl || uploadData.url || uploadData.result?.data?.mediaUrl;
              
              if (!mediaUrl) {
                console.error('[Chat Upload Error] No media URL in response:', uploadData);
                throw new Error("No media URL returned from upload. Please check file format and size.");
              }
              
              const deduplicated = uploadData.deduplicated;
              if (deduplicated) {
                console.log(`[Deduplication] Reused existing ${recordingType} recording`);
              }
              
              // Send message with media URL
              await sendMessage.mutateAsync({
                conversationId,
                senderType: "customer",
                messageType: msgType as 'image' | 'voice' | 'video',
                content: recordingType === 'voice' ? "Voice message" : recordingType === 'snapshot' ? "Snapshot" : "Video message",
                mediaUrl,
              });
              
              // Close modal after successful send
              setShowRecordingModal(false);
              setRecordingType(null);
              
            } catch (error) {
              console.error("Failed to upload recording:", error);
              alert(`Failed to send recording: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
            }
          }}
        />
      )}
    </Card>
  );
}
