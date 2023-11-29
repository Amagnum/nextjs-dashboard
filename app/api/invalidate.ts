// pages/api/invalidate.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createInvalidation } from "../utils/cloudfront";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { distributionId, pathsToInvalidate } = req.body;

  if (!distributionId || !pathsToInvalidate) {
    return res.status(400).json({
      error:
        "Invalid request. Please provide distributionId and pathsToInvalidate.",
    });
  }

  await createInvalidation(distributionId, pathsToInvalidate);

  return res
    .status(200)
    .json({ message: "CloudFront invalidation initiated successfully." });
}
