const FACES = {
  happy: (
    <>
      <circle cx="23" cy="27" r="3" fill="currentColor" stroke="none" />
      <circle cx="41" cy="27" r="3" fill="currentColor" stroke="none" />
      <path d="M19 38 Q32 53 45 38" />
    </>
  ),
  sad: (
    <>
      <circle cx="23" cy="29" r="3" fill="currentColor" stroke="none" />
      <circle cx="41" cy="29" r="3" fill="currentColor" stroke="none" />
      <path d="M16 22 L27 18 M48 22 L37 18" />
      <path d="M22 47 Q32 38 42 47" />
    </>
  ),
  angry: (
    <>
      <circle cx="23" cy="29" r="3" fill="currentColor" stroke="none" />
      <circle cx="41" cy="29" r="3" fill="currentColor" stroke="none" />
      <path d="M16 18 L27 24 M48 18 L37 24" />
      <path d="M23 46 Q32 40 41 46" />
    </>
  ),
  fearful: (
    <>
      <circle cx="23" cy="28" r="4.5" />
      <circle cx="41" cy="28" r="4.5" />
      <circle cx="23" cy="28" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="41" cy="28" r="1.5" fill="currentColor" stroke="none" />
      <path d="M16 18 L27 14 M48 18 L37 14" />
      <ellipse cx="32" cy="46" rx="5" ry="6" />
    </>
  ),
  surprised: (
    <>
      <circle cx="23" cy="28" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="41" cy="28" r="3.5" fill="currentColor" stroke="none" />
      <path d="M16 19 Q22 13 28 19 M36 19 Q42 13 48 19" />
      <ellipse cx="32" cy="45" rx="6" ry="8" />
    </>
  ),
  disgusted: (
    <>
      <path d="M18 27 H27 M37 27 H46" />
      <path d="M20 43 Q26 37 32 43 T44 43" />
    </>
  ),
  neutral: (
    <>
      <circle cx="23" cy="27" r="3" fill="currentColor" stroke="none" />
      <circle cx="41" cy="27" r="3" fill="currentColor" stroke="none" />
      <path d="M23 43 H41" />
    </>
  ),
};

export default function MoodFace({ emotion, className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="27" />
      {FACES[emotion]}
    </svg>
  );
}