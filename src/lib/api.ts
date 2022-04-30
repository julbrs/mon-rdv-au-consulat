import { ConsulateZone, Config } from "./types";
import { isoLocale } from "./utils";
import axios from "axios";
import * as cheerio from "cheerio";

const API = "https://api.consulat.gouv.fr/api/team";

export const extractConfig = async (consulateZone: ConsulateZone) => {
  const result = await axios.get(consulateZone.url);
  const data = cheerio.load(result.data);
  const script = (data("script")[1].children[0] as any).data;
  let nuxt: any;
  eval(script.replace("window.__NUXT__", "nuxt"));
  const configRaw = nuxt.data[0].publicTeam.reservations_shop_availabilty.find(
    (item: any) => item._id === consulateZone.zoneId
  );
  const config: Config = {
    csrf: nuxt.data[0].csrf,
    days: configRaw.dynamic_calendar.end.value,
    name: configRaw.name,
  };
  return config;
};

export const startSession = async (
  consulateZone: ConsulateZone,
  csrf: string
) => {
  const session = await axios.post(
    `${API}/${consulateZone.teamId}/reservations-session`,
    null,
    {
      headers: {
        "x-csrf-token": csrf,
        "x-troov-web": "com.troov.web",
      },
    }
  );
  return session.data;
};

export const selectService = async (
  session_id: string,
  consulateZone: ConsulateZone,
  config: Config
) => {
  const answer = await axios.post(
    `${API}/${consulateZone.teamId}/reservations-session/${session_id}/update-dynamic-steps`,
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
    },
    {
      headers: {
        "content-type": "application/json",
        "x-troov-web": "com.troov.web",
      },
    }
  );

  return answer.data;
};

export const extractExcludeDays = async (
  start: Date,
  end: Date,
  consulateZone: ConsulateZone,
  session: string
) => {
  const response = await axios.post(
    `${API}/${consulateZone.teamId}/reservations/exclude-days`,
    {
      start: isoLocale(start),
      end: isoLocale(end),
      session: { [consulateZone.zoneId]: 1 },
      sessionId: session,
    },
    {
      headers: {
        "content-type": "application/json",
        "x-troov-web": "com.troov.web",
      },
    }
  );
  return response.data;
};

export const updateStepValue = async (
  session_id: string,
  data: string,
  consulateZone: ConsulateZone
) => {
  const result = await axios.post(
    `${API}/${consulateZone.teamId}/reservations-session/${session_id}/update-step-value`,
    data,
    {
      headers: {
        "content-type": "application/json",
        "x-troov-web": "com.troov.web",
      },
    }
  );
  return result.data;
};

export const extractAvailabilities = async (
  session_id: string,
  consulateZone: ConsulateZone,
  config: Config,
  date: string
) => {
  try {
    const available = await axios.get(
      `${API}/${consulateZone.teamId}/reservations/avaibility`,
      {
        params: {
          name: config.name,
          date,
          places: 1,
          maxCapacity: 1,
          matching: "",
          sessionId: session_id,
        },
        headers: {
          "x-troov-web": "com.troov.web",
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
