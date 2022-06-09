import React, { useCallback, useState } from 'react';
import ModalTeam from '../../../../components/ModalTeam';
import NormalButton from '../../../../components/NormalButton';
import './index.scss';

type EmptyViewProps = {
  createTeam?: (body: any) => any;
  findTeamAndChannel: () => any;
};

const EmptyView = ({ createTeam, findTeamAndChannel }: EmptyViewProps) => {
  const [isOpenModalTeam, setOpenModalTeam] = useState(false);
  const toggleModalTeam = useCallback(
    () => setOpenModalTeam((current) => !current),
    []
  );
  const handleCreateTeam = useCallback(
    async (body) => {
      await createTeam?.({
        team_id: body.teamId,
        team_display_name: body.name,
        team_icon: body.teamIcon?.url,
      });
      setOpenModalTeam(false);
    },
    [createTeam]
  );
  const handleAcceptTeam = useCallback(() => {
    findTeamAndChannel();
    setOpenModalTeam(false);
  }, [findTeamAndChannel]);
  return (
    <div className="empty-view__container">
      <span className="empty-text">
        You don&apos;t have any community yet,
        <br />
        create a new community to start using Buidler.
      </span>
      <NormalButton
        title="New Community"
        onPress={toggleModalTeam}
        type="main"
      />
      <ModalTeam
        open={isOpenModalTeam}
        handleClose={toggleModalTeam}
        onCreateTeam={handleCreateTeam}
        onAcceptTeam={handleAcceptTeam}
      />
    </div>
  );
};

export default EmptyView;
