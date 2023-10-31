import { postData, axiosPostData } from "../../utils/fetch-services";

export const getAllPromotion = async (request) => {
  const result = await postData("promotion/getAllPromotion", request);
  return result.success ? result.data : [];
};

export const deletePromotion = async (id) => {
  const result = await postData("promotion/deletePromotion", {
    _id: id,
  });
  return result.success;
};

export const getPromotionDetailByID = async (id) => {
  if (!id) {
    return null;
  }
  const result = await postData("promotion/getPromotionById", {
    _id: id,
  });
  return result.success ? result.data.details : [];
};

export const addPromotion = async (request) => {
  try {
    const result = await axiosPostData("promotion/createPromotion", request);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const updatePromotion = async (request) => {
  const result = await axiosPostData("promotion/updatePromotion", request);
  return result;
};

export const changeStatus = async (request) => {
  const result = await postData("promotion/updatePromotionStatus", request);
  return result;
};
