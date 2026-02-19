// import { withMiddleware } from "@/core/lib/api.middleware";
// import { directus } from "@/core/lib/directus";
// import { uploadFiles } from "@directus/sdk";
// import { NextRequest, NextResponse } from "next/server";

// async function postHandler(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("image");
//     console.log({ file });

//     if (!file) {
//       return NextResponse.json({ error: "No image provided" }, { status: 400 });
//     }

//     // Upload file to Directus
//     const uploadFormData = new FormData();
//     uploadFormData.append("image", file);

//     const result = await directus.request(uploadFiles(uploadFormData));

//     // Return the file ID
//     return NextResponse.json({
//       success: true,
//       fileId: result.id,
//       data: result,
//     });
//   } catch (error: any) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { error: "Upload failed", message: error.message },
//       { status: 500 },
//     );
//   }
// }
// export const POST = withMiddleware(postHandler);
