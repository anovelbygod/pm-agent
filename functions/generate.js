exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, model, images } = JSON.parse(event.body);
    const apiKey = event.headers['x-api-key'];

    if (!apiKey) {
      return { statusCode: 401, body: JSON.stringify({ error: 'API key required' }) };
    }

    // Build message content — text only, or text + images if provided
    let content;
    if (images && images.length > 0) {
      content = [
        // Images first — gives Claude visual context before reading the prompt
        ...images.map(img => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType,
            data: img.base64
          }
        })),
        // Then the text prompt
        { type: 'text', text: prompt }
      ];
    } else {
      content = prompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content }]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};