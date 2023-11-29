// utils/cloudfront.ts
import * as AWS from "aws-sdk";

const cloudFront = new AWS.CloudFront();

export const createInvalidation = async (
  distributionId: string,
  pathsToInvalidate: string[],
) => {
  const params: AWS.CloudFront.CreateInvalidationRequest = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `${Date.now()}`,
      Paths: {
        Quantity: pathsToInvalidate.length,
        Items: pathsToInvalidate,
      },
    },
  };

  try {
    const result = await cloudFront.createInvalidation(params).promise();
    console.log("CloudFront invalidation created:", result);
  } catch (error) {
    console.error("Error creating CloudFront invalidation:", error);
  }
};
