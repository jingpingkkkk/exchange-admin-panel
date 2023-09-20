import { getData, postData } from "../../utils/fetch-services";

export const getAllSport = async (page, perPage, sortBy, direction, searchQuery) => {
  const result = await postData("sport/getAllSport", {
    page: page,
    perPage: perPage,
    sortBy: sortBy,
    direction: direction,
    searchQuery: searchQuery,
  });
  return result.success ? result.data : [];
};

export const getAllActiveSport = async (page, perPage, sortBy, direction, searchQuery) => {
  const result = await postData("sport/getAllSport", {
    page: page,
    perPage: perPage,
    sortBy: sortBy,
    direction: direction,
    searchQuery: searchQuery,
    status: "true",
  });
  return result.success ? result.data : [];
};

export const deleteSport = async (id) => {
  const result = await postData("sport/deleteSport", {
    _id: id,
  });
  return result.success;
};

export const getSportDetailByID = async (id) => {
  if (!id) {
    return null;
  }
  const result = await postData("sport/getSportById", {
    _id: id,
  });
  return result.success ? result.data.details : [];
};

export const addSport = async (request) => {
  try {
    const result = await postData("sport/createSport", request);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const updateSport = async (request) => {
  const result = await postData("sport/updateSport", request);
  return result;
};

export const changeStatus = async (request) => {
  const result = await postData("sport/changeStatus", request);
  return result;
};

export const getBetCategory = async () => {
  const result = await getData("sport/getBetCategory");
  return result.success ? result.data.details : [];
};

export const getBetCategoryListBySportID = async (request) => {
  const result = await postData("sportsBetCategories/getAllSportsBetCategory", request);
  return result.success ? result.data : [];
};

export const getBetCategorySettingByID = async (id) => {
  const result = await postData("sportsBetCategories/getSportsBetCategoryById", {
    _id: id,
  });
  return result.success ? result.data.details : [];
};

export const updateBetCategorySetting = async (request) => {
  const result = await postData("sportsBetCategories/updateSportsBetCategory", request);
  return result.success ? result.data.details : [];
};
