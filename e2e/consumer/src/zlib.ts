const unavailable = () => {
  throw new Error("zlib is not available in the browser");
};
export const gunzipSync = unavailable;
export const gzipSync = unavailable;
export const constants = {};
export default { gunzipSync, gzipSync, constants };
