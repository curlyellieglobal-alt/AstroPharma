import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Square, Send, RotateCcw } from "lucide-react";

interface RecordingModalProps {
  type: 'voice' | 'video';
  onClose: () => void;
  onSend: (blob: Blob) => void;
}

export function RecordingModal({ type, onClose, onSend }: RecordingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const constraints = type === 'voice' 
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user' } };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Show live preview for video
      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const mimeType = type === 'voice' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(chunks, { type: mimeType });
        setRecordedBlob(blob);
        
        // Create preview URL
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Stop live preview
        if (type === 'video' && videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 30 seconds for video
          if (type === 'video' && newTime >= 30) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone/camera. Please check permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  // Re-record
  const reRecord = () => {
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
    startRecording();
  };

  // Send recording
  const handleSend = () => {
    if (recordedBlob) {
      onSend(recordedBlob);
      cleanup();
      onClose();
    }
  };

  // Cleanup
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Auto-start recording when modal opens
  useEffect(() => {
    startRecording();
    return cleanup;
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {type === 'voice' ? '🎤 Voice Recording' : '📹 Video Recording'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              cleanup();
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Recording Area */}
        <div className="space-y-4">
          {/* Video Preview */}
          {type === 'video' && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoPreviewRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {!isRecording && previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}

          {/* Voice Visualization */}
          {type === 'voice' && (
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-pink-600 rounded-full transition-all ${
                      isRecording ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: isRecording ? `${20 + Math.random() * 40}px` : '20px',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Audio Preview */}
          {type === 'voice' && !isRecording && previewUrl && (
            <audio src={previewUrl} controls className="w-full" />
          )}

          {/* Timer */}
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-pink-600">
              {formatTime(recordingTime)}
            </div>
            {type === 'video' && isRecording && (
              <p className="text-sm text-gray-500 mt-1">Max 30 seconds</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {isRecording ? (
              <Button
                onClick={stopRecording}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            ) : recordedBlob ? (
              <>
                <Button
                  onClick={reRecord}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Re-record
                </Button>
                <Button
                  onClick={handleSend}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
