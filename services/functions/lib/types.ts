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
  hmc_key: string;
  days: number;
  name: string;
}
