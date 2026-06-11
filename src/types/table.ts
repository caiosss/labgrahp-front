export type TableTextAlign = "left" | "center" | "right";

export interface AbntTableAppearance {
  fontFamily: string;
  fontSize: number;
  cellPadding: number;
  textAlign: TableTextAlign;
  showHorizontalBorders: boolean;
}

export interface AbntColumn {
  id: string;
  label: string;
}

export interface AbntRow {
  id: string;
  values: Record<string, string>;
}

export interface AbntTableConfig {
  title: string;
  source: string;
  appearance: AbntTableAppearance;
  columns: AbntColumn[];
  rows: AbntRow[];
}