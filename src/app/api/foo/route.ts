import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = Number(searchParams.get("cursor"));
  const limit = Number(searchParams.get("limit"));
  if (cursor == null || limit == null)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 400 },
    );
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => `Async loaded row #${i + cursor * limit}`)
    .map((i) => ({ foo: i, id: crypto.randomUUID() }));

  await new Promise((r) => setTimeout(r, 500));

  const res = {
    rows,
    nextCursor: cursor < 4 ? cursor + 1 : null,
  };
  return NextResponse.json(res);
}
