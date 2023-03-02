
export interface IUrlData {
  url: string;
}

export interface IData {
  urlsMap: Record<string, IUrlData>
  urls: string[];
}
