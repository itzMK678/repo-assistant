import { getHealthStatus } from "../services/health.service.js";

export const healthCheck = async (req, res, next) => {
  try {
    const health = await getHealthStatus();

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};