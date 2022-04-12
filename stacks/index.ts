import MyStack from "./MyStack";
import * as sst from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export default function main(app: sst.App): void {
  // Remove all resources when stage is removed (but not on prod!)
  if (app.stage !== "prod") {
    app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
  }
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
    logRetention: RetentionDays.ONE_WEEK,
    environment: {
      TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY!,
      TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET!,
    },
  });

  new MyStack(app, "app", {
    tags: {
      costcenter: "mon-rdv-au-consulat",
    },
  });

  // Add more stacks
}
