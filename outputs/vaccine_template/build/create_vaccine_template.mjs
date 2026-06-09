import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "C:/Users/Admin/ReactNative/BabyOi/outputs/vaccine_template";
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const sheetNames = [
  "README",
  "status_codes",
  "locations",
  "vaccines",
  "vaccine_packages",
  "package_structures",
  "location_vaccine_prices",
  "location_package_prices",
  "vaccine_records_seed",
];

const sheets = {};
for (const name of sheetNames) {
  sheets[name] = workbook.worksheets.add(name);
  sheets[name].showGridLines = false;
}

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

function title(sheet, titleText, subtitle, colCount) {
  const last = colLetter(Math.max(colCount - 1, 7));
  const titleRange = sheet.getRange(`A1:${last}1`);
  titleRange.merge();
  titleRange.values = [[titleText]];
  titleRange.format = {
    fill: "#14532D",
    font: { bold: true, color: "#FFFFFF", size: 15 },
    wrapText: true,
  };
  titleRange.format.rowHeightPx = 34;

  const subtitleRange = sheet.getRange(`A2:${last}2`);
  subtitleRange.merge();
  subtitleRange.values = [[subtitle]];
  subtitleRange.format = {
    fill: "#DCFCE7",
    font: { italic: true, color: "#166534" },
    wrapText: true,
  };
  subtitleRange.format.rowHeightPx = 44;
}

