export enum Months {
    January = "jan",
    February = "feb",
    March = "mar",
    April = "apr",
    May = "may",
    June = "jun",
    July = "jul",
    August = "aug",
    September = "sept",
    October = "oct",
    November = "nov",
    December = "dec",
}

export const monthOptions = Object.entries(Months).map(([label, value]) => ({
    label,
    value
}));

const monthLabelMap: Record<string, string> = Object.entries(Months).reduce(
    (acc, [label, value]) => {
        acc[value] = label;
        return acc;
    },
    {} as Record<string, string>
);

export function getMonthLabel(value: string): string {
    return monthLabelMap[value] || value; // fallback to value if not found
}