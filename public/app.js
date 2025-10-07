async function sendQuery() {
  const query = document.getElementById('query').value;
  const messages = document.getElementById('messages');
  messages.innerHTML += `<p><strong>You:</strong> ${escapeHtml(query)}</p>`;

  const response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await response.json();

  if (response.ok) {
    messages.innerHTML += `<p><strong>Agent summary:</strong> ${escapeHtml(data.summary || '')}</p>`;
    messages.innerHTML += `<p><strong>Executed SQL:</strong> <code>${escapeHtml(data.sql || '')}</code></p>`;

    // If rows exist, render a simple table
    if (Array.isArray(data.rows) && data.rows.length > 0) {
      const tableHtml = buildTableHtml(data.rows);
      messages.innerHTML += tableHtml;
    } else {
      messages.innerHTML += `<p><em>No rows returned.</em></p>`;
    }
  } else {
    messages.innerHTML += `<p><strong>Error:</strong> ${escapeHtml((data && data.error) || 'Unknown error')}</p>`;
  }

  document.getElementById('query').value = '';
}

async function sendSuggestion(query) {
  document.getElementById('query').value = query;
  await sendQuery();
}

function buildTableHtml(rows) {
  const headers = Object.keys(rows[0]);
  let html = '<table border="1" cellpadding="4" style="border-collapse:collapse;margin:6px 0">';
  html += '<thead><tr>' + headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr></thead>';
  html += '<tbody>' + rows.map(r => '<tr>' + headers.map(h => `<td>${escapeHtml(String(r[h] ?? ''))}</td>`).join('') + '</tr>').join('') + '</tbody>';
  html += '</table>';
  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
