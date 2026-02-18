import ExcelJS from "exceljs";
import { IAnimal } from "../interfaces/animal.interface";

export async function exportAnimalData(data: IAnimal[]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Animal Registry");

    // ── Column definitions ──────────────────────────────────────────────────────
    sheet.columns = [
        // Owner columns
        { header: "Owner Name", key: "ownerName", width: 20 },
        { header: "Owner Contact", key: "ownerContact", width: 16 },
        { header: "Ward Number", key: "wardNumber", width: 12 },
        { header: "Municipality", key: "municipality", width: 20 },
        { header: "Local Level", key: "localLevel", width: 20 },
        { header: "District", key: "district", width: 16 },
        { header: "Province", key: "province", width: 18 },
        // Animal columns
        { header: "Tag Number", key: "tagNumber", width: 14 },
        { header: "Animal Type", key: "animalType", width: 16 },
        { header: "Category", key: "category", width: 16 },
        { header: "Production Capacity", key: "productionCapacity", width: 20 },
        { header: "Age (Years)", key: "ageYears", width: 12 },
        { header: "Age (Months)", key: "ageMonths", width: 13 },
        { header: "Verification Status", key: "verificationStatus", width: 18 },
        { header: "Vaccinated", key: "vaccinated", width: 12 },
        { header: "Vaccination Date", key: "vaccinationDate", width: 18 },
        { header: "Status", key: "status", width: 12 },
        { header: "Latitude", key: "latitude", width: 12 },
        { header: "Longitude", key: "longitude", width: 12 },
        { header: "Date Created", key: "dateCreated", width: 20 },
    ];

    // ── Header row styling ──────────────────────────────────────────────────────
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E4057" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" },
        };
    });
    headerRow.height = 30;

    // ── Group by owner ──────────────────────────────────────────────────────────
    const grouped = new Map<number, IAnimal[]>();
    for (const record of data) {
        const ownerId = record.owners_id.id;
        if (!grouped.has(ownerId)) grouped.set(ownerId, []);
        grouped.get(ownerId)!.push(record);
    }

    // ── Write rows ──────────────────────────────────────────────────────────────
    const ownerFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F4FD" } };
    const animalFillA: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
    const animalFillB: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F9FC" } };

    let currentRow = 2;

    for (const [, animals] of grouped) {
        const owner = animals[0].owners_id;
        const startRow = currentRow;
        const endRow = currentRow + animals.length - 1;

        animals.forEach((animal, idx) => {
            const row = sheet.getRow(currentRow);
            const isFirst = idx === 0;
            const altFill = idx % 2 === 0 ? animalFillA : animalFillB;

            row.values = [
                isFirst ? owner.owners_name : "",
                isFirst ? owner.owners_contact : "",
                isFirst ? (owner.ward_number ?? "N/A") : "",
                isFirst ? (owner.municipality ?? "N/A") : "",
                isFirst ? owner.local_level_name : "",
                isFirst ? owner.district_id.district_name : "",
                isFirst ? owner.district_id.province_id.province_name : "",
                animal.tag_number,
                animal.animal_type.animal_name,
                animal.animal_category.category_name,
                animal.production_capacity.capacity_name,
                animal.age_years,
                animal.age_months,
                animal.verification_status,
                animal.is_vaccination_applied ? "Yes" : "No",
                animal.vaccinated_date ?? "N/A",
                animal.status,
                animal.latitude,
                animal.longitude,
                new Date(animal.date_created).toLocaleDateString(),
            ];

            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const isOwnerCol = colNumber <= 7;
                cell.fill = isOwnerCol ? ownerFill : altFill;
                cell.font = { name: "Arial", size: 10 };
                cell.alignment = { vertical: "middle", horizontal: isOwnerCol ? "left" : "center" };
                cell.border = {
                    top: { style: "thin", color: { argb: "FFD0D0D0" } },
                    bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
                    left: { style: "thin", color: { argb: "FFD0D0D0" } },
                    right: { style: "thin", color: { argb: "FFD0D0D0" } },
                };
            });

            row.height = 22;
            currentRow++;
        });

        // Merge owner columns if multiple animals
        if (animals.length > 1) {
            for (let col = 1; col <= 7; col++) {
                sheet.mergeCells(startRow, col, endRow, col);
                const cell = sheet.getCell(startRow, col);
                cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
            }
        }

        // Add a subtle divider border between owner groups
        for (let col = 1; col <= 20; col++) {
            const cell = sheet.getCell(endRow, col);
            cell.border = {
                ...cell.border,
                bottom: { style: "medium", color: { argb: "FF2E4057" } },
            };
        }
    }

    // ── Freeze header row ───────────────────────────────────────────────────────
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    // ── Download in browser ─────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "animal_registry.xlsx";
    a.click();
    URL.revokeObjectURL(url);
}
