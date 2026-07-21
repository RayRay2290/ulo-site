const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { password, type, data } = body;
  
  if (password !== 'ulo2026') {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  if (!type || !data) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing type or data' })
    };
  }

  if (type !== 'rooms' && type !== 'images') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid type' })
    };
  }

  try {
    const filename = type === 'rooms' ? 'rooms.json' : 'images.json';
    const filepath = path.join(__dirname, '..', '..', filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, file: filename })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to write file: ' + err.message })
    };
  }
};
