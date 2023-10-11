import { postData } from "../../utils/fetch-services";

export const syncData = async (fields = null) => {
  const result = await postData("cron/syncData", { fields });
  return result;
};

export const getAllActiveEvents = async (fields = null) => {
  const result = await postData("cron/getActiveEvent", { fields });
  return result;
};
