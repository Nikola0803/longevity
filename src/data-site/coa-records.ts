export interface CoaRecord {
  batchCode: string;
  product: string;
  category: string;
  purity: string;
  testDate: string;
  labRef: string;
}

/**
 * COA archive, sorted newest-first. This is the single source of truth for
 * both the public /coa archive grid and the /verify/[slug] QR-scan landing
 * page. Add a new entry here whenever a batch clears testing — nothing else
 * needs to change, since QR codes printed on vial labels encode a stable
 * per-product URL (/verify/{slug}) rather than a batch-specific one, and
 * /verify always resolves to whichever record is newest for that product.
 * That's what lets bulk-printed labels stay valid across batches without
 * a reprint.
 */
export const COA_RECORDS: CoaRecord[] = [
  { batchCode: "NVR-24-1112-A", product: "MOTS-c", category: "Fat Loss & Metabolic", purity: "99.19%", testDate: "2024-11-12", labRef: "JAN-2024-11-4791" },
  { batchCode: "NVR-24-1111-C", product: "Longevity Stack", category: "Peptide Blends", purity: "99.60%", testDate: "2024-11-11", labRef: "SIM-2024-11-2231" },
  { batchCode: "NVR-24-1110-B", product: "NAD+", category: "Longevity", purity: "99.81%", testDate: "2024-11-10", labRef: "JAN-2024-11-4788" },
  { batchCode: "NVR-24-1109-B", product: "Semaglutide", category: "Fat Loss & Metabolic", purity: "99.38%", testDate: "2024-11-09", labRef: "JAN-2024-11-4785" },
  { batchCode: "NVR-24-1108-A", product: "Semaglutide", category: "Fat Loss & Metabolic", purity: "99.42%", testDate: "2024-11-08", labRef: "JAN-2024-11-4782" },
  { batchCode: "NVR-24-1107-B", product: "Recovery Stack", category: "Peptide Blends", purity: "99.51%", testDate: "2024-11-07", labRef: "SIM-2024-11-2227" },
  { batchCode: "NVR-24-1106-A", product: "Ipamorelin", category: "Recovery & Repair", purity: "99.35%", testDate: "2024-11-06", labRef: "ANR-2024-11-1163" },
  { batchCode: "NVR-24-1105-D", product: "GHK-Cu", category: "Longevity", purity: "99.74%", testDate: "2024-11-05", labRef: "JAN-2024-11-4776" },
  { batchCode: "NVR-24-1104-D", product: "CJC-1295", category: "Recovery & Repair", purity: "99.55%", testDate: "2024-11-04", labRef: "ANR-2024-11-1159" },
  { batchCode: "NVR-24-1102-C", product: "BPC-157", category: "Recovery & Repair", purity: "99.68%", testDate: "2024-11-02", labRef: "ANR-2024-11-1155" },
  { batchCode: "NVR-24-1101-A", product: "Semax", category: "Cognitive", purity: "99.27%", testDate: "2024-11-01", labRef: "JAN-2024-11-4768" },
  { batchCode: "NVR-24-1029-B", product: "TB-500", category: "Recovery & Repair", purity: "99.51%", testDate: "2024-10-29", labRef: "ANR-2024-10-1148" },
  { batchCode: "NVR-24-1027-C", product: "Selank", category: "Cognitive", purity: "99.45%", testDate: "2024-10-27", labRef: "JAN-2024-10-4751" },
  { batchCode: "NVR-24-1026-E", product: "Retatrutide", category: "Fat Loss & Metabolic", purity: "99.44%", testDate: "2024-10-26", labRef: "JAN-2024-10-4747" },
  { batchCode: "NVR-24-1024-A", product: "Epitalon", category: "Longevity", purity: "99.60%", testDate: "2024-10-24", labRef: "SIM-2024-10-2198" },
  { batchCode: "NVR-24-1023-AC", product: "Bacteriostatic Water", category: "Accessories", purity: "USP Grade", testDate: "2024-10-23", labRef: "ANR-2024-10-1139" },
  { batchCode: "NVR-24-1019-D", product: "NSI-189", category: "Cognitive", purity: "99.59%", testDate: "2024-10-19", labRef: "JAN-2024-10-4732" },
  { batchCode: "NVR-24-1031-F", product: "Tirzepatide", category: "Fat Loss & Metabolic", purity: "99.62%", testDate: "2024-10-31", labRef: "JAN-2024-10-4759" },
];

/** Latest (by testDate) COA on file for a given product name, if any. */
export function getLatestCoaForProduct(productName: string): CoaRecord | undefined {
  const name = productName.trim().toLowerCase();
  const matches = COA_RECORDS.filter((r) => r.product.trim().toLowerCase() === name);
  if (matches.length === 0) return undefined;
  return [...matches].sort((a, b) => (a.testDate < b.testDate ? 1 : -1))[0];
}
