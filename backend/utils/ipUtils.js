export const resolveClientIpFromReq = (req) => {
  const xf = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];
  if (xf) {
    const s = Array.isArray(xf) ? xf[0] : String(xf);
    return s.split(",")[0].trim();
  }
  return (
    req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || null
  );
};

export default { resolveClientIpFromReq };
