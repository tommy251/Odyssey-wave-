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
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.play().catch(() => {});
  }, [chosen]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        key={chosen}
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
      )}
    </div>
  );
}