import { getApiKey, setApiKey } from '@/utils/storage';
import './style.css';

const input = document.getElementById('api-key') as HTMLInputElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLDivElement;

// Load existing key
getApiKey().then((key) => {
  if (key) {
    input.value = key;
    showStatus('API key is configured.', 'success');
  }
});

saveBtn.addEventListener('click', async () => {
  const key = input.value.trim();

  if (!key) {
    showStatus('Please enter an API key.', 'error');
    return;
  }

  if (!key.startsWith('sk-ant-')) {
    showStatus('Invalid key format. Should start with sk-ant-', 'error');
    return;
  }

  await setApiKey(key);
  showStatus('API key saved!', 'success');
});

function showStatus(message: string, type: 'success' | 'error'): void {
  status.textContent = message;
  status.className = `status ${type}`;
}
