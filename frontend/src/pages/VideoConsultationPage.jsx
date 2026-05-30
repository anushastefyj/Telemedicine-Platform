import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, AlertCircle } from 'lucide-react';
import { useVideo } from '../context/VideoContext';

const VideoConsultationPage = () => {
  const { videoCallId } = useParams();
  const navigate = useNavigate();
  
  const {
    localStream,
    remoteStream,
    startCall,
    endCall,
    toggleCamera,
    toggleMic,
    errorMessage,
  } = useVideo();

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [duration, setDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize WebRTC Call
  useEffect(() => {
    startCall(videoCallId);
    return () => {
      endCall(videoCallId);
    };
  }, [videoCallId]);

  // Set Local Video Stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set Remote Video Stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Timer for duration of call
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCameraToggle = () => {
    const newState = !cameraOn;
    setCameraOn(newState);
    toggleCamera(newState);
  };

  const handleMicToggle = () => {
    const newState = !micOn;
    setMicOn(newState);
    toggleMic(newState);
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this consultation call?')) {
      endCall(videoCallId);
      navigate(-1); // Navigate back to appointment details
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800">
        <div>
          <h2 className="font-bold text-sm tracking-wide">CareSync HD Consult</h2>
          <p className="text-[10px] text-teal-400">Room: {videoCallId}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-xs bg-slate-800 px-3 py-1 rounded-full font-mono">
            Duration: {formatDuration(duration)}
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HIPAA ENCRYPTED LINK</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl flex items-center space-x-2 text-rose-400 text-xs my-2 max-w-lg mx-auto">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Video Section */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 py-6 max-w-6xl mx-auto w-full items-center">
        {/* Remote Counterpart Screen */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl h-[450px] overflow-hidden flex items-center justify-center shadow-lg">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center space-y-2">
              <div className="h-16 w-16 bg-teal-500 rounded-full flex items-center justify-center font-bold text-2xl text-white mx-auto animate-pulse">
                C
              </div>
              <p className="text-xs font-semibold text-slate-400">Waiting for other participant to join...</p>
            </div>
          )}
          <span className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-xl text-xs">
            Consultant Partner
          </span>
        </div>

        {/* Local Stream Screen */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl h-[450px] overflow-hidden flex items-center justify-center shadow-lg">
          {cameraOn && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="text-center">
              <VideoOff className="h-12 w-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Camera is Off</p>
            </div>
          )}
          <span className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-xl text-xs">
            You (Local Screen)
          </span>
        </div>
      </div>

      {/* Controller Buttons */}
      <div className="flex items-center justify-center space-x-4 py-4 border-t border-slate-800">
        <button
          onClick={handleCameraToggle}
          className={`p-3 rounded-full border transition ${
            cameraOn
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
              : 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
          }`}
          title={cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          onClick={handleMicToggle}
          className={`p-3 rounded-full border transition ${
            micOn
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
              : 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
          }`}
          title={micOn ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition transform hover:scale-105"
          title="End Consultation"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
};

export default VideoConsultationPage;
