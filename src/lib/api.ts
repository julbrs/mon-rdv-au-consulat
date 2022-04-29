import fetch from "node-fetch";
import { ConsulateZone } from "./types";
import { isoLocale } from "./utils";
import axios from "axios";
import * as cheerio from "cheerio";

const API = "https://api.consulat.gouv.fr/api/team";

export const extractCSRF = async (consulateZone: ConsulateZone) => {
  const result = await axios.get(consulateZone.url);
  const data = cheerio.load(result.data);
  const script = (data("script")[1].children[0] as any).data;
  let nuxt: any;
  eval(script.replace("window.__NUXT__", "nuxt"));
  return nuxt.data[0].csrf;
};

export const startSession = async (
  consulateZone: ConsulateZone,
  csrf: string
) => {
  const session = await fetch(
    `${API}/${consulateZone.teamId}/reservations-session`,
    {
      body: null,
      method: "POST",
      headers: {
        "x-csrf-token": csrf,
        "x-troov-web": "com.troov.web",
      },
    }
  );
  return session.json();
};

export const selectService = async (
  session_id: string,
  consulateZone: ConsulateZone
) => {
  const answer = await fetch(
    `${API}/${consulateZone.teamId}/reservations-session/${session_id}/update-dynamic-steps`,
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        key: "slotsSteps",
        steps: [
          {
            stepType: "slotsStep",
            name: consulateZone.zoneName,
            numberOfSlots: 1,
            dynamicStepIndex: 0,
            zone_id: consulateZone.zoneId,
            value: {
              lastSelectedDate: "",
              label: consulateZone.zoneName,
              accessibleCalendar: false,
              hasSwitchedCalendar: false,
              slots: {},
            },
          },
        ],
      }),
      method: "POST",
    }
  );

  return answer.json();
};

export const extractExcludeDays = async (
  start: Date,
  end: Date,
  consulateZone: ConsulateZone,
  session: string
) => {
  const response = await fetch(
    `${API}/${consulateZone.teamId}/reservations/exclude-days`,
    {
      headers: {
        "content-type": "application/json",
        "x-troov-web": "com.troov.web",
      },
      body: JSON.stringify({
        start: isoLocale(start),
        end: isoLocale(end),
        session: { [consulateZone.zoneId]: 1 },
        sessionId: session,
      }),
      method: "POST",
    }
  );
  return response.json();
};

export const updateStepValue = async (
  session_id: string,
  data: string,
  consulateZone: ConsulateZone
) => {
  const result = await fetch(
    `${API}/${consulateZone.teamId}/reservations-session/${session_id}/update-step-value`,
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
      method: "POST",
    }
  );
  return result.json();
};

export const extractAvailabilities = async (
  session_id: string,
  consulateZone: ConsulateZone,
  date: string
) => {
  try {
    const available = await axios.get(
      `${API}/${consulateZone.teamId}/reservations/avaibility`,
      {
        params: {
          name: consulateZone.zoneName,
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
