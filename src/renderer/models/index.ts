export type CreateSpaceData = {
  title: string;
  description?: string;
  attachment?: any;
  emoji?: string;
  spaceType: 'Public' | 'Exclusive';
  spaceBadgeId?: number;
  condition?: any;
};
