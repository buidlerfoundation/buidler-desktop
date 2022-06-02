import React from 'react';

type IconStarProps = {
  fill?: string;
};

const IconStar = ({ fill }: IconStarProps) => {
  return (
    <svg
      width="18"
      height="16"
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.83906 15.8687C3.98376 15.9812 4.14722 16.0214 4.32943 15.9893C4.51164 15.9571 4.71261 15.8607 4.93234 15.6999L8.99196 12.7094L13.0677 15.6999C13.2874 15.8607 13.4884 15.9571 13.6706 15.9893C13.8528 16.0214 14.0162 15.9812 14.1609 15.8687C14.3056 15.7615 14.3914 15.6168 14.4182 15.4346C14.4503 15.2577 14.4235 15.0407 14.3378 14.7835L12.7381 9.9923L16.8379 7.05008C17.0576 6.8893 17.2104 6.72852 17.2961 6.56774C17.3818 6.40161 17.3952 6.23279 17.3363 6.0613C17.2827 5.89516 17.1728 5.76922 17.0067 5.68347C16.8406 5.59772 16.6235 5.55753 16.3556 5.56289L11.3152 5.587L9.78781 0.779769C9.70206 0.522526 9.59488 0.329593 9.46626 0.200971C9.33764 0.0669905 9.17954 0 8.99196 0C8.81511 0 8.66237 0.0669905 8.53375 0.200971C8.40513 0.329593 8.29794 0.522526 8.2122 0.779769L6.68481 5.587L1.64445 5.56289C1.37113 5.55753 1.1514 5.59772 0.985266 5.68347C0.824489 5.76922 0.717304 5.89516 0.663712 6.0613C0.60476 6.23279 0.618158 6.40161 0.703906 6.56774C0.789654 6.72852 0.942392 6.8893 1.16212 7.05008L5.26194 9.9923L3.65417 14.7835C3.57378 15.0407 3.54698 15.2577 3.57378 15.4346C3.60593 15.6168 3.69436 15.7615 3.83906 15.8687Z"
        fill={fill || '#56C195'}
      />
    </svg>
  );
};

export default IconStar;
