export interface IApiResponse {
  data: any;
  message: string;
  meta?: { [key: string]: any };
}
