export type StorageItem = FileType | FolderType; 

export type FileType = {
  id: string;
  name: string;
  type: "file";
  url: string;
  owner: string;
  dateModified: Date;
  parent: string;
  size: string;
}

export type FolderType= {
  id: string;
  name: string;
  type: "folder";
  parent: string | null;
  owner: string;
  dateModified: Date;
};


