import { analyzeInputSchema } from "@/lib/domain";
import { readInput, jsonResponse, requestFailure } from "@/lib/http";
import { analyzeQuestion } from "@/lib/server-ai";
export async function POST(request: Request) {
  try {
    const { question, readingSessionId, drawCount } = await readInput(
      request,
      analyzeInputSchema,
    );
    return jsonResponse(
      await analyzeQuestion(
        question,
        readingSessionId,
        request.signal,
        drawCount,
      ),
    );
  } catch (error) {
    return requestFailure(error);
  }
}
