#!/bin/sh
set -eu

model="${OLLAMA_MODEL:-qwen2.5:1.5b-instruct}"
local_api="http://127.0.0.1:11434"

# O servidor escuta em IPv4 e IPv6 para funcionar também em projetos Railway
# cuja rede privada ainda resolve apenas endereços IPv6.
OLLAMA_HOST="[::]:11434" ollama serve &
server_pid=$!

stop_server() {
  kill "$server_pid" 2>/dev/null || true
  wait "$server_pid" 2>/dev/null || true
}
trap stop_server INT TERM

until OLLAMA_HOST="$local_api" ollama list >/dev/null 2>&1; do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo "O servidor Ollama encerrou antes de ficar disponível."
    wait "$server_pid"
    exit 1
  fi
  sleep 2
done

if ! OLLAMA_HOST="$local_api" ollama list | awk 'NR > 1 { print $1 }' | grep -Fxq "$model"; then
  echo "Baixando o modelo $model para o volume persistente..."
  OLLAMA_HOST="$local_api" ollama pull "$model"
else
  echo "O modelo $model já está disponível no volume persistente."
fi

echo "Ollama pronto para receber requisições com o modelo $model."
wait "$server_pid"
