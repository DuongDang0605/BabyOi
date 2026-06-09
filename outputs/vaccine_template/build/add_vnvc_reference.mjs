import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = "C:/Users/Admin/ReactNative/BabyOi/outputs/vaccine_template";
const inputPath = path.join(outputDir, "babyoi_vaccine_data_template.xlsx");
const outputPath = path.join(outputDir, "babyoi_vaccine_data_template_vnvc_reference.xlsx");

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

function colLetter(index) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

function getFreshSheet(name) {
  try {
    workbook.worksheets.getItem(name).delete();
  } catch {}
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  return sheet;
}

function writeSheet(name, titleText, subtitle, headers, rows, widths = []) {
  const sheet = getFreshSheet(name);
  const last = colLetter(Math.max(headers.length - 1, 7));
  const title = sheet.getRange(`A1:${last}1`);
  title.merge();
  title.values = [[titleText]];
  title.format = { fill: "#1D4ED8", font: { bold: true, color: "#FFFFFF", size: 15 }, wrapText: true };
  title.format.rowHeightPx = 34;

  const sub = sheet.getRange(`A2:${last}2`);
  sub.merge();
  sub.values = [[subtitle]];
  sub.format = { fill: "#DBEAFE", font: { italic: true, color: "#1E3A8A" }, wrapText: true };
  sub.format.rowHeightPx = 54;

  const header = sheet.getRangeByIndexes(2, 0, 1, headers.length);
  header.values = [headers];
  header.format = { fill: "#1E40AF", font: { bold: true, color: "#FFFFFF" }, wrapText: true };
  header.format.borders = { preset: "all", style: "thin", color: "#CBD5E1" };

  if (rows.length > 0) {
    const data = sheet.getRangeByIndexes(3, 0, rows.length, headers.length);
    data.values = rows;
    data.format = { wrapText: true };
    data.format.borders = { preset: "all", style: "thin", color: "#E2E8F0" };
  }

  try {
    const table = sheet.tables.add(sheet.getRangeByIndexes(2, 0, Math.max(rows.length + 1, 2), headers.length), true, `${name.replace(/[^A-Za-z0-9]/g, "_")}Table`);
    table.style = "TableStyleMedium2";
  } catch {}

  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
  sheet.freezePanes.freezeRows(3);
  return sheet;
}

const packageUrl = "https://vnvc.vn/goi-vac-xin-danh-cho-tre-em/";
const scheduleUrl = "https://vnvc.vn/lich-tiem-chung-day-du-nhat-cho-tre-theo-tung-thang-tuoi/";

writeSheet(
  "vnvc_sources",
  "VNVC sources",
  "Nguon da dung de tong hop. Cac dong staging chi nen import sang DB sau khi doi chieu lai voi bang goc hoac anh chup neu can.",
  ["source_key", "url", "used_for", "extraction_status", "caution"],
  [
    ["package_page", packageUrl, "Danh muc goi, ma tran so mui, gia goi, uu dai, qua tang.", "Doc duoc text tren trang; da dua vao sheet staging.", "Ma tran goi khong cho biet tung mui 1/2/3 tiem o thang nao."],
    ["schedule_page", scheduleUrl, "Moc tuoi tiem va nhan mui/lieu theo thang.", "Doc duoc text tren trang; da dua vao sheet reference.", "Lich theo nhom benh/vaccine, khong phai lich rieng cua tung goi thuong mai."],
  ],
  [140, 420, 300, 220, 420],
);