function writeSheet(sheetName, titleText, subtitle, headers, rows, widths) {
  const sheet = sheets[sheetName];
  title(sheet, titleText, subtitle, headers.length);

  const header = sheet.getRangeByIndexes(2, 0, 1, headers.length);
  header.values = [headers];
  header.format = {
    fill: "#166534",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
  header.format.borders = { preset: "all", style: "thin", color: "#D1D5DB" };

  if (rows.length > 0) {
    const data = sheet.getRangeByIndexes(3, 0, rows.length, headers.length);
    data.values = rows;
    data.format = { wrapText: true };
    data.format.borders = { preset: "all", style: "thin", color: "#E5E7EB" };
  }

  try {
    const tableRange = sheet.getRangeByIndexes(2, 0, Math.max(rows.length + 1, 2), headers.length);
    const table = sheet.tables.add(tableRange, true, `${sheetName.replace(/[^A-Za-z0-9]/g, "_")}Table`);
    table.style = "TableStyleMedium4";
  } catch {
    // Table styling is nice-to-have; values and formatting are the source of truth.
  }

  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
  sheet.freezePanes.freezeRows(3);
}

writeSheet(
  "README",
  "BabyOi Vaccine Data Template",
  "Nhap du lieu theo thu tu: locations -> vaccines -> vaccine_packages -> package_structures -> location_vaccine_prices -> location_package_prices -> vaccine_records_seed neu can. Cac cot *_id phai khop voi id o sheet goc.",
  ["Sheet", "Purpose", "Required?", "Important FK / Rules", "Notes"],
  [
    ["locations", "Danh muc trung tam/chi nhanh tiem chung.", "Yes", "id duoc dung trong location_vaccine_prices, location_package_prices, vaccine_records_seed.", "status = 2 neu dang hoat dong."],
    ["vaccines", "Danh muc vaccine le.", "Yes", "id duoc dung trong package_structures, location_vaccine_prices, vaccine_records_seed.", "Khong nhap gia tai day."],
    ["vaccine_packages", "Danh muc goi vaccine cha.", "Optional", "id duoc dung trong package_structures va location_package_prices.", "Dung neu co ban goi."],
    ["package_structures", "Cau truc mui tiem trong goi theo moc thang.", "Optional", "package_id + duration_months + vaccine_id.", "Khong chua gia."],
    ["location_vaccine_prices", "Gia vaccine le theo dia diem.", "Yes for pricing", "location_id, vaccine_id.", "stock_status TRUE/FALSE."],
    ["location_package_prices", "Gia goi theo dia diem va moc thang.", "Optional", "location_id, package_id, duration_months.", "Gia chot goi nam tai final_package_price."],
    ["vaccine_records_seed", "Lich tiem mau theo profile.", "Optional", "profile_id, location_id, vaccine_id, package_id, package_structure_id.", "Chi dung neu muon seed lich tiem ca nhan."],
  ],
  [180, 260, 100, 360, 260],
);

writeSheet(
  "status_codes",
  "Status Codes",
  "Dung cac ma status nay de thong nhat voi Constants.TABLE_STATUS cua BE.",
  ["status", "code", "meaning", "use_case"],
  [
    [-1, "PENDING", "Sap tiem / cho xu ly", "vaccine_record"],
    [-2, "CANCELED", "Da huy", "vaccine_record"],
    [-4, "DELETED", "Xoa mem", "vaccine_record"],
    [0, "INACTIVE", "Khong hoat dong", "catalog"],
    [2, "ACTIVE", "Dang hoat dong", "catalog, price"],
    [3, "SUCCESS", "Da tiem / hoan thanh", "vaccine_record"],
  ],
  [90, 130, 220, 180],
);

writeSheet(
  "locations",
  "locations",
  "Danh muc trung tam/chi nhanh. Khong nhap gia tai sheet nay.",
  ["id", "name", "region", "address", "status"],
  [
    [1, "VNVC Truong Chinh", "Mien Bac", "180 Truong Chinh, Dong Da, Ha Noi", 2],
    [2, "VNVC Nguyen Duy Trinh", "Mien Nam", "Nguyen Duy Trinh, TP. Thu Duc, TP.HCM", 2],
    [3, "Trung tam Y te Du phong Ha Noi", "Mien Bac", "70 Nguyen Chi Thanh, Dong Da, Ha Noi", 2],
  ],
  [70, 260, 120, 360, 90],
);

writeSheet(
  "vaccines",
  "vaccines",
  "Danh muc vaccine le. Gia theo dia diem nam o sheet location_vaccine_prices.",
  ["id", "name", "manufacturer", "origin", "description", "status"],
  [
    [1, "Hexaxim", "Sanofi", "Phap", "Vaccine 6 trong 1 phong bach hau, ho ga, uon van, bai liet, viem gan B va Hib.", 2],
    [2, "Rotarix", "GSK", "Bi", "Vaccine uong phong tieu chay do Rotavirus.", 2],
    [3, "Varilrix", "GSK", "Bi", "Vaccine phong benh thuy dau.", 2],
    [4, "Vaxigrip Tetra", "Sanofi", "Phap", "Vaccine phong cum mua.", 2],
    [5, "MMR II", "MSD", "My", "Vaccine phong soi, quai bi va rubella.", 2],
  ],
  [70, 220, 140, 100, 460, 90],
);

writeSheet(
  "vaccine_packages",
  "vaccine_packages",
  "Danh muc goi cha. Moc thang va chi tiet mui tiem nam o package_structures.",
  ["id", "code", "name", "description", "status"],
  [
    [1, "GOI_01", "Goi 1: Hexaxim - Rotarix - Varilrix", "Goi vaccine co ban cho tre nho theo cac moc thang dau doi.", 2],
    [2, "GOI_02", "Goi 2: Infanrix Hexa - Rotarix - MMR II", "Vi du goi thay the neu co phac do khac.", 2],
  ],
  [70, 120, 360, 440, 90],
);

writeSheet(
  "package_structures",
  "package_structures",
  "Cau truc goi theo duration_months. Sheet nay khong chua gia.",
  ["id", "package_id", "duration_months", "vaccine_id", "recommended_age_months", "dosage_order", "dose_label", "note"],
  [
    [1, 1, 7, 1, 2, 1, "Mui 1", ""],
    [2, 1, 7, 1, 3, 2, "Mui 2", ""],
    [3, 1, 7, 2, 2, 1, "Lieu 1", "Uong"],
    [4, 1, 7, 2, 3, 2, "Lieu 2", "Uong"],
    [5, 1, 24, 3, 12, 1, "Mui 1", ""],
    [6, 1, 24, 5, 12, 1, "Mui 1", ""],
  ],
  [70, 110, 130, 100, 190, 120, 120, 220],
);

writeSheet(
  "location_vaccine_prices",
  "location_vaccine_prices",
  "Gia vaccine le theo tung dia diem. Moi cap location_id + vaccine_id nen chi co mot dong active.",
  ["id", "location_id", "vaccine_id", "retail_price", "stock_status", "status"],
  [
    [1, 1, 1, 1050000, true, 2],
    [2, 1, 2, 750000, true, 2],
    [3, 1, 3, 950000, true, 2],
    [4, 1, 4, 350000, true, 2],
    [5, 1, 5, 450000, true, 2],
    [6, 2, 1, 1080000, true, 2],
    [7, 2, 2, 760000, false, 2],
  ],
  [70, 110, 100, 130, 120, 90],
);

writeSheet(
  "location_package_prices",
  "location_package_prices",
  "Gia goi theo dia diem. base_vaccine_sum co the tinh tu tong gia le roi luu de query nhanh.",
  ["id", "location_id", "package_id", "duration_months", "base_vaccine_sum", "service_fee", "discount_amount", "final_package_price", "gift_description"],
  [
    [1, 1, 1, 7, 3600000, 0, 250000, 3350000, "Balo BabyOi"],
    [2, 1, 1, 24, 5400000, 0, 500000, 4900000, "Balo va ao mua BabyOi"],
    [3, 2, 1, 7, 3680000, 0, 200000, 3480000, "Balo BabyOi"],
  ],
  [70, 110, 100, 130, 150, 120, 150, 160, 260],
);

writeSheet(
  "vaccine_records_seed",
  "vaccine_records_seed",
  "Tuy chon: chi dung de seed lich tiem mau cho profile. Khong can dien neu chi tong hop catalog/gia.",
  ["id", "profile_id", "location_id", "vaccine_id", "package_id", "package_structure_id", "injection_date", "actual_injection_date", "price", "note", "status"],
  [
    [1, 1, 1, 1, 1, 1, "2026-06-20", "", 1050000, "Mui 1 - Hexaxim", -1],
    [2, 1, 1, 2, 1, 3, "2026-07-05", "", 750000, "Lieu uong Rotarix", -1],
    [3, 1, 1, 4, "", "", "2026-05-20", "2026-05-20", 350000, "Da tiem cum mua", 3],
  ],
  [70, 100, 100, 100, 100, 150, 130, 160, 110, 260, 90],
);

for (const sheet of Object.values(sheets)) {
  const used = sheet.getUsedRange();
  if (used) {
    used.format.font = { name: "Aptos", size: 10 };
    used.format.wrapText = true;
  }
}

sheets.location_vaccine_prices.getRange("D4:D200").format.numberFormat = "#,##0";
sheets.location_package_prices.getRange("E4:H200").format.numberFormat = "#,##0";
sheets.vaccine_records_seed.getRange("G4:H200").format.numberFormat = "yyyy-mm-dd";
sheets.vaccine_records_seed.getRange("I4:I200").format.numberFormat = "#,##0";

sheets.locations.getRange("E4:E200").dataValidation = { rule: { type: "list", values: ["2", "0"] } };
sheets.vaccines.getRange("F4:F200").dataValidation = { rule: { type: "list", values: ["2", "0"] } };
sheets.vaccine_packages.getRange("E4:E200").dataValidation = { rule: { type: "list", values: ["2", "0"] } };
sheets.location_vaccine_prices.getRange("E4:E200").dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
sheets.location_vaccine_prices.getRange("F4:F200").dataValidation = { rule: { type: "list", values: ["2", "0"] } };
sheets.vaccine_records_seed.getRange("K4:K200").dataValidation = { rule: { type: "list", values: ["-1", "-2", "-4", "0", "2", "3"] } };

sheets.README.getRange("G4:H10").values = [
  ["Quick counts", "Formula"],
  ["locations rows", ""],
  ["vaccines rows", ""],
  ["packages rows", ""],
  ["package structures rows", ""],
  ["vaccine price rows", ""],
  ["package price rows", ""],
];
sheets.README.getRange("H5:H10").formulas = [
  ["=COUNTA(locations!A4:A200)"],
  ["=COUNTA(vaccines!A4:A200)"],
  ["=COUNTA(vaccine_packages!A4:A200)"],
  ["=COUNTA(package_structures!A4:A200)"],
  ["=COUNTA(location_vaccine_prices!A4:A200)"],
  ["=COUNTA(location_package_prices!A4:A200)"],
];
sheets.README.getRange("G4:H4").format = { fill: "#166534", font: { bold: true, color: "#FFFFFF" } };
sheets.README.getRange("G4:H10").format.borders = { preset: "all", style: "thin", color: "#D1D5DB" };
sheets.README.getRange("G:G").format.columnWidthPx = 180;
sheets.README.getRange("H:H").format.columnWidthPx = 100;

const sheetInspect = await workbook.inspect({ kind: "sheet", include: "name", maxChars: 3000 });
console.log(sheetInspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "babyoi_vaccine_data_template.xlsx");
await output.save(outputPath);
console.log(`Saved ${outputPath}`);
