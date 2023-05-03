export const normalizeErrorMessage = (message: string) => {
  if (message.includes('insufficient')) return 'Insufficient amount';
  return message;
};
