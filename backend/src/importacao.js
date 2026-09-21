// Leitura de planilhas (.xlsx ou .csv) para importação em massa de clientes e
// produtos. Usa a biblioteca "xlsx" (SheetJS), que lê os dois formatos com o
// mesmo código.
const XLSX = require("xlsx");

// Normaliza o nome de uma coluna para comparação (sem acento, minúsculo, sem
// espaços) — assim "WhatsApp", "Whats App" e "whatsapp" são todos aceitos.
function normalizarChave(s) {
  return String(s == null ? "" : s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
}

// Lê a planilha (buffer do arquivo enviado) e devolve um array de objetos,
// um por linha, com as chaves já normalizadas.
function parsePlanilha(buffer) {
  // Um .xlsx é um arquivo ZIP e sempre começa com os bytes "PK". Um .csv é
  // texto puro — nesse caso decodificamos como UTF-8 nós mesmos antes de
  // entregar para a biblioteca, porque ela não detecta a codificação sozinha
  // e acaba estragando acentos (ex.: "á" virando outro caractere).
  const ehXlsxBinario = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
  const wb = ehXlsxBinario
    ? XLSX.read(buffer, { type: "buffer" })
    : XLSX.read(buffer.toString("utf8").replace(/^﻿/, ""), { type: "string" });
  const nomeAba = wb.SheetNames[0];
  if (!nomeAba) return [];
  const aba = wb.Sheets[nomeAba];
  const linhasCru = XLSX.utils.sheet_to_json(aba, { defval: "", raw: false });
  return linhasCru.map((linha) => {
    const normalizada = {};
    Object.keys(linha).forEach((chave) => {
      normalizada[normalizarChave(chave)] = linha[chave];
    });
    return normalizada;
  });
}

// Busca o valor de uma linha já normalizada, testando várias variações
// aceitas do nome da coluna (também normalizadas).
function pegar(linhaNormalizada, chavesPossiveis) {
  for (const chave of chavesPossiveis) {
    const nk = normalizarChave(chave);
    const valor = linhaNormalizada[nk];
    if (valor !== undefined && String(valor).trim() !== "") return String(valor).trim();
  }
  return "";
}

module.exports = { parsePlanilha, pegar, normalizarChave };
