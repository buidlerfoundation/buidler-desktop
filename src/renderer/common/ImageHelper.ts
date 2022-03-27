type imageOptions = {
  w?: number;
  h?: number;
  radius?: number;
};

class ImageHelper {
  imgConfig: any = null;
  imgDomain?: string = '';

  initial(domain: string, config: any) {
    this.imgConfig = config;
    this.imgDomain = domain;
  }

  normalizeImage = (
    name: string,
    teamId: string,
    options: imageOptions = {},
    noParams = false
  ) => {
    if (name.includes('http')) return name;
    if (this.imgDomain === '' || this.imgConfig == null || name == null)
      return '';
    if (name.includes('.gif') || noParams) {
      return `${this.imgDomain}${teamId}/${name}`;
    }
    let params = '?auto=format&fit=crop';
    if (options.w || options.h) {
      params += `&dpr=2.0&fm=jpg&q=50`;
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
    return `${this.imgDomain}${teamId}/${name}${params}`;
  };
}

export default new ImageHelper();
