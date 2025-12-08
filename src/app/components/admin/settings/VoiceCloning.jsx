import { Mic, StopCircle, Play, Pause, Edit, Save, X, Info, Trash2, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ConfirmDeleteDialog from '@/app/components/ConfirmDeleteDialog';

export default function VoiceCloning({
  isLoadingVoice,
  isEditingVoice,
  isSavingVoice,
  isDeletingVoice,
  currentVoice,
  onEdit,
  onSave,
  onCancel,
  onDelete
}) {
  const [voiceName, setVoiceName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const sampleScript = "Hello, this is a sample recording for voice cloning. The more natural and clear your recording is, the better the AI will be able to clone your voice. Please speak naturally and clearly, with good microphone quality for the best results.";

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!audioBlob) {
      alert('Please record your voice first');
      return;
    }

    if (recordingTime < 10) {
      alert('Recording must be at least 10 seconds long');
      return;
    }

    if (!voiceName.trim()) {
      alert('Please enter a voice name');
      return;
    }

    // Convert blob to file
    const audioFile = new File([audioBlob], `voice-recording-${Date.now()}.wav`, { type: 'audio/wav' });
    onSave(audioFile, voiceName);
  };

  const handleCancel = () => {
    deleteRecording();
    setVoiceName('');
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col lg:grid lg:grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-8 p-4 sm:p-6">
        {/* Left Sidebar */}
        <div className="xl:col-span-1 border-b lg:border-b-0 pb-4 lg:pb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Voice Cloning</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Clone your custom voice using ElevenLabs</p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-sm sm:text-md font-medium text-gray-900">Custom Voice</h3>
            {!isEditingVoice && currentVoice && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:py-1 bg-blue-50 text-blue-600 hover:text-blue-700 text-sm font-medium rounded-md w-full sm:w-auto"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>

          {isLoadingVoice ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading voice information...</p>
            </div>
          ) : isEditingVoice ? (
            /* Edit Mode */
            <>
              {/* Information Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Voice Cloning Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Record at least 10 seconds of clear audio</li>
                      <li>Use a good quality microphone</li>
                      <li>Better recording quality = Better voice clone</li>
                      <li>Speak naturally and clearly in a quiet environment</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="font-medium mb-1">Supported Audio Formats:</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-600">
                        <span>• MP3 - Best for web uploads</span>
                        <span>• WAV - High quality</span>
                        <span>• M4A - Apple/iPhone recordings</span>
                        <span>• FLAC - Lossless compression</span>
                        <span>• OGG - Open format</span>
                        <span>• WebM - Browser recording</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Script */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mic size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Script (Optional)</h4>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      "{sampleScript}"
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      You can record yourself saying this or any other text. The more natural your recording, the better the clone!
                    </p>
                  </div>
                </div>
              </div>

              {/* Voice Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g., Professional Voice, CEO Voice"
                  className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Voice Recording */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Your Voice <span className="text-red-500">*</span>
                </label>
                
                {!audioBlob ? (
                  /* Recording Interface */
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 p-6">
                      <Mic className={`w-16 h-16 mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                      
                      {isRecording && (
                        <div className="text-center mb-4">
                          <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
                            {formatTime(recordingTime)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {isPaused ? 'Paused' : 'Recording...'}
                          </p>
                          {recordingTime < 10 && (
                            <p className="text-xs text-orange-600 mt-1">
                              Minimum 10 seconds required ({10 - recordingTime}s remaining)
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        {!isRecording ? (
                          <button
                            onClick={startRecording}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Mic size={20} />
                            Start Recording
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={pauseRecording}
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                              {isPaused ? <Play size={20} /> : <Pause size={20} />}
                              {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                              onClick={stopRecording}
                              disabled={recordingTime < 10}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              <StopCircle size={20} />
                              Stop
                            </button>
                          </>
                        )}
                      </div>
                      
                      {!isRecording && (
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          Click "Start Recording" and speak clearly into your microphone
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Recorded Audio Preview */
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mic size={20} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Recording Complete</p>
                          <p className="text-xs text-green-700">Duration: {formatTime(recordingTime)}</p>
                        </div>
                      </div>
                      <button
                        onClick={deleteRecording}
                        className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                    
                    {/* Audio Player */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-md">
                      <button
                        onClick={togglePlayback}
                        className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <audio
                        ref={audioPlayerRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="flex-1"
                        controls
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={isSavingVoice}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium w-full sm:w-auto"
                >
                  {isSavingVoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cloning Voice...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Clone Voice
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSavingVoice}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium w-full sm:w-auto"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </>
          ) : currentVoice ? (
            /* View Mode - Voice Exists */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Voice Name</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{currentVoice.voiceName}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Voice ID</p>
                  <p className="text-sm sm:text-base font-mono text-gray-600">{currentVoice.voiceId}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentVoice.language && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Language</p>
                    <p className="text-sm sm:text-base text-gray-900 uppercase">{currentVoice.language}</p>
                  </div>
                )}
                {/* {currentVoice.businessId && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Business ID</p>
                    <p className="text-sm sm:text-base font-mono text-gray-600">{currentVoice.businessId}</p>
                  </div>
                )} */}
              </div>
              
              {/* Delete Button */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeletingVoice}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isDeletingVoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Custom Voice
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode - No Voice */
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Mic className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-4">No custom voice configured</p>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                <Mic size={16} />
                Record Voice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
        isDeleting={isDeletingVoice}
        title="Delete Custom Voice"
        message="Are you sure you want to delete this custom voice? This will revert to the default voice and cannot be undone."
      />
    </div>
  );
}
