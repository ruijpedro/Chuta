/** ChutaXuta v1.60 — funções auxiliares; sem doGet/doPost duplicados. */
const CX160_CONFIG = 'Configuracao';
const CX160_GUESTS = 'Jogadores_Jogo';
function cx160Sheet_(name, header) {
  const ss = SpreadsheetApp.openById(CX_SHEET_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); }
  return sh;
}
function cx160Config_() {
  const sh = cx160Sheet_(CX160_CONFIG, ['Chave', 'Valor']);
  const rows = sh.getDataRange().getDisplayValues();
  const item = rows.find((r, i) => i > 0 && r[0] === 'game_datetime');
  return item ? String(item[1]) : '';
}
function cx160SetConfig_(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return {ok:false,error:'Data/hora invalida'};
  const [date, time] = value.split('T');
  const [y,m,d] = date.split('-').map(Number), [h,min] = time.split(':').map(Number);
  const test = new Date(Date.UTC(y,m-1,d));
  if (test.getUTCFullYear() !== y || test.getUTCMonth() !== m-1 || test.getUTCDate() !== d || h>23 || min>59) return {ok:false,error:'Data/hora invalida'};
  const sh = cx160Sheet_(CX160_CONFIG, ['Chave','Valor']);
  const rows = sh.getDataRange().getDisplayValues();
  const index = rows.findIndex((r,i) => i>0 && r[0]==='game_datetime');
  if (index < 0) { sh.appendRow(['game_datetime',value]); }
  else { sh.getRange(index+1,2).setNumberFormat('@').setValue(value); }
  return {ok:true,game_datetime:value};
}
function cx160Guests_(cycle) {
  const sh = cx160Sheet_(CX160_GUESTS, ['Ciclo','Jogador','Pagamento','Presenca']);
  return sh.getDataRange().getDisplayValues().slice(1)
    .filter(r => r[0] === cycle && norm_(r[1]))
    .map(r => ({jogador:r[1],pagamento:r[2],presenca:r[3],pontual:true}));
}
function cx160AddPlayer_(body, cycle) {
  const name=norm_(body.jogador),scope=norm_(body.scope);
  const payment=norm_(body.pagamento)==='mes'?'mês':'jogo';
  if (!name || name.length>100) return {ok:false,error:'Nome invalido'};
  const sh=sheet_(),last=sh.getLastRow();
  const names=last>HEADER_ROW?sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,1).getDisplayValues():[];
  if (names.some(r=>norm_(r[0]).toLocaleLowerCase('pt-PT')===name.toLocaleLowerCase('pt-PT'))) return {ok:false,error:'Jogador ja pertence ao plantel'};
  if (scope==='plantel') {
    sh.getRange(last+1,2,1,4).setValues([[name,'',payment,0]]);
    return {ok:true,jogador:name,scope:'plantel'};
  }
  if (scope!=='jogo') return {ok:false,error:'Tipo de inscricao invalido'};
  const guests=cx160Sheet_(CX160_GUESTS,['Ciclo','Jogador','Pagamento','Presenca']);
  const rows=guests.getDataRange().getDisplayValues().slice(1);
  if (rows.some(r=>r[0]===cycle && norm_(r[1]).toLocaleLowerCase('pt-PT')===name.toLocaleLowerCase('pt-PT'))) return {ok:false,error:'Convidado ja existe neste jogo'};
  guests.appendRow([cycle,name,payment,'']);
  return {ok:true,jogador:name,scope:'jogo',game_key:cycle};
}
function cx160UpdateGuest_(body, cycle) {
  const name=norm_(body.jogador),sh=cx160Sheet_(CX160_GUESTS,['Ciclo','Jogador','Pagamento','Presenca']);
  const rows=sh.getDataRange().getDisplayValues();
  const i=rows.findIndex((r,index)=>index>0 && r[0]===cycle && norm_(r[1]).toLocaleLowerCase('pt-PT')===name.toLocaleLowerCase('pt-PT'));
  if (i<0) return null;
  if (Object.prototype.hasOwnProperty.call(body,'presenca')) sh.getRange(i+1,4).setValue(norm_(body.presenca));
  return {ok:true,jogador:name,game_key:cycle,pontual:true};
}
