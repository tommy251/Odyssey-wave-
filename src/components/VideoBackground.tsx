import { useEffect, useRef } from "react";

interface Props {
  src?: string;
  overlay?: boolean;
}

const VIDEOS = ["/videos/wave1.mp4", "/videos/wave2.mp4"];

export function VideoBackground({ src, overlay = true }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const chosen = src ?? VIDEOS[Math.floor(Math.random() * VIDEOS.length)];

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        src={chosen}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
      )}
    </div>
  );
}
