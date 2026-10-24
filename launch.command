#!/bin/bash
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  node scripts/dev.mjs --open
elif command -v python3 >/dev/null 2>&1; then
  python3 scripts/serve.py --open
else
  echo 'Для localhost установите Node.js 20+ или Python 3.'
  echo 'Без установки можно открыть index.html напрямую.'
  read -r -p 'Нажмите Enter, чтобы закрыть окно.'
fi
