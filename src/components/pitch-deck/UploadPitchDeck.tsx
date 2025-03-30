
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from '@supabase/supabase-js/dist/module/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, CheckCircle, XCircle } from 'lucide-react';

export function UploadPitchDeck() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Generate unique storage path
      const filePath = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('pitch-decks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });

      if (storageError) {
        throw new Error(storageError.message);
      }

      // Create file record in the database
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          storage_path: filePath,
          file_type: 'application/pdf',
          file_size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          owner: 'Current User' // In a real app, use authenticated user's information
        })
        .select()
        .single();

      if (fileError) {
        throw new Error(fileError.message);
      }

      toast({
        title: "Upload successful",
        description: "Your pitch deck has been uploaded successfully.",
      });

      // Start analysis
      setUploading(false);
      setAnalyzing(true);

      const analysisResponse = await fetch(`${window.location.origin}/functions/v1/analyze-pitch-deck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`,
        },
        body: JSON.stringify({ fileId: fileData.id }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || 'Failed to analyze pitch deck');
      }

      const analysisData = await analysisResponse.json();
      
      toast({
        title: "Analysis complete",
        description: "Your pitch deck has been analyzed successfully.",
      });
      
      // Redirect to analysis results page
      navigate(`/pitch-deck-analysis/${analysisData.analysis.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
          {file ? (
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
                  disabled={uploading || analyzing}
                >
                  Change File
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || analyzing}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading {uploadProgress}%
                    </>
                  ) : analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
