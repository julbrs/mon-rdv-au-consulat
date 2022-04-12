import {
  startSession,
  selectService,
  extractExcludeDays,
  extractAvailabilities,
} from "./lib/api";

import { postTweet } from "./lib/twitter";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { ConsulateZone } from "./lib/types";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ddbClient = new DynamoDBClient({});

//const ZONE_ID = "623e3c5319ec2e40dcf76397"; // passeport
//const ZONE_ID = "61f955a5456683ff9569d0bc"; // etat civil

export const main = async () => {
  const params = {
    TableName: process.env.TABLE,
  };
  const consulateZones = await ddbClient.send(new ScanCommand(params));
  return Promise.all(
    // @ts-ignore
    consulateZones.Items?.map(async (dynamoConsulateZone) => {
      const consulateZone = unmarshall(dynamoConsulateZone) as ConsulateZone;
      return {
        consulate: consulateZone.consulateName,
        result: await checkSingleZone(consulateZone),
      };
    })
  );
};

const checkSingleZone = async (consulateZone: ConsulateZone) => {
  try {
    //start session
    const sessionData: any = await startSession(consulateZone);
    const session_id = sessionData._id;

    // select the right service
    await selectService(session_id, consulateZone);

    //exclude days
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + consulateZone.days);

    const excludeDays: any = await extractExcludeDays(
      start,
      end,
      consulateZone
    );

    const allDays = [];
    while (start <= end) {
      allDays.push(start.toISOString().substring(0, 10));
      start.setDate(start.getDate() + 1);
    }

    const possibleDays = allDays.filter((day) => !excludeDays.includes(day));

    console.log(
      `possibleDays for ${consulateZone.consulateName}:  ${possibleDays}`
    );

    const availabilities = await Promise.all(
      possibleDays.map(async (day) => {
        return {
          day,
          times: await extractAvailabilities(session_id, consulateZone, day),
        };
      })
    );

    let flat: any = [];
    availabilities.forEach((day: any) => {
      day.times.forEach((time: any) => {
        flat.push({
          day: day.day,
          time: time.time,
        });
      });
    });

    flat = flat.sort((a: any, b: any) => {
      if (a.day > b.day) {
        return 1;
      } else if (a.day < b.day) {
        return -1;
      } else if (a.time > b.time) {
        return 1;
      } else if (a.time < b.time) {
        return -1;
      }
    });
    if (flat.length === 0) {
      console.log(
        `Pas de créneau disponible dans les prochains ${consulateZone.days} jours 😢 sur ${consulateZone.consulateName}`
      );
      return 0;
    } else {
      const text = `Voici les prochains créneaux disponible! (${
        flat.length
      } au total) \n${flat
        .slice(0, 5)
        .map((e: any) => `le ${e.day} à ${e.time}`)
        .join(", ")} ➡️ ${consulateZone.url}`;
      const tweetResult = await postTweet(consulateZone, text);
      console.log(tweetResult);
      console.log(
        `Tweet posté! ${tweetResult} pour ${consulateZone.consulateName}`
      );
    }
    return flat.length;
  } catch (err) {
    console.error(err);
    return 0;
  }
};
