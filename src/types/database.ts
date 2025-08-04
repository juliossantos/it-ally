export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'user' | 'technician' | 'admin';
          sector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: 'user' | 'technician' | 'admin';
          sector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'user' | 'technician' | 'admin';
          sector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      problem_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          user_id: string;
          sector: string;
          problem_type_id: string;
          title: string;
          description: string;
          status: 'open' | 'in_progress' | 'rejected' | 'completed';
          technician_id: string | null;
          diagnosis: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          sector: string;
          problem_type_id: string;
          title: string;
          description: string;
          status?: 'open' | 'in_progress' | 'rejected' | 'completed';
          technician_id?: string | null;
          diagnosis?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          sector?: string;
          problem_type_id?: string;
          title?: string;
          description?: string;
          status?: 'open' | 'in_progress' | 'rejected' | 'completed';
          technician_id?: string | null;
          diagnosis?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      ticket_history: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          action: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          action: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          action?: string;
          description?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProblemType = Database['public']['Tables']['problem_types']['Row'];
export type Ticket = Database['public']['Tables']['tickets']['Row'];
export type TicketHistory = Database['public']['Tables']['ticket_history']['Row'];

export type TicketWithDetails = Ticket & {
  profiles: Profile;
  problem_types: ProblemType;
  technician?: Profile;
  ticket_history?: TicketHistory[];
};