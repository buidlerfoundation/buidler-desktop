import React from 'react';
import { connect } from 'react-redux';
import images from '../../common/images';
import GroupTitle from '../../pages/Main/Layout/SideBar/components/GroupTitle';
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
  return (
    <div className="popup-channel__container hide-scroll-bar">
      {groupChannel.map((g) => {
        return (
          <div key={g?.group_channel_name}>
            <GroupTitle title={g?.group_channel_name} />
            {channel
              ?.filter(
                (c) =>
                  c.group_channel?.group_channel_name === g?.group_channel_name
              )
              ?.map?.((c) => {
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
