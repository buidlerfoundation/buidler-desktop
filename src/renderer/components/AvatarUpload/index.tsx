import React, { useRef } from 'react';
import Dropzone from 'react-dropzone';
import images from 'renderer/common/images';
import './index.scss';

type AvatarUploadProps = {
  onAddFiles: (fs) => void;
};

const AvatarUpload = ({ onAddFiles }: AvatarUploadProps) => {
  const inputFileRef = useRef();
  const openFile = () => {
    inputFileRef.current?.click();
  };
  return (
    <Dropzone onDrop={onAddFiles}>
      {({ getRootProps, getInputProps }) => (
        <div className="avatar-upload__container" {...getRootProps()}>
          <div className="button-upload normal-button" onClick={openFile}>
            <img src={images.icCameraDark} alt="" />
          </div>
          <input
            {...getInputProps()}
            ref={inputFileRef}
            accept="image/*"
            onChange={(e: any) => {
              onAddFiles(e.target.files);
              e.target.value = null;
            }}
          />
        </div>
      )}
    </Dropzone>
  );
};

export default AvatarUpload;
