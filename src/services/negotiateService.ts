import { api } from './api';

/**
 * Chama o backend para obter uma sugestão de acordo gerada por IA.
 * POST /api/negociate/{debtId}/sugget (Ajustado para o typo no Java)
 */
export async function fetchNegotiationSuggestion(debtId: string): Promise<string> {
  // Se o seu context-path for /api e o Controller tiver /api/negociate, a rota é /api/api/negociate
  // Vou usar a rota relativa para evitar confusão com o context-path
  const response = await api.post<{ suggestion: string }>(`/api/negociate/${debtId}/sugget`);
  return response.data.suggestion;
}
