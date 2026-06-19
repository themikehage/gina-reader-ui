const form = document.getElementById('readerForm');
const urlInput = document.getElementById('urlInput');
const btn = document.getElementById('readBtn');
const resultArea = document.getElementById('resultArea');
const preview = document.getElementById('preview');
const markdown = document.getElementById('markdown');
const json = document.getElementById('json');
const errorArea = document.getElementById('errorArea');
const copyBtn = document.getElementById('copyBtn');
const tabs = document.querySelectorAll('.tab');

let currentData = null;
let currentTab = 'preview';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorArea.classList.add('hidden');
  resultArea.classList.add('hidden');

  const url = urlInput.value.trim();
  if (!url) return;

  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const res = await fetch('/api/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, format: 'json' }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Error desconocido');
      return;
    }

    currentData = data;
    renderPreview(data);
    renderMarkdown(data);
    renderJson(data);
    resultArea.classList.remove('hidden');
  } catch (err) {
    showError('Error de conexión con el servidor');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    currentTab = target;

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    preview.classList.toggle('hidden', target !== 'preview');
    markdown.classList.toggle('hidden', target !== 'markdown');
    json.classList.toggle('hidden', target !== 'json');
  });
});

copyBtn.addEventListener('click', () => {
  let text = '';

  if (currentTab === 'preview' && currentData) {
    text = currentData.markdown || currentData.data?.content || currentData.data || '';
  } else if (currentTab === 'markdown') {
    text = markdown.textContent;
  } else if (currentTab === 'json') {
    text = json.textContent;
  }

  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = 'Copiado!';
    setTimeout(() => {
      copyBtn.textContent = 'Copiar';
    }, 2000);
  });
});

function renderPreview(data) {
  const md = data.markdown || data.data?.content || data.data || '';
  preview.innerHTML = marked.parse(md);
}

function renderMarkdown(data) {
  const md = data.markdown || data.data?.content || data.data || '';
  markdown.textContent = md;
}

function renderJson(data) {
  json.textContent = JSON.stringify(data, null, 2);
}

function showError(msg) {
  errorArea.textContent = msg;
  errorArea.classList.remove('hidden');
}
