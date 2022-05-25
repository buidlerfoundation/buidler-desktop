import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

class WalletConnectUtils {
  connector: any = null;

  init() {
    this.connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
    });
    if (!this.connector.connected) {
      // create new session
      this.connector.createSession();
    }
    console.log(this.connector);
    // Subscribe to connection events
    this.connector.on('connect', (error, payload) => {
      if (error) {
        throw error;
      }
      console.log('connect', payload);
      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
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

      // Delete connector
    });
  }
}

export default new WalletConnectUtils();
