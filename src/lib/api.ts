import fetch from "node-fetch";
import { ConsulateZone } from "./types";
import { isoLocale } from "./utils";

const API = "https://api.consulat.gouv.fr/api/team";

export const startSession = async (consulateZone: ConsulateZone) => {
  const session = await fetch(
    `${API}/${consulateZone.teamId}/reservations-session`,
    {
      body: null,
      method: "POST",
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
  consulateZone: ConsulateZone
) => {
  const response = await fetch(
    `${API}/${consulateZone.teamId}/reservations/exclude-days`,
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        start: isoLocale(start),
        end: isoLocale(end),
        session: { [consulateZone.zoneId]: 1 },
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
  return await result.json();
};

export const extractAvailabilities = async (
  session_id: string,
  consulateZone: ConsulateZone,
  date: string
) => {
  const available = await fetch(
    `${API}/${consulateZone.teamId}/reservations/avaibility?` +
      // @ts-ignore
      new URLSearchParams({
        name: consulateZone.zoneName,
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

  return available.json();
};
