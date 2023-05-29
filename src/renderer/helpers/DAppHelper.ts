import { utils } from 'ethers';

export const normalizeErrorMessage = (message: string) => {
  if (message.includes('insufficient')) return 'Insufficient amount';
  return message;
};

export const normalizeSendMessageObject = (object: any) => {
  if (object.payload?.params.signature) {
    object.payload.params.signature = utils
      .hexlify(utils.toUtf8Bytes(object.payload.params.signature))
      .slice(2);
  }
  return object;
};
