import { MyStack } from "./MyStack";
import * as sst from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";

export default function (app: sst.App): void {
  // Remove all resources when stage is removed (but not on prod!)
  if (app.stage !== "prod") {
    app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
  }
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm",
    },
    logRetention: "one_week",
    environment: {
      TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY!,
      TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET!,
    },
  });

  // Create the stack
  app.stack(MyStack, {
    id: "app",
    tags: {
      costcenter: "mon-rdv-au-consulat",
    },
  });
}
