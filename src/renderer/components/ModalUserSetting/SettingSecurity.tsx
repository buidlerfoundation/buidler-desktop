import React from 'react';
import images from 'renderer/common/images';

type SettingSecurityProps = {};

const SettingSecurity = ({}: SettingSecurityProps) => {
  return (
    <div>
      <span className="modal-label">Security</span>
      <div className="security-action-view">
        <div className="action-item">
          <span>Change password</span>
          <img className="mr5" src={images.icChevronRight} alt="" />
        </div>
        <div className="action-item">
          <span>Auto lock</span>
          <span>if away for 1 hour</span>
        </div>
      </div>
      <span className="security-des">
        You can manually lock the app by using ⌘ + L
      </span>
    </div>
  );
};

export default SettingSecurity;