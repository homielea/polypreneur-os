import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import {
  DEFAULT_LEVERAGE_WEIGHTS,
  LEVERAGE_COMPONENT_ORDER,
  type LeverageWeights,
} from "@/config/leverage.config";
import {
  getEffectiveWeights,
  resetWeights,
  saveWeightOverride,
  weightsAreCustom,
  weightsSum,
  WEIGHT_SUM_TOLERANCE,
} from "@/lib/leverage/settings";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const weights = await getEffectiveWeights();
    return {
      weights,
      defaults: DEFAULT_LEVERAGE_WEIGHTS,
      customized: weightsAreCustom(weights),
    };
  });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    weights?: Partial<LeverageWeights>;
    reset?: boolean;
  };

  if (body.reset) {
    return handler(async () => {
      await resetWeights();
      return { weights: DEFAULT_LEVERAGE_WEIGHTS, customized: false };
    });
  }

  const incoming = body.weights ?? {};
  const weights = {} as LeverageWeights;
  for (const key of LEVERAGE_COMPONENT_ORDER) {
    const v = incoming[key];
    if (typeof v !== "number" || Number.isNaN(v) || v < 0) {
      return badRequest(`Weight "${key}" must be a non-negative number.`);
    }
    weights[key] = v;
  }
  if (Math.abs(weightsSum(weights) - 1) > WEIGHT_SUM_TOLERANCE) {
    return badRequest(
      `Weights must sum to 1.0 (got ${weightsSum(weights).toFixed(3)}).`,
    );
  }

  return handler(async () => {
    await saveWeightOverride(weights);
    return { weights, customized: weightsAreCustom(weights) };
  });
}
