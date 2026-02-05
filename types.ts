
export type TabType = 'scientific' | 'fluid' | 'ai' | 'mechanics';

export interface FluidCalculationResult {
  formula: string;
  result: number;
  unit: string;
  label: string;
  steps?: string[];
}

export interface HistoryItem {
  id: string;
  type: 'scientific' | 'fluid' | 'ai' | 'mechanics';
  expression: string;
  result: string;
  timestamp: Date;
}
