"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    console.log(process.env.NEXT_PUBLIC_BASE_URL);
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      },
    );

    console.log(response);

    if (response.ok) {
      const { url, fields } = await response.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      console.log(url, fields, JSON.stringify(formData));

      formData.append("file", file);

      console.log(url, fields, JSON.stringify(formData));

      try {
        const uploadResponse = await fetch(url, {
          method: "POST",
          body: { ...fields, file: file },
        });

        if (uploadResponse.ok) {
          alert("Upload successful!");
        } else {
          console.error("S3 Upload Error:", uploadResponse);
          alert("Upload failed.");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Failed to get pre-signed URL.");
    }

    setUploading(false);
  };

  return (
    <main>
      <h1>Upload a File to S3</h1>
      <form onSubmit={handleSubmit}>
        <input
          id="file"
          type="file"
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              setFile(files[0]);
            }
          }}
          accept="image/png, image/jpeg"
        />
        <button type="submit" disabled={uploading}>
          Upload
        </button>
      </form>
    </main>
  );
}
