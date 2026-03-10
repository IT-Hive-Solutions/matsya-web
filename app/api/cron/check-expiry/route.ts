// app/api/cron/check-expiry/route.ts
//
// GET /api/cron/check-expiry
//
// PURPOSE:
//   Scans a Directus collection for records where `vaccinated_date` is approaching
//   its 1-year anniversary (within the 11th month = warning window).
//   Sends a push + in-app notification to the record owner once per week max.
//
// HOW IT'S TRIGGERED:
//   • Vercel Cron (vercel.json)   → runs daily automatically
//   • Manual curl/browser call   → for testing (requires CRON_SECRET header)
//
// PREVENTING DUPLICATE NOTIFICATIONS:
//   • `last_notified_at` on each record tracks when we last sent a notification.
//   • We skip any record notified within the last 7 days.

import { NextRequest, NextResponse } from "next/server";
import { readItems, updateItem } from "@directus/sdk";
import { getDirectusClient } from "@/core/lib/directus";
import { getAccessToken } from "@/core/lib/auth";
import { sendNotification } from "@/core/lib/notification";

// ─── Config — adjust these to match your collection ──────────────────────────

const COLLECTION = "animal_info";   // ← replace with your collection name
const DATE_FIELD = "vaccinated_date";        // ← the date field to watch
const OWNER_FIELD = "user_created";          // ← field that holds the owner's user ID
const LABEL_FIELD = "name";             // ← a human-readable field for the notification text

// Warning fires when the date is between these many months ago
const WARN_MONTH_START = 11;   // start of warning window (11 months ago)
const WARN_MONTH_END = 12;     // end of warning window (12 months ago = already expired)

// How many days must pass before we re-notify the same record
const NOTIFY_COOLDOWN_DAYS = 7;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollectionRecord {
    id: string;
    [key: string]: unknown;
    last_notified_at: string | null;
}

interface CronResult {
    processed: number;
    notified: number;
    skipped: number;
    errors: string[];
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
    // ── Auth: verify the cron secret to block unauthorized calls ──────────────
    const authHeader = request.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = await getAccessToken()
    const directus = getDirectusClient(token!);
    const result: CronResult = { processed: 0, notified: 0, skipped: 0, errors: [] };

    try {
        const now = new Date();

        // ── Build the date window ─────────────────────────────────────────────
        // We want records where vaccinated_date is between 11 and 12 months ago.
        // Example: today is 2025-03-09
        //   warnStart = 2024-04-09  (11 months ago)
        //   warnEnd   = 2024-03-09  (12 months ago)
        const warnStart = new Date(now);
        warnStart.setMonth(warnStart.getMonth() - WARN_MONTH_START);

        const warnEnd = new Date(now);
        warnEnd.setMonth(warnEnd.getMonth() - WARN_MONTH_END);

        const cooldownCutoff = new Date(now);
        cooldownCutoff.setDate(cooldownCutoff.getDate() - NOTIFY_COOLDOWN_DAYS);

        // ── Query Directus for matching records ───────────────────────────────
        // Fetch records whose date falls in the warning window.
        // We filter last_notified_at on the server to reduce data transfer:
        //   either never notified, or last notified more than COOLDOWN days ago.
        const records = (await directus.request(
            readItems(COLLECTION as "animal_info", {
                filter: {
                    _and: [
                        // Date is within the 11–12 month warning window
                        { [DATE_FIELD]: { _gte: warnEnd.toISOString().split("T")[0] } },
                        { [DATE_FIELD]: { _lte: warnStart.toISOString().split("T")[0] } },
                        // Not notified recently (null = never notified, or older than cooldown)
                        {
                            _or: [
                                { last_notified_at: { _null: true } },
                                { last_notified_at: { _lte: cooldownCutoff.toISOString() } },
                            ],
                        },
                    ],
                },
                fields: ["id", DATE_FIELD, OWNER_FIELD, LABEL_FIELD, "last_notified_at"],
                limit: 100, // process in batches — increase or paginate if needed
            })
        )) as CollectionRecord[];

        result.processed = records.length;

        if (records.length === 0) {
            return NextResponse.json({ ...result, message: "No records in warning window." });
        }

        // ── Process each record ───────────────────────────────────────────────
        await Promise.allSettled(
            records.map(async (record) => {
                const userId = record[OWNER_FIELD] as string | null;
                const label = (record[LABEL_FIELD] as string) ?? "your record";
                const dateValue = record[DATE_FIELD] as string;

                if (!userId) {
                    result.skipped++;
                    return;
                }

                // Calculate days remaining until the 1-year anniversary
                const createdDate = new Date(dateValue);
                const anniversary = new Date(createdDate);
                anniversary.setFullYear(anniversary.getFullYear() + 1);
                const daysRemaining = Math.ceil(
                    (anniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                try {
                    // ── Send notification via your existing route ──────────────────
                    await sendNotification({
                        userId,
                        title: "⚠️ Annual Renewal Approaching",
                        body: `"${label}" is due for renewal in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}.`,
                        type: "warning",
                        data: {
                            url: `/${COLLECTION}/${record.id}`,   // deep link into the app
                            recordId: record.id,
                            daysRemaining: String(daysRemaining),
                        },
                    });

                    // ── Stamp last_notified_at so we don't re-send this week ───────
                    await directus.request(
                        updateItem(COLLECTION as "animal_info", record.id, {
                            last_notified_at: now.toISOString(),
                        })
                    );

                    result.notified++;
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