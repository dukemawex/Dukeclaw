export async function askQwen(prompt, systemPrompt = 'You are DukeClaw AI.') {
  const models = [
    'qwen/qwen3.6-plus:free',
    'google/gemini-pro-1.5-exp:free',
    'mistralai/mistral-7b-instruct:free'
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();
      if (data.choices) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error(`⚠️ Model ${model} failed, trying fallback...`, error);
    }
  }

  throw new Error('❌ All free models exhausted.');
}
