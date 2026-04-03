import { DIRECTUS_BASE_URL } from "@/core/contants/directusEndpoints";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) return new Response("Missing fileId", { status: 400 });

  const fileUrl = `${DIRECTUS_BASE_URL}assets/${fileId}?download`;

  const response = await fetch(fileUrl);

  if (!response.ok) return new Response("File not found", { status: 404 });

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition") ?? `attachment; filename="${fileId}"`;

  return new Response(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}