import React, { useState, useRef } from 'react';
import { Modal } from '@material-ui/core';
import './index.scss';
import { useDispatch, useSelector } from 'react-redux';
import actionTypes from 'renderer/actions/ActionTypes';
import NormalButton from '../NormalButton';

const ModalOTP = () => {
  const dispatch = useDispatch();
  const openOTP = useSelector((state: any) => state.configs.openOTP);
  const handleClose = () => {
    dispatch({ type: actionTypes.TOGGLE_OTP });
  };
  const [otp, setOtp] = useState('');
  return (
    <Modal className="modal-otp" open={openOTP} onClose={handleClose}>
      <div className="otp-view__container">
        <span className="otp__title">Enter OTP code</span>
        <div className="resend-button normal-button">
          <span>Resend code</span>
        </div>
        <div className="otp-input__wrapper">
          <div className="otp-item">
            <span>{otp?.[0]}</span>
          </div>
          <div className="otp-item">
            <span>{otp?.[1]}</span>
          </div>
          <div className="otp-item">
            <span>{otp?.[2]}</span>
          </div>
          <div className="otp-item">
            <span>{otp?.[3]}</span>
          </div>
          <input
            className="otp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={4}
            autoFocus
          />
        </div>
        <div className="otp-des">
          <span>Verification code to log in your new device.</span>
        </div>
        <div className="otp-bottom">
          <NormalButton type="normal" title="Dismiss" onPress={handleClose} />
        </div>
      </div>
    </Modal>
  );
};

export default ModalOTP;
