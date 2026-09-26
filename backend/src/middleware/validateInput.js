import { fail } from '../utils/apiResponse.js';

const missing = (value) => value === undefined || value === null || value === '';

export function validateBody({ required = [], arrays = [], positive = [], nonNegative = [] } = {}) {
  return (req, res, next) => {
    const errors = [];

    for (const field of required) {
      if (missing(req.body[field])) errors.push(`${field} is required`);
    }

    for (const field of arrays) {
      if (req.body[field] !== undefined && (!Array.isArray(req.body[field]) || req.body[field].length === 0)) {
        errors.push(`${field} must be a non-empty array`);
      }
    }

    if (req.body.lines !== undefined) {
      if (!Array.isArray(req.body.lines) || req.body.lines.length === 0) {
        errors.push('lines must be a non-empty array');
      } else {
        req.body.lines.forEach((line, index) => {
          if (missing(line.product)) errors.push(`lines[${index}].product is required`);
          if (typeof line.qty !== 'number' || !Number.isFinite(line.qty) || line.qty <= 0) {
            errors.push(`lines[${index}].qty must be greater than 0`);
          }
        });
      }
    }

    for (const field of positive) {
      if (req.body[field] !== undefined &&
        (typeof req.body[field] !== 'number' || !Number.isFinite(req.body[field]) || req.body[field] <= 0)) {
        errors.push(`${field} must be greater than 0`);
      }
    }

    for (const field of nonNegative) {
      if (req.body[field] !== undefined &&
        (typeof req.body[field] !== 'number' || !Number.isFinite(req.body[field]) || req.body[field] < 0)) {
        errors.push(`${field} must be zero or greater`);
      }
    }

    if (errors.length) return fail(res, 'Validation failed', 400, errors);
    return next();
  };
}