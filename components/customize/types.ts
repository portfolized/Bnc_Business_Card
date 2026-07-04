import type { ComponentType } from "react";
import type { CardType, VipTier } from "@/lib/currency";

export type CardSide = "front" | "back";

export type PersonalInfo = {
  fullName: string;
  role: string;
  email: string;
  website: string;
  phone: string;
  address: string;
};

export type CardTemplateProps = {
  info: PersonalInfo;
  side: CardSide;
  frontLogoUrl?: string | null;
  backLogoUrl?: string | null;
  backgroundImage: string;
  /** Whether to render the QR code on the card back. Defaults to true. */
  showQr?: boolean;
};

export type CardTemplateComponent = ComponentType<CardTemplateProps>;

export type CardTemplateDefinition = {
  id: string;
  name: string;
  tags: string[];
  backgroundImage: string;
  thumbnailImage: string;
  Component: CardTemplateComponent;
};

/** localStorage key holding a card designed on the landing page, pending checkout. */
export const PENDING_CARD_KEY = "bnc:pending-card";

export type PendingCard = {
  info: PersonalInfo;
  bio?: string;
  cardTemplate: string;
  cardType?: CardType;
  cardTier?: VipTier;
  quantity?: number;
  qrEnabled?: boolean;
  slug?: string;
  affiliateCode?: string;
};

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  fullName: "Full Name",
  role: "CEO, BNC",
  email: "example@example.com",
  website: "https://samratsapkota.com.np",
  phone: "+977 9800000001",
  address: "Enter Your Address",
};
