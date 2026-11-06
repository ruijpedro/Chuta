/** ChutaXuta v1.52 — reset semanal seguro + Presenças/Pagamento/Estatística. Sem Jantar. */
const CX_SHEET_ID='1Pow94ZwdNKqAQJkwubEz8kR8FzITrhGaK5K0WEJBSn0';
const CX_SHEET_NAME='Presencas';
const HEADER_ROW=2;
function sheet_(){return SpreadsheetApp.openById(CX_SHEET_ID).getSheetByName(CX_SHEET_NAME);}
function jsonp_(obj,cb){const t=JSON.stringify(obj);return ContentService.createTextOutput(cb?cb+'('+t+')':t).setMimeType(cb?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);}
function norm_(v){return String(v==null?'':v).trim();}
function resetPresencas_(){const sh=sheet_(),last=sh.getLastRow();if(last>HEADER_ROW)sh.getRange(HEADER_ROW+1,3,last-HEADER_ROW,1).clearContent();SpreadsheetApp.flush();}
function ensureCycle_(cycle){
 cycle=norm_(cycle); if(!cycle)return {ok:false,error:'cycle vazio'};
 const props=PropertiesService.getScriptProperties(),old=props.getProperty('CX_RESET_CYCLE');let did=false;
 if(old!==cycle){resetPresencas_();props.setProperty('CX_RESET_CYCLE',cycle);did=true;}
 return {ok:true,cycle:cycle,reset:did};
}
function list_(cycle){
 const sh=sheet_(),last=sh.getLastRow(),data=[];
 if(last>HEADER_ROW){const vals=sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,4).getValues();vals.forEach(r=>{if(norm_(r[0]))data.push({jogador:norm_(r[0]),presenca:norm_(r[1]),pagamento:norm_(r[2]),estatistica:Number(r[3])||0});});}
 return {ok:true,cycle:cycle,data:data};
}

/* API v1.60: configuração e jogadores. Requer publicação de nova versão do Apps Script.
   A API antiga mantém-se; nunca redefinir presenças por simples leitura de configuração. */
const CX_CONFIG_SHEET='Configuracao';
const CX_GUEST_SHEET='Jogadores_Jogo';
function ensureExtraSheet_(name,header){
 const ss=SpreadsheetApp.openById(CX_SHEET_ID);
 let sh=ss.getSheetByName(name);
 if(!sh){sh=ss.insertSheet(name);sh.appendRow(header);}
 return sh;
}
function getConfig_(){
 const sh=ensureExtraSheet_(CX_CONFIG_SHEET,['Chave','Valor']);
 const vals=sh.getDataRange().getDisplayValues();
 const row=vals.find(r=>r[0]==='game_datetime');
 return {ok:true,game_datetime:row?row[1]:'',default_weekday:2,default_time:'22:00'};
}
function setConfig_(value){
 if(!/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/.test(value))return {ok:false,error:'Data inválida'};
 const sh=ensureExtraSheet_(CX_CONFIG_SHEET,['Chave','Valor']);
 const vals=sh.getDataRange().getDisplayValues();
 let idx=vals.findIndex(r=>r[0]==='game_datetime');
 if(idx<0){sh.appendRow(['game_datetime',value]);}else{sh.getRange(idx+1,2).setNumberFormat('@').setValue(value);}
 return getConfig_();
}
function listGuests_(cycle){
 const sh=ensureExtraSheet_(CX_GUEST_SHEET,['Ciclo','Jogador','Pagamento','Presenca']);
 const vals=sh.getDataRange().getDisplayValues().slice(1);
 return vals.filter(r=>r[0]===cycle&&norm_(r[1])).map(r=>({jogador:r[1],pagamento:r[2],presenca:r[3],pontual:true}));
}
function addPlayerV2_(body){
 const nome=norm_(body.jogador),tipo=norm_(body.pagamento)==='mes'?'mes':'jogo';
 const scope=norm_(body.scope),cycle=norm_(body.cycle);
 if(!nome||nome.length>100)return {ok:false,error:'Nome inválido'};
 if(scope==='jogo'){
   if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(cycle))return {ok:false,error:'Ciclo inválido'};
   const sh=ensureExtraSheet_(CX_GUEST_SHEET,['Ciclo','Jogador','Pagamento','Presenca']);
   const vals=sh.getDataRange().getDisplayValues().slice(1);
   if(vals.some(r=>r[0]===cycle&&norm_(r[1]).toLowerCase()===nome.toLowerCase()))return {ok:false,error:'Já existe neste jogo'};
   sh.appendRow([cycle,nome,tipo,'pendente']);
   return {ok:true,jogador:nome,scope:'jogo',cycle:cycle};
 }
 if(scope!=='plantel')return {ok:false,error:'Tipo de inscrição inválido'};
 const sh=sheet_(),last=sh.getLastRow();
 const names=last>HEADER_ROW?sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,1).getDisplayValues():[];
 if(names.some(r=>norm_(r[0]).toLowerCase()===nome.toLowerCase()))return {ok:false,error:'Já existe no plantel'};
 sh.getRange(last+1,2,1,4).setValues([[nome,'pendente',tipo,0]]);
 return {ok:true,jogador:nome,scope:'plantel'};
}

