import type { DataPoint, GaussianPeakConfig } from "../types/chart";
import { createRandomUUID } from "./create-random-uuid";

export const generateGaussianPeak = (config: GaussianPeakConfig): DataPoint[] => {
  const xMin = Number(config.xMin);
  const xMax = Number(config.xMax);
  const peakX = Number(config.peakX);
  const amplitude = Number(config.amplitude);
  const width = Number(config.width);
  const baseline = Number(config.baseline);
  const step = Number(config.step);

  if (
    Number.isNaN(xMin) ||
    Number.isNaN(xMax) ||
    Number.isNaN(peakX) ||
    Number.isNaN(amplitude) ||
    Number.isNaN(width) ||
    Number.isNaN(baseline) ||
    Number.isNaN(step) ||
    width <= 0 ||
    step <= 0 ||
    xMax <= xMin
  ) {
    return [];
  }

  const points: DataPoint[] = [];

  for (let x = xMin; x <= xMax; x += step) {
    const y =
      baseline +
      amplitude * Math.exp(-Math.pow(x - peakX, 2) / (2 * Math.pow(width, 2)));

    points.push({
      id: createRandomUUID(),
      x: x.toFixed(2),
      y: y.toFixed(4),
    });
  }

  return points;
}