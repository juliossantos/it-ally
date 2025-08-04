import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Create mock client if environment variables are not set
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Utility functions for authentication
export const auth = {
  signUp: async (email: string, password: string, metadata: { name: string; role?: string; sector?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Utility functions for database operations
export const db = {
  // Profile operations
  createProfile: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    return { data, error };
  },

  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateProfile: async (userId: string, updates: Database['public']['Tables']['profiles']['Update']) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Problem types operations
  getProblemTypes: async () => {
    const { data, error } = await supabase
      .from('problem_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data, error };
  },

  // Ticket operations
  createTicket: async (ticket: Database['public']['Tables']['tickets']['Insert']) => {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select(`
        *,
        profiles!tickets_user_id_fkey(name, email, sector),
        problem_types(name)
      `)
      .single();
    return { data, error };
  },

  getTickets: async (filters?: { 
    userId?: string; 
    status?: string; 
    sector?: string; 
    problemTypeId?: string;
    isTechnician?: boolean;
  }) => {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        profiles!tickets_user_id_fkey(name, email, sector),
        problem_types(name),
        technician:profiles!tickets_technician_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.userId && !filters.isTechnician) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }
      if (filters.problemTypeId) {
        query = query.eq('problem_type_id', filters.problemTypeId);
      }
    }

    const { data, error } = await query;
    return { data, error };
  },

  getTicket: async (ticketId: string) => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        profiles!tickets_user_id_fkey(name, email, sector),
        problem_types(name),
        technician:profiles!tickets_technician_id_fkey(name, email),
        ticket_history(*)
      `)
      .eq('id', ticketId)
      .single();
    return { data, error };
  },

  updateTicket: async (ticketId: string, updates: Database['public']['Tables']['tickets']['Update']) => {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select(`
        *,
        profiles!tickets_user_id_fkey(name, email, sector),
        problem_types(name),
        technician:profiles!tickets_technician_id_fkey(name, email)
      `)
      .single();
    return { data, error };
  },

  // Check for duplicate tickets
  checkDuplicateTickets: async (userId: string, sector: string, problemTypeId: string) => {
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', userId)
      .eq('sector', sector)
      .eq('problem_type_id', problemTypeId)
      .in('status', ['open', 'in_progress']);
    return { data, error };
  }
};