import * as sst from "@serverless-stack/resources";
import { Cron } from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    new Cron(this, "Cron", {
      schedule: "rate(5 minutes)",
      job: "src/cron.main",
      eventsRule: {
        // disable cron schedule if deployed locally
        enabled: !scope.local,
      },
    });
  }
}
