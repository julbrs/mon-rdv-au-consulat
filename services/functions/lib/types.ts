export interface ConsulateZone {
  zoneId: string;
  teamId: string;
  consulateName: string;
  twitterOauthToken: string;
  twitterOauthTokenSecret: string;
  url: string;
  active: boolean;
}

export interface Config {
  csrf: string;
  XGouvAppId: string;
  days: number;
  name: string;
}
