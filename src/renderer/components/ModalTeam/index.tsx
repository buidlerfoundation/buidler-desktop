import React, { useState, useRef } from 'react';
import { CircularProgress, Modal } from '@material-ui/core';
import './index.global.scss';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';
import images from '../../common/images';
import Dropzone from 'react-dropzone';
import { getUniqueId } from '../../helpers/GenerateUUID';
import api from '../../api';

type ModalTeamProps = {
  open: boolean;
  handleClose: () => void;
  onCreateTeam: (teamData: any) => void;
};

const ModalTeam = ({ open, handleClose, onCreateTeam }: ModalTeamProps) => {
  const [teamData, setTeamData] = useState({
    name: '',
  });
  const [file, setFile] = useState<any>(null);
  const inputFileRef = useRef<any>();
  const generateId = useRef<string>('');
  const onAddFile = (fs: any) => {
    if (fs == null) return;
    generateId.current = getUniqueId();
    const data = [...fs];
    const f = data?.[0];
    if (!f) return;
    const attachment = {
      file: URL.createObjectURL(f),
      randomId: Math.random(),
      loading: true,
      type: f.type,
      name: f.name,
    };
    setFile(attachment);
    api.uploadFile(generateId.current, generateId.current, f).then((res) => {
      setFile((current: any) => ({
        ...current,
        loading: false,
        url: res.file_url,
        id: res.file.file_id,
      }));
      return null;
    });
  };

  const onPaste = (e: any) => {
    const fs = e.clipboardData.files;
    if (fs?.length > 0) {
      onAddFile(fs);
    }
  };

  return (
    <Dropzone onDrop={onAddFile} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <Modal
          open={open}
          onClose={handleClose}
          className="team-modal"
          style={{ backgroundColor: 'var(--color-backdrop)' }}
        >
          <div className="team-view__container" {...getRootProps()}>
            <span className="team__title">Create Team</span>
            <div style={{ height: 65 }} />
            <div className="team-body">
              <div
                className="input-team-icon normal-button"
                onClick={() => inputFileRef.current?.click()}
              >
                {file?.file ? (
                  <div className="team-icon__wrapper">
                    <img className="team-icon" alt="" src={file?.file} />
                    {file?.loading && (
                      <div className="attachment-loading">
                        <CircularProgress />
                      </div>
                    )}
                  </div>
                ) : (
                  <span>
                    Team
                    <br />
                    Icon
                  </span>
                )}
                <img className="icon-camera" alt="" src={images.icCameraDark} />
              </div>
              <div className="input-team-item__container">
                <AppInput
                  className="app-input-highlight"
                  placeholder="Team name"
                  onChange={(e) => setTeamData({ name: e.target.value })}
                  value={teamData?.name}
                  autoFocus
                  onPaste={onPaste}
                />
              </div>
            </div>
            <div className="group-channel__bottom">
              <NormalButton
                title="Cancel"
                onPress={handleClose}
                type="normal"
              />
              <div style={{ width: 10 }} />
              <NormalButton
                title="Create team"
                onPress={() => {
                  if (!teamData.name) return;
                  onCreateTeam({
                    ...teamData,
                    teamIcon: file,
                    teamId: generateId.current,
                  });
                }}
                type="main"
              />
            </div>
            <input
              {...getInputProps()}
              ref={inputFileRef}
              accept="image/*"
              onChange={(e: any) => {
                onAddFile(e.target.files);
                e.target.value = null;
              }}
            />
          </div>
        </Modal>
      )}
    </Dropzone>
  );
};

export default ModalTeam;
