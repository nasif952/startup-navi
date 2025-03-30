
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  FolderOpen,
  ChevronRight,
  File,
  Trash2,
  Download,
  Search,
  CheckSquare,
  ArrowLeft
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddDocumentDialog } from '@/components/dialogs/AddDocumentDialog';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { EditDocumentMetadataDialog } from '@/components/dialogs/EditDocumentMetadataDialog';
import { Badge } from '@/components/ui/badge';

interface Folder {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  parent_id: string | null;
}

interface File {
  id: string;
  name: string;
  description?: string;
  location: string;
  owner: string;
  date: string;
  fileSize: string;
  storage_path: string;
  file_type?: string;
}

export default function DataRoom() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Root' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch folders
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['folders', currentFolderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('parent_id', currentFolderId)
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching folders:', error);
        return [];
      }
      
      return data as Folder[];
    }
  });

  // Fetch files
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['files', currentFolderId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('files')
        .select('*');

      // Apply folder filter if we're in a specific folder
      if (currentFolderId) {
        query = query.eq('folder_id', currentFolderId);
      } else {
        query = query.is('folder_id', null);
      }

      // Apply search filter if provided
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }
      
      // Format dates and file sizes for display
      return data.map((file) => ({
        ...file,
        date: new Date(file.created_at).toLocaleDateString(),
        fileSize: file.file_size || '-',
        location: folderPath.map(f => f.name).join(' / ')
      })) as File[];
    }
  });

  // Delete selected items
  const deleteItemsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItems.length) return;
      
      const fileIdsToDelete = files
        ?.filter(file => selectedItems.includes(file.id))
        .map(file => ({ id: file.id, path: file.storage_path })) || [];
      
      const folderIdsToDelete = folders
        ?.filter(folder => selectedItems.includes(folder.id))
        .map(folder => folder.id) || [];
      
      // Delete files
      if (fileIdsToDelete.length > 0) {
        // First, delete storage objects
        for (const file of fileIdsToDelete) {
          const { error: storageError } = await supabase.storage
            .from('data-room')
            .remove([file.path]);
          
          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
          }
        }
        
        // Then, delete file records
        const { error: filesError } = await supabase
          .from('files')
          .delete()
          .in('id', fileIdsToDelete.map(f => f.id));
        
        if (filesError) {
          throw filesError;
        }
      }
      
      // Delete folders
      if (folderIdsToDelete.length > 0) {
        const { error: foldersError } = await supabase
          .from('folders')
          .delete()
          .in('id', folderIdsToDelete);
        
        if (foldersError) {
          throw foldersError;
        }
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Items deleted",
        description: `${selectedItems.length} item(s) have been deleted.`
      });
      setSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting items",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Handle folder navigation
  const navigateToFolder = async (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    
    if (folderId === null) {
      // Going to root
      setFolderPath([{ id: null, name: 'Root' }]);
    } else {
      // Check if we're going back in the path
      const existingIndex = folderPath.findIndex(f => f.id === folderId);
      
      if (existingIndex >= 0) {
        // Going back to a folder in the path
        setFolderPath(folderPath.slice(0, existingIndex + 1));
      } else {
        // Going forward to a new folder
        setFolderPath([...folderPath, { id: folderId, name: folderName }]);
      }
    }
    
    setSelectedItems([]);
  };
  
  // Download file
  const downloadFile = async (file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from('data-room')
        .download(file.storage_path);
      
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${file.name}`
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  // Handle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };
  
  // Check if storage bucket exists, if not create it
  useEffect(() => {
    const createBucketIfNeeded = async () => {
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.some(b => b.name === 'data-room')) {
        await supabase.storage.createBucket('data-room', {
          public: false
        });
      }
    };
    
    createBucketIfNeeded().catch(console.error);
  }, []);
  
  const isLoading = foldersLoading || filesLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Data Room</h1>
        <p className="text-muted-foreground">Manage documents and investor updates</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Files & Folders</h2>
            <div className="flex space-x-2">
              <AddDocumentDialog folderId={currentFolderId} />
              <CreateFolderDialog parentId={currentFolderId} />
              
              {selectedItems.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteItemsMutation.mutate()}
                  disabled={deleteItemsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete ({selectedItems.length})
                </Button>
              )}
            </div>
          </div>
          
          <Card className="p-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                {folderPath.map((folder, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight size={16} className="text-muted-foreground mx-1" />}
                    <button 
                      onClick={() => navigateToFolder(folder.id, folder.name)}
                      className="text-sm hover:underline flex items-center"
                    >
                      {index === 0 && <FolderOpen size={20} className="text-muted-foreground mr-2" />}
                      <span>{folder.name}</span>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search files..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : folders?.length === 0 && files?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchQuery ? (
                          <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                        ) : (
                          <p className="text-muted-foreground">This folder is empty</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {folders?.map((folder) => (
                        <TableRow key={folder.id} className="hover:bg-muted/30">
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedItems.includes(folder.id)}
                              onChange={() => toggleItemSelection(folder.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell>
                            <button 
                              onClick={() => navigateToFolder(folder.id, folder.name)}
                              className="flex items-center text-primary hover:underline"
                            >
                              <FolderOpen size={18} className="mr-2" />
                              <span>{folder.name}</span>
                            </button>
                          </TableCell>
                          <TableCell>{folderPath.map(f => f.name).join(' / ')}</TableCell>
                          <TableCell>{folder.owner}</TableCell>
                          <TableCell>{new Date(folder.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 
                                  size={16} 
                                  className="text-muted-foreground" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItems([folder.id]);
                                    deleteItemsMutation.mutate();
                                  }}
                                />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {files?.map((file) => (
                        <TableRow key={file.id} className="hover:bg-muted/30">
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedItems.includes(file.id)}
                              onChange={() => toggleItemSelection(file.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <File size={18} className="text-muted-foreground mr-2" />
                              <span>{file.name}</span>
                              {file.description && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Has description
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{file.location}</TableCell>
                          <TableCell>{file.owner}</TableCell>
                          <TableCell>{file.date}</TableCell>
                          <TableCell>{file.fileSize}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => downloadFile(file)}
                              >
                                <Download size={16} className="text-muted-foreground" />
                              </Button>
                              <EditDocumentMetadataDialog file={file} />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedItems([file.id]);
                                  deleteItemsMutation.mutate();
                                }}
                              >
                                <Trash2 size={16} className="text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Investor Updates</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-md border border-border p-2 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={16}
              />
            </div>
          </div>
          
          <Card>
            <div className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">No investor updates available</p>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-muted rounded-full p-2">
                  <FolderOpen size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">New folder created</p>
                  <p className="text-xs text-muted-foreground">Original Documents</p>
                  <p className="text-xs text-muted-foreground">Today at 9:30 AM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-muted rounded-full p-2">
                  <File size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">File uploaded</p>
                  <p className="text-xs text-muted-foreground">Q2 Financial Report.pdf</p>
                  <p className="text-xs text-muted-foreground">Today at 9:15 AM</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