function doGet(e){
 const p=(e&&e.parameter)||{},action=norm_(p.action).toLowerCase(),cycle=norm_(p.cycle),lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  if(action==='config'){return jsonp_(getConfig_(),p.callback);}
  if(action==='guests'){return jsonp_({ok:true,data:listGuests_(cycle)},p.callback);}
  if(action==='reset'){resetPresencas_();if(cycle)PropertiesService.getScriptProperties().setProperty('CX_RESET_CYCLE',cycle);return jsonp_({ok:true,cycle:cycle,reset:true},p.callback);}
  if(action==='ensure'){return jsonp_(ensureCycle_(cycle),p.callback);}
  if(action==='list'){
    // Leitura nunca pode limpar presenças devido a relógios ou versões diferentes.
    const cfg=getConfig_();
    const gameKey=cfg.game_datetime?cfg.game_datetime.slice(0,10):(cycle||norm_(PropertiesService.getScriptProperties().getProperty('CX_RESET_CYCLE')));
    const out=list_(gameKey);out.game_key=gameKey;out.game_datetime=cfg.game_datetime;out.guests=listGuests_(gameKey);return jsonp_(out,p.callback);
  }
  // compatibilidade com versões antigas
  const sh=sheet_(),last=sh.getLastRow();if(last<=HEADER_ROW)return jsonp_([],p.callback);
  const vals=sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,4).getValues();
  return jsonp_(vals.map(r=>({jogador:norm_(r[0]),presenca:norm_(r[1]),pagamento:norm_(r[2]),estatistica:Number(r[3])||0})).filter(r=>r.jogador),p.callback);
 }finally{lock.releaseLock();}
}
function doPost(e){
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
  if(body.action==='set_config')return jsonp_(setConfig_(norm_(body.game_datetime)));
  if(body.action==='add_player')return jsonp_(addPlayerV2_(body));
  const nome=norm_(body.jogador),semana=norm_(body.semana);if(!nome)return jsonp_({ok:false,error:'jogador vazio'});
  // Nunca fazer reset implícito ao receber confirmações de um cliente.
  const sh=sheet_(),last=sh.getLastRow();if(last<=HEADER_ROW)return jsonp_({ok:false,error:'sem jogadores'});
  const names=sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,1).getDisplayValues();let row=-1;
  for(let i=0;i<names.length;i++)if(norm_(names[i][0]).toLowerCase()===nome.toLowerCase()){row=HEADER_ROW+1+i;break;}
  if(row<0)return jsonp_({ok:false,error:'jogador não encontrado'});
  sh.getRange(row,3).setValue(norm_(body.presenca));sh.getRange(row,4).setValue(norm_(body.pagamento));
  const delta=Number(body.estatistica_delta||0),props=PropertiesService.getScriptProperties(),key='STAT|'+nome.toLowerCase()+'|'+semana;let atual=Number(sh.getRange(row,5).getValue())||0;
  if(delta>0&&semana&&!props.getProperty(key)){atual++;sh.getRange(row,5).setValue(atual);props.setProperty(key,'1');}
  else{const rec=Number(body.estatistica||0);if(rec>atual){atual=rec;sh.getRange(row,5).setValue(atual);}}
  SpreadsheetApp.flush();return jsonp_({ok:true,jogador:nome,cycle:semana,estatistica:atual});
 }finally{lock.releaseLock();}
}
