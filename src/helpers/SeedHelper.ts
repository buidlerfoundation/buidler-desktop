export const createConfirmSeedState = () => {
  return new Array(12).fill({}).map((_, index) => ({ index, title: '' }));
};
