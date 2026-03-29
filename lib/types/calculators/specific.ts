import { UrgencyLevel } from './base';

/**
 * Настройки срочности
 */
export interface UrgencySettings {
  /** Уровень срочности */
  level: UrgencyLevel;
  /** Текущая наценка (₽) */
  surcharge: number;
  /** Базовая наценка за срочное выполнение (₽) */
  urgentSurcharge: number;
}

/**
 * Типы финишного покрытия UV DTF
 */
export type UVDTFFinishType = 'gloss' | 'matte' | 'soft-touch' | 'textured';

/**
 * Типы поверхностей UV DTF
 */
export const UV_DTF_SURFACE_TYPES = [
  'glass',
  'metal',
  'plastic',
  'acrylic',
  'ceramic',
  'wood',
] as const;

export type UVDTFSurfaceType = typeof UV_DTF_SURFACE_TYPES[number];

/**
 * Типы термотрансферных плёнок
 */
export type ThermotransferFilmType =
  | 'flex-pu'
  | 'flex-pvc'
  | 'glitter'
  | 'flock'
  | 'holographic'
  | 'metallic'
  | '3d-puff'
  | 'glow'
  | 'reflective'
  | 'nylon'
  | 'stretch';

/**
 * Конфигурация типов термотрансферных плёнок
 */
export const THERMOTRANSFER_FILM_TYPES: Record<ThermotransferFilmType, { label: string; priceMultiplier: number }> = {
  'flex-pu': { label: 'Flex PU (стандарт)', priceMultiplier: 1.0 },
  'flex-pvc': { label: 'Flex PVC', priceMultiplier: 0.8 },
  glitter: { label: 'Glitter (блёстки)', priceMultiplier: 2.0 },
  flock: { label: 'Flock (бархат)', priceMultiplier: 2.2 },
  holographic: { label: 'Holographic', priceMultiplier: 1.8 },
  metallic: { label: 'Metallic', priceMultiplier: 1.6 },
  '3d-puff': { label: '3D / Puff', priceMultiplier: 2.5 },
  glow: { label: 'Glow-in-dark', priceMultiplier: 2.3 },
  reflective: { label: 'Reflective', priceMultiplier: 2.8 },
  nylon: { label: 'Nylon', priceMultiplier: 1.4 },
  stretch: { label: 'Stretch', priceMultiplier: 1.3 },
};

/**
 * Типы предобработки DTG
 */
export const DTG_PRETREATMENT_TYPES = [
  { value: 'none', label: 'Без предобработки' },
  { value: 'light', label: 'Для светлых тканей' },
  { value: 'dark', label: 'Для тёмных тканей' },
] as const;

export type DTGPretreatmentType = typeof DTG_PRETREATMENT_TYPES[number]['value'];

/**
 * Разрешение печати DTG
 */
export const DTG_RESOLUTION_OPTIONS = [
  { value: 720, label: '720 dpi (стандарт)' },
  { value: 1440, label: '1440 dpi (высокое)' },
] as const;

export type DTGPrintResolution = typeof DTG_RESOLUTION_OPTIONS[number]['value'];

/**
 * Типы чернил DTG
 */
export const DTG_INK_TYPES = [
  { value: 'pigment', label: 'Пигментные' },
  { value: 'reactive', label: 'Реактивные' },
] as const;

export type DTGInkType = typeof DTG_INK_TYPES[number]['value'];

/**
 * Цвет изделия (для DTG)
 */
export const GARMENT_COLOR_OPTIONS = [
  { value: 'light', label: 'Светлое' },
  { value: 'dark', label: 'Тёмное' },
] as const;

export type GarmentColor = typeof GARMENT_COLOR_OPTIONS[number]['value'];

/**
 * Типы плёнки DTF
 */
export const DTF_FILM_TYPES = [
  { value: 'matte', label: 'Матовая' },
  { value: 'glossy', label: 'Глянцевая' },
  { value: 'glitter', label: 'С глиттером' },
] as const;

