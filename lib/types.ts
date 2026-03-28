// export interface StorageItem {
//   id: string;
//   name: string;
//   type: 'file' | 'folder';
//   uploadedBy: string;
//   fileSize: string; // "2.5 MB" or "-" for folders
//   dateModified: Date;
// }

export type StorageItem = FileType | FolderType; 

export type FileType = {
  id: string;
  name: string;
  type: "file";
  url: string;
  uploadedBy: string;
  dateModified: Date;
  parent: string;
  size: string;
}

export type FolderType= {
  id: string;
  name: string;
  type: "folder";
  parent: string | null;
  uploadedBy: string;
  dateModified: Date;
};


