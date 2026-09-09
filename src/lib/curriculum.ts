// Central Kurdish (Sorani) EdClub Curriculum Configuration
import { levels, LevelItem, Milestone } from "@/data/levels";

export type { Milestone, LevelItem };
export type LevelConfig = LevelItem;

export interface UnitConfig {
  id: number;
  title: string;
  kurdishTitle: string;
  description: string;
  color: string;
  levels: LevelConfig[];
}

export const CURRICULUM_UNITS: UnitConfig[] = [
  {
    id: 1,
    title: "ئاستەکانی کلیلی بنەڕەتی",
    kurdishTitle: "ئاستەکانی کلیلی بنەڕەتی",
    description: "فێربوونی پیتەکانی ناوەڕاست بە پەنجەی ئاماژە و ناونیشان",
    color: "#58cc02",
    levels: levels.filter((l) => l.unitId === 1),
  },
  {
    id: 2,
    title: "ڕیزی سەرەوە و دەنگدارەکان",
    kurdishTitle: "ڕیزی سەرەوە و دەنگدارەکان",
    description: "شارەزابوون لە دەنگدارەکانی (ە، و، ۆ) و پیتی تایبەتی پ",
    color: "#0ea5e9",
    levels: levels.filter((l) => l.unitId === 2),
  },
  {
    id: 3,
    title: "ڕیزی خوارەوە و ڕستەی تەواو",
    kurdishTitle: "ڕیزی خوارەوە و ڕستەی تەواو",
    description: "کۆتاییهێنان بە تەواوی تەختەکلیل بە پیتەکانی (ڤ، ژ، ب، ن، م، ی)",
    color: "#f59e0b",
    levels: levels.filter((l) => l.unitId === 3),
  },
  {
    id: 4,
    title: "پیتە لاوەکییەکان بە کلیلی Shift",
    kurdishTitle: "پیتە لاوەکییەکان بە کلیلی Shift",
    description: "شارەزابوون لە پیتە گرنگەکانی ش، ڵ، ڕ، ێ، چ بە کلیلی Shift",
    color: "#8b5cf6",
    levels: levels.filter((l) => l.unitId === 4),
  },
];

export const ALL_LEVELS: LevelConfig[] = levels;
