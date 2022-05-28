import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { utils } from 'ethers';
import api from 'renderer/api';

class WalletConnectUtils {
  connector: any = null;

  init() {
    this.connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
    });
    this.connector.on('session_update', (error, payload) => {
      if (error) {
        throw error;
      }
      console.log('session_update', payload);
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
    });

    this.connector.on('disconnect', (error, payload) => {
      if (error) {
        throw error;
      }
      console.log('disconnect', payload);
      // Delete connector
    });
  }

  connect() {
    if (!this.connector.connected) {
      // create new session
      this.connector.createSession();
    }
  }

  disconnect() {
    if (this.connector.connected) {
      this.connector.killSession();
    }
  }
}

export default new WalletConnectUtils();
