import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, LogOut, User, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TicketForm } from './TicketForm';
import { TicketCard } from './TicketCard';
import { TicketDetails } from './TicketDetails';
import { db, TicketWithDetails } from '@/lib/localStorage';

export function TicketDashboard() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile, signOut } = useAuth();

  const isTechnician = profile?.role === 'technician' || profile?.role === 'admin';

  useEffect(() => {
    loadTickets();
  }, [profile]);

  const loadTickets = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await db.getTickets({
        userId: profile.id,
        isTechnician
      });

      if (error) {
        console.error('Error loading tickets:', error);
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketUpdate = () => {
    loadTickets();
    setSelectedTicket(null);
  };

  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const completedTickets = tickets.filter(t => t.status === 'completed');
  const rejectedTickets = tickets.filter(t => t.status === 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando chamados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Sistema de Chamados</h1>
                <p className="text-muted-foreground">
                  {isTechnician ? 'Painel do Técnico' : 'Meus Chamados'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{profile?.name}</span>
                <span className="text-muted-foreground">({profile?.role})</span>
              </div>
              
              {!isTechnician && (
                <Button onClick={() => setShowForm(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Novo Chamado
                </Button>
              )}
              
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {showForm && !isTechnician ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                ← Voltar para lista
              </Button>
            </div>
            <TicketForm onTicketCreated={() => { setShowForm(false); loadTickets(); }} />
          </div>
        ) : (
          <Tabs defaultValue="open" className="space-y-6">
            <TabsList>
              <TabsTrigger value="open">
                Abertos ({openTickets.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                Em Atendimento ({inProgressTickets.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Finalizados ({completedTickets.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Recusados ({rejectedTickets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {openTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhum chamado em aberto</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {openTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewDetails={setSelectedTicket}
                      showUserInfo={isTechnician}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4">
              {inProgressTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhum chamado em atendimento</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewDetails={setSelectedTicket}
                      showUserInfo={isTechnician}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhum chamado finalizado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewDetails={setSelectedTicket}
                      showUserInfo={isTechnician}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhum chamado recusado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rejectedTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewDetails={setSelectedTicket}
                      showUserInfo={isTechnician}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Ticket Details Modal */}
      <TicketDetails
        ticket={selectedTicket}
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={handleTicketUpdate}
      />
    </div>
  );
}