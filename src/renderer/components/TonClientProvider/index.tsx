import {
  ResultOfEncodeMessage,
  ResultOfQuery,
  ResultOfSign,
  ResultOfSubscribeCollection,
  ResultOfVerifySignature,
  TonClient,
} from '@eversdk/core';
import { libWeb, libWebSetup } from '@eversdk/lib-web';
import { createContext, useCallback, useContext } from 'react';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { EverWallet } from 'renderer/services/connectors/EverWallet';

libWebSetup({
  disableSeparateWorker: true,
  binaryURL:
    process.env.NODE_ENV === 'production'
      ? window.electron.tonClientBinaryURL
      : undefined,
});

export interface ITonClientContext {
  client: TonClient | null;
  runLocal?: (payload: any) => Promise<ResultOfEncodeMessage>;
  query?: (query: string) => Promise<ResultOfQuery>;
  sendMessage?: (data: any) => Promise<ResultOfEncodeMessage>;
  getTransaction?: (hash: string) => Promise<any>;
  subscribeTransaction?: (data: any) => Promise<ResultOfSubscribeCollection>;
  signData?: (data: any) => Promise<ResultOfSign>;
  verifySignature?: (data: any) => Promise<ResultOfVerifySignature>;
  findTransaction?: (data: any) => Promise<any>;
}

export const TonClientContext = createContext<ITonClientContext>({
  client: null,
});

export function useTonClient(): ITonClientContext {
  return useContext(TonClientContext);
}

interface ITonClientProps {
  children?: ReactNode;
}

const TonClientProvider = ({ children }: ITonClientProps) => {
  TonClient.useBinaryLibrary(libWeb);
  const venomKey = useAppSelector((state) => state.configs.venomKey);
  const getClient = useCallback(
    () =>
      new TonClient({
        network: {
          // endpoints: ['devnet.evercloud.dev/f4d1e07e34504b52b68facb61083b0b4'],
          endpoints: ['gql-testnet.venom.foundation'],
        },
      }),
    []
  );
  const runLocal = useCallback(
    async (payload: any) => {
      const client = getClient();
      const res = await client?.abi.encode_message({
        abi: {
          type: 'Json',
          value: payload.functionCall.abi,
        },
        address: payload.address,
        call_set: {
          function_name: payload.functionCall.method,
          input: payload.functionCall.params,
        },
        signer: {
          type: 'None',
        },
      });
      return res;
    },
    [getClient]
  );
  const getTransaction = useCallback(
    async (hash: string) => {
      const client = getClient();
      const query = `
      query {
        blockchain {
          transaction(
            hash: "${hash}"
          ) {
            id: hash
            lt(format: DEC)
            inMessage: in_message {
              hash
              dst
              value
              bounce
              bounced
              body
              bodyHash: body_hash
            }
            outMessages: out_messages {
              hash
              src
              dst
              value
              bounce
              bounced
            }
          }
        }
      }`;
      const { result } = await client.net.query({ query });
      const { transaction } = result.data.blockchain;
      transaction.id = {
        id: transaction.id,
        lt: transaction.lt,
      };
      return { transaction };
    },
    [getClient]
  );
  const sendMessage = useCallback(
    async (data: any) => {
      const client = getClient();
      let payload = '';
      if (data?.payload) {
        payload = (
          await client?.abi?.encode_message_body({
            abi: {
              type: 'Json',
              value: data?.payload?.abi,
            },
            is_internal: false,
            call_set: {
              function_name: data?.payload?.method,
              input: data?.payload?.params,
            },
            address: data?.recipient,
            signer: {
              type: 'Keys',
              keys: {
                public: venomKey?.publicKey,
                secret: venomKey?.secret,
              },
            },
          })
        ).body;
      }
      console.log('XXX1: ', payload);
      const messageData = await client?.processing.process_message({
        send_events: false,
        message_encode_params: {
          abi: {
            type: 'Contract',
            value: EverWallet.abi,
          },
          address: data.sender,
          call_set: {
            function_name: 'sendTransaction',
            input: {
              dest: data.recipient,
              value: data.amount,
              bounce: data.bounce,
              flags: 3,
              payload,
            },
          },
          signer: {
            type: 'Keys',
            keys: {
              public: venomKey?.publicKey,
              secret: venomKey?.secret,
            },
          },
        },
      });
      console.log('XXX2: ', messageData);
      const transaction = await getTransaction(messageData.transaction.id);
      return transaction;
    },
    [getClient, getTransaction, venomKey?.publicKey, venomKey?.secret]
  );
  const query = useCallback(
    async (q: string) => {
      const client = getClient();
      return client.net.query({ query: q });
    },
    [getClient]
  );
  const subscribeTransaction = useCallback(
    async (data: any) => {
      const client = getClient();
      const addressList = [data.address];
      const queryText = `
            subscription my($list: [String!]!){
                transactions(
                    filter: {account_addr: { in: $list }}
                ) {
                    id
                    account_addr
                    balance_delta
                }
            }`;
      const res = await client?.net?.subscribe({
        subscription: queryText,
        variables: { list: addressList },
      });
      return res;
    },
    [getClient]
  );
  const signData = useCallback(
    async (data: any) => {
      const client = getClient();
      const { hash } = await client.crypto.sha256(data);
      const res = await client?.crypto?.sign({
        unsigned: data.data,
        keys: {
          public: venomKey?.publicKey,
          secret: venomKey?.secret,
        },
      });
      console.log(res);
      return {
        dataHash: hash,
        signature: res.signed,
        // signed: res.signed,
        signatureHex: Buffer.from(res.signed, 'base64').toString('hex'),
        signatureParts: {
          high: `0x${res.signature.substring(0, 64)}`,
          low: `0x${res.signature.substring(64)}`,
        },
      };
    },
    [getClient, venomKey?.publicKey, venomKey?.secret]
  );
  const verifySignature = useCallback(
    async (data: any) => {
      const client = getClient();
      const res = await client?.crypto?.verify_signature({
        signed: data.signature,
        public: data.publicKey,
      });
      return {
        isValid: !!res,
      };
    },
    [getClient]
  );
  const findTransaction = useCallback(
    async (data: any) => {
      const client = getClient();
      const queryText = `
    query {
      transactions(
        filter: {
          in_msg: {
            in: ["${data.inMessageHash}"]
          }
        }
      ) {
        id
        prevTransactionId: prev_trans_hash
        aborted
        origStatus: orig_status
        endStatus :end_status
        totalFees: total_fees
        inMessage: in_message {
          id
          dst
          value
          bounce
          bounced
          body
          bodyHash: body_hash
        }
        outMessages: out_messages {
          id
          src
          dst
          value
          bounce
          bounced
        }
      }
    }
    `;
      const { result } = await client.net.query({ query: queryText });
      return {
        transaction: result.data.transactions?.[0] || null,
      };
    },
    [getClient]
  );
  return (
    <TonClientContext.Provider
      value={{
        runLocal,
        query,
        sendMessage,
        getTransaction,
        subscribeTransaction,
        signData,
        verifySignature,
        findTransaction,
      }}
    >
      {children}
    </TonClientContext.Provider>
  );
};

export default TonClientProvider;
