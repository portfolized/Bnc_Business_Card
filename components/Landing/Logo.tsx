import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { img: 32, text: "text-base" },
  md: { img: 40, text: "text-lg" },
  lg: { img: 48, text: "text-xl" },
};

export default function Logo({ showText = true, size = "md" }: LogoProps) {
  const { img, text } = sizeMap[size];

  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <Image
        src="/logo.png"
        alt="BNC Business Card Logo"
        width={img}
        height={img}
        className="shrink-0 rounded-full"
        style={{ width: img, height: img }}
        priority
      />
      {showText && (
        <span className={`${text} font-bold text-foreground tracking-tight`}>
          BNC Business Card
        </span>
      )}
    </Link>
  );
}
