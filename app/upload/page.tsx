/**
 * Upload Page
 *
 * Allows users to upload financial documents (CSV, PDF, OFX/QFX/QBO files).
 * Features:
 * - Drag-and-drop file upload
 * - File validation (type, size)
 * - Upload progress tracking
 * - Document status display
 *
 * WHY: This is the entry point for user data. Making it smooth and
 * intuitive is critical for the "first I win moment" (PRD requirement).
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, File, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Accepted file types based on PRD
const ACCEPTED_FILE_TYPES = {
  "text/csv": [".csv"],
  "application/pdf": [".pdf"],
  "application/x-ofx": [".ofx"],
  "application/vnd.intu.qfx": [".qfx"],
  "application/vnd.intu.qbo": [".qbo"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  // Handle file drop/selection
  const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejection) => {
        const error =
          rejection.errors[0]?.code === "file-too-large"
            ? "File is too large (max 10MB)"
            : "Invalid file type";

        toast({
          title: "Upload failed",
          description: `${rejection.file.name}: ${error}`,
          variant: "destructive",
        });
      });
    }

    // Add accepted files to list
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Start upload simulation (replace with real upload in production)
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  // Simulate file upload and processing (replace with real API call)
  const simulateUpload = async (fileId: string) => {
    // Upload phase
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f))
    );

    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
      );
    }

    // Processing phase
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: "processing", progress: 0 } : f
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Completed
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: "completed", progress: 100 } : f
      )
    );

    toast({
      title: "Upload complete",
      description: "File has been processed successfully",
    });
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getStatusBadge = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "uploading":
        return <Badge className="bg-blue-500">Uploading</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
      case "uploading":
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
          <p className="text-muted-foreground">
            Upload your bank statements or transaction files to get started
          </p>
        </div>

        {/* Dropzone */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Supported formats: CSV, PDF, OFX, QFX, QBO
              (max 10MB each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop files here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CSV, PDF, OFX, QFX, or QBO files (max 10MB)
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded files list */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>Track the status of your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-shrink-0">
                      <File className="h-8 w-8 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{uploadedFile.file.name}</p>
                        {getStatusBadge(uploadedFile.status)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {/* Progress bar */}
                      {(uploadedFile.status === "uploading" ||
                        uploadedFile.status === "processing") && (
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                              width: `${uploadedFile.status === "uploading" ? uploadedFile.progress : 50}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadedFile.status)}
                      {uploadedFile.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(uploadedFile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Tips for uploading your financial data</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • <strong>CSV files:</strong> Export from your bank&apos;s website. Make sure it
                includes date, amount, merchant, and description columns.
              </li>
              <li>
                • <strong>PDF statements:</strong> We&apos;ll use OCR to extract transactions
                automatically.
              </li>
              <li>
                • <strong>OFX/QFX/QBO files:</strong> Common formats from financial software like
                Quicken or QuickBooks.
              </li>
              <li>
                • <strong>Privacy:</strong> Your data is encrypted and only accessible to you. We
                never share your financial information.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
