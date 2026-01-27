export enum VerificationStatus {
    Pending = "pending",
    Verified = "verified",
    Validated = "validated",
}

export const verificationStatusOptions = Object.entries(VerificationStatus).map(([label, value]) => ({
    label,
    value
}));

const verificationStatusLabelMap: Record<string, string> = Object.entries(VerificationStatus).reduce(
    (acc, [label, value]) => {
        acc[value] = label;
        return acc;
    },
    {} as Record<string, string>
);

export function getVerficationStatusLabel(value: string): string {
    return verificationStatusLabelMap[value] || value; // fallback to value if not found
}