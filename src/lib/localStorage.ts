// Local storage utilities for the support ticket system

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'technician' | 'admin';
  sector?: string;
  created_at: string;
}

interface ProblemType {
  id: string;
  name: string;
  is_active: boolean;
}

interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  sector: string;
  problem_type_id: string;
  status: 'open' | 'in_progress' | 'completed' | 'rejected';
  technician_id?: string;
  diagnosis?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface TicketWithDetails extends Ticket {
  profiles: Profile;
  problem_types: ProblemType;
  technician?: Profile;
}

// Storage keys
const STORAGE_KEYS = {
  users: 'support_system_users',
  profiles: 'support_system_profiles',
  tickets: 'support_system_tickets',
  problemTypes: 'support_system_problem_types',
  currentUser: 'support_system_current_user',
} as const;

// Initialize default data
const initializeData = () => {
  // Initialize problem types if not exists
  if (!localStorage.getItem(STORAGE_KEYS.problemTypes)) {
    const defaultProblemTypes: ProblemType[] = [
      { id: '1', name: 'Problemas com Internet / Conexão de Rede', is_active: true },
      { id: '2', name: 'Impressora com Defeito', is_active: true },
      { id: '3', name: 'Problemas no Computador (sistema lento, travamentos, etc.)', is_active: true },
      { id: '4', name: 'Manutenção de Hardware', is_active: true },
      { id: '5', name: 'Instalação de Software', is_active: true },
      { id: '6', name: 'Acesso a Sistemas (login, senha, permissões)', is_active: true },
      { id: '7', name: 'Atualização de Software / Sistema Operacional', is_active: true },
      { id: '8', name: 'Configuração de E-mail ou Conta', is_active: true },
      { id: '9', name: 'Outros', is_active: true },
    ];
    localStorage.setItem(STORAGE_KEYS.problemTypes, JSON.stringify(defaultProblemTypes));
  }

  // Initialize empty arrays if not exists
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.profiles)) {
    localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.tickets)) {
    localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify([]));
  }
};

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const getCurrentTimestamp = () => new Date().toISOString();

// Authentication functions
export const auth = {
  signUp: async (email: string, password: string, metadata: { name: string; role?: string; sector?: string }) => {
    try {
      initializeData();
      
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        return { data: null, error: { message: 'Usuário já existe' } };
      }
      
      const userId = generateId();
      const timestamp = getCurrentTimestamp();
      
      const newUser: User = {
        id: userId,
        email,
        created_at: timestamp
      };
      
      const newProfile: Profile = {
        id: userId,
        name: metadata.name,
        email,
        role: (metadata.role as 'user' | 'technician' | 'admin') || 'user',
        sector: metadata.sector,
        created_at: timestamp
      };
      
      users.push(newUser);
      profiles.push(newProfile);
      
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(newUser));
      
      return { data: { user: newUser }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao criar usuário' } };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      initializeData();
      
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return { data: null, error: { message: 'Usuário não encontrado' } };
      }
      
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao fazer login' } };
    }
  },

  signOut: async () => {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    return { error: null };
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.currentUser);
    const user = userStr ? JSON.parse(userStr) : null;
    return Promise.resolve({ data: { user } });
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Simple implementation - in real app you'd use proper event listeners
    const user = localStorage.getItem(STORAGE_KEYS.currentUser);
    const session = user ? { user: JSON.parse(user) } : null;
    
    setTimeout(() => {
      callback('SIGNED_IN', session);
    }, 100);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
};

