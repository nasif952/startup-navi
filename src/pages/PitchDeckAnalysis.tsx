
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudUpload } from 'lucide-react';

export default function PitchDeckAnalysis() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Pitch Deck Analysis</h1>
        <p className="text-muted-foreground">Upload and analyze your pitch deck with AI</p>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center p-12">
          <CloudUpload className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Upload Your Pitch Deck</h2>
          <p className="text-center text-muted-foreground mb-6">
            Drag and drop your PDF file here, or click to browse
          </p>
          <Button>Select File</Button>
        </div>
      </Card>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Supported format: PDF (Max size: 10MB)
        </p>
      </div>
    </div>
  );
}
