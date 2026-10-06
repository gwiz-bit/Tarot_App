import { readingInputSchema } from "@/lib/domain";
import { readInput, jsonResponse, requestFailure } from "@/lib/http";
import { generateReading } from "@/lib/server-ai";
export async function POST(request: Request) {
  try {
    return jsonResponse(
      await generateReading(
        await readInput(request, readingInputSchema),
        request.signal,
      ),
    );
  } catch (error) {
    return requestFailure(error);
  }
}
