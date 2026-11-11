import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const base = (props: IconProps) => ({
  width: props.size ?? 24,
  height: props.size ?? 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const BusIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <rect x="4" y="3" width="16" height="15" rx="3" />
    <path d="M4 11h16" />
    <path d="M8 18v2" />
    <path d="M16 18v2" />
    <circle cx="8" cy="15.5" r="1.2" />
    <circle cx="16" cy="15.5" r="1.2" />
    <path d="M7 7h4M14 7h3" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const SeatIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <rect x="6" y="5" width="12" height="9" rx="2" />
    <path d="M6 14v3h12v-3" />
    <path d="M8 5v-.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V5" />
  </svg>
);

export const TicketIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
    <path d="M13 6v12" strokeDasharray="2 2" />
  </svg>
);

export const GpsIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M12 22s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const QrCodeIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
  </svg>
);

export const CalendarIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const SwapIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M7 7h13M16 4l3 3-3 3" />
    <path d="M17 17H4M8 20l-3-3 3-3" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);

export const XIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

export const BellIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M6 8a6 6 0 1 1 12 0c0 4.5 2 5.5 2 7H4c0-1.5 2-2.5 2-7Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const BookmarkIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

export const WalletIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M16 13h3" />
    <path d="M3 10h14" />
  </svg>
);

export const WifiIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M5 11a10 10 0 0 1 14 0" />
    <path d="M8 14a6 6 0 0 1 8 0" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

export const PlugIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M9 2v4M15 2v4M7 6h10v3a5 5 0 0 1-4 5v4h-2v-4a5 5 0 0 1-4-5Z" />
  </svg>
);

export const MapPinIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M12 22s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const PhoneIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M4 5c0-1 1-2 2-2h2l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v2c0 1-1 2-2 2A16 16 0 0 1 4 5z" />
  </svg>
);

export const ShieldCheckIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const PrinterIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </svg>
);

export const BuildingIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <rect x="4" y="3" width="16" height="18" rx="1" />
    <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
    <path d="M10 21v-4h4v4" />
  </svg>
);

export const UsersIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M22 19c0-2.5-2-4.5-4.5-5" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 4 3 5-6" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const BankIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M3 10 12 4l9 6" />
    <path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18M3 22h18" />
  </svg>
);

export const CarIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <path d="M5 17h14l-2-7H7z" />
    <path d="M5 17v2M19 17v2" />
    <circle cx="8" cy="17.5" r="1.2" />
    <circle cx="16" cy="17.5" r="1.2" />
  </svg>
);

export const RouteIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <circle cx="6" cy="5" r="2" />
    <circle cx="18" cy="19" r="2" />
    <path d="M6 7v4a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4" />
  </svg>
);

export const CashIcon = (props: IconProps) => (
  <svg {...base(props)} {...props}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 10v.01M18 14v.01" />
  </svg>
);
