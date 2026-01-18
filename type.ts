// src/types.ts
export interface Atom {
  id: string;
  name: string;
  description: string;
  value?: string | number;
}

export interface ArchiveRecord {
  id: string;
  title: string;
  timestamp: string;
}
