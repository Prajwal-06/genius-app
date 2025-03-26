"use client";
import React from "react";

type Props = { pdf_url: string };

export default function PDFViewer({ pdf_url }: Props) {
  return (
    <div className="h-full w-full">
      <iframe
        src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
        className="w-full h-full"
        title="PDF Viewer"
      />
    </div>
  );
}