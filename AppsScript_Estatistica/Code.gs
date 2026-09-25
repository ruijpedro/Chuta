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
function doGet(e){
 const p=(e&&e.parameter)||{},action=norm_(p.action).toLowerCase(),cycle=norm_(p.cycle),lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  if(action==='reset'){resetPresencas_();if(cycle)PropertiesService.getScriptProperties().setProperty('CX_RESET_CYCLE',cycle);return jsonp_({ok:true,cycle:cycle,reset:true},p.callback);}
  if(action==='ensure'){return jsonp_(ensureCycle_(cycle),p.callback);}
  if(action==='list'){
    const en=ensureCycle_(cycle);if(!en.ok)return jsonp_(en,p.callback);
    const out=list_(cycle);out.reset=en.reset;return jsonp_(out,p.callback);
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
  const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}'),nome=norm_(body.jogador),semana=norm_(body.semana);if(!nome)return jsonp_({ok:false,error:'jogador vazio'});
  if(semana){const en=ensureCycle_(semana);if(!en.ok)return jsonp_(en);}
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
