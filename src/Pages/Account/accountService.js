import CryptoJS from "crypto-js";
import { postData } from "../../utils/fetch-services";

export const user = JSON.parse(localStorage.getItem("user_info"));

export const getAllData = async (request) => {
  const result = await postData("users/getAllUsers", request);
  return result.success ? result.data : [];
};

export const deleteData = async (id) => {
  const result = await postData("users/deleteUser", {
    _id: id,
  });
  return result.success;
};

export const getDetailByID = async (id, fields = null) => {
  if (!id) {
    return null;
  }
  const result = await postData("users/getUserById", {
    _id: id,
    fields,
  });
  return result.success ? result.data.details : {};
};

export const getUserDetails = async (fields = null) => {
  const result = await postData("users/getUserDetails", { fields });
  return result.success ? result.data.details : {};
};

export const addData = async (request) => {
  const result = await postData("users/createUser", request);
  return result;
};

export const updateData = async (request) => {
  const result = await postData("users/updateUser", request);
  return result;
};

export const createCloneUser = async (request) => {
  const result = await postData("users/createUserClone", request);
  return result;
};

export const updateUserStatus = async (request) => {
  const result = await postData("users/updateUserStatus", request);
  return result;
};

// Decrypt with CryptoJS AES
export const decryptUserPermissions = (encryptedPermissions) => {
  try {
    if (!encryptedPermissions) {
      return [];
    }
    const bytes = CryptoJS.AES.decrypt(encryptedPermissions, process.env.REACT_APP_PERMISSIONS_AES_SECRET);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

export const getUserDefaultPermissions = async () => {
  const result = await postData("permission/getDefaultUserPermissions");
  if (result.success) {
    const permissions = decryptUserPermissions(result.data);
    return permissions;
  }
  return [];
};

export const getUserPermissionModules = async (id) => {
  const result = await postData("permission/getUserPermissionModules", { userId: id });
  if (result.success) {
    const permissions = decryptUserPermissions(result.data);
    return permissions;
  }
  return [];
};

export const getUserPermissions = async (id) => {
  if (id) {
    return await getUserPermissionModules(id);
  }
  return await getUserDefaultPermissions();
};

export const getPermissionsById = async (id) => {
  if (id) {
    const result = await postData("permission/getUserActivePermissions", { userId: id });
    if (result.success) {
      return decryptUserPermissions(result.data);
    }
  }
  return [];
};

export const createTransaction = async (request) => {
  const result = await postData("transactionActivity/createTransaction", request);
  return result;
};



export const getUserActivity = async (request) => {
  const result = await postData('users/getUserActivity', request);
  return result.success ? result.data : [];
};


export const getSuperAdminMasters = async (id) => {
  if (!id) {
    return null;
  }
  const result = await postData("users/getSuperAdminMasters", {
    _id: id
  });
  return result.success ? result.data : {};
};

