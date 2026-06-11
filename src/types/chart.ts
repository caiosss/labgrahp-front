export type ChartMode = "markers" | "lines" | "lines+markers";

export type AxisTickMode = "step" | "custom";

export type MarkerSymbol =
    | "circle"
    | "square"
    | "diamond"
    | "cross"
    | "x"
    | "triangle-up"
    | "triangle-down";

export type LineDash =
    | "solid"
    | "dash"
    | "dot"
    | "dashdot";

export type LineShape = "linear" | "spline";

export type SeriesType = "manual" | "gaussian-peak";

export interface DataPoint {
    id: string;
    x: string;
    y: string;
}

export interface ChartAxisConfig {
    label: string;
    unit: string;
    min: string;
    max: string;
    tickStep: string;
    tickMode: AxisTickMode;
    tickValues: string;
}

export interface ChartSeries {
  id: string;
  type: SeriesType;

  name: string;
  color: string;

  markerSize: string;
  markerSymbol: MarkerSymbol;

  lineWidth: string;
  lineDash: LineDash;
  lineShape: LineShape;

  points: DataPoint[];

  gaussianPeak?: GaussianPeakConfig;
}

export interface ChartConfig {
    title: string;
    xAxis: ChartAxisConfig;
    yAxis: ChartAxisConfig;
    mode: ChartMode;
    showGrid: boolean;
    showLegend: boolean;
    appearance: ChartAppearance;
    series: ChartSeries[];
}

export interface ChartAppearance {
    width: string;
    height: string;
    titleFontSize: string;
    fontFamily: string;
    plotBackgroundColor: string;
    paperBackgroundColor: string;
}

export interface GaussianPeakConfig {
  xMin: string;
  xMax: string;
  peakX: string;
  amplitude: string;
  width: string;
  baseline: string;
  step: string;
}