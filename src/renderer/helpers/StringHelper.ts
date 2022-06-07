import numeral from 'numeral';

export const formatNumber = (number: string | number) => {
  return numeral(number).format('0,0');
};

export default {};
