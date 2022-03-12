import React, { useState } from 'react';
import './index.scss';
import { useHistory } from 'react-router-dom';
import TextField from '../../components/TextField';
import CreateTeamState from './CreateTeamState';
import JoinTeamState from './JoinTeamState';
import AddTeamLogo from './AddTeamLogo';
import InviteYourTeam from './InviteYourTeam';

const CreateTeam = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const tabs = [{ name: 'Create Team' }, { name: 'Join Team' }];
  return (
    <div className="create-team-container">
      <div className="create-team-body">
        {/* <div className="label-wrapper">
          {tabs.map((tab, index) => {
            const isActive = index === tabIndex;
            return (
              <div
                className={`tab-item ${isActive ? 'active' : ''}`}
                key={tab.name}
                onClick={() => setTabIndex(index)}
              >
                <span>{tab.name}</span>
              </div>
            );
          })}
        </div>
        <CreateTeamState display={tabIndex === 0} />
        <JoinTeamState display={tabIndex === 1} /> */}
        {/* <AddTeamLogo /> */}
        <InviteYourTeam />
      </div>
    </div>
  );
};

export default CreateTeam;
