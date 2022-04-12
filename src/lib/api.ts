import fetch from "node-fetch";
import { isoLocale, getServiceName } from "./utils";

const API = "https://api.consulat.gouv.fr/api/team";
const TEAM = "61f924e90b0582a933ff3e7c";

export const startSession = async () => {
  const session = await fetch(`${API}/${TEAM}/reservations-session`, {
    body: null,
    method: "POST",
  });
  return session.json();
};

export const selectService = async (session_id: string, zone_id: string) => {
  const answer = await fetch(
    `${API}/${TEAM}/reservations-session/${session_id}/update-dynamic-steps`,
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        key: "slotsSteps",
        steps: [
          {
            stepType: "slotsStep",
            name: getServiceName(zone_id),
            numberOfSlots: 1,
            dynamicStepIndex: 0,
            zone_id,
            value: {
              lastSelectedDate: "",
              label: getServiceName(zone_id),
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
  zone_id: string
) => {
  const response = await fetch(`${API}/${TEAM}/reservations/exclude-days`, {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      start: isoLocale(start),
      end: isoLocale(end),
      session: { [zone_id]: 1 },
    }),
    method: "POST",
  });
  return response.json();
};

export const updateStepValue = async (session_id: string, data: string) => {
  const result = await fetch(
    `${API}/${TEAM}/reservations-session/${session_id}/update-step-value`,
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
      method: "POST",
    }
  );
  return await result.json();
};

export const extractAvailabilities = async (
  session_id: string,
  zone_id: string,
  date: string
) => {
  const dispo = await fetch(
    `${API}/${TEAM}/reservations/avaibility?` +
      // @ts-ignore
      new URLSearchParams({
        name: getServiceName(zone_id),
        date,
        places: 1,
        maxCapacity: 1,
        matching: "",
        sessionId: session_id,
      }),
    {
      body: null,
      method: "GET",
    }
  );

  return dispo.json();
};
