import { ConsulateZone, Config } from "./types";
import { isoLocale } from "./utils";
import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import { getAxiosInstance } from "./axios";

const API = "https://api.consulat.gouv.fr/api/team";

export const extractConfig = async (consulateZone: ConsulateZone) => {
  const result = await axios.get(consulateZone.url);
  const data = cheerio.load(result.data);

  // extract the first <script> tag that have a children (no src attr)
  const nuxt_script = data("script")
    .filter((i, el) => {
      return el.children.length === 1;
    })
    .toArray();

  const script = (nuxt_script[0].children[0] as any).data;

  let nuxt: any;
  eval(script.replace("window.__NUXT__", "nuxt"));
  const configRaw = nuxt.data[0].publicTeam.reservations_shop_availabilty.find(
    (item: any) => item._id === consulateZone.zoneId
  );
  const config: Config = {
    csrf: nuxt.data[0].csrf,
    hmc_key: nuxt.config.HMC_KEY,
    days: configRaw.dynamic_calendar.end.value,
    name: configRaw.name,
  };
  console.log("Get a config!");
  return config;
};

export const startSession = async (
  consulateZone: ConsulateZone,
  client: AxiosInstance
) => {
  const session = await client.post(
    `${consulateZone.teamId}/reservations-session`,
    { sessionId: null }
  );
  console.log("Get a session!");
  return session.data;
};

export const selectService = async (
  session_id: string,
  consulateZone: ConsulateZone,
  config: Config,
  client: AxiosInstance
) => {
  const answer = await client.post(
    `${consulateZone.teamId}/reservations-session/${session_id}/update-dynamic-steps`,
    {
      key: "slotsSteps",
      steps: [
        {
          stepType: "slotsStep",
          name: config.name,
          numberOfSlots: 1,
          dynamicStepIndex: 0,
          zone_id: consulateZone.zoneId,
          value: {
            lastSelectedDate: "",
            label: config.name,
            accessibleCalendar: false,
            hasSwitchedCalendar: false,
            slots: {},
          },
        },
      ],
    }
  );
  console.log("Get a service!");
  return answer.data;
};

export const extractExcludeDays = async (
  start: Date,
  end: Date,
  consulateZone: ConsulateZone,
  session: string,
  client: AxiosInstance
) => {
  const response = await client.post(
    `${consulateZone.teamId}/reservations/exclude-days`,
    {
      start: isoLocale(start),
      end: isoLocale(end),
      session: { [consulateZone.zoneId]: 1 },
      sessionId: session,
    }
  );
  console.log("Get exclude days!");

  return response.data;
};

export const extractAvailabilities = async (
  session_id: string,
  consulateZone: ConsulateZone,
  config: Config,
  date: string,
  client: AxiosInstance
) => {
  try {
    const available = await client.get(
      `${consulateZone.teamId}/reservations/availability`,
      {
        params: {
          name: config.name,
          date,
          places: 1,
          maxCapacity: 1,
          matching: "",
          sessionId: session_id,
        },
        timeout: 800,
      }
    );
    return available.data;
  } catch (err) {
    if (err instanceof Error) {
      console.log(`${consulateZone.consulateName} - ${date}: ${err.message}`);
    } else {
      console.log(`${consulateZone.consulateName} - ${date}: ${err}`);
    }
    return [];
  }
};
