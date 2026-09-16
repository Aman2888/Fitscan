import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { detectDocumentStructureFlags } from "@/lib/atsChecks";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    const documentFlags = await detectDocumentStructureFlags(pdf);
    return NextResponse.json({ text, documentFlags });
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json({ error: "Could not read PDF" }, { status: 500 });
  }
}
