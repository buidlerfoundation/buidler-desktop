import { Wallet, providers, utils, ethers } from 'ethers';
import { SendData } from 'renderer/models';
import store from 'renderer/store';
import MinABI from './MinABI';

const INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;

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

  sendETHTransaction = (sendData: SendData, from: string) => {
    const { privateKey } = store.getState().configs;
    if (!privateKey) return null;
    const provider = new providers.InfuraProvider('mainnet', INFURA_API_KEY);
    const signer = new Wallet(privateKey, provider);
    const amount = ethers.BigNumber.from(
      `${Math.floor(
        parseFloat(`${sendData.amount || 0}`) *
          Math.pow(10, sendData.asset?.contract.decimals || 0)
      ).toLocaleString('fullwide', { useGrouping: false })}`
    );
    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gasLimit: sendData.gasLimit.toHexString(),
      to: sendData.recipientAddress,
      from,
      value: amount.toHexString(),
    };
    return signer.sendTransaction(transactionParameters);
  };

  sendERC20Transaction = async (sendData: SendData, from: string) => {
    const { privateKey } = store.getState().configs;
    if (!privateKey) return null;
    const provider = new providers.InfuraProvider('mainnet', INFURA_API_KEY);
    const signer = new Wallet(privateKey, provider);
    const amount = ethers.BigNumber.from(
      `${Math.floor(
        parseFloat(`${sendData.amount || 0}`) *
          Math.pow(10, sendData.asset?.contract.decimals || 0)
      ).toLocaleString('fullwide', { useGrouping: false })}`
    );
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData('transfer', [
      sendData.recipientAddress,
      amount.toHexString(),
    ]);

    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gasLimit: sendData.gasLimit.toHexString(),
      to: sendData.asset?.contract.contract_address,
      from,
      value: '0x00',
      data: transferData,
    };
    return signer.sendTransaction(transactionParameters);
  };
}

export default new EthereumUtils();
