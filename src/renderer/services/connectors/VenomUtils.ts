import { TonClient } from '@eversdk/core';

const client = new TonClient({
  network: {
    // endpoints: ['devnet.evercloud.dev/f4d1e07e34504b52b68facb61083b0b4'],
    endpoints: ['gql-testnet.venom.foundation'],
  },
});

class VenomUtils {
  deriveSignKeysFromSeed = async (seed: string) => {
    const walletKeys = await client.crypto.mnemonic_derive_sign_keys({
      phrase: seed,
    });
    return walletKeys;
  };
  getWalletAddress = async (publicKey: string) => {
    const initData = (
      await client.abi.encode_boc({
        params: [
          { name: 'publicKey', type: 'uint256' },
          { name: 'timestamp', type: 'uint64' },
        ],
        data: {
          publicKey: `0x${publicKey}`,
          timestamp: 0,
        },
      })
    ).boc;
    const stateInit = (
      await client.boc.encode_tvc({
        code: window.electron.walletBOC,
        data: initData,
      })
    ).tvc;
    const everWalletAddress = (
      await client.boc.get_boc_hash({ boc: stateInit })
    ).hash;
    return `0:${everWalletAddress}`;
  };
  getAccount = async (address: string) => {
    try {
      const query = `
      query {
        blockchain {
          account(
            address: "${address}"
          ) {
             info {
              balance
              boc
            }
          }
        }
      }`;
      const { result } = await client.net.query({ query });
      const { info } = result.data.blockchain.account;
      console.log(info);
      return info;
    } catch (error) {
      console.log('XXX: ', address, error);
      return null;
    }
  };
  runLocal = async (payload: any) => {
    const res = await client?.abi.encode_message({
      abi: {
        type: 'Json',
        value: payload.functionCall.abi,
      },
      address: payload.address,
      call_set: {
        function_name: payload.functionCall.method,
        input: payload.params,
      },
      signer: {
        type: 'None',
      },
    });
    return res;
  };
}

export default new VenomUtils();
