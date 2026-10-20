export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      website_content: {
        Row: { business_id: string; content: Json };
        Insert: { business_id: string; content: Json };
        Update: { business_id?: string; content?: Json };
        Relationships: [{
          foreignKeyName: "website_content_business_id_fkey";
          columns: ["business_id"];
          isOneToOne: true;
          referencedRelation: "businesses";
          referencedColumns: ["id"];
        }];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          industry: string;
          phone: string | null;
          email: string | null;
          website: string | null;
          city: string | null;
          state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          industry: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          industry?: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      confirm_business_import: {
        Args: { request_key: string; file_digest: string; accepted_rows: Json; invalid_count: number; duplicate_count: number };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
