import { ResultOfEncodeMessage, ResultOfQuery, TonClient } from '@eversdk/core';
import { libWeb, libWebSetup } from '@eversdk/lib-web';
import { createContext, useCallback, useContext } from 'react';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { EverWallet } from 'renderer/services/connectors/EverWallet';

libWebSetup({
  disableSeparateWorker: true,
});

export interface ITonClientContext {
  client: TonClient | null;
  runLocal?: (payload: any) => Promise<ResultOfEncodeMessage>;
  query?: (query: string) => Promise<ResultOfQuery>;
  sendMessage?: (data: any) => Promise<ResultOfEncodeMessage>;
  getTransaction?: (hash: string) => Promise<any>;
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
            id
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
      return result.data.blockchain;
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
            is_internal: true,
            call_set: {
              function_name: data?.payload?.method,
              input: data?.payload?.params,
            },
            address: data?.recipient,
            signer: {
              type: 'External',
              public_key: venomKey?.publicKey,
            },
          })
        ).body;
      }
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
              flags: 1,
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
  return (
    <TonClientContext.Provider
      value={{
        runLocal,
        query,
        sendMessage,
        getTransaction,
      }}
    >
      {children}
    </TonClientContext.Provider>
  );
};

export default TonClientProvider;
