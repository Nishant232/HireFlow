import { useId } from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export function HireFlowLogo({ size = 40, className = '' }: LogoProps) {
  const uid = useId()
  const gradId = `hf-grad-${uid.replace(/:/g, '')}`
  const shineId = `hf-shine-${uid.replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
      {/* Shine overlay */}
      <rect width="40" height="20" rx="11" fill={`url(#${shineId})`} />
      {/* H shape — bold and clean */}
      <path
        d="M11 10v20M11 20h18M29 10v20"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
