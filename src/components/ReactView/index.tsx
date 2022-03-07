import React, { useState } from 'react';
import './index.global.scss';
import { Emoji } from 'emoji-mart';
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';
import AvatarView from '../AvatarView';
import api from '../../api';

type ReactViewProps = {
  reacts: Array<any>;
  onClick: (name: string) => void;
  teamUserData: Array<any>;
  parentId: string;
};

const ReactView = ({
  reacts,
  onClick,
  teamUserData,
  parentId,
}: ReactViewProps) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reactDetail, setReactDetail] = useState([]);

  const handlePopoverOpen = (emj: any) => async (evt: any) => {
    setAnchorEl(evt.currentTarget);
    const res = await api.getReactionDetail(parentId, emj.name);
    if (res.statusCode === 200) {
      setReactDetail(res.data);
    } else {
      setReactDetail([]);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setReactDetail([]);
  };

  const open = !!anchorEl && reactDetail.length > 0;
  return (
    <div>
      <div
        className="react-view__container"
        aria-describedby={open ? 'react-detail-popover' : undefined}
      >
        {reacts.map((emj) => (
          <div
            className={`react-item__view ${
              emj.isReacted ? 'react-item__highlight' : ''
            }`}
            key={emj.name}
            onClick={(e) => {
              e.stopPropagation();
              onClick(emj.name);
            }}
            onMouseEnter={handlePopoverOpen(emj)}
            onMouseLeave={handlePopoverClose}
          >
            <Emoji emoji={emj.name} set="apple" size={18} />
            <span className="react-item__count">{emj.count}</span>
          </div>
        ))}
      </div>
      <Popper
        id="react-detail-popover"
        open={open}
        anchorEl={anchorEl}
        style={{ zIndex: 1000 }}
      >
        <div className="react-detail__container">
          {reactDetail.map((el: any) => {
            const user = teamUserData.find((u) => u.user_id === el.user_id);
            return (
              <div className="react-item" key={el.emoji_id + el.user_id}>
                <AvatarView user={user} />
                <span className="user-name">{user.full_name}</span>
                <Emoji emoji={el.emoji_id} set="apple" size={18} />
              </div>
            );
          })}
        </div>
      </Popper>
    </div>
  );
};

export default ReactView;
