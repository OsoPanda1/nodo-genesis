/* ===================================================================== */
/* Tipos del catálogo RDM. Contratos técnicos desacoplados de los datos. */
/* ===================================================================== */

export type RDMId = string;
export type RDMImagePath = `/${string}`;

export type RDMGastronomyType =
  | 'paste'
  | 'restaurante'
  | 'panaderia'
  | 'heladeria'
  | 'cafe';

export type RDMGalleryType = 'imagen' | 'video';

export type RDMIcon =
  | 'pickaxe'
  | 'paste'
  | 'mountain'
  | 'scroll'
  | 'globe'
  | 'star';

export type RDMTodoIcon = RDMIcon | 'camera' | 'music';

export type RDMBadgeRarity =
  | 'Común'
  | 'Raro'
  | 'Épico'
  | 'Legendario';

export type RDMRecordStatus =
  | 'active'
  | 'draft'
  | 'archived';

export interface RDMArtist {
  readonly id: RDMId;
  readonly name: string;
  readonly discipline: string;
  readonly location: string;
  readonly bio: string;
  readonly image: RDMImagePath;
  readonly rating: number;
}

export interface RDMGastronomy {
  readonly id: RDMId;
  readonly name: string;
  readonly type: RDMGastronomyType;
  readonly specialty: string;
  readonly priceRange: string;
  readonly location: string;
  readonly image: RDMImagePath;
  readonly rating: number;
  readonly description: string;
}

export interface RDMTrack {
  readonly id: RDMId;
  readonly title: string;
  readonly artist: string;
  readonly genre: string;
  readonly duration: string;
  readonly image: RDMImagePath;
}

export interface RDMPodcastEpisode {
  readonly id: RDMId;
  readonly title: string;
  readonly subtitle: string;
  readonly duration: string;
  readonly date: string;
  readonly image: RDMImagePath;
  readonly description: string;
  readonly tags: readonly string[];
}

export interface RDMBadge {
  readonly id: RDMId;
  readonly name: string;
  readonly icon: RDMIcon;
  readonly description: string;
  readonly rarity: RDMBadgeRarity;
}

export interface RDMChallenge {
  readonly id: RDMId;
  readonly title: string;
  readonly points: number;
  readonly description: string;
  readonly category: string;
  readonly progress: number;
}

export interface RDMLegend {
  readonly id: RDMId;
  readonly title: string;
  readonly category: string;
  readonly image: RDMImagePath;
  readonly story: string;
  readonly moral: string;
}

export interface RDMForumThread {
  readonly id: RDMId;
  readonly title: string;
  readonly author: string;
  readonly role: string;
  readonly category: string;
  readonly replies: number;
  readonly likes: number;
  readonly time: string;
  readonly excerpt: string;
  readonly pinned?: boolean;
}

export interface RDMHonoree {
  readonly id: RDMId;
  readonly name: string;
  readonly title: string;
  readonly achievement: string;
  readonly image: RDMImagePath;
  readonly year: string;
}

export interface RDMGalleryItem {
  readonly id: RDMId;
  readonly image: RDMImagePath;
  readonly caption: string;
  readonly author: string;
  readonly type: RDMGalleryType;
  readonly category: string;
  readonly likes: number;
}

export interface RDMTodoItem {
  readonly id: RDMId;
  readonly title: string;
  readonly icon: RDMTodoIcon;
}

export interface RDMDichoMinero {
  readonly id: RDMId;
  readonly text: string;
  readonly meaning: string;
}

export interface RDMTeamMember {
  readonly id: RDMId;
  readonly name: string;
  readonly role: string;
  readonly alias: string;
  readonly bio: string;
  readonly image: RDMImagePath;
}

export interface RDMValue {
  readonly id: RDMId;
  readonly title: string;
  readonly description: string;
}
