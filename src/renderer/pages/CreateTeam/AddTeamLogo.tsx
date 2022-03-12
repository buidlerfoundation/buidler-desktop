import React from 'react';
import images from '../../common/images';
import './index.scss';

const AddTeamLogo = () => {
  return (
    <div className="add-team-logo__container">
      <span className="create-team-title">Add Team Logo</span>
      <div className="upload-logo normal-button">
        <span className="upload-text">Upload Image</span>
        <img src={images.icCamera} alt="" className="camera-icon" />
      </div>
      <div className="create-button add-logo-button">
        <span>Create</span>
      </div>
    </div>
  );
};

export default AddTeamLogo;
