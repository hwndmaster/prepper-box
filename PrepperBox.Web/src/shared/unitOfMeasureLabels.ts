import { UnitOfMeasure } from "@/models/unitOfMeasure";

const UnitOfMeasureLabels: Record<UnitOfMeasure, string> = {
    [UnitOfMeasure.Piece]: "pcs",
    [UnitOfMeasure.Kilogram]: "kg",
    [UnitOfMeasure.Can]: "cans",
    [UnitOfMeasure.Liter]: "L",
};

const UnitOfMeasureOptions = [
    { label: "Pieces", value: UnitOfMeasure.Piece },
    { label: "Kilograms", value: UnitOfMeasure.Kilogram },
    { label: "Cans", value: UnitOfMeasure.Can },
    { label: "Liters", value: UnitOfMeasure.Liter },
];

export { UnitOfMeasureLabels, UnitOfMeasureOptions };
