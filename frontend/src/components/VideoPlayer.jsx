import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ streamingUrl, poster }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;

    if (streamingUrl && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 30, // seconds
          maxMaxBufferLength: 60,
        });

        hls.loadSource(streamingUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Ready to play, Intersection Observer handles autoplay
        });

        // Error handling
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("fatal network error encountered, try to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("fatal media error encountered, try to recover");
                hls.recoverMediaError();
                break;
              default:
                // cannot recover
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback for Safari which has native HLS support
        video.src = streamingUrl;
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamingUrl]);

  // Autoplay functionality using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            // Check if user has interacted, otherwise autoplay might be blocked
            videoRef.current.play().catch(error => {
              // Autoplay was prevented (expected in many browsers before interaction)
              console.log("Autoplay prevented:", error);
            });
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 } // Play when 50% visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <div className="aspect-video w-full bg-black rounded-t-xl overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        poster={poster}
        muted // Muted to allow autoplay per browser policies
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;
