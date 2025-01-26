import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.YC_REGION,
  endpoint: "https://storage.yandexcloud.net",
  credentials: {
    accessKeyId: process.env.YC_ACCESS_KEY_ID!,
    secretAccessKey: process.env.YC_SECRET_ACCESS_KEY!,
  },
});

export default s3Client;
