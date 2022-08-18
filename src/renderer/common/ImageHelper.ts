import { utils } from 'ethers';
import blockies from 'ethereum-blockies-png';

type imageOptions = {
  w?: number;
  h?: number;
  radius?: number;
  fm?: string;
};

class ImageHelper {
  imgConfig: any = null;
  imgDomain?: string = '';

  initial(domain: string, config: any) {
    this.imgConfig = config;
    this.imgDomain = domain;
  }

  normalizeEthImage = (address) => {
    return blockies.createDataURL({
      seed: address,
    });
  };

  normalizeImage = (
    name?: string,
    id?: string,
    options: imageOptions = {},
    noParams = false
  ) => {
    if (!name && id?.substring(0, 2) === '0x') {
      const data = blockies.createDataURL({
        seed: utils.computeAddress(id),
      });
      return data;
    }
    if (name?.includes?.('http')) return name;
    if (this.imgDomain === '' || this.imgConfig == null || name == null)
      return '';
    if (name?.includes?.('.gif') || noParams) {
      return `${this.imgDomain}${id}/${name}`;
    }
    let params = '?auto=compress&fit=crop';
    if (options.w || options.h) {
      params += `&dpr=1.0&fm=jpg`;
    }
    if (options.w) {
      params += `&w=${options.w}`;
    }
    if (options.h) {
      params += `&h=${options.h}`;
    }
    if (options.radius) {
      params += `&corner-radius=${options.radius},${options.radius},${options.radius},${options.radius}&mask=corners`;
    }
    if (options.fm) {
      params += `&fm=${options.fm}`;
    }
    return `${this.imgDomain}${id}/${name}${params}`;
  };
}

export default new ImageHelper();
