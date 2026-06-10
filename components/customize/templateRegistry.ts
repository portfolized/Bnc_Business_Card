import DarkWoodGoldTemplate from "./templates/DarkWoodGoldTemplate";
import BlueGeometricTemplate from "./templates/BlueGeometricTemplate";
import MinimalSilverTemplate from "./templates/MinimalSilverTemplate";
import MarbleLuxuryTemplate from "./templates/MarbleLuxuryTemplate";
import ForestNatureTemplate from "./templates/ForestNatureTemplate";
import UrbanCorporateTemplate from "./templates/UrbanCorporateTemplate";
import type { CardTemplateDefinition } from "./types";

const pexels = (id: number, w = 1260) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const CARD_TEMPLATES: CardTemplateDefinition[] = [
  {
    id: "dark-wood-gold",
    name: "Dark Wood Gold",
    tags: ["luxury", "gold", "dark", "wood", "premium"],
    backgroundImage: pexels(172277),
    thumbnailImage: pexels(172277, 400),
    Component: DarkWoodGoldTemplate,
  },
  {
    id: "blue-geometric",
    name: "Blue Geometric",
    tags: ["blue", "modern", "geometric", "corporate"],
    backgroundImage: pexels(373543),
    thumbnailImage: pexels(373543, 400),
    Component: BlueGeometricTemplate,
  },
  {
    id: "minimal-silver",
    name: "Minimal Silver",
    tags: ["silver", "minimal", "clean", "simple"],
    backgroundImage: pexels(1103970),
    thumbnailImage: pexels(1103970, 400),
    Component: MinimalSilverTemplate,
  },
  {
    id: "marble-luxury",
    name: "Marble Luxury",
    tags: ["marble", "luxury", "white", "elegant"],
    backgroundImage: pexels(1571460),
    thumbnailImage: pexels(1571460, 400),
    Component: MarbleLuxuryTemplate,
  },
  {
    id: "forest-nature",
    name: "Forest Nature",
    tags: ["green", "nature", "eco", "organic"],
    backgroundImage: pexels(1072179),
    thumbnailImage: pexels(1072179, 400),
    Component: ForestNatureTemplate,
  },
  {
    id: "urban-corporate",
    name: "Urban Corporate",
    tags: ["city", "corporate", "night", "professional"],
    backgroundImage: pexels(325185),
    thumbnailImage: pexels(325185, 400),
    Component: UrbanCorporateTemplate,
  },
];
