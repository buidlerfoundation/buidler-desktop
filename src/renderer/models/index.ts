export type CreateSpaceData = {
  spaceId?: string;
  name: string;
  description?: string;
  attachment?: any;
  emoji?: string;
  url?: string;
  spaceType: 'Public' | 'Exclusive';
  spaceBadgeId?: number;
  condition?: {
    address: string;
    amount?: number;
    amountInput?: string;
  };
};

export interface UserNFTCollection {
  name: string;
  description: string;
  contract_address: string;
  token_type: string;
  image_url: string;
  background_image_url: string;
  external_url: string;
  symbol: string;
  network: string;
}
