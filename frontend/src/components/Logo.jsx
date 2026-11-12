export function LogoMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 200" role="img" aria-label="Butaca">
      <path d="M50 104V70a50 50 0 0 1 100 0v34z" fill="#E60026" />
      <path d="M68 104V72a32 32 0 0 1 64 0v32" fill="none" stroke="#0D0D11" strokeWidth="6" />
      <path d="M86 104V74a14 14 0 0 1 28 0v30" fill="none" stroke="#0D0D11" strokeWidth="6" />
      <rect x="46" y="110" width="108" height="34" rx="10" fill="#FFB300" />
      <rect x="20" y="84" width="22" height="62" rx="11" fill="#00E5FF" />
      <rect x="158" y="84" width="22" height="62" rx="11" fill="#00E5FF" />
      <rect x="64" y="150" width="10" height="30" rx="3" fill="#F2F2F6" />
      <rect x="126" y="150" width="10" height="30" rx="3" fill="#F2F2F6" />
    </svg>
  );
}