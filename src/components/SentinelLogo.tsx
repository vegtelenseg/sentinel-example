type Props = {
  className?: string;
};

export default function SentinelLogo({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M24 7L39 14v11c0 9.5-6.5 16-15 19-8.5-3-15-9.5-15-19V14L24 7z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="27" r="2.5" fill="currentColor" />
    </svg>
  );
}
