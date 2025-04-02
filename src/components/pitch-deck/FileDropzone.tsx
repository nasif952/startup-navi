
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileDropzoneProps {
  file: File | null;
  setFile: (file: File | null) => void;
  isProcessing: boolean;
}

export function FileDropzone({ file, setFile, isProcessing }: FileDropzoneProps) {
  const { toast } = useToast();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (selectedFile) {
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  if (file) {
    return (
      <div className="flex flex-col items-center space-y-4 w-full">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <div className="text-center">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)}MB
          </p>
        </div>
        <div className="flex space-x-3 mt-4">
          <Button
            variant="outline"
            onClick={() => setFile(null)}
            disabled={isProcessing}
          >
            Change File
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 rounded-full bg-muted">
        <Upload className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">Upload your pitch deck</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop or click to browse your files
        </p>
        <p className="text-xs text-muted-foreground">
          PDF format only (Max 10MB)
        </p>
      </div>
      <Input
        type="file"
        id="file-upload"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        Select File
      </Button>
    </div>
  );
}
