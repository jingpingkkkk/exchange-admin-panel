import { postData, getData } from "../../utils/fetch-services";
const { _id } = JSON.parse(localStorage.getItem("user_info")) || {};

export const getAllActiveCompetitionEvents = async (page, perPage, sortBy, direction, searchQuery) => {
  const result = await postData("competition/getAllActiveCompetitionEvents", {});
  return result.success ? result.data : [];
};

export const getEventMatchData = async (id) => {
  if (!id) {
    return null;
  }
  const result = await postData("event/getEventMatchDataFront", {
    eventId: id,
  });
  return result.success ? result.data.details : [];
};

export const matchOddsDetail = async (id) => {
  const result = await postData("cron/getMatchOdds", {
    markeId: id,
  });
  //return result.success ? result.data : [];
  return result.data;
};

export const getAllBet = async (id) => {
  const result = await postData("bet/getAllBet", {
    eventId: id,
  });
  //return result.success ? result.data : [];

  return result.success ? result.data.details.records : [];
};
export const getMatchWinLoss = async (id) => {
  const result = await postData("event/getMatchWiseWinLoss", {
    eventId: id,
    loginUserId: _id,
  });
  return result.success ? result.data.details : [];
};
