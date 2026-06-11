/**
 * popup.js - Simple Memo Chrome Extension
 */

const memoInput = document.getElementById('memoInput');
const addBtn = document.getElementById('addBtn');
const memoList = document.getElementById('memoList');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

// ストレージからメモを読み込んで表示
function loadMemos() {
  chrome.storage.local.get({ memos: [] }, ({ memos }) => {
    renderMemos(memos);
  });
}

// メモ一覧を描画
function renderMemos(memos) {
  memoList.innerHTML = '';

  if (memos.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'メモがありません';
    memoList.appendChild(empty);
    return;
  }

  // 新しい順に表示
  [...memos].reverse().forEach((memo, reversedIndex) => {
    const index = memos.length - 1 - reversedIndex;
    const item = document.createElement('div');
    item.className = 'memo-item';

    const text = document.createElement('p');
    text.className = 'memo-text';
    text.textContent = memo.text;

    const meta = document.createElement('span');
    meta.className = 'memo-date';
    meta.textContent = formatDate(memo.createdAt);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'コピー';
    copyBtn.addEventListener('click', () => copyMemo(memo.text, copyBtn));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteMemo(index));

    const actions = document.createElement('div');
    actions.className = 'memo-actions';
    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);

    const header = document.createElement('div');
    header.className = 'memo-header';
    header.appendChild(meta);
    header.appendChild(actions);

    item.appendChild(header);
    item.appendChild(text);
    memoList.appendChild(item);
  });
}

// メモを追加
function addMemo() {
  const text = memoInput.value.trim();
  if (!text) return;

  chrome.storage.local.get({ memos: [] }, ({ memos }) => {
    memos.push({ text, createdAt: Date.now() });
    chrome.storage.local.set({ memos }, () => {
      memoInput.value = '';
      renderMemos(memos);
    });
  });
}

// メモをクリップボードにコピー
function copyMemo(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'コピー済み';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 700);
  });
}

// メモを削除
function deleteMemo(index) {
  chrome.storage.local.get({ memos: [] }, ({ memos }) => {
    memos.splice(index, 1);
    chrome.storage.local.set({ memos }, () => {
      renderMemos(memos);
    });
  });
}

// JSON export
function exportMemos() {
  chrome.storage.local.get({ memos: [] }, ({ memos }) => {
    const json = JSON.stringify({ version: 1, memos }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `simple-memo-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// JSON import
function importMemos(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      const imported = Array.isArray(parsed) ? parsed : parsed.memos;

      if (!Array.isArray(imported)) throw new Error('invalid format');

      const valid = imported.filter(
        (m) => typeof m.text === 'string' && typeof m.createdAt === 'number'
      );

      chrome.storage.local.get({ memos: [] }, ({ memos }) => {
        // 既存メモと結合（createdAt で重複排除）
        const existingKeys = new Set(memos.map((m) => m.createdAt));
        const merged = [...memos, ...valid.filter((m) => !existingKeys.has(m.createdAt))];
        merged.sort((a, b) => a.createdAt - b.createdAt);

        chrome.storage.local.set({ memos: merged }, () => {
          renderMemos(merged);
        });
      });
    } catch {
      alert('JSONファイルの読み込みに失敗しました。');
    } finally {
      // 同じファイルを再度選択できるようにリセット
      importFile.value = '';
    }
  };
  reader.readAsText(file);
}

// 日付フォーマット
function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// イベントリスナー
addBtn.addEventListener('click', addMemo);

memoInput.addEventListener('keydown', (e) => {
  // Ctrl+Enter または Cmd+Enter で追加
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    addMemo();
  }
});

memoInput.addEventListener('paste', (e) => {
  e.preventDefault();
  const plain = e.clipboardData.getData('text/plain');
  const start = memoInput.selectionStart;
  const end = memoInput.selectionEnd;
  const value = memoInput.value;
  memoInput.value = value.slice(0, start) + plain + value.slice(end);
  memoInput.selectionStart = memoInput.selectionEnd = start + plain.length;
});

exportBtn.addEventListener('click', exportMemos);
importFile.addEventListener('change', importMemos);

// 初期ロード
loadMemos();
