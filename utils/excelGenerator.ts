
import * as XLSX from 'xlsx';
import { ExtractedInfo } from '../types';

export const downloadAsExcel = (data: ExtractedInfo[], filename: string = '质量数据报表.xlsx') => {
  // Define header row based on the specific column requirements
  // A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11, M=12, N=13
  const headers = [];
  headers[4] = '问题点';
  headers[5] = '件号';
  headers[6] = '名称';
  headers[7] = '不良批次';
  headers[8] = '数量';
  headers[9] = 'J列';
  headers[10] = '是否客服返修件';
  headers[13] = '供应商名称';

  const rows = data.map(item => {
    const row = [];
    row[4] = item.problemPoint;
    row[5] = item.partNumber;
    row[6] = item.name;
    row[7] = item.defectBatch;
    row[8] = item.defectQuantity;
    row[9] = 'NEIAS';
    row[10] = item.isCustomerReturn;
    row[13] = item.supplierName;
    return row;
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, // A-D
    { wch: 20 }, // E: 问题点
    { wch: 15 }, // F: 件号
    { wch: 15 }, // G: 名称
    { wch: 12 }, // H: 不良批次
    { wch: 10 }, // I: 数量
    { wch: 10 }, // J: NEIAS
    { wch: 15 }, // K: 是否客服返修件
    { wch: 5 }, { wch: 5 }, // L-M
    { wch: 20 }, // N: 供应商
  ];

  XLSX.writeFile(workbook, filename);
};
