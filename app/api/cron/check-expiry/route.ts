// app/api/cron/check-expiry/route.ts

import { getDirectusWithStaticToken } from "@/core/lib/directus";
import { sendNotificationDirect } from "@/core/lib/notification-sender";
import { readItems, updateItem } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION = "animal_info";
const DATE_FIELD = "vaccinated_date";
const OWNER_FIELD = "user_created";
const LABEL_FIELD = "animal_category.category_name";

// ─── Notification windows ─────────────────────────────────────────────────────

const WARNING_MONTHS = 11;   // start warning at 11 months
const CRITICAL_MONTHS = 12;  // critical after 12 months (expired)

const NOTIFY_COOLDOWN_HOURS = 23;

interface CollectionRecord {
    id: string;
    [key: string]: unknown;
    last_notified_at: string | null;
}

interface CronResult {
    processed: number;
    warned: number;
    critical: number;
    skipped: number;
    errors: string[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    // Uncomment in production:
    // const authHeader = request.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const directus = getDirectusWithStaticToken();
    const result: CronResult = { processed: 0, warned: 0, critical: 0, skipped: 0, errors: [] };

    try {
        const now = new Date();

        // ── Date boundaries ───────────────────────────────────────────────────
        //
        // Example: today = 2025-04-23
        //   warningCutoff  = 2024-05-23  (11 months ago) — warning starts here
        //   criticalCutoff = 2024-04-23  (12 months ago) — critical starts here
        //
        // Record zones:
        //   vaccinated_date >= warningCutoff              → not due yet, skip
        //   vaccinated_date <  warningCutoff
        //     AND >= criticalCutoff                       → WARNING (11–12 months)
        //   vaccinated_date <  criticalCutoff             → CRITICAL (12+ months)

        const warningCutoff = new Date(now);
        warningCutoff.setMonth(warningCutoff.getMonth() - WARNING_MONTHS);

        const criticalCutoff = new Date(now);
        criticalCutoff.setMonth(criticalCutoff.getMonth() - CRITICAL_MONTHS);

        const cooldownCutoff = new Date(now);
        cooldownCutoff.setHours(cooldownCutoff.getHours() - NOTIFY_COOLDOWN_HOURS);

        // ── Fetch records that are in warning or critical zone ────────────────
        const records = (await directus.request(
            readItems(COLLECTION as "animal_info", {
                filter: {
                    _and: [
                        // Only records older than 11 months
                        {
                            [DATE_FIELD]: {
                                _lte: warningCutoff.toISOString().split("T")[0],
                            },
                        },
                        // Not notified in the last 23 hours (daily re-notify)
                        {
                            _or: [
                                { last_notified_at: { _null: true } },
                                { last_notified_at: { _lte: cooldownCutoff.toISOString() } },
                            ],
                        },
                    ],
                },
                fields: ["id", DATE_FIELD, OWNER_FIELD, LABEL_FIELD, "last_notified_at"],
                limit: 100,
            })
        )) as CollectionRecord[];

        console.log({ records });

        result.processed = records.length;

        if (records.length === 0) {
            return NextResponse.json({ ...result, message: "No records due for notification." });
        }

        await Promise.allSettled(
            records.map(async (record) => {
                const userId = record[OWNER_FIELD] as string | null;
                const categoryObj = record[LABEL_FIELD] as { category_name?: string } | null;
                const label = categoryObj?.category_name ?? "your record";
                const dateValue = record[DATE_FIELD] as string;

                if (!userId || !dateValue) {
                    result.skipped++;
                    return;
                }

                const vaccinatedDate = new Date(dateValue);
                const isCritical = vaccinatedDate < criticalCutoff;

                // Days overdue (positive = expired, negative = days remaining)
                const anniversary = new Date(vaccinatedDate);
                anniversary.setFullYear(anniversary.getFullYear() + 1);
                const daysDiff = Math.ceil(
                    (now.getTime() - anniversary.getTime()) / (1000 * 60 * 60 * 24)
                );

                // ── Build notification content based on zone ──────────────────
                const { title, body, type } = isCritical
                    ? buildCriticalNotification(label, daysDiff)
                    : buildWarningNotification(label, daysDiff);

                try {
                    await sendNotificationDirect({
                        userId,
                        title,
                        body,
                        type,
                        data: {
                            url: `/${COLLECTION}/${record.id}`,
                            recordId: String(record.id),
                            zone: isCritical ? "critical" : "warning",
                            daysDiff: String(daysDiff),
                        },
                    });

                    // Stamp last_notified_at to prevent re-notify within 23h
                    await directus.request(
                        updateItem(COLLECTION as "animal_info", record.id, {
                            last_notified_at: now.toISOString(),
                        })
                    );

                    if (isCritical) result.critical++;
                    else result.warned++;

                } catch (err) {
                    const msg = err instanceof Error ? err.message : "Unknown error";
                    result.errors.push(`Record ${record.id}: ${msg}`);
                }
            })
        );

        console.log("[cron/check-expiry] Result:", result);
        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[cron/check-expiry] Fatal error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// ─── Notification content builders ───────────────────────────────────────────

function buildWarningNotification(label: string, daysDiff: number) {
    // daysDiff is negative here (anniversary hasn't passed yet)
    const daysRemaining = Math.abs(daysDiff);
    return {
        title: "⚠️ Vaccination Renewal Due Soon",
        body: `"${label}" vaccination expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Please renew before it expires.`,
        type: "warning" as const,
    };
}

function buildCriticalNotification(label: string, daysDiff: number) {
    // daysDiff is positive here (anniversary has passed)
    return {
        title: "🚨 Vaccination EXPIRED — Action Required",
        body: `"${label}" vaccination expired ${daysDiff} day${daysDiff !== 1 ? "s" : ""} ago. Immediate renewal is required.`,
        type: "alert" as const,
    };
}