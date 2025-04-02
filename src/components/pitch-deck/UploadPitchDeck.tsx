
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileDropzone } from './FileDropzone';
import { UploadProgressButton } from './UploadProgressButton';
import { AuthRequiredMessage } from './AuthRequiredMessage';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';

export function UploadPitchDeck() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    file,
    setFile,
    uploading,
    uploadProgress,
    analyzing,
    handleUpload
  } = useFileUpload();

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

  const handleUploadClick = () => {
    handleUpload(isAuthenticated);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
          <FileDropzone 
            file={file} 
            setFile={setFile} 
            isProcessing={uploading || analyzing}
          />
          
          {file && (
            <div className="flex space-x-3 mt-4">
              <UploadProgressButton 
                isUploading={uploading}
                isAnalyzing={analyzing}
                uploadProgress={uploadProgress}
                onUploadClick={handleUploadClick}
                disabled={!isAuthenticated}
              />
            </div>
          )}
          
          {!isAuthenticated && (
            <AuthRequiredMessage />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
