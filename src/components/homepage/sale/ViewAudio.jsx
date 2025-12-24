import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAudioPost } from "../../../../Hooks/audioPosts/useCreateAudio";
import useProfile from "../../../../Hooks/useProfile";
import AudioPost from "../feed/AudioPost";
import BottomNav from "../BottomNav";
import Spinner from "../../Spinner";

const ViewAudio = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { data: post, loading, error } = useGetAudioPost(postId);
    const { profile } = useProfile();

    const [isActive, setIsActive] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showTapIcon, setShowTapIcon] = useState(false);
    const audioRef = useRef(null);

    // Auto-play when loaded
    useEffect(() => {
        if (post && audioRef.current && !isActive) {
            // Attempt auto-play
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsActive(true);
                }).catch(error => {
                    console.log("Auto-play prevented", error);
                });
            }
        }
    }, [post]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isActive) {
                audioRef.current.pause();
                setIsActive(false);
                setShowTapIcon(true);
                setTimeout(() => setShowTapIcon(false), 500);
            } else {
                audioRef.current.play();
                setIsActive(true);
                setShowTapIcon(true);
                setTimeout(() => setShowTapIcon(false), 500);
            }
        }
    };

    const handleTimeUpdate = (e) => {
        setCurrentTime(e.target.currentTime);
    };

    const handleLoadedMetadata = (e) => {
        setDuration(e.target.duration);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Spinner />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <div className="text-white text-xl mb-4">{error || "Audio not found"}</div>
                <button
                    className="bg-[#2D8C72] text-white px-4 py-2 rounded-lg"
                    onClick={() => navigate("/")}
                >
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black relative">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            <AudioPost
                post={post}
                profile={profile}
                isActive={isActive}
                onTap={togglePlay}
                currentTime={currentTime}
                duration={duration}
                setAudioRef={(el) => audioRef.current = el}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                showTapIcon={showTapIcon}
                tapIconType={isActive ? "play" : "pause"} // Logic inverted: if active, action is pause, but icon usually shows state? AudioPost seems to use it for feedback.
            // If AudioPost uses tapIconType to show what JUST happened or current state? 
            // AudioPlayerControls: {tapIconType === "play" ? FaPlay : FaPause}
            // Usually tap icon shows what state we changed TO.
            // If I tap to pause, I want to see Pause icon momentarily.
            // If I tap to play, I want to see Play icon momentarily.
            />
            <BottomNav />
        </div>
    );
};

export default ViewAudio;
