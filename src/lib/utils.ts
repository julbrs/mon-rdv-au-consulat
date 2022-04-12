import data from "./data";

// @ts-ignore
export const isoLocale = (date) => {
  const z = date.getTimezoneOffset() * 60 * 1000;
  let tLocal = date - z;
  // @ts-ignore
  tLocal = new Date(tLocal);
  // @ts-ignore
  let iso = tLocal.toISOString();
  return iso.slice(0, 19);
};

export const extractDynamicCalendar = (zone_id: string) => {
  const service = data.value.services.find((s) => zone_id === s.zone_id);
  if (service !== undefined) {
    return service.zone.dynamic_calendar;
  }
  throw new Error(`no service found for ${zone_id}`);
};

export const getServiceName = (zone_id: string) => {
  const service = data.value.services.find((s) => zone_id === s.zone_id);
  if (service !== undefined) {
    return service.label;
  }
  throw new Error(`no service found for ${zone_id}`);
};
