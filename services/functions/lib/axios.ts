import axios from "axios";
import { Config } from "./types";

export const getAxiosInstance = async (config: Config) => {
  return axios.create({
    baseURL: "https://api.consulat.gouv.fr/api/team",
    headers: {
      "x-csrf-token": config.csrf,
      "x-gouv-app-id": `fr.gouv$+${config.XGouvAppId}-meae-ttc`,
    },
  });
};
