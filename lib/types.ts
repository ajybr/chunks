
export interface StorageItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  uploadedBy: string;
  fileSize: string; // "2.5 MB" or "-" for folders
  dateModified: Date;
}
