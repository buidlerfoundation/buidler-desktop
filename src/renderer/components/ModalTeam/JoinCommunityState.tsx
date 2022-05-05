import React from 'react';
import images from 'renderer/common/images';
import NormalButton from '../NormalButton';

type JoinCommunityStateProps = {
  onJoinPress: () => void;
  handleClose: () => void;
  link: string;
  onChange: (e: any) => void;
};

const JoinCommunityState = ({
  onJoinPress,
  handleClose,
  link,
  onChange,
}: JoinCommunityStateProps) => {
  return (
    <div className="view-body__wrapper">
      <div className="view-body">
        <div className="server-link__wrapper">
          <div className="tag-link">
            <img src={images.icLink} alt="" />
          </div>
          <input
            className="invite-link"
            placeholder="Invitation link"
            value={link}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="group-channel__bottom">
        <NormalButton title="Cancel" onPress={handleClose} type="normal" />
        <div style={{ width: 10 }} />
        <NormalButton title="Join" onPress={onJoinPress} type="main" />
      </div>
    </div>
  );
};

export default JoinCommunityState;