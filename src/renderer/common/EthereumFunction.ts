import { Contract, providers, Wallet, ethers, utils } from 'ethers';

const INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;

export const checkGasPrice = async () => {
  const provider = new providers.InfuraProvider('goerli', INFURA_API_KEY);

  const signer = new Wallet('PK');
  const account = signer.connect(provider);

  const gasPrice = await provider.getGasPrice();

  console.log(gasPrice.toString());
};

export const testSC = async () => {
  const provider = new providers.InfuraProvider('goerli', INFURA_API_KEY);

  const signer = new Wallet('PK');
  const account = signer.connect(provider);
  const router = new Contract(
    '0x32cc13220314180b1c9a373279a736ea6ec27ec4',
    [
      'function inviteUser(address _address) public payable',
      'function setPaused(bool _bool) public payable',
      'function getBalance() public view returns (uint256)',
      'event InviteUserEvent(address _address)',
    ],
    account
  );

  const amount = 1000000000000000;

  const amountHex = ethers.BigNumber.from(amount.toString()).toHexString();

  const gasPrice = await provider.getGasPrice();
  router.on('InviteUserEvent', (v1, v2) => {
    console.log(v1, v2);
  });
  router
    .inviteUser('0x27fa68a776af552d73c77631bcfcb8f47b1b62e9', {
      value: amountHex,
      gasPrice: gasPrice.toHexString(),
      gasLimit: ethers.BigNumber.from(300000).toHexString(),
    })
    .then(async (res: any) => {
      console.log(res);
      console.log(res.gasLimit.toString());
      console.log(gasPrice.toString());
      const r = await res.wait();
      console.log(r);
      return null;
    })
    .catch((err: any) => console.log(err));
};

export const stringToBytes32 = (text) => {
  let result = utils.toUtf8Bytes(text);
  if (result.length > 32) {
    throw new Error('String too long');
  }
  result = utils.hexlify(result);
  while (result.length < 66) {
    result += '0';
  }
  if (result.length !== 66) {
    throw new Error('invalid web3 implicit bytes32');
  }
  return result;
};
