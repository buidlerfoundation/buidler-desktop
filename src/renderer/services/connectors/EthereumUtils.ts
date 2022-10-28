import { Wallet, providers, utils } from 'ethers';
import { SendData } from 'renderer/models';
import store from 'renderer/store';
import MinABI from './MinABI';

const INFURA_API_KEY = '74de9271d1194b40af956650c6084bb4';

class EthereumUtils {
  sendERC721Transaction = async (sendData: SendData, from: string) => {
    const { privateKey } = store.getState().configs;
    if (!privateKey) return null;
    const provider = new providers.InfuraProvider('mainnet', INFURA_API_KEY);
    const signer = new Wallet(privateKey, provider);
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData('transferFrom', [
      from,
      sendData.recipientAddress,
      sendData.nft?.token_id,
    ]);

    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gasLimit: sendData.gasLimit.toHexString(),
      to: sendData.nft?.contract_address,
      from,
      value: '0x00',
      data: transferData,
    };
    return signer.sendTransaction(transactionParameters);
  };
}

export default new EthereumUtils();
