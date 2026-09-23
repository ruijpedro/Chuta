/** ChutaXuta v1.49 — Presenças + Pagamento + Estatística. Sem Jantar. */
const CX_SHEET_ID='1Pow94ZwdNKqAQJkwubEz8kR8FzITrhGaK5K0WEJBSn0';
const CX_SHEET_NAME='Presencas';
const HEADER_ROW=2;
function sheet_(){return SpreadsheetApp.openById(CX_SHEET_ID).getSheetByName(CX_SHEET_NAME);}
function jsonp_(obj,cb){const t=JSON.stringify(obj);return ContentService.createTextOutput(cb?cb+'('+t+')':t).setMimeType(cb?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);}
function norm_(v){return String(v==null?'':v).trim();}
function resetPresencas_(){const sh=sheet_(),last=sh.getLastRow();if(last>HEADER_ROW)sh.getRange(HEADER_ROW+1,3,last-HEADER_ROW,1).clearContent();SpreadsheetApp.flush();}
function doGet(e){
 const p=(e&&e.parameter)||{}, action=norm_(p.action).toLowerCase(), props=PropertiesService.getScriptProperties();
 if(action==='ensure'){
   const cycle=norm_(p.cycle); if(!cycle)return jsonp_({ok:false,error:'cycle vazio'},p.callback);
   const lock=LockService.getScriptLock();lock.waitLock(15000);
   try{
     const old=props.getProperty('CX_RESET_CYCLE'); let did=false;
     if(old!==cycle){resetPresencas_();props.setProperty('CX_RESET_CYCLE',cycle);did=true;}
     return jsonp_({ok:true,cycle:cycle,reset:did},p.callback);
   }finally{lock.releaseLock();}
 }
 if(action==='reset'){
   resetPresencas_(); if(p.cycle)props.setProperty('CX_RESET_CYCLE',norm_(p.cycle));
   return jsonp_({ok:true,action:'reset'},p.callback);
 }
 const sh=sheet_(),last=sh.getLastRow(); if(last<=HEADER_ROW)return jsonp_([],p.callback);
 const vals=sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,4).getValues(); // B:E
 return jsonp_(vals.map(r=>({jogador:norm_(r[0]),presenca:norm_(r[1]),pagamento:norm_(r[2]),estatistica:Number(r[3])||0})).filter(r=>r.jogador),p.callback);
}
function doPost(e){
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}'),nome=norm_(body.jogador);if(!nome)return jsonp_({ok:false,error:'jogador vazio'});
  const sh=sheet_(),last=sh.getLastRow();if(last<=HEADER_ROW)return jsonp_({ok:false,error:'sem jogadores'});
  const names=sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,1).getDisplayValues();let row=-1;
  for(let i=0;i<names.length;i++)if(norm_(names[i][0]).toLowerCase()===nome.toLowerCase()){row=HEADER_ROW+1+i;break;}
  if(row<0)return jsonp_({ok:false,error:'jogador não encontrado'});
  sh.getRange(row,3).setValue(norm_(body.presenca)); sh.getRange(row,4).setValue(norm_(body.pagamento));
  const delta=Number(body.estatistica_delta||0),semana=norm_(body.semana),props=PropertiesService.getScriptProperties(),key='STAT|'+nome.toLowerCase()+'|'+semana;
  let atual=Number(sh.getRange(row,5).getValue())||0;
  if(delta>0&&!props.getProperty(key)){atual++;sh.getRange(row,5).setValue(atual);props.setProperty(key,'1');}
  else{const rec=Number(body.estatistica||0);if(rec>atual){atual=rec;sh.getRange(row,5).setValue(atual);}}
  SpreadsheetApp.flush();return jsonp_({ok:true,jogador:nome,estatistica:atual});
 }finally{lock.releaseLock();}
}
