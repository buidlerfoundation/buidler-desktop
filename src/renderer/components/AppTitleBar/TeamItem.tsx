import React, { useState, useEffect } from 'react';
import ImageHelper from '../../common/ImageHelper';
import images from '../../common/images';
import './index.scss';

type TeamItemProps = {
  t: any;
  isSelected: boolean;
  onChangeTeam: () => void;
  onContextMenu: (e: any) => void;
};

const TeamItem = ({
  t,
  isSelected,
  onChangeTeam,
  onContextMenu,
}: TeamItemProps) => {
  return (
    <div
      className={`team-item ${isSelected ? 'team-selected' : ''}`}
      onClick={onChangeTeam}
      onContextMenu={onContextMenu}
    >
      <img
        alt=""
        className="team-icon-mini"
        src={
          t?.team_icon
            ? ImageHelper.normalizeImage(t?.team_icon, t?.team_id, {
                w: 20,
                h: 20,
                radius: 5,
              })
            : images.icTeamDefault
        }
      />
      <div style={{ width: 8 }} />
      <span className="team-name">{t.team_display_name}</span>
    </div>
  );
};

export default TeamItem;
