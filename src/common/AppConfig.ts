import images from './images';

const TodayPrefix = 'TodayApp';

const AppConfig = {
  baseUrl: 'https://api.remotetoday.app/',
  // baseUrl: 'http://127.0.0.1:8888/',
};

export default AppConfig;

export const AsyncKey = {
  accessTokenKey: `${TodayPrefix}_access_token`,
  lastChannelId: `${TodayPrefix}_last_channel_id`,
  lastTeamId: `${TodayPrefix}_last_team_id`,
};

export const ProgressStatus = [
  { title: 'Todo', type: 'todo', icon: images.icCheckOutline, id: 'todo' },
  { title: 'Doing', type: 'doing', icon: images.icCheckDoing, id: 'doing' },
  { title: 'Done', type: 'done', icon: images.icCheckDone, id: 'done' },
  {
    title: 'Archived',
    type: 'archived',
    icon: images.icCheckArchived,
    id: 'archived',
  },
];
