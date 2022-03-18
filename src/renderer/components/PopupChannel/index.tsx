import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import images from '../../common/images';
import GroupTitle from '../../pages/Main/Layout/SideBar/components/GroupTitle';
import AppInput from '../AppInput';
import './index.scss';

type PopupChannelProps = {
  channel: Array<any>;
  selected: Array<any>;
  onChange: (data: Array<any>) => void;
  groupChannel: Array<any>;
};

const PopupChannel = ({
  channel,
  selected,
  onChange,
  groupChannel,
}: PopupChannelProps) => {
  const [search, setSearch] = useState('');
  const channels = useCallback(
    (data) => {
      if (!search) return data;
      return data.filter((el: any) =>
        el.channel_name.toLowerCase().includes(search.toLowerCase())
      );
    },
    [search]
  );
  return (
    <div className="popup-channel__container hide-scroll-bar">
      <AppInput
        placeholder="Search channel"
        className="search-channel"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {groupChannel.map((g, index) => {
        return (
          <div
            key={g?.group_channel_name}
            style={{ marginTop: index === 0 ? 60 : 0 }}
          >
            <GroupTitle title={g?.group_channel_name} />
            {channels(channel)
              ?.filter(
                (c: any) =>
                  c.group_channel?.group_channel_name === g?.group_channel_name
              )
              ?.map?.((c: any) => {
                const isActive = selected?.find(
                  (el) => el.channel_id === c.channel_id
                );
                return (
                  <div
                    key={c.channel_id}
                    className="channel-item normal-button"
                    onClick={() => {
                      if (isActive) {
                        onChange(
                          selected.filter(
                            (el) => el.channel_id !== c.channel_id
                          )
                        );
                      } else {
                        onChange([...selected, c]);
                      }
                    }}
                  >
                    <span>
                      {c.channel_type === 'Private' ? (
                        <img src={images.icPrivate} alt="" />
                      ) : (
                        '#'
                      )}{' '}
                      {c.channel_name}
                    </span>
                    <div style={{ flex: 1 }} />
                    {isActive && <img alt="" src={images.icCheck} />}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    channel: state.user.channel,
    groupChannel: state.user.groupChannel,
  };
};

export default connect(mapStateToProps)(PopupChannel);
