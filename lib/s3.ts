import { PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3Client({
        region: "ap-south-1",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });

      const file_key = `uploads/${Date.now()}-${file.name.replace(/ /g, "-")}`;
      
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
        Body: file,
        ContentType: file.type,
      };

      // Create upload object with progress tracking
      const upload = new Upload({
        client: s3,
        params
      });

      // Listen for upload completion
      upload.done().then(() => {
        resolve({ file_key, file_name: file.name });
      }).catch(reject);

      // Optional: Add progress event listener
      upload.on("httpUploadProgress", (progress) => {
        const percentage = Math.round(
          (progress.loaded! / progress.total!) * 100
        );
        console.log(`Upload progress: ${percentage}%`);
      });

    } catch (error) {
      console.error("S3 Upload Error:", error);
      reject(error);
    }
  });
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${file_key}`;
  return url;
}
