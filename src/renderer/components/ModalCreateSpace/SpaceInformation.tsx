import React, { useCallback, useRef } from 'react';
import AppConfig from 'renderer/common/AppConfig';
import { CreateSpaceData } from 'renderer/models';
import api from 'renderer/api';
import { useSelector } from 'react-redux';
import { getUniqueId } from 'renderer/helpers/GenerateUUID';
import EmojiAndAvatarPicker from '../EmojiAndAvatarPicker';
import PopoverButton from '../PopoverButton';
import './index.scss';
import AppInput from '../AppInput';
import SpaceIcon from './SpaceIcon';

type SpaceInformationProps = {
  setSpaceData: React.Dispatch<React.SetStateAction<CreateSpaceData>>;
  spaceData: CreateSpaceData;
  spaceId?: string;
};

const SpaceInformation = ({
  spaceData,
  setSpaceData,
  spaceId,
}: SpaceInformationProps) => {
  const currentTeam = useSelector((state) => state.user.currentTeam);
  const popupSpaceIconRef = useRef<any>();
  const handleEmojiPickerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation(),
    []
  );
  const onAddFiles = useCallback(
    async (fs) => {
      if (fs == null || fs.length === 0) return;
      const id = spaceData.spaceId || getUniqueId();
      const file = [...fs][0];
      const attachment = {
        file: URL.createObjectURL(file),
        loading: true,
        type: file.type,
      };
      setSpaceData((current) => ({
        ...current,
        spaceId: id,
        attachment,
        emoji: null,
      }));
      const res = await api.uploadFile(currentTeam?.team_id, id, file);
      setSpaceData((current) => ({
        ...current,
        spaceId: id,
        attachment: {
          ...current.attachment,
          loading: false,
        },
        emoji: null,
        url: res?.file_url,
      }));
      popupSpaceIconRef.current?.hide();
    },
    [currentTeam?.team_id, setSpaceData, spaceData.spaceId]
  );
  const onAddEmoji = useCallback(
    async (emoji) => {
      setSpaceData((current) => ({
        ...current,
        attachment: null,
        emoji: emoji.id,
        url: null,
      }));
      popupSpaceIconRef.current?.hide();
    },
    [setSpaceData]
  );
  const onSelectRecentFile = useCallback(
    async (file) => {
      setSpaceData((current) => ({
        ...current,
        attachment: null,
        emoji: null,
        url: file.file_url,
      }));
    },
    [setSpaceData]
  );
  const handleUpdateName = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setSpaceData((current) => ({
        ...current,
        name: e.target.value.toUpperCase(),
      })),

    [setSpaceData]
  );
  const handleUpdateDescription = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSpaceData((current) => ({ ...current, description: e.target.value }));
    },
    [setSpaceData]
  );
  return (
    <div className="space-information__container">
      <div className="title__wrap">
        <PopoverButton
          ref={popupSpaceIconRef}
          componentButton={<SpaceIcon spaceData={spaceData} showDefault />}
          componentPopup={
            <div
              className="emoji-picker__container"
              onClick={handleEmojiPickerClick}
            >
              <EmojiAndAvatarPicker
                onAddFiles={onAddFiles}
                onAddEmoji={onAddEmoji}
                spaceId={spaceId}
                onSelectRecentFile={onSelectRecentFile}
              />
            </div>
          }
        />
        <AppInput
          style={{ marginLeft: 15 }}
          className="app-input-highlight"
          placeholder="Space name"
          onChange={handleUpdateName}
          value={spaceData?.name}
          autoFocus
        />
      </div>
      <div className="space-description__wrap">
        <textarea
          style={{ height: 370 }}
          className="space-description hide-scroll-bar"
          placeholder="Description"
          value={spaceData.description || ''}
          onChange={handleUpdateDescription}
          maxLength={AppConfig.maxLengthSpaceDescription}
        />
        <div className="description-limit">
          <span>
            {AppConfig.maxLengthSpaceDescription -
              spaceData.description?.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpaceInformation;
