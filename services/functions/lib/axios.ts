import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { aesGcmEncrypt } from "./crypto-aes-gcm";
import { Config } from "./types";
dayjs.extend(utc);
dayjs.extend(timezone);

export const getAxiosInstance = async (config: Config) => {
  const today = dayjs().tz("Europe/Paris");
  const ciphertext = await aesGcmEncrypt(
    `c0m.7rÔ°v.T7c.90uv-${today.format("DDYYYYMM")}_${today.format("HH")}`,
    config.hmc_key
  );

  return axios.create({
    baseURL: "https://api.consulat.gouv.fr/api/team",
    headers: {
      "x-csrf-token": config.csrf,
      "x-gouv-app-id": `gouv/=/${ciphertext}-ttc`,
    },
  });
};
