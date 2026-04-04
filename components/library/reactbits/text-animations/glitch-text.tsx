"use client";

interface GlitchTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const GlitchText = ({
  text,
  className = "",
  speed = 1,
}: GlitchTextProps) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute left-0 top-0 z-20 animate-rb-glitch-1 text-[#ff00c1] mix-blend-multiply"
        style={{ animationDuration: `${2 / speed}s` }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute left-0 top-0 z-30 animate-rb-glitch-2 text-[#00fff9] mix-blend-multiply"
        style={{ animationDuration: `${3 / speed}s` }}
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
};
