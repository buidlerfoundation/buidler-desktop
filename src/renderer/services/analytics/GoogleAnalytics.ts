class GoogleAnalytics {
  init() {}

  tracking(eventName: string, props: { [key: string]: string }) {}

  trackingError(
    apiUrl: string,
    method: string,
    errorMessage: string,
    statusCode: number,
    reqBody?: any
  ) {}
}

export default new GoogleAnalytics();
