export type CreateSpaceData = {
  spaceId?: string;
  name: string;
  description?: string;
  attachment?: {
    file: any;
    loading: boolean;
    type: string;
  };
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

export interface UserData {
  avatar_url: string;
  encrypt_message_key?: string;
  is_verified_avatar?: boolean;
  is_verified_username?: boolean;
  nonce?: string;
  user_id: string;
  user_name: string;
  role?: string;
  status?: string;
}

export interface Channel {
  channel_emoji?: string;
  channel_id: string;
  channel_image_url?: string;
  channel_member: Array<string>;
  channel_name: string;
  channel_type: 'Public' | 'Private' | 'Direct';
  notification_type: string;
  seen: boolean;
  space?: Space;
  space_id?: string;
}

export interface Space {
  is_hidden?: boolean;
  order: number;
  space_emoji?: string;
  space_id: string;
  space_image_url?: string;
  space_name: string;
  space_type: 'Public' | 'Private';
  team_id?: string;
  space_description?: string;
  icon_color?: string;
  icon_sub_color?: string;
}

export interface Community {
  team_display_name: string;
  team_icon: string;
  team_id: string;
  team_url: string;
}

export interface NFTCollection {
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

export interface SpaceCollectionData {
  space_condition_id: string;
  space_id: string;
  contract_address: string;
  token_type: string;
  network: string;
  amount: number;
  nft_collection: NFTCollection;
}

export interface SettingItem {
  label: string;
  icon: string;
  id: string;
}

export interface GroupSettingItem {
  id: string;
  groupLabel: string;
  items: Array<SettingItem>;
}
