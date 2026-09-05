import { useAiStore } from '../store/useAiStore';

export interface AiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function parseApiError(errorText: string, status: number): string {
  if (!navigator.onLine) {
    return 'Немає доступу до інтернету. Перевірте підключення до мережі.';
  }

  if (status === 401 || status === 403) {
    return 'Помилка: невалідний або відсутній API-ключ OpenRouter. Перевірте ключ у налаштуваннях AI.';
  }

  if (status === 429) {
    return 'Помилка: перевищено ліміт запитів або баланс ключа вичерпано. Спробуйте пізніше.';
  }

  if (status >= 500) {
    return 'Помилка: сервер OpenRouter або обрана модель тимчасово недоступні. Спробуйте іншу модель.';
  }

  try {
    const parsed = JSON.parse(errorText);
    if (parsed.error?.message) {
      return `Помилка AI: ${parsed.error.message}`;
    }
  } catch (e) {
    // ignore json parse error
  }

  return `Помилка сервера (HTTP ${status}). Спробуйте пізніше.`;
}

export const aiService = {
  // 1. Validation test request
  async validateKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    if (!apiKey.trim()) {
      return { valid: false, message: 'Ключ порожній. Введіть API-ключ OpenRouter.' };
    }

    if (!navigator.onLine) {
      return { valid: false, message: '❌ Немає доступу до інтернету' };
    }

    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`
        }
      });

      if (res.ok) {
        return { valid: true, message: '✅ Ключ валідний та готовий до роботи' };
      } else {
        const errorText = await res.text();
        return { valid: false, message: `❌ ${parseApiError(errorText, res.status)}` };
      }
    } catch (err: any) {
      return { valid: false, message: '❌ Не вдалося з’єднатися з сервером OpenRouter' };
    }
  },

  // 2. Summarize Note
  async summarizeNote(title: string, text: string): Promise<AiResponse<string>> {
    const { apiKey, model } = useAiStore.getState();

    if (!apiKey) {
      return {
        success: false,
        error: 'API-ключ не налаштовано. Натисніть "Налаштування AI" та введіть ключ OpenRouter.'
      };
    }

    if (!text.trim()) {
      return {
        success: false,
        error: 'Нотатка порожня. Додайте трохи тексту, щоб створити резюме.'
      };
    }

    const systemPrompt = `Ти корисний персональний помічник для ведення нотаток. 
Твоя задача — проаналізувати текст нотатки та скласти лаконічне, чітке та структуроване резюме українською мовою.
Використовуй марковані списки (bullet points) для головних тез та короткий вступ. Відповідай виключно результатом у форматі Markdown.`;

    const userPrompt = `Заголовок: ${title || 'Без назви'}\n\nТекст нотатки:\n${text}`;

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://nullnotes.app',
          'X-Title': 'Nullnotes App'
        },
        body: JSON.stringify({
          model: model || 'google/gemini-2.0-flash-lite-preview-02-05:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: parseApiError(errorText, res.status) };
      }

      const data = await res.json();
      const summary = data.choices?.[0]?.message?.content?.trim();

      if (!summary) {
        return { success: false, error: 'Модель повернула порожню відповідь. Спробуйте ще раз.' };
      }

      return { success: true, data: summary };
    } catch (err: any) {
      if (!navigator.onLine) {
        return { success: false, error: 'Немає з’єднання з інтернетом.' };
      }
      return { success: false, error: 'Помилка мережі при запиті до AI. Спробуйте пізніше.' };
    }
  },

  // 3. Generate Tags
  async generateTags(title: string, text: string): Promise<AiResponse<string[]>> {
    const { apiKey, model } = useAiStore.getState();

    if (!apiKey) {
      return {
        success: false,
        error: 'API-ключ не налаштовано. Натисніть "Налаштування AI" та введіть ключ OpenRouter.'
      };
    }

    if (!text.trim() && !title.trim()) {
      return {
        success: false,
        error: 'Нотатка порожня. Неможливо згенерувати теги.'
      };
    }

    const systemPrompt = `Ти розумний аналізатор тексту.
Проаналізуй тему та зміст нотатки і запропонуй від 2 до 5 коротких, релевантних тегів в одному слові (без пробілів, без знаку #).
Теги мають бути в нижньому регістрі.
Поверни результат ТІЛЬКИ у вигляді валідного JSON масиву рядків, наприклад: ["робота", "плани", "ідеї"].
Не додавай жодних інших слів, пояснень чи Markdown форматування \`\`\`json.`;

    const userPrompt = `Заголовок: ${title || 'Без назви'}\n\nТекст:\n${text.slice(0, 3000)}`;

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://nullnotes.app',
          'X-Title': 'Nullnotes App'
        },
        body: JSON.stringify({
          model: model || 'google/gemini-2.0-flash-lite-preview-02-05:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: parseApiError(errorText, res.status) };
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';

      // Clean markdown quotes if any
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedTags = JSON.parse(cleaned);

      if (Array.isArray(parsedTags)) {
        const cleanedTags = parsedTags
          .map((t: any) => String(t).trim().toLowerCase().replace(/[^a-zа-яіїєґ0-9_-]/g, ''))
          .filter(t => t.length > 0)
          .slice(0, 5);

        return { success: true, data: cleanedTags };
      }

      return { success: false, error: 'Не вдалося розпізнати формат тегів від AI.' };
    } catch (err: any) {
      if (!navigator.onLine) {
        return { success: false, error: 'Немає з’єднання з інтернетом.' };
      }
      return { success: false, error: 'Помилка аналізу тегів. Спробуйте ще раз.' };
    }
  }
};