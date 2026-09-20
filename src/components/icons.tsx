import type { SVGProps } from 'react';

/**
 * Inline SVG icon set (24×24 grid, 2px strokes). Decorative by default
 * (aria-hidden) – pass `title` to make an icon meaningful.
 */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Svg({ title, children, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ? `icon ${className}` : 'icon'}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z" />
  </Svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <Svg {...p} className={`icon-fill ${p.className ?? ''}`.trim()}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3.3 4.4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.4 1 2.9.8 3.5.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.1-.7.2l-1 1.2c-.1.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.5l-1-2.1c-.2-.5-.4-.4-.6-.4h-.5Z" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const NavigationIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3 11 19-9-9 19-2-8-8-2Z" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 2 21h20L12 3Z" />
    <path d="M12 10v4" />
    <path d="M12 18h.01" />
  </Svg>
);

export const InfoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </Svg>
);

export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const StoreIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9 5 3h14l2 6" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M5 12v9h14v-9" />
    <path d="M10 21v-6h4v6" />
  </Svg>
);

export const TruckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h11v10H3z" />
    <path d="M14 9h4l3 3v4h-7" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Svg>
);

export const UsersIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    <path d="M17.5 14a6.5 6.5 0 0 1 4 6" />
  </Svg>
);

export const StarIcon = (p: IconProps) => (
  <Svg {...p} className={`icon-fill ${p.className ?? ''}`.trim()}>
    <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8L12 2.5Z" />
  </Svg>
);

export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M9 7V4h6v3" />
  </Svg>
);

/* Product category icons */
export const CementIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 8h12l1 12H5L6 8Z" />
    <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
    <path d="M6 13h12" />
  </Svg>
);

export const BricksIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="8" height="5" rx="0.5" />
    <rect x="13" y="4" width="8" height="5" rx="0.5" />
    <rect x="3" y="15" width="8" height="5" rx="0.5" />
    <rect x="13" y="15" width="8" height="5" rx="0.5" />
    <rect x="8" y="9.5" width="8" height="5" rx="0.5" />
  </Svg>
);

export const SteelIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20 20 4" />
    <path d="M4 14 14 4" />
    <path d="M10 20 20 10" />
    <path d="m6 18 1-1" />
    <path d="m9 15 1-1" />
    <path d="m12 12 1-1" />
    <path d="m15 9 1-1" />
  </Svg>
);

export const HardwareIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 3.5a4.5 4.5 0 0 0-5.8 5.8L3 15v6h6l5.7-5.7a4.5 4.5 0 0 0 5.8-5.8l-3 3-2.5-2.5 3-3Z" />
  </Svg>
);

export const MaterialsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 16 9 5 9-5" />
  </Svg>
);

export const categoryIcons = {
  cement: CementIcon,
  bricks: BricksIcon,
  steel: SteelIcon,
  hardware: HardwareIcon,
  materials: MaterialsIcon,
} as const;
