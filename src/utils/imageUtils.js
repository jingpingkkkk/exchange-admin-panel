export async function checkImageExist(url) {
  try {
    const response = await fetch(url, { mode: "no-cors" });
    if (response.ok) {
      return url;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
