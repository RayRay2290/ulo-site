exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { password, type, data } = body;
  
  if (password !== 'ulo2026') {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (!type || !data || (type !== 'rooms' && type !== 'images')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  try {
    const filename = type === 'rooms' ? 'rooms.json' : 'images.json';
    const content = JSON.stringify(data, null, 2);
    
    // Use Netlify API to update the file
    const siteId = process.env.ULO_SITE_ID;
const token = process.env.ULO_DEPLOY_TOKEN;
    
    if (!siteId || !token) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing env vars SITE_ID or NETLIFY_TOKEN' }) };
    }

    // Create a new deploy with the updated file
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [`/${filename}`]: {
            content: content,
            encoding: 'utf-8'
          }
        },
        draft: false
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error('Deploy failed: ' + err);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, file: filename })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};