import React, { useCallback } from 'react';
import { Community } from 'renderer/models';
import ImageHelper from '../../common/ImageHelper';
import DefaultSpaceIcon from '../DefaultSpaceIcon';
import './index.scss';

type TeamItemProps = {
  t: Community;
  isSelected: boolean;
  onChangeTeam: (team: Community) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const TeamItem = ({
  t,
  isSelected,
  onChangeTeam,
  onContextMenu,
}: TeamItemProps) => {
  const handleClick = useCallback(() => onChangeTeam(t), [onChangeTeam, t]);
  return (
    <div
      className={`team-item ${isSelected ? 'team-selected' : ''}`}
      onClick={handleClick}
      onContextMenu={onContextMenu}
    >
      {t?.team_icon ? (
        <img
          alt=""
          className="team-icon-mini"
          src={ImageHelper.normalizeImage(t?.team_icon, t?.team_id, {
            w: 20,
            h: 20,
            radius: 5,
          })}
        />
      ) : (
        <DefaultSpaceIcon
          name={t.team_display_name ? t.team_display_name.charAt(0) : ''}
          size={20}
          borderRadius={5}
          fontSize={12}
          fontMarginTop={2}
        />
      )}
      <div style={{ width: 8 }} />
      <span className="team-name">{t.team_display_name}</span>
    </div>
  );
};

export default TeamItem;
