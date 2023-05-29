const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const buffer = fs.readFileSync(path.join(__dirname, 'trust-min.js'));
const fileContent = buffer.toString();

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    postMessage: (data) => ipcRenderer.sendToHost(data),
  },
});

process.once('loaded', () => {
  const script = document.createElement('script');
  script.textContent = `
  ${fileContent}
    console.log('Injecting javascript');
    var config = {
      ethereum: {
        chainId: 1,
        rpcUrl: 'https://cloudflare-eth.com',
      },
      solana: {
        cluster: 'mainnet-beta',
      },
      venom: {
        networkId: 1000,
        address: '',
        publicKey: '',
      },
      isDebug: true,
    };
    trustwallet.ethereum = new trustwallet.Provider(config);
    trustwallet.ethereum.isMetaMask = true;
    trustwallet.ethereum.isTrust = false;
    trustwallet.postMessage = (json) => {
      window.electron.ipcRenderer.postMessage(JSON.stringify(json));
    };
    window.ethereum = trustwallet.ethereum;
    trustwallet.venom = new trustwallet.VenomProvider(config);
    window.__ever = trustwallet.venom;
    window.hasTonProvider = true;
  `;
  document.appendChild(script);
});

// contextBridge.exposeInMainWorld('hasTonProvider', true);
