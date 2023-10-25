import { postData } from "../../utils/fetch-services";

export const updateMarket = async (request) => {
  const result = await postData("market/updateMarket", request);
  return result;
};

export const getAllBetResultData = async (id) => {
  if (!id) {
    return null;
  }
  const result = await postData("event/getAllBetResultData", {
    eventId: id,
  });
  return result.success ? result.data.details : [];
};