/**
 * Типы плёнки UV DTF
 */
export const UV_DTF_FILM_TYPES = [
  { value: 'a_film', label: 'A-плёнка (клеевая)' },
  { value: 'b_film', label: 'B-плёнка (ламинат)' },
  { value: 'ab_film', label: 'AB-плёнка (комплект)' },
] as const;

/**
 * Типы финиша UV DTF
 */
export const UV_DTF_FINISH_TYPES = [
  { value: 'matte', label: 'Матовый' },
  { value: 'glossy', label: 'Глянцевый' },
  { value: 'soft_touch', label: 'Soft-touch' },
  { value: 'holographic', label: 'Голографический' },
] as const;

/**
 * Опции ширины рулона
 */
export const ROLL_WIDTH_OPTIONS = [
  { value: 300, label: '30 см' },
  { value: 330, label: '33 см' },
  { value: 450, label: '45 см' },
  { value: 600, label: '60 см' },
  { value: 1200, label: '120 см' },
] as const;

/**
 * Типы ткани для вышивки
 */
export const EMBROIDERY_FABRIC_TYPES = [
  { value: 'cotton', label: 'Хлопок' },
  { value: 'polyester', label: 'Полиэстер' },
  { value: 'denim', label: 'Джинса' },
  { value: 'leather', label: 'Кожа' },
  { value: 'knit', label: 'Трикотаж' },
] as const;

/**
 * Типы стабилизатора
 */
export const STABILIZER_TYPES = [
  { value: 'tearaway', label: 'Отрывной' },
  { value: 'cutaway', label: 'Отрезной' },
  { value: 'washaway', label: 'Водорастворимый' },
  { value: 'none', label: 'Без стабилизатора' },
] as const;

/**
 * Количество голов вышивальной машины
 */
export const MACHINE_HEAD_OPTIONS = [
  { value: 1, label: '1 голова' },
  { value: 2, label: '2 головы' },
  { value: 4, label: '4 головы' },
  { value: 6, label: '6 голов' },
  { value: 8, label: '8 голов' },
  { value: 12, label: '12 голов' },
] as const;

/**
 * Типы краски для шелкографии
 */
export const SILKSCREEN_INK_TYPES = [
  { value: 'plastisol', label: 'Пластизоль' },
  { value: 'water_based', label: 'Водная' },
  { value: 'discharge', label: 'Вытравная' },
  { value: 'specialty', label: 'Специальная' },
] as const;

/**
 * Размер сетки (mesh)
 */
export const MESH_SIZE_OPTIONS = [
  { value: 110, label: '110 mesh' },
  { value: 156, label: '156 mesh' },
  { value: 200, label: '200 mesh' },
  { value: 230, label: '230 mesh' },
  { value: 305, label: '305 mesh' },
] as const;

/**
 * Типы подложки для шелкографии
 */
export const SUBSTRATE_TYPES = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
] as const;

/**
 * Типы носителя для сублимации
 */
export const SUBLIMATION_SUBSTRATE_TYPES = [
  { value: 'polyester', label: 'Полиэстер' },
  { value: 'coated', label: 'С покрытием' },
  { value: 'hardsubstrate', label: 'Твёрдая подложка' },
] as const;

/**
 * Типы бумаги для сублимации
 */
export const SUBLIMATION_PAPER_TYPES = [
  { value: 'standard', label: 'Стандартная' },
  { value: 'premium', label: 'Премиум' },
  { value: 'tacky', label: 'Липкая' },
] as const;

/**
 * Типы термотрансфера
 */
export const THERMOTRANSFER_TYPES = [
  { value: 'vinyl', label: 'Винил' },
  { value: 'flex', label: 'Флекс' },
  { value: 'flock', label: 'Флок' },
  { value: 'glitter', label: 'Глиттер' },
  { value: 'holographic', label: 'Голографический' },
  { value: 'reflective', label: 'Светоотражающий' },
] as const;
