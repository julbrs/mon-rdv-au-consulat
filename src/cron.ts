import {
  startSession,
  selectService,
  extractExcludeDays,
  extractAvailabilities,
} from "./lib/api";
import { extractDynamicCalendar } from "./lib/utils";

import { postTweet } from "./lib/twitter";

const ZONE_ID = "623e3c5319ec2e40dcf76397"; // passeport
//const ZONE_ID = "61f955a5456683ff9569d0bc"; // etat civil

export const main = async (_event: any) => {
  //start session
  const sessionData: any = await startSession();
  const session_id = sessionData._id;

  // select the right service
  await selectService(session_id, ZONE_ID);

  // get the dynamic calendar for the zone
  const dynamicCalendar = extractDynamicCalendar(ZONE_ID);

  //exclude days
  let start = new Date();
  let end = new Date();
  end.setDate(end.getDate() + dynamicCalendar.end.value);

  const excludeDays: any = await extractExcludeDays(start, end, ZONE_ID);

  const allDays = [];
  while (start < end) {
    allDays.push(start.toISOString().substring(0, 10));
    start.setDate(start.getDate() + 1);
  }

  const possibleDays = allDays.filter((day) => !excludeDays.includes(day));

  const availabilities = await Promise.all(
    possibleDays.map(async (day) => {
      return {
        day,
        times: await extractAvailabilities(session_id, ZONE_ID, day),
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
      `Pas de crénau disponible dans les prochains ${dynamicCalendar.end.value} jours 😢`
    );
    return 0;
  } else {
    const text = `Voici les prochains créneaux disponible! (${
      flat.length
    } au total) \n${flat
      .slice(0, 5)
      .map((e: any) => `le ${e.day} à ${e.time}`)
      .join(
        ", "
      )} ➡️ https://consulat.gouv.fr/consulat-general-de-france-a-montreal/rendez-vous`;
    const tweetResult = await postTweet(text);
    console.log(`Tweet posted! ${tweetResult}`);
  }
  return flat.length;
};
