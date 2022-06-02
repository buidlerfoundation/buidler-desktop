import React, { useCallback, useEffect, useState } from 'react';
import api from 'renderer/api';
import { randomEmoji } from 'renderer/helpers/RandomHelper';
import AvatarUpload from '../AvatarUpload';
import EmojiPicker from '../EmojiPicker';
import './index.scss';

type EmojiAndAvatarPickerProps = {
  onAddFiles: (fs) => void;
  onAddEmoji: (emoji) => void;
  onSelectRecentFile?: (file) => void;
  spaceId?: string;
  channelId?: string;
};

const EmojiAndAvatarPicker = ({
  onAddFiles,
  onAddEmoji,
  spaceId,
  channelId,
  onSelectRecentFile,
}: EmojiAndAvatarPickerProps) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const labels = ['Emoji', 'Upload'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fetchRecentFiles = useCallback(async () => {
    let res = null;
    if (spaceId) {
      res = await api.getSpaceFile(spaceId);
    } else if (channelId) {
      res = await api.getChannelFile(channelId);
    }
    if (res?.statusCode === 200) {
      setRecentFiles(res.data);
    }
  }, [spaceId, channelId]);
  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);
  const onRandomClick = useCallback(() => {
    const res = randomEmoji();
    onAddEmoji({ id: res });
  }, [onAddEmoji]);
  const handleClickEmoji = useCallback(
    (emoji) => {
      onAddEmoji(emoji);
    },
    [onAddEmoji]
  );
  const handleLabelClick = useCallback(
    (index) => () => setSelectedIndex(index),
    []
  );
  const renderLabel = useCallback(
    (el, index) => (
      <div
        className={`picker-title normal-button ${
          selectedIndex === index ? 'selected' : ''
        }`}
        key={el}
        onClick={handleLabelClick(index)}
      >
        <span>{el}</span>
      </div>
    ),
    [selectedIndex, handleLabelClick]
  );
  return (
    <div className="emoji-avatar-picker__container">
      <div className="picker-title__wrapper">
        {labels.map(renderLabel)}
        <div style={{ flex: 1 }} />
        {selectedIndex === 0 && (
          <div className="random-button normal-button" onClick={onRandomClick}>
            <span>Random</span>
          </div>
        )}
      </div>
      {selectedIndex === 0 && (
        <EmojiPicker onClick={handleClickEmoji} style={{ border: 'none' }} />
      )}
      {selectedIndex === 1 && (
        <AvatarUpload
          recentFiles={recentFiles}
          onAddFiles={onAddFiles}
          onSelectRecentFile={onSelectRecentFile}
        />
      )}
    </div>
  );
};

export default EmojiAndAvatarPicker;
