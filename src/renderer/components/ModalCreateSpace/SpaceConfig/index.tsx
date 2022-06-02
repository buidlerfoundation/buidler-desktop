import React from 'react';
import { SpaceBadge } from 'renderer/common/AppConfig';
import AppInput from 'renderer/components/AppInput';
import IconStar from 'renderer/components/SVG/IconStar';
import { CreateSpaceData } from 'renderer/models';
import '../index.scss';

type SpaceConfigProps = {
  setSpaceData: (spaceData: CreateSpaceData) => void;
  spaceData: CreateSpaceData;
};

const spaceTypes = ['Public', 'Exclusive'];

const SpaceConfig = ({ spaceData, setSpaceData }: SpaceConfigProps) => {
  return (
    <div className="space-config__container">
      <div className="space-type__wrap">
        {spaceTypes.map((el) => (
          <div
            className={`space-type ${
              el === spaceData.spaceType ? 'active' : ''
            }`}
            key={el}
            onClick={() => setSpaceData({ ...spaceData, spaceType: el })}
          >
            <span>{el}</span>
          </div>
        ))}
      </div>
      <div className="space-type-description">
        <span>
          {spaceData.spaceType === 'Public'
            ? 'Full access to all users.'
            : 'Only members who meet the condition can have access to the space.'}
        </span>
      </div>
      <div className="space-badge-color__wrap">
        <span className="space-config-label">Badge color</span>
        {SpaceBadge.map((el) => {
          const isActive = spaceData.spaceBadgeId === el.id;
          return (
            <div
              className="badge-item"
              style={{
                '--hover-background': el.backgroundColor,
                outline: isActive ? `1px solid ${el.color}` : 'none',
              }}
              onClick={() =>
                setSpaceData({ ...spaceData, spaceBadgeId: el.id })
              }
            >
              <IconStar fill={el.color} />
            </div>
          );
        })}
      </div>
      <div className="space-condition__wrap">
        <span className="space-config-label">Condition</span>
        <div className="input-contract__wrap">
          <AppInput
            className="app-input-highlight input-contract"
            placeholder="contract address"
          />
          <div className="logo-contract__wrap">
            <div className="logo-contract" />
          </div>
          <div className="button-paste">
            <span>Paste</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceConfig;
