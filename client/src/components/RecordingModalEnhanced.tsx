import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Square, Send, RotateCcw, Loader2 } from "lucide-react";

interface RecordingModalProps {
  type: 'voice' | 'video' | 'snapshot';
  onClose: () => void;
  onSend: (blob: Blob) => void;
}

// Get supported MIME type for the browser
function getSupportedMimeType(type: 'voice' | 'video'): string {
  if (type === 'voice') {
    // Try audio formats in order of preference
    const audioTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ];
    
    for (const mimeType of audioTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('Using audio MIME type:', mimeType);
        return mimeType;
      }
    }
    
    // Fallback
    return 'audio/webm';
  } else {
    // Try video formats in order of preference
    const videoTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=avc1,mp4a',
      'video/mp4'
    ];
    
    for (const mimeType of videoTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('Using video MIME type:', mimeType);
        return mimeType;
      }
    }
    
    // Fallback
    return 'video/webm';
  }
}

export function RecordingModalEnhanced({ type, onClose, onSend }: RecordingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actualMimeType, setActualMimeType] = useState<string>('');
  const [snapshotReady, setSnapshotReady] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Capture snapshot from camera
  const captureSnapshot = () => {
    if (!videoPreviewRef.current || !canvasRef.current) return;
    
    const video = videoPreviewRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        setUploadError('Failed to capture snapshot');
        return;
      }
      
      console.log('Snapshot captured. Size:', blob.size);
      setRecordedBlob(blob);
      setActualMimeType('image/png');
      setPreviewUrl(URL.createObjectURL(blob));
      setSnapshotReady(true);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
      }
    }, 'image/png');
  };

  // Start recording or camera preview
  const startRecording = async () => {
    try {
      setUploadError(null);
      const constraints = type === 'voice' 
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user' } };
      
      // For snapshot, only need video
      if (type === 'snapshot') {
        constraints.audio = false;
        constraints.video = { facingMode: 'user' };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Show live preview for video/snapshot
      if ((type === 'video' || type === 'snapshot') && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      
      // For snapshot mode, just show camera preview (no recording)
      if (type === 'snapshot') {
        setIsRecording(false);
        setSnapshotReady(true);
        return;
      }

      // Get supported MIME type for this browser
      const supportedMimeType = getSupportedMimeType(type);
      setActualMimeType(supportedMimeType);
      
      // Create MediaRecorder with supported MIME type
      const options = supportedMimeType ? { mimeType: supportedMimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        // Use the actual MIME type from MediaRecorder (it may differ from requested)
        const finalMimeType = recorder.mimeType || supportedMimeType;
        const blob = new Blob(chunks, { type: finalMimeType });
        
        console.log('Recording stopped. MIME type:', finalMimeType, 'Size:', blob.size);
        
        // Validate blob size (16MB limit)
        const maxSize = 16 * 1024 * 1024;
        if (blob.size > maxSize) {
          setUploadError(`File size exceeds 16MB limit (${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
          return;
        }
        
        // Validate blob is not empty
        if (blob.size === 0) {
          setUploadError('Recording failed: empty file. Please try again.');
          return;
        }
        
        setRecordedBlob(blob);
        setActualMimeType(finalMimeType);
        
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
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      
      // User-friendly error messages
      let friendlyMsg = '';
      if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
        friendlyMsg = type === 'voice' 
          ? '🎤 Microphone access denied. Please enable microphone permissions in your browser settings.'
          : '📹 Camera access denied. Please enable camera permissions in your browser settings.';
      } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('not found')) {
        friendlyMsg = type === 'voice'
          ? '🎤 No microphone found. Please connect a microphone and try again.'
          : '📹 No camera found. Please connect a camera and try again.';
      } else if (errorMsg.includes('NotReadableError')) {
        friendlyMsg = type === 'voice'
          ? '🎤 Microphone is already in use by another application. Please close other apps and try again.'
          : '📹 Camera is already in use by another application. Please close other apps and try again.';
      } else {
        friendlyMsg = `Could not access ${type === 'voice' ? 'microphone' : 'camera'}: ${errorMsg}`;
      }
      
      setUploadError(friendlyMsg);
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
    setUploadProgress(0);
    setUploadError(null);
    startRecording();
  };

  // Send recording with progress tracking
  const handleSend = async () => {
    if (!recordedBlob) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 200);
      
      // Call parent handler
      onSend(recordedBlob);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Wait a moment before closing
      setTimeout(() => {
        cleanup();
        onClose();
      }, 500);
    } catch (error) {
      console.error("Failed to send recording:", error);
      
      // User-friendly upload error messages
      let friendlyMsg = '';
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          friendlyMsg = '🚫 Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          friendlyMsg = '⏱️ Upload timeout. The file may be too large or your connection is slow. Please try again.';
        } else if (error.message.includes('size') || error.message.includes('16MB')) {
          friendlyMsg = '📊 File size exceeds 16MB limit. Please record a shorter clip.';
        } else {
          friendlyMsg = `Upload failed: ${error.message}`;
        }
      } else {
        friendlyMsg = '❌ Upload failed. Please try again or contact support if the problem persists.';
      }
      
      setUploadError(friendlyMsg);
      setIsUploading(false);
      setUploadProgress(0);
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
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {type === 'voice' ? '🎤 Voice Recording' : type === 'video' ? '📹 Video Recording' : '📷 Camera Snapshot'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              cleanup();
              onClose();
            }}
            disabled={isRecording || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Message with Retry */}
        {uploadError && (
          <div className="mb-4 space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <div className="font-semibold mb-1">❌ Upload Failed</div>
              <div>{uploadError}</div>
            </div>
            {recordedBlob && (
              <Button
                onClick={handleSend}
                className="w-full bg-pink-600 hover:bg-pink-700"
                variant="default"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Upload
              </Button>
            )}
          </div>
        )}

        {/* Snapshot Camera Preview */}
        {type === 'snapshot' && snapshotReady && !recordedBlob && (
          <div className="space-y-4">
            {/* Live Camera Preview */}
            <div className="relative">
              <video
                ref={videoPreviewRef}
                className="w-full rounded bg-black"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Capture Button */}
            <Button
              onClick={captureSnapshot}
              className="w-full bg-pink-600 hover:bg-pink-700"
              size="lg"
            >
              📷 Capture Photo
            </Button>
          </div>
        )}

        {/* Recording State */}
        {isRecording && !recordedBlob && type !== 'snapshot' && (
          <div className="space-y-4">
            {/* Video Preview */}
            {type === 'video' && (
              <video
                ref={videoPreviewRef}
                className="w-full rounded bg-black"
                autoPlay
                muted
                playsInline
              />
            )}

            {/* Timer */}
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 font-mono">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {type === 'video' ? 'Max 30 seconds' : 'Recording...'}
              </div>
            </div>

            {/* Stop Button */}
            <Button
              onClick={stopRecording}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          </div>
        )}

        {/* Preview State */}
        {recordedBlob && !isUploading && (
          <div className="space-y-4">
            {/* Audio/Video/Image Preview */}
            {type === 'voice' ? (
              <audio
                src={previewUrl || undefined}
                controls
                className="w-full"
              />
            ) : type === 'snapshot' ? (
              <img
                src={previewUrl || undefined}
                alt="Captured snapshot"
                className="w-full rounded"
              />
            ) : (
              <video
                src={previewUrl || undefined}
                controls
                className="w-full rounded bg-black"
              />
            )}

            {/* File Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <div>Duration: {formatTime(recordingTime)}</div>
              <div>Size: {(recordedBlob.size / 1024 / 1024).toFixed(2)}MB</div>
              {actualMimeType && (
                <div className="text-xs opacity-70">Format: {actualMimeType.split(';')[0]}</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
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
            </div>
          </div>
        )}

        {/* Uploading State */}
        {isUploading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">Uploading...</div>
              <div className="text-2xl font-bold text-pink-600 mt-2">
                {Math.round(uploadProgress)}%
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-pink-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
