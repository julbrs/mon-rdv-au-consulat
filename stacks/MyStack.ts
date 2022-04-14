import * as sst from "@serverless-stack/resources";
import { Cron, Table, TableFieldType } from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const table = new Table(this, "Zone", {
      fields: {
        zoneId: TableFieldType.STRING,
        teamId: TableFieldType.STRING,
        consulateName: TableFieldType.STRING,
        twitterOauthToken: TableFieldType.STRING,
        twitterOauthTokenSecret: TableFieldType.STRING,
        days: TableFieldType.NUMBER,
        url: TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "zoneId" },
    });

    new Cron(this, "Cron", {
      schedule: "rate(5 minutes)",
      job: {
        handler: "src/cron.main",
        timeout: 10,
        environment: { TABLE: table.tableName },
        permissions: [table],
      },
      eventsRule: {
        // disable cron schedule if deployed locally
        enabled: !scope.local,
      },
    });
  }
}
