"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

type UploadData = {
  file_key: string;
  file_name: string;
};

type ApiErrorResponse = {
  error?: string;
};

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (uploadData: UploadData) => {
      const response = await axios.post("/api/create-chat", uploadData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Chat created!");
      router.push(`/doctutor/${data.chat_id}`);
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to create chat";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      console.error("Mutation error:", error);
    }
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large (max 10MB)");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        
        if (!data?.file_key || !data.file_name) {
          throw new Error("Invalid file data from S3");
        }

        mutate(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "File upload failed";
        console.error("Upload error:", message);
        toast.error(message);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Processing PDF...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;