/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AnalysisSample {
  id: string;
  title: string;
  icon: string;
  description: string;
  csvData: string;
  defaultFocus?: string;
}

export interface CsvPreviewData {
  headers: string[];
  rows: string[][];
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}
