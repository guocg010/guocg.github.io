
export interface ExtractedInfo {
  name: string;
  partNumber: string;
  isCustomerReturn: string;
  supplierName: string;
  problemPoint: string;
  defectBatch: string;
  defectQuantity: string;
}

export interface InputFragment {
  id: string;
  text: string;
  isProcessing: boolean;
  result?: ExtractedInfo;
  error?: string;
}
