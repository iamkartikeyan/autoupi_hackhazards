import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  textClassName?: string;
  size?: number;
  showText?: boolean;
  priority?: boolean;
  grayscale?: boolean;
}

export default function BrandLogo({
  className = '',
  textClassName = '',
  size = 36,
  showText = true,
  priority = false,
  grayscale = false,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className} ${grayscale ? 'grayscale opacity-50' : ''}`.trim()}>
      <Image
        src="/autoupi-logo.jpeg"
        alt="AutoUPI logo"
        width={size}
        height={size}
        priority={priority}
        className="rounded-lg object-cover"
      />
      {showText && <span className={textClassName}>AutoUPI</span>}
    </div>
  );
}
