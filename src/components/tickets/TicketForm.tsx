import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db, ProblemType } from '@/lib/localStorage';

interface TicketFormProps {
  onTicketCreated?: () => void;
}

const sectors = [
  'Administrativo',
  'Recursos Humanos',
  'Financeiro',
  'Vendas',
  'Marketing',
  'Produção',
  'Logística',
  'Jurídico',
  'TI',
  'Diretoria'
];

export function TicketForm({ onTicketCreated }: TicketFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    sector: '',
    problemTypeId: '',
    description: ''
  });
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProblemTypes, setLoadingProblemTypes] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadProblemTypes();
  }, []);

  const loadProblemTypes = async () => {
    try {
      const { data, error } = await db.getProblemTypes();
      if (error) {
        console.error('Error loading problem types:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os tipos de problema'
        });
      } else {
        setProblemTypes(data || []);
      }
    } catch (error) {
      console.error('Error loading problem types:', error);
    } finally {
      setLoadingProblemTypes(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Usuário não encontrado'
      });
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate tickets
      const { data: duplicates, error: duplicateError } = await db.checkDuplicateTickets(
        profile.id,
        formData.sector,
        formData.problemTypeId
      );

      if (duplicateError) {
        throw duplicateError;
      }

      if (duplicates && duplicates.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Chamado duplicado',
          description: 'Já existe um chamado em aberto para esse tipo de solicitação. Por favor, aguarde o atendimento.'
        });
        setLoading(false);
        return;
      }

      // Create the ticket
      const { data, error } = await db.createTicket({
        user_id: profile.id,
        title: formData.title,
        sector: formData.sector,
        problem_type_id: formData.problemTypeId,
        description: formData.description
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Chamado criado com sucesso!',
        description: 'Seu chamado foi enviado para o departamento de TI.'
      });

      // Reset form
      setFormData({
        title: '',
        sector: '',
        problemTypeId: '',
        description: ''
      });

      onTicketCreated?.();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar chamado',
        description: error.message || 'Ocorreu um erro inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProblemTypes) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Chamado</CardTitle>
        <CardDescription>
          Preencha as informações para registrar sua solicitação de suporte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Chamado</Label>
            <Input
              id="title"
              placeholder="Ex: Computador com problema de lentidão"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Select value={formData.sector} onValueChange={(value) => handleChange('sector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemType">Tipo de Problema</Label>
            <Select value={formData.problemTypeId} onValueChange={(value) => handleChange('problemTypeId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de problema" />
              </SelectTrigger>
              <SelectContent>
                {problemTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada</Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema em detalhes..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Criando chamado...' : 'Criar Chamado'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}