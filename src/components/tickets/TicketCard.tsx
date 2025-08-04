import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Building, AlertCircle } from 'lucide-react';
import { TicketWithDetails } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketCardProps {
  ticket: TicketWithDetails;
  onViewDetails: (ticket: TicketWithDetails) => void;
  showUserInfo?: boolean;
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

export function TicketCard({ ticket, onViewDetails, showUserInfo = false }: TicketCardProps) {
  const status = statusConfig[ticket.status];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(ticket)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ticket.description}
            </p>
          </div>
          <Badge variant={status.variant} className="ml-2 shrink-0">
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            {showUserInfo && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="w-4 h-4" />
                {ticket.profiles?.name}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Building className="w-4 h-4" />
              {ticket.sector}
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              {ticket.problem_types?.name}
            </div>
          </div>
          
          {ticket.technician && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              Técnico: {ticket.technician.name}
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t">
          <Button variant="outline" size="sm" className="w-full">
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}