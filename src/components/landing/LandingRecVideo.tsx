import { useEffect, useRef } from 'react';

const REC_VIDEO_SRC = new URL('../../../assets/rec.mp4', import.meta.url).href;
const PLAYBACK_RATE = 1.5;

export function LandingRecVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applyRate = () => {
      video.playbackRate = PLAYBACK_RATE;
    };

    applyRate();
    video.addEventListener('loadedmetadata', applyRate);
    video.addEventListener('play', applyRate);

    return () => {
      video.removeEventListener('loadedmetadata', applyRate);
      video.removeEventListener('play', applyRate);
    };
  }, []);

  return (
    <div className="landing-rec-video-breakout mt-10 md:mt-12">
      <div className="landing-rec-video-frame">
        <video
          ref={videoRef}
          className="landing-rec-video-screen"
          src={REC_VIDEO_SRC}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-label="IlluminAIte platform demonstration"
        />
      </div>
    </div>
  );
}