// Database functions
export const db = {
  // Profile operations
  createProfile: async (profile: Omit<Profile, 'created_at'>) => {
    try {
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      const newProfile: Profile = {
        ...profile,
        created_at: getCurrentTimestamp()
      };
      
      profiles.push(newProfile);
      localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles));
      
      return { data: newProfile, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao criar perfil' } };
    }
  },

  getProfile: async (userId: string) => {
    try {
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      const profile = profiles.find(p => p.id === userId);
      
      if (!profile) {
        return { data: null, error: { message: 'Perfil não encontrado' } };
      }
      
      return { data: profile, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao buscar perfil' } };
    }
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    try {
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      const profileIndex = profiles.findIndex(p => p.id === userId);
      
      if (profileIndex === -1) {
        return { data: null, error: { message: 'Perfil não encontrado' } };
      }
      
      profiles[profileIndex] = { ...profiles[profileIndex], ...updates };
      localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles));
      
      return { data: profiles[profileIndex], error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao atualizar perfil' } };
    }
  },

  // Problem types operations
  getProblemTypes: async () => {
    try {
      initializeData();
      const problemTypes: ProblemType[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.problemTypes) || '[]');
      return { data: problemTypes.filter(pt => pt.is_active), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao buscar tipos de problema' } };
    }
  },

  // Ticket operations
  createTicket: async (ticket: Omit<Ticket, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      const tickets: Ticket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.tickets) || '[]');
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      const problemTypes: ProblemType[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.problemTypes) || '[]');
      
      const timestamp = getCurrentTimestamp();
      const newTicket: Ticket = {
        ...ticket,
        id: generateId(),
        status: 'open',
        created_at: timestamp,
        updated_at: timestamp
      };
      
      tickets.push(newTicket);
      localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(tickets));
      
      // Return ticket with related data
      const profile = profiles.find(p => p.id === newTicket.user_id);
      const problemType = problemTypes.find(pt => pt.id === newTicket.problem_type_id);
      
      const ticketWithDetails = {
        ...newTicket,
        profiles: profile!,
        problem_types: problemType!
      };
      
      return { data: ticketWithDetails, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao criar chamado' } };
    }
  },

  getTickets: async (filters?: {
    userId?: string;
    status?: string;
    sector?: string;
    problemTypeId?: string;
    isTechnician?: boolean;
  }) => {
    try {
      const tickets: Ticket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.tickets) || '[]');
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      const problemTypes: ProblemType[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.problemTypes) || '[]');
      
      let filteredTickets = [...tickets];
      
      if (filters) {
        if (filters.userId && !filters.isTechnician) {
          filteredTickets = filteredTickets.filter(t => t.user_id === filters.userId);
        }
        if (filters.status) {
          filteredTickets = filteredTickets.filter(t => t.status === filters.status);
        }
        if (filters.sector) {
          filteredTickets = filteredTickets.filter(t => t.sector === filters.sector);
        }
        if (filters.problemTypeId) {
          filteredTickets = filteredTickets.filter(t => t.problem_type_id === filters.problemTypeId);
        }
      }
      
      // Add related data
      const ticketsWithDetails: TicketWithDetails[] = filteredTickets.map(ticket => {
        const profile = profiles.find(p => p.id === ticket.user_id);
        const problemType = problemTypes.find(pt => pt.id === ticket.problem_type_id);
        const technician = ticket.technician_id ? profiles.find(p => p.id === ticket.technician_id) : undefined;
        
        return {
          ...ticket,
          profiles: profile!,
          problem_types: problemType!,
          technician
        };
      });
      
      // Sort by created_at descending
      ticketsWithDetails.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { data: ticketsWithDetails, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao buscar chamados' } };
    }
  },

  getTicket: async (ticketId: string) => {
    try {
      const tickets: Ticket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.tickets) || '[]');
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      const problemTypes: ProblemType[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.problemTypes) || '[]');
      
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) {
        return { data: null, error: { message: 'Chamado não encontrado' } };
      }
      
      const profile = profiles.find(p => p.id === ticket.user_id);
      const problemType = problemTypes.find(pt => pt.id === ticket.problem_type_id);
      const technician = ticket.technician_id ? profiles.find(p => p.id === ticket.technician_id) : undefined;
      
      const ticketWithDetails = {
        ...ticket,
        profiles: profile!,
        problem_types: problemType!,
        technician,
        ticket_history: [] // Simple implementation - you could expand this
      };
      
      return { data: ticketWithDetails, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao buscar chamado' } };
    }
  },

  updateTicket: async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      const tickets: Ticket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.tickets) || '[]');
      const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]');
      const problemTypes: ProblemType[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.problemTypes) || '[]');
      
      const ticketIndex = tickets.findIndex(t => t.id === ticketId);
      if (ticketIndex === -1) {
        return { data: null, error: { message: 'Chamado não encontrado' } };
      }
      
      tickets[ticketIndex] = {
        ...tickets[ticketIndex],
        ...updates,
        updated_at: getCurrentTimestamp()
      };
      
      localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(tickets));
      
      // Return ticket with related data
      const ticket = tickets[ticketIndex];
      const profile = profiles.find(p => p.id === ticket.user_id);
      const problemType = problemTypes.find(pt => pt.id === ticket.problem_type_id);
      const technician = ticket.technician_id ? profiles.find(p => p.id === ticket.technician_id) : undefined;
      
      const ticketWithDetails = {
        ...ticket,
        profiles: profile!,
        problem_types: problemType!,
        technician
      };
      
      return { data: ticketWithDetails, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao atualizar chamado' } };
    }
  },

  // Check for duplicate tickets
  checkDuplicateTickets: async (userId: string, sector: string, problemTypeId: string) => {
    try {
      const tickets: Ticket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.tickets) || '[]');
      
      const duplicates = tickets.filter(t =>
        t.user_id === userId &&
        t.sector === sector &&
        t.problem_type_id === problemTypeId &&
        ['open', 'in_progress'].includes(t.status)
      );
      
      return { data: duplicates, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao verificar duplicatas' } };
    }
  }
};

export type { User, Profile, ProblemType, Ticket, TicketWithDetails };