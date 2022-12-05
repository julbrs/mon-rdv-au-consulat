import { Cron, StackContext, Table } from "@serverless-stack/resources";
import { Duration } from "aws-cdk-lib";

export function MyStack({ stack, app }: StackContext) {
  // Table to store consulate zones
  const table = new Table(stack, "Zone", {
    fields: {
      zoneId: "string",
      teamId: "string",
      consulateName: "string",
      twitterOauthToken: "string",
      twitterOauthTokenSecret: "string",
      url: "string",
    },
    primaryIndex: { partitionKey: "zoneId" },
  });

  // Cron job to check for available appointments
  const cron = new Cron(stack, "Cron", {
    schedule: "rate(5 minutes)",
    job: {
      function: "functions/cron.main",
      timeout: Duration.seconds(10),
    },
    cdk: {
      rule: {
        // disable cron schedule if deployed locally
        enabled: !app.local,
      },
    },
  });

  cron.bind([table]);
}
