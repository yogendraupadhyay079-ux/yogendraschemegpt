import { generateAIResponse, streamAIResponse, convertMessagesToGeminiFormat } from './ai.service';
import { getProfile } from './profile.service';
import type { Profile } from '../lib/database.types';

export async function askGemini(text: string, userId?: string): Promise<string> {
  let profile: Profile | undefined;
  if (userId) {
    profile = (await getProfile(userId)) ?? undefined;
  }

  const messages = convertMessagesToGeminiFormat([
    { role: 'user', content: text },
  ]);

  return generateAIResponse(messages, { profile });
}

export async function streamGemini(
  text: string,
  userId: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const profile = (await getProfile(userId)) ?? undefined;

  const messages = convertMessagesToGeminiFormat([
    { role: 'user', content: text },
  ]);

  return streamAIResponse(messages, { profile }, 'en', onChunk, signal);
}
