
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';

interface AddDocumentDialogProps {
  folderId?: string;
  onDocumentAdded?: () => void;
}

export function AddDocumentDialog({ folderId, onDocumentAdded }: AddDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name);
      }
    }
  };

  const uploadFileMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("No file selected");
      }

      setUploading(true);

      try {
        // 1. Upload file to Supabase Storage
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${Date.now()}_${fileName.replace(/\s+/g, '_')}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('data-room')
          .upload(filePath, selectedFile);
        
        if (uploadError) throw uploadError;

        // 2. Add file metadata to files table
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: fileName || selectedFile.name,
            folder_id: folderId || null,
            storage_path: filePath,
            file_size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
            file_type: selectedFile.type,
            owner: 'Current User' // In a real app, this would be the current user's name or ID
          });
        
        if (dbError) throw dbError;

        return true;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "File uploaded",
        description: "Your document has been uploaded successfully."
      });
      setOpen(false);
      setFileName('');
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      if (onDocumentAdded) onDocumentAdded();
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadFileMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex items-center gap-2">
          <Upload size={16} />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to the data room.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file-name" className="text-right">
                Name
              </Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="col-span-3"
                placeholder="Document name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file-upload" className="text-right">
                File
              </Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
