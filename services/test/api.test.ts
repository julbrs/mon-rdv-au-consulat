import { extractConfig } from "../functions/lib/api";
import { ConsulateZone } from "../functions/lib/types";
import axios from "axios";
import * as fs from "fs";
import { vi, describe, it, expect, Mocked } from "vitest";

vi.mock("axios");

const consulateZone: ConsulateZone = {
  consulateName: "Montréal",
  url: "http://bla",
  active: true,
  teamId: "teamId",
  zoneId: "623e3c5319ec2e40dcf76397",
  twitterOauthToken: "twitterOauthToken",
  twitterOauthTokenSecret: "twitterOauthTokenSecret",
};

describe("test extractConfig", () => {
  it("should parse the html and extract a configuration", async () => {
    // given
    const mock = axios as Mocked<typeof axios>;
    mock.get.mockResolvedValueOnce({
      data: fs.readFileSync(`${__dirname}/resources/rendez-vous.html`),
    });

    const config = await extractConfig(consulateZone);
    expect(config).toStrictEqual({
      csrf: "lZ7Nz9aLAmFB0PBCatt0YBqpJyjHEjH4",
      days: 42,
      XGouvAppId:
        "$argon2id$v=19$m=65536,t=3,p=4$P1gZiLnu1DNTa0flSf5hzQ$7aerTzudk5tHpIcIP22NjIPJ36u7ki+ptcbI4UMwCw0",
      name: "Demande de passeport/CNI",
    });

    expect(mock.get).toHaveBeenCalledOnce();
  });
});
