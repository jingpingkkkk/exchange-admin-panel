import { postData } from "../../utils/fetch-services";

export const updateMarket = async (request) => {
  const result = await postData("market/updateMarket", request);
  return result;
};
