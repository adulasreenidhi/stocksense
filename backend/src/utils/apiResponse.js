export const ok = (res, data, meta, status = 200) =>
  res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });

export const fail = (res, message, status = 400, errors = []) =>
  res.status(status).json({ success: false, message, errors });
