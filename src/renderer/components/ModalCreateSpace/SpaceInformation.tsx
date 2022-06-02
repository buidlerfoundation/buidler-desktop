import { CircularProgress } from '@material-ui/core';
import React, { useRef } from 'react';
import { Emoji } from 'emoji-mart';
import { useSelector } from 'react-redux';
import ImageHelper from 'renderer/common/ImageHelper';
import images from 'renderer/common/images';
import TextareaAutosize from 'react-textarea-autosize';
import AppConfig from 'renderer/common/AppConfig';
import { CreateSpaceData } from 'renderer/models';
import EmojiAndAvatarPicker from '../EmojiAndAvatarPicker';
import PopoverButton from '../PopoverButton';
import './index.scss';
import AppInput from '../AppInput';

type SpaceInformationProps = {
  setSpaceData: (spaceData: CreateSpaceData) => void;
  spaceData: CreateSpaceData;
};

const SpaceInformation = ({
  spaceData,
  setSpaceData,
}: SpaceInformationProps) => {
  const currentTeam = useSelector((state) => state.user.currentTeam);
  const popupSpaceIconRef = useRef<any>();
  const renderSpaceIcon = () => {
    if (spaceData.attachment) {
      return (
        <>
          <img className="space-icon" src={spaceData.attachment.file} alt="" />
          {spaceData?.attachment?.loading && (
            <div className="attachment-loading">
              <CircularProgress size={50} />
            </div>
          )}
        </>
      );
    }
    if (spaceData.imageUrl) {
      return (
        <img
          className="space-icon"
          src={ImageHelper.normalizeImage(
            spaceData.imageUrl,
            currentTeam.team_id
          )}
          alt=""
        />
      );
    }
    if (spaceData.emoji) {
      return <Emoji emoji={spaceData.emoji} set="apple" size={40} />;
    }
    return <img alt="" src={images.icCameraSolid} />;
  };
  const onAddFiles = async (fs) => {
    if (fs == null || fs.length === 0) return;
    const file = [...fs][0];
    const attachment = {
      file: URL.createObjectURL(file),
      // loading: true,
      type: file.type,
    };
    // TODO: Handle Upload
    setSpaceData({ ...spaceData, attachment, emoji: null });
    popupSpaceIconRef.current?.hide();
  };
  const onAddEmoji = async (emoji) => {
    setSpaceData({ ...spaceData, attachment: null, emoji: emoji.id });
    popupSpaceIconRef.current?.hide();
  };
  return (
    <div className="space-information__container">
      <div className="title__wrap">
        <PopoverButton
          ref={popupSpaceIconRef}
          componentButton={
            <div className="space-icon__wrapper">{renderSpaceIcon()}</div>
          }
          componentPopup={
            <div
              className="emoji-picker__container"
              onClick={(e) => e.stopPropagation()}
            >
              <EmojiAndAvatarPicker
                onAddFiles={onAddFiles}
                onAddEmoji={onAddEmoji}
              />
            </div>
          }
        />
        <AppInput
          style={{ marginLeft: 15 }}
          className="app-input-highlight"
          placeholder="Space name"
          onChange={(e) =>
            setSpaceData({ ...spaceData, name: e.target.value.toUpperCase() })
          }
          value={spaceData?.name}
          autoFocus
        />
      </div>
      <div className="space-description__wrap">
        <TextareaAutosize
          className="space-description hide-scroll-bar"
          minRows={16}
          maxRows={16}
          placeholder="Description"
          value={spaceData.description || ''}
          onChange={(e) => {
            setSpaceData({ ...spaceData, description: e.target.value });
          }}
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
