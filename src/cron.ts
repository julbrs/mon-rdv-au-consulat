import {
  startSession,
  selectService,
  extractExcludeDays,
  extractAvailabilities,
  extractConfig,
} from "./lib/api";

import { postTweet } from "./lib/twitter";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { ConsulateZone } from "./lib/types";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ddbClient = new DynamoDBClient({});

export const main = async () => {
  const params = {
    TableName: process.env.TABLE,
  };
  const consulateZones = await ddbClient.send(new ScanCommand(params));
  return Promise.all(
    // @ts-ignore
    consulateZones.Items?.map(async (dynamoConsulateZone) => {
      const consulateZone = unmarshall(dynamoConsulateZone) as ConsulateZone;
      if (consulateZone.active) {
        return {
          consulate: consulateZone.consulateName,
          result: await checkSingleZone(consulateZone),
        };
      } else {
        return {
          consulate: consulateZone.consulateName,
          result: "inactive",
        };
      }
    })
  );
};

const checkSingleZone = async (consulateZone: ConsulateZone) => {
  try {
    // get config fron homepage
    const config = await extractConfig(consulateZone);

    //start session
    const sessionData: any = await startSession(consulateZone, config.csrf);
    const session_id = sessionData._id;

    // select the right service
    await selectService(session_id, consulateZone, config);

    //exclude days
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + config.days);

    const excludeDays: any = await extractExcludeDays(
      start,
      end,
      consulateZone,
      session_id
    );
    const allDays = [];
    while (start <= end) {
      allDays.push(start.toISOString().substring(0, 10));
      start.setDate(start.getDate() + 1);
    }

    const possibleDays = allDays.filter((day) => !excludeDays.includes(day));

    const availabilities = await Promise.all(
      possibleDays.map(async (day) => {
        return {
          day,
          times: await extractAvailabilities(
            session_id,
            consulateZone,
            config,
            day
          ),
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
        `Pas de créneau disponible dans les prochains ${config.days} jours 😢 sur ${consulateZone.consulateName}`
      );
      return 0;
    } else {
      const text = `Voici les prochains créneaux disponible! (${
        flat.length
      } au total) \n${flat
        .slice(0, 5)
        .map((e: any) => `le ${e.day} à ${e.time}`)
        .join(", ")} ➡️ ${consulateZone.url}?name=${encodeURI(config.name)}`;
      console.log(`Envoi tweet pour ${consulateZone.consulateName}: ${text}`);
      await postTweet(consulateZone, text);
    }
    return flat.length;
  } catch (err) {
    //console.error(err);
    // @ts-ignore
    console.error(`Erreur pour ${consulateZone.consulateName}: ${err.message}`);
    return 0;
  }
};
