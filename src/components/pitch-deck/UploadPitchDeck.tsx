
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function UploadPitchDeck() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ensure the storage bucket exists when component mounts
  useEffect(() => {
    const ensureStorageBucketExists = async () => {
      try {
        // First check if bucket exists
        const { data: buckets, error } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'pitch-decks');
        
        if (!bucketExists) {
          console.log('Pitch-decks bucket does not exist, creating it');
          const { data, error: createError } = await supabase.storage.createBucket('pitch-decks', {
            public: false,
            allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.error('Error creating storage bucket:', createError);
            // Don't set an error here as we'll try again during upload if needed
          } else {
            console.log('Successfully created pitch-decks bucket');
          }
        }
      } catch (err) {
        console.error('Error checking/creating storage bucket:', err);
        // Don't set an error here as we'll try again during upload if needed
      }
    };

    if (isAuthenticated) {
      ensureStorageBucketExists();
    }
  }, [isAuthenticated]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];
    
    if (selectedFile) {
      // Check if file is a PDF or PPTX
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or PPTX file.",
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

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress > 95) {
        progress = 95; // Cap at 95% until upload actually completes
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 500);
    
    return () => clearInterval(interval);
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

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return;
    }

    try {
      setError(null);
      setUploading(true);
      setUploadProgress(0);
      
      // Start progress simulation
      const stopProgressSimulation = simulateProgress();
      
      // Generate unique ID for storage
      const fileUuid = uuidv4();
      
      // Create a safe filename with the file extension from the original name
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 
        (file.type === 'application/pdf' ? 'pdf' : 'pptx');
      
      // Generate storage path with sanitized filename
      const filePath = `${fileUuid}.${fileExtension}`;
      
      // Ensure bucket exists before uploading
      try {
        // First check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error("Error listing buckets:", listError);
          throw new Error("Failed to check storage buckets");
        }
        
        const bucketExists = buckets?.some(bucket => bucket.name === 'pitch-decks');
        
        if (!bucketExists) {
          console.log('Creating pitch-decks bucket before upload');
          const { error: createError } = await supabase.storage.createBucket('pitch-decks', {
            public: false,
            allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
            throw new Error("Failed to create storage bucket");
          }
        }
      } catch (bucketError) {
        console.error('Bucket error:', bucketError);
        stopProgressSimulation();
        setUploading(false);
        setError("Failed to access storage. Please try again later.");
        toast({
          title: "Storage access failed",
          description: "Could not access the storage bucket. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('pitch-decks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Changed from false to true to handle case where file might exist
        });

      stopProgressSimulation();
      
      if (storageError) {
        console.error('Storage error:', storageError);
        setUploadProgress(0);
        throw new Error(storageError.message || "Failed to upload file");
      }

      setUploadProgress(100);

      // Create file record in the database
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          storage_path: filePath,
          file_type: file.type,
          file_size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          owner: 'Current User' // In a real app, use authenticated user's information
        })
        .select()
        .single();

      if (fileError) {
        throw new Error(fileError.message || "Failed to create file record");
      }

      toast({
        title: "Upload successful",
        description: "Your pitch deck has been uploaded successfully.",
      });

      // Start analysis
      setUploading(false);
      setAnalyzing(true);

      try {
        // Call the Supabase edge function with proper error handling
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-pitch-deck', {
          body: { 
            fileId: fileData.id,
            fileType: fileExtension
          },
        });
        
        if (analysisError) {
          console.error('Analysis error details:', analysisError);
          throw new Error(analysisError.message || 'Failed to analyze pitch deck');
        }
        
        if (!analysisData || !analysisData.analysis || !analysisData.analysis.id) {
          throw new Error('Invalid response from analysis function');
        }

        toast({
          title: "Analysis complete",
          description: "Your pitch deck has been analyzed successfully.",
        });
        
        // Redirect to analysis results page
        navigate(`/pitch-deck-analysis/${analysisData.analysis.id}`);
      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        setError(analysisError instanceof Error ? analysisError.message : "Failed to analyze the pitch deck");
        toast({
          title: "Analysis failed",
          description: analysisError instanceof Error ? analysisError.message : "Failed to analyze the pitch deck",
          variant: "destructive",
        });
        // Even if analysis fails, don't prevent the user from seeing previous analyses
        navigate('/pitch-deck-analysis');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
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
        {error && (
          <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <h4 className="font-medium">Error</h4>
            </div>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
        
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
              
              {uploading && (
                <div className="w-full space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setError(null);
                  }}
                  disabled={uploading || analyzing}
                >
                  Change File
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || analyzing || !isAuthenticated}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading
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
              {!isAuthenticated && (
                <p className="text-sm text-red-500 mt-2">
                  Please log in to upload and analyze pitch decks.
                </p>
              )}
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
                  PDF and PPTX formats supported (Max 10MB)
                </p>
                {!isAuthenticated && (
                  <p className="text-sm text-red-500">
                    Please log in to upload and analyze pitch decks.
                  </p>
                )}
              </div>
              <Input
                type="file"
                id="file-upload"
                accept=".pdf,.pptx"
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