const scheduleRows = [
  ["so_sinh", 0, "So sinh / trong 24h dau", "Lao", "BCG", "Mui 1", scheduleUrl, "Lich tiem phong cho tre so sinh"],
  ["so_sinh", 0, "So sinh / trong 24h dau", "Viem gan B", "Vaccine viem gan B so sinh", "Mui so sinh trong 24h", scheduleUrl, "Lich tiem phong cho tre so sinh"],
  ["6_tuan", "", "6 tuan", "6 trong 1", "Infanrix Hexa; Hexaxim", "Mui 1", scheduleUrl, "Trang ghi tre tu 6 tuan tuoi"],
  ["6_tuan", "", "6 tuan", "Tieu chay cap do Rotavirus", "Rotarix; Rotateq; Rotavin", "Lieu 1", scheduleUrl, "Trang ghi tre tu 6 tuan tuoi"],
  ["6_tuan", "", "6 tuan", "Phe cau", "Synflorix; Prevenar 13; Vaxneuvance; Prevenar 20", "Mui 1", scheduleUrl, "Trang ghi tre tu 6 tuan tuoi"],
  ["6_tuan", "", "6 tuan", "Nao mo cau ACYW-135", "Nimenrix; MenQuadfi", "Mui 1", scheduleUrl, "Trang ghi tre tu 6 tuan tuoi"],
  ["2_thang", 2, "2 thang", "Nao mo cau nhom B", "Bexsero", "Mui 1", scheduleUrl, "Trang ghi den luc tre 2 thang tuoi"],
  ["3_thang", 3, "3 thang", "6 trong 1", "Infanrix Hexa; Hexaxim", "Mui 2", scheduleUrl, "Muc tre 3 thang tuoi"],
  ["3_thang", 3, "3 thang", "Tieu chay cap do Rotavirus", "Rotarix; Rotateq; Rotavin", "Lieu 2", scheduleUrl, "Muc tre 3 thang tuoi"],
  ["3_thang", 3, "3 thang", "Phe cau", "Synflorix; Prevenar 13; Vaxneuvance; Prevenar 20", "Mui 2", scheduleUrl, "Muc tre 3 thang tuoi"],
  ["4_thang", 4, "4 thang", "6 trong 1", "Infanrix Hexa; Hexaxim", "Mui 3", scheduleUrl, "Muc tre 4 thang tuoi"],
  ["4_thang", 4, "4 thang", "Tieu chay cap do Rotavirus", "Rotarix; Rotateq; Rotavin", "Lieu 3", scheduleUrl, "Muc tre 4 thang tuoi"],
  ["4_thang", 4, "4 thang", "Phe cau", "Synflorix; Prevenar 13; Vaxneuvance; Prevenar 20", "Mui 3", scheduleUrl, "Muc tre 4 thang tuoi"],
  ["4_thang", 4, "4 thang", "Nao mo cau nhom B", "Bexsero", "Mui 2", scheduleUrl, "Muc tre 4 thang tuoi"],
  ["4_thang", 4, "4 thang", "Nao mo cau ACYW-135", "Nimenrix; MenQuadfi", "Mui 2", scheduleUrl, "Muc tre 4 thang tuoi"],
  ["6_thang", 6, "6 thang", "Cum mua", "Vaxigrip Tetra; Influvac Tetra; GCFlu Quadrivalent; Ivacflu-S", "Mui 1", scheduleUrl, "Muc tre 6 thang tuoi"],
  ["6_thang", 6, "6 thang", "Nao mo cau B+C", "VA-MENGOC-BC", "Mui 1 neu chua tiem Bexsero", scheduleUrl, "Muc tre 6 thang tuoi"],
  ["6_thang", 6, "6 thang", "Nao mo cau ACYW-135", "MenQuadfi", "Mui 3", scheduleUrl, "Muc tre 6 thang tuoi"],
  ["9_thang", 9, "9 thang", "Nao mo cau ACYW-135", "Menactra", "Mui 1 neu chua tiem truoc do", scheduleUrl, "Muc tre 9 thang tuoi"],
  ["9_thang", 9, "9 thang", "Thuy dau", "Varilrix", "Mui 1", scheduleUrl, "Muc tre 9 thang tuoi"],
  ["9_thang", 9, "9 thang", "Viem nao Nhat Ban", "Imojev", "Mui 1", scheduleUrl, "Muc tre 9 thang tuoi"],
  ["9_thang", 9, "9 thang", "Soi", "MVVac", "Mui 1", scheduleUrl, "Muc tre 9 thang tuoi"],
  ["9_thang", 9, "9 thang", "Soi - quai bi - rubella", "Priorix", "Mui 1", scheduleUrl, "Muc tre 9 thang tuoi"],
  ["12_thang", 12, "12 thang", "Soi - quai bi - rubella", "Priorix", "Mui 1 neu chua tiem / Mui 2 neu da tiem luc 9 thang", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Soi - quai bi - rubella", "MMR-II", "Mui 1 neu chua tiem Priorix", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Soi - quai bi - rubella - thuy dau", "ProQuad", "Mui 1 theo tu van bac si", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Thuy dau", "Varilrix", "Mui 2", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Thuy dau", "Varivax; Varicella; Barycela", "Mui 1 neu chua tiem Varilrix", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Viem nao Nhat Ban", "Jevax", "2 mui cach nhau 1-2 tuan; day la mui 1 neu chua tiem Imojev", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Viem gan A", "Avaxim 80U/0.5ml", "Mui 1; nhac lai sau 6-18 thang", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Phe cau", "Synflorix; Prevenar 13; Vaxneuvance; Prevenar 20", "Mui 4", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Viem gan A+B", "Twinrix", "Mui 1", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["12_thang", 12, "12 thang", "Nao mo cau nhom B", "Bexsero", "Mui 3", scheduleUrl, "Muc tre 12 thang tuoi"],
  ["15_24_thang", 18, "15-24 thang", "6 trong 1", "Infanrix Hexa; Hexaxim", "Mui 4", scheduleUrl, "Muc 15-24 thang tuoi"],
  ["15_24_thang", 18, "15-24 thang", "Soi - quai bi - rubella", "MMR II", "Mui 2", scheduleUrl, "Muc 15-24 thang tuoi"],
  ["15_24_thang", 18, "15-24 thang", "Soi - quai bi - rubella - thuy dau", "ProQuad", "Mui 2 theo tu van bac si", scheduleUrl, "Muc 15-24 thang tuoi"],
  ["15_24_thang", 18, "15-24 thang", "Viem gan A", "Avaxim 80U/0.5ml", "Mui 2 khi tre duoc 18 thang", scheduleUrl, "Muc 15-24 thang tuoi"],
  ["15_24_thang", 18, "15-24 thang", "Viem gan A+B", "Twinrix", "Mui 2 khi tre duoc 18 thang", scheduleUrl, "Muc 15-24 thang tuoi"],
  ["15_24_thang", 18, "15-24 thang", "Cum mua", "Vaxigrip Tetra; Influvac Tetra; GCFlu Quadrivalent; Ivacflu-S", "1 mui nhac", scheduleUrl, "Muc 15-24 thang tuoi"],
  ["24_thang", 24, "24 thang", "Viem nao Nhat Ban", "Jevax", "Mui 3", scheduleUrl, "Muc tre du 24 thang tuoi"],
  ["24_thang", 24, "24 thang", "Viem nao Nhat Ban", "Imojev", "Mui 2", scheduleUrl, "Muc tre du 24 thang tuoi"],
  ["24_thang", 24, "24 thang", "Thuong han", "Typhim VI; Typhoid VI", "1 mui, nhac moi 3 nam", scheduleUrl, "Muc tre du 24 thang tuoi"],
  ["24_thang", 24, "24 thang", "Ta", "Morcvax", "Uong 2 lieu cach nhau toi thieu 2 tuan", scheduleUrl, "Muc tre du 24 thang tuoi"],
  ["24_thang", 24, "24 thang", "Phe cau", "Pneumovax 23", "1 mui", scheduleUrl, "Muc tre du 24 thang tuoi"],
];

writeSheet(
  "vnvc_schedule_reference",
  "VNVC schedule reference",
  "Bang tham chieu lich tiem theo thang tuoi. Khong tu dong import vao package_structures vi nguon nay la lich chung, khong phai lich rieng cua tung goi.",
  ["schedule_key", "age_months", "age_label", "disease_group", "vaccine_options", "dose_label", "source_url", "source_note"],
  scheduleRows,
  [120, 90, 130, 260, 380, 260, 420, 260],
);

const packageNames = [
  [1, "GOI_01", "Goi 1: Hexaxim - Rotarix - Varilrix - MenQuadfi"],
  [2, "GOI_02", "Goi 2: Hexaxim - Rotateq - Varilrix - MenQuadfi"],
  [3, "GOI_03", "Goi 3: Infanrix Hexa - Rotarix - Varilrix - MenQuadfi"],
  [4, "GOI_04", "Goi 4: Infanrix Hexa - Rotateq - Varilrix - MenQuadfi"],
  [5, "GOI_05", "Goi 5: Hexaxim - Rotarix - Varivax - MenQuadfi"],
  [6, "GOI_06", "Goi 6: Hexaxim - Rotateq - Varivax - MenQuadfi"],
  [7, "GOI_07", "Goi 7: Infanrix Hexa - Rotarix - Varivax - MenQuadfi"],
  [8, "GOI_08", "Goi 8: Infanrix Hexa - Rotateq - Varivax - MenQuadfi"],
  [9, "GOI_09", "Goi 9: Infanrix Hexa - Rotateq - Proquad"],
  [10, "GOI_10", "Goi 10: Infanrix Hexa - Rotarix - Proquad"],
  [11, "GOI_11", "Goi 11: Hexaxim - Rotateq - Proquad"],
  [12, "GOI_12", "Goi 12: Hexaxim - Rotarix - Proquad"],
  [13, "GOI_13", "Goi 13: Infanrix Hexa - Rotateq - Varivax"],
  [14, "GOI_14", "Goi 14: Infanrix Hexa - Rotarix - Varivax"],
  [15, "GOI_15", "Goi 15: Hexaxim - Rotateq - Varivax"],
  [16, "GOI_16", "Goi 16: Hexaxim - Rotarix - Varivax"],
  [17, "GOI_17", "Goi 17: Infanrix Hexa - Rotateq - Varilrix"],
  [18, "GOI_18", "Goi 18: Infanrix Hexa - Rotarix - Varilrix"],
  [19, "GOI_19", "Goi 19: Hexaxim - Rotateq - Varilrix"],
  [20, "GOI_20", "Goi 20: Hexaxim - Rotarix - Varilrix"],
];

writeSheet(
  "vnvc_package_names",
  "VNVC package names",
  "Danh muc ten goi lay tu muc luc trang goi vaccine tre em VNVC. Chua phai toan bo chi tiet tung goi.",
  ["package_no", "suggested_code", "package_name", "source_url", "source_note"],
  packageNames.map((p) => [...p, packageUrl, "Muc luc goi vaccine cho tre 0-2 tuoi"]),
  [100, 130, 420, 420, 260],
);

function packageRows(packageNo, packageName, rows) {
  return rows.map((row) => [packageNo, packageName, ...row, packageUrl]);
}

const commonG1Rows = [
  [2, "2 thang", "Tieu chay do rota virus", "Rotarix", "GSK/Bi", 2, 2, 2, 2, 2],
  [2, "2 thang", "Bach hau, ho ga, uon van, bai liet, Hib, viem gan B (6in1)", "Hexaxim", "Sanofi/Phap", 4, 3, 3, 3, 4],
  [2, "2 thang", "Phong benh do phe cau khuan", "Prevenar 20", "Bi", 4, 3, 3, 4, 4],
  [2, "2 thang", "Nao mo cau tuyp B", "Bexsero", "Y", 3, 2, 2, 3, 3],
  [2, "2 thang", "Viem mang nao do mo cau tuyp A,C,Y,W", "MenQuadfi", "My", 3, 1, 1, 2, 2],
  [2, "2 thang", "Cum", "Vaxigrip tetra", "Sanofi/Phap", 3, 2, 2, 3, 3],
  [9, "9 thang", "Soi", "Mvvac", "Polyvac/Viet Nam", 1, "", 1, 1, 1],
  [9, "9 thang", "Viem nao Nhat ban", "Imojev", "Sanofi/Thai Lan", 2, "", 1, 1, 2],
  [9, "9 thang", "Thuy dau", "Varilrix", "GSK/Bi", 2, "", "", 1, 2],
  [12, "12 thang", "Soi - Quai bi - Rubella", "Priorix", "Bi", 2, "", "", 1, 1],
  [12, "12 thang", "Viem gan A,B", "Twinrix", "GSK/Bi", 2, "", "", 1, 2],
  [24, "24 thang", "Thuong han", "Typhoid Vi", "Davac/Viet Nam", 1, "", "", "", 1],
  [24, "24 thang", "Ta", "mOrcvax", "Vabiotech/Viet Nam", 2, "", "", "", 2],
];

const packageMatrixRows = [
  ...packageRows(1, "Goi 1: Hexaxim - Rotarix - Varilrix - MenQuadfi", commonG1Rows),
  ...packageRows(2, "Goi 2: Hexaxim - Rotateq - Varilrix - MenQuadfi", commonG1Rows.map((r) => r[3] === "Rotarix" ? [r[0], r[1], r[2], "Rotateq", "My", 3, 3, 3, 3, 3] : r)),
  ...packageRows(3, "Goi 3: Infanrix Hexa - Rotarix - Varilrix - MenQuadfi", commonG1Rows.map((r) => r[3] === "Hexaxim" ? [r[0], r[1], r[2], "Infanrix Hexa", "GSK/Bi", 4, 3, 3, 3, 4] : r)),
  ...packageRows(4, "Goi 4: Infanrix Hexa - Rotateq - Varilrix - MenQuadfi", commonG1Rows.map((r) => {
    if (r[3] === "Hexaxim") return [r[0], r[1], r[2], "Infanrix Hexa", "GSK/Bi", 4, 3, 3, 3, 4];
    if (r[3] === "Rotarix") return [r[0], r[1], r[2], "Rotateq", "My", 3, 3, 3, 3, 3];
    return r;
  })),
  ...packageRows(20, "Goi 20: Hexaxim - Rotarix - Varilrix", [
    [2, "2 thang", "Tieu chay do rota virus", "Rotarix", "GSK/Bi", 2, 2, 2, 2, 2],
    [2, "2 thang", "Bach hau, ho ga, uon van, bai liet, Hib, viem gan B (6in1)", "Hexaxim", "Sanofi/Phap", 4, 3, 3, 3, 4],
    [2, "2 thang", "Phong benh do phe cau khuan", "Prevenar 20", "Bi", 4, 3, 3, 4, 4],
    [2, "2 thang", "Nao mo cau tuyp B", "Bexsero", "Y", 3, 2, 2, 3, 3],
    [2, "2 thang", "Viem mang nao do mo cau tuyp A,C,Y,W", "Nimenrix", "Bi", 3, 2, 2, 3, 3],
    [2, "2 thang", "Cum", "Vaxigrip tetra", "Sanofi/Phap", 3, 2, 2, 3, 3],
    [9, "9 thang", "Soi", "Mvvac", "Polyvac/Viet Nam", 1, "", 1, 1, 1],
    [9, "9 thang", "Viem nao Nhat ban", "Imojev", "Sanofi/Thai Lan", 2, "", 1, 1, 2],
    [12, "12 thang", "Thuy dau", "Varilrix", "GSK/Bi", 2, "", "", 1, 2],
    [12, "12 thang", "Soi-Quai bi-Rubella", "Priorix", "Bi", 2, "", "", 1, 1],
    [12, "12 thang", "Viem gan A,B", "Twinrix", "GSK/Bi", 2, "", "", 1, 2],
    [24, "24 thang", "Thuong han", "Typhoid Vi", "Davac/Viet Nam", 1, "", "", "", 1],
    [24, "24 thang", "Ta", "mOrcvax", "Vabiotech/Viet Nam", 2, "", "", "", 2],
  ]),
];

writeSheet(
  "vnvc_package_matrix",
  "VNVC package matrix",
  "Ma tran so mui theo goi/moc thang lay tu trang goi VNVC. Day la staging: chua tach thanh tung dong package_structures vi chua co lich tung mui cu the.",
  ["package_no", "package_name", "start_age_months", "start_age_label", "disease_group", "vaccine_name", "origin_manufacturer", "protocol_total_doses", "shots_7_months", "shots_10_months", "shots_12_months", "shots_24_months", "source_url"],
  packageMatrixRows,
  [90, 360, 120, 130, 360, 180, 170, 130, 120, 130, 130, 130, 420],
);

const gifts7 = "3 voucher 50.000 dong / Balo tre em / Ao mua / Mu bao hiem lon";
const gifts10 = "4 voucher 50.000 dong / Balo chong gu / 3 voucher 50.000 dong va Non bao hiem tre co sung";
const gifts12 = "Balo hoc sinh / Tui thoi trang";
const gifts24 = "Balo hoc sinh / Tui thoi trang";
const packagePriceRows = [
  [1, "Goi 1", 7, 13, 19965600, 1197936, 18767664, gifts7, packageUrl],
  [1, "Goi 1", 10, 15, 21652800, 1515696, 20137104, gifts10, packageUrl],
  [1, "Goi 1", 12, 22, 31550400, 2208528, 29341872, gifts12, packageUrl],
  [1, "Goi 1", 24, 29, 37197600, 2603832, 34593768, gifts24, packageUrl],
  [2, "Goi 2", 7, 14, 20132400, 1409268, 18723132, gifts10, packageUrl],
  [2, "Goi 2", 10, 16, 21819600, 1527372, 20292228, gifts10, packageUrl],
  [2, "Goi 2", 12, 23, 31717200, 2220204, 29496996, gifts12, packageUrl],
  [2, "Goi 2", 24, 30, 37364400, 2615508, 34748892, gifts24, packageUrl],
  [3, "Goi 3", 7, 13, 19965600, 1197936, 18767664, gifts7, packageUrl],
  [3, "Goi 3", 10, 15, 21652800, 1515696, 20137104, gifts10, packageUrl],
  [3, "Goi 3", 12, 22, 31550400, 2208528, 29341872, gifts12, packageUrl],
  [3, "Goi 3", 24, 29, 37197600, 2603832, 34593768, gifts24, packageUrl],
  [4, "Goi 4", 7, 14, 20132400, 1409268, 18723132, gifts10, packageUrl],
  [4, "Goi 4", 10, 16, 21819600, 1527372, 20292228, gifts10, packageUrl],
  [4, "Goi 4", 12, 23, 31717200, 2220204, 29496996, gifts12, packageUrl],
  [4, "Goi 4", 24, 30, 37364400, 2615508, 34748892, gifts24, packageUrl],
  [20, "Goi 20", 7, 14, 21825600, 1527792, 20297808, gifts10, packageUrl],
  [20, "Goi 20", 10, 16, 23512800, 1645896, 21866904, gifts10, packageUrl],
  [20, "Goi 20", 12, 23, 33170400, 2321928, 30848472, gifts12, packageUrl],
  [20, "Goi 20", 24, 30, 38817600, 2717232, 36100368, gifts24, packageUrl],
];

writeSheet(
  "vnvc_package_prices",
  "VNVC package prices",
  "Gia goi/uu dai/tong thanh toan lay tu trang VNVC. Chua dua vao location_package_prices vi nguon khong tach theo location_id.",
  ["package_no", "package_label", "duration_months", "total_shots", "package_price", "discount_amount", "final_package_price", "gift_description", "source_url"],
  packagePriceRows,
  [90, 110, 130, 110, 140, 150, 160, 420, 420],
);

for (const sheetName of ["vnvc_package_prices"]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  sheet.getRange("E4:G200").format.numberFormat = "#,##0";
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);
