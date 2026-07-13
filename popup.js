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

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.title = 'コピー';
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    copyBtn.addEventListener('click', () => copyMemo(memo.text, copyBtn));

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.title = '編集';
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    editBtn.addEventListener('click', () => startMemoEdit(text, actions, index, memo.text));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = '削除';
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    deleteBtn.addEventListener('click', () => deleteMemo(index));

    const actions = document.createElement('div');
    actions.className = 'memo-actions';
    actions.appendChild(copyBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    const header = document.createElement('div');
    header.className = 'memo-header';
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

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

// メモをクリップボードにコピー
function copyMemo(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = CHECK_ICON;
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = COPY_ICON;
      btn.classList.remove('copied');
    }, 700);
  });
}

// メモのインライン編集を開始
function startMemoEdit(textEl, actionsEl, index, currentText) {
  const textarea = document.createElement('textarea');
  textarea.className = 'memo-edit-textarea';
  textarea.value = currentText;
  textEl.replaceWith(textarea);
  textarea.focus();

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.title = '保存';
  saveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.title = 'キャンセル';
  cancelBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const spacer = document.createElement('div');
  spacer.style.width = '26px';

  actionsEl.innerHTML = '';
  actionsEl.appendChild(cancelBtn);
  actionsEl.appendChild(saveBtn);
  actionsEl.appendChild(spacer);

  saveBtn.addEventListener('click', () => {
    const newText = textarea.value.trim();
    if (!newText) return;
    updateMemoText(index, newText);
  });

  cancelBtn.addEventListener('click', () => loadMemos());
}

// メモのテキストを更新
function updateMemoText(index, text) {
  chrome.storage.local.get({ memos: [] }, ({ memos }) => {
    memos[index].text = text;
    chrome.storage.local.set({ memos }, () => renderMemos(memos));
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
