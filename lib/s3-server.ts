// import { S3 } from "@aws-sdk/client-s3";
// import fs from "fs";
// export async function downloadFromS3(file_key: string): Promise<string> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const s3 = new S3({
//         region: "ap-south-1",
//         credentials: {
//           accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
//           secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
//         },
//       });
//       const params = {
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
//         Key: file_key,
//       };

//       const obj = await s3.getObject(params);
//       const file_name = `/tmp/elliott${Date.now().toString()}.pdf`;

//       if (obj.Body instanceof require("stream").Readable) {
//         // AWS-SDK v3 has some issues with their typescript definitions, but this works
//         // https://github.com/aws/aws-sdk-js-v3/issues/843
//         //open the writable stream and write the file
//         const file = fs.createWriteStream(file_name);
//         file.on("open", function (fd) {
//           // @ts-ignore
//           obj.Body?.pipe(file).on("finish", () => {
//             return resolve(file_name);
//           });
//         });
//         // obj.Body?.pipe(fs.createWriteStream(file_name));
//       }
//     } catch (error) {
//       console.error(error);
//       reject(error);
//       return null;
//     }
//   });
// }

// // downloadFromS3("uploads/1693568801787chongzhisheng_resume.pdf");

import { S3, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import os from "os";
import { Readable } from "stream";

export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3({
        region: "ap-south-1",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });

      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
      };

      // Create temporary directory
      const tmpDir = path.join(os.tmpdir(), 'pdfs');
      await fs.promises.mkdir(tmpDir, { recursive: true });
      const file_name = path.join(tmpDir, `document-${Date.now()}.pdf`);

      // Get the object from S3
      const obj: GetObjectCommandOutput = await s3.getObject(params);
      
      // Validate response body
      if (!obj.Body) {
        throw new Error("S3 response body is empty");
      }

      // Create write stream
      const file = fs.createWriteStream(file_name);

      // Handle different body types
      if (obj.Body instanceof Readable) {
        const bodyStream = obj.Body;
        
        // Handle stream errors
        bodyStream.on('error', (err) => {
          file.destroy(err);
          reject(new Error(`Stream error: ${err.message}`));
        });

        file.on('error', (err) => {
          reject(new Error(`File write error: ${err.message}`));
        });

        file.on('finish', () => {
          resolve(file_name);
        });

        // Pipe the stream
        bodyStream.pipe(file);
      } else if (obj.Body instanceof Uint8Array) {
        // Handle buffer directly
        fs.writeFile(file_name, obj.Body, (err) => {
          if (err) reject(err);
          resolve(file_name);
        });
      } else {
        reject(new Error("Unsupported S3 response body type"));
      }
    } catch (error) {
      console.error("S3 download error:", error);
      reject(error instanceof Error ? error : new Error("Unknown download error"));
    }
  });
}