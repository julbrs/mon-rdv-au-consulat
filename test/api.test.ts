import { extractConfig } from "../src/lib/api";
import { ConsulateZone } from "../src/lib/types";
import axios from "axios";
import * as fs from "fs";

jest.mock("axios");

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
    const mock = jest.spyOn(axios, "get");
    mock.mockReturnValueOnce(
      Promise.resolve({
        data: fs.readFileSync(`${__dirname}/resources/rendez-vous.html`),
      })
    );

    const config = await extractConfig(consulateZone);
    expect(config).toStrictEqual({
      csrf: "evvzOYAQme4XyPjIwSlSj6ntrHA3sZSg",
      days: 45,
      name: "Demande de passeport/CNI",
    });
  });
});
