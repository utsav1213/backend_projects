import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.S3_BUCKET || "";

if (!BUCKET) {
  console.warn("S3_BUCKET not set — presign endpoints will fail without it");
}

const s3 = new S3Client({ region: REGION });

export async function generatePresignedUploadUrl(
  profileId: string,
  filename: string,
  contentType = "application/octet-stream",
) {
  const key = `profiles/${profileId}/${uuid()}_${filename}`;
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "private",
  });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
  const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return { uploadUrl, key, publicUrl };
}
