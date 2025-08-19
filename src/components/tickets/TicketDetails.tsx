import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Building, AlertCircle, Clock } from 'lucide-react';
import { TicketWithDetails } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/localStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketDetailsProps {
  ticket: TicketWithDetails | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const statusConfig = {
  open: {
    label: 'Aberto',
    variant: 'destructive' as const,
    color: 'text-destructive'
  },
  in_progress: {
    label: 'Em Atendimento',
    variant: 'warning' as const,
    color: 'text-warning'
  },
  completed: {
    label: 'Finalizado',
    variant: 'success' as const,
    color: 'text-success'
  },
  rejected: {
    label: 'Recusado',
    variant: 'secondary' as const,
    color: 'text-muted-foreground'
  }
};

export function TicketDetails({ ticket, open, onClose, onUpdate }: TicketDetailsProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const { profile } = useAuth();
  const { toast } = useToast();

  if (!ticket) return null;

  const isTechnician = profile?.role === 'technician' || profile?.role === 'admin';
  const canTakeAction = isTechnician && (ticket.status === 'open' || ticket.status === 'in_progress');
  const status = statusConfig[ticket.status];

  const handleAcceptTicket = async () => {
    if (!profile) return;
    
    setActionLoading(true);
    try {
      const { error } = await db.updateTicket(ticket.id, {
        status: 'in_progress',
        technician_id: profile.id
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Chamado aceito!',
        description: 'O chamado foi atribuído a você e está em atendimento.'
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível aceitar o chamado'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTicket = async () => {
    if (!diagnosis.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O diagnóstico técnico é obrigatório para finalizar o chamado'
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await db.updateTicket(ticket.id, {
        status: 'completed',
        diagnosis: diagnosis.trim(),
        completed_at: new Date().toISOString()
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Chamado finalizado!',
        description: 'O chamado foi marcado como concluído.'
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível finalizar o chamado'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTicket = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O motivo da recusa é obrigatório'
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await db.updateTicket(ticket.id, {
        status: 'rejected',
        rejection_reason: rejectionReason.trim(),
        technician_id: profile?.id
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Chamado recusado',
        description: 'O chamado foi marcado como recusado.'
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível recusar o chamado'
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Solicitante</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{ticket.profiles?.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Setor</Label>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{ticket.sector}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de Problema</Label>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span>{ticket.problem_types?.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Data de Abertura</Label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
              </div>
            </div>
          </div>

          {ticket.technician && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Técnico Responsável</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{ticket.technician.name}</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Descrição do Problema</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Diagnosis or Rejection Reason */}
          {ticket.diagnosis && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Diagnóstico Técnico</Label>
              <div className="p-3 bg-success/10 border border-success/20 rounded-md">
                <p className="whitespace-pre-wrap">{ticket.diagnosis}</p>
              </div>
            </div>
          )}

          {ticket.rejection_reason && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Motivo da Recusa</Label>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="whitespace-pre-wrap">{ticket.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Technician Actions */}
          {canTakeAction && (
            <>
              <Separator />
              
              {ticket.status === 'open' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Ações do Técnico</Label>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAcceptTicket}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      {actionLoading ? 'Processando...' : 'Aceitar Chamado'}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rejection">Ou recusar com motivo:</Label>
                    <Textarea
                      id="rejection"
                      placeholder="Digite o motivo da recusa..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      variant="destructive"
                      onClick={handleRejectTicket}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="w-full"
                    >
                      {actionLoading ? 'Processando...' : 'Recusar Chamado'}
                    </Button>
                  </div>
                </div>
              )}

              {ticket.status === 'in_progress' && ticket.technician_id === profile?.id && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Finalizar Chamado</Label>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnóstico Técnico *</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Descreva a solução aplicada ou ação executada..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={4}
                    />
                    <Button 
                      onClick={handleCompleteTicket}
                      disabled={actionLoading || !diagnosis.trim()}
                      className="w-full"
                    >
                      {actionLoading ? 'Finalizando...' : 'Finalizar Chamado'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}