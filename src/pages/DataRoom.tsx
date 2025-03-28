
import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { FolderOpen, Upload, FolderPlus, ChevronRight, File, MoreVertical } from 'lucide-react';

const folderData = [
  { 
    name: 'Original Documents', 
    location: '/', 
    owner: 'Nasif Ahmed', 
    date: '3/27/2025', 
    fileSize: '-',
    isFolder: true 
  },
  { 
    name: 'Private Folder', 
    location: '/', 
    owner: 'Nasif Ahmed', 
    date: '3/27/2025', 
    fileSize: '-',
    isFolder: true 
  },
  { 
    name: 'Public Folder', 
    location: '/', 
    owner: 'Nasif Ahmed', 
    date: '3/27/2025', 
    fileSize: '-',
    isFolder: true 
  }
];

export default function DataRoom() {
  const [searchQuery, setSearchQuery] = useState('');
  
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
              <Button variant="primary" size="sm" iconLeft={<Upload size={16} />}>Upload File</Button>
              <Button variant="outline" size="sm" iconLeft={<FolderPlus size={16} />}>Create Folder</Button>
            </div>
          </div>
          
          <Card>
            <div className="flex items-center mb-4">
              <FolderOpen size={20} className="text-muted-foreground mr-2" />
              <ChevronRight size={16} className="text-muted-foreground mx-1" />
              <span className="text-sm">Files & Folders</span>
            </div>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Owner</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">File Size</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {folderData.map((item, index) => (
                  <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FolderOpen size={18} className="text-primary mr-2" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{item.location}</td>
                    <td className="py-3 px-4">{item.owner}</td>
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">{item.fileSize}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <svg 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          
          <Card>
            <div className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
