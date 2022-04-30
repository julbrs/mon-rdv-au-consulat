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
  days: number;
  name: string;
}
