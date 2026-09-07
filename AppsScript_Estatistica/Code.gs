/**
 * ChutaXuta v1.46 — backend Google Sheets
 * Folha: Presencas
 * Cabeçalhos na linha 2: B Jogador | C Presença | D Pagamento | E Estatística | F Jantar
 * Estatística acumula e NUNCA é apagada pelo reset semanal.
 */
const CX_SHEET_ID = '1Pow94ZwdNKqAQJkwubEz8kR8FzITrhGaK5K0WEJBSn0';
const CX_SHEET_NAME = 'Presencas';
const HEADER_ROW = 2;

function sheet_() {
  return SpreadsheetApp.openById(CX_SHEET_ID).getSheetByName(CX_SHEET_NAME);
}

function jsonp_(obj, callback) {
  const txt = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + txt + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.JSON);
}

function norm_(v) { return String(v == null ? '' : v).trim(); }

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'reset') {
    resetPresencas_();
    return jsonp_({ok:true, action:'reset'}, p.callback);
  }

  const sh = sheet_();
  const last = sh.getLastRow();
  if (last <= HEADER_ROW) return jsonp_([], p.callback);
  const vals = sh.getRange(HEADER_ROW + 1, 2, last - HEADER_ROW, 5).getValues(); // B:F
  const rows = vals.map(r => ({
    jogador: norm_(r[0]),
    presenca: norm_(r[1]),
    pagamento: norm_(r[2]),
    estatistica: Number(r[3]) || 0,
    jantar: norm_(r[4])
  })).filter(r => r.jogador);
  return jsonp_(rows, p.callback);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const nome = norm_(body.jogador);
    if (!nome) return jsonp_({ok:false,error:'jogador vazio'});

    const sh = sheet_();
    const last = sh.getLastRow();
    if (last <= HEADER_ROW) return jsonp_({ok:false,error:'sem jogadores'});
    const names = sh.getRange(HEADER_ROW + 1, 2, last - HEADER_ROW, 1).getDisplayValues();
    let row = -1;
    for (let i=0;i<names.length;i++) {
      if (norm_(names[i][0]).toLowerCase() === nome.toLowerCase()) { row = HEADER_ROW + 1 + i; break; }
    }
    if (row < 0) return jsonp_({ok:false,error:'jogador não encontrado'});

    // Estado semanal
    sh.getRange(row,3).setValue(norm_(body.presenca));
    sh.getRange(row,4).setValue(norm_(body.pagamento));
    if (body.jantar !== undefined) sh.getRange(row,6).setValue(norm_(body.jantar));

    // Estatística: +1 no máximo uma vez por jogador e por semana.
    const delta = Number(body.estatistica_delta || 0);
    const semana = norm_(body.semana) || Utilities.formatDate(new Date(), 'Europe/Lisbon', 'yyyy-MM-dd');
    const props = PropertiesService.getScriptProperties();
    const dedupeKey = 'STAT|' + nome.toLowerCase() + '|' + semana;
    let atual = Number(sh.getRange(row,5).getValue()) || 0;

    if (delta > 0 && !props.getProperty(dedupeKey)) {
      atual += 1;
      sh.getRange(row,5).setValue(atual);
      props.setProperty(dedupeKey, '1');
    } else {
      // Compatibilidade: nunca deixa uma app com valor maior perder o acumulado.
      const recebido = Number(body.estatistica || 0);
      if (recebido > atual) {
        atual = recebido;
        sh.getRange(row,5).setValue(atual);
      }
    }

    SpreadsheetApp.flush();
    return jsonp_({ok:true,jogador:nome,estatistica:atual});
  } finally {
    lock.releaseLock();
  }
}

function resetPresencas_() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last <= HEADER_ROW) return;
  // Limpa APENAS Presença (C) e Jantar (F). Estatística (E) fica intacta.
  sh.getRange(HEADER_ROW + 1, 3, last - HEADER_ROW, 1).clearContent();
  sh.getRange(HEADER_ROW + 1, 6, last - HEADER_ROW, 1).clearContent();
  SpreadsheetApp.flush();
}
