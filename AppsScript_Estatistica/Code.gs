/** ChutaXuta v1.52 — reset semanal seguro + Presenças/Pagamento/Estatística. Sem Jantar. */
const CX_SHEET_ID='1Pow94ZwdNKqAQJkwubEz8kR8FzITrhGaK5K0WEJBSn0';
const CX_SHEET_NAME='Presencas';
const HEADER_ROW=2;
function sheet_(){return SpreadsheetApp.openById(CX_SHEET_ID).getSheetByName(CX_SHEET_NAME);}
function jsonp_(obj,cb){const t=JSON.stringify(obj);return ContentService.createTextOutput(cb?cb+'('+t+')':t).setMimeType(cb?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);}
function norm_(v){return String(v==null?'':v).trim();}
function resetPresencas_(){const sh=sheet_(),last=sh.getLastRow();if(last>HEADER_ROW)sh.getRange(HEADER_ROW+1,3,last-HEADER_ROW,1).clearContent();SpreadsheetApp.flush();}
function ensureCycle_(cycle){
  cycle=norm_(cycle);if(!cycle)return {ok:false,error:'cycle vazio'};
  const props=PropertiesService.getScriptProperties();
  const old=props.getProperty('CX_RESET_CYCLE');
  // Nunca limpar presenças durante uma leitura nem na primeira execução após upgrade.
  if(!old)props.setProperty('CX_RESET_CYCLE',cycle);
  return {ok:true,cycle:cycle,reset:false};
}
function list_(cycle){
 const sh=sheet_(),last=sh.getLastRow(),data=[];
 if(last>HEADER_ROW){const vals=sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,4).getValues();vals.forEach(r=>{if(norm_(r[0]))data.push({jogador:norm_(r[0]),presenca:norm_(r[1]),pagamento:norm_(r[2]),estatistica:Number(r[3])||0});});}
 return {ok:true,cycle:cycle,data:data};
}

/* API v1.60: configuração e jogadores. Requer publicação de nova versão do Apps Script.
   A API antiga mantém-se; nunca redefinir presenças por simples leitura de configuração. */
function defaultCycle_(){
 const now=new Date(),tz='Europe/Lisbon';
 const parts=Utilities.formatDate(now,tz,'yyyy-MM-dd').split('-').map(Number);
 const local=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));
 const day=local.getUTCDay();let diff=(2-day+7)%7;
 if(diff===0&&Number(Utilities.formatDate(now,tz,'HHmm'))>=2330)diff=7;
 local.setUTCDate(local.getUTCDate()+diff);
 return Utilities.formatDate(local,'UTC','yyyy-MM-dd');
}
function activeGame_(){
 const value=cx160Config_();
 const today=Utilities.formatDate(new Date(),'Europe/Lisbon','yyyy-MM-dd');
 const dt=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)&&value.slice(0,10)>=today?value:'';
 return {game_key:dt?dt.slice(0,10):defaultCycle_(),game_datetime:dt};
}
function updateWeeklyCycle_(){
 const props=PropertiesService.getScriptProperties(),key=defaultCycle_();
 const old=props.getProperty('CX_WEEKLY_KEY');
 const game=activeGame_();
 // Não limpar automaticamente em GET: clientes antigos e alterações de data
 // não podem apagar confirmações dos jogadores.
 if(old!==key)props.setProperty('CX_WEEKLY_KEY',key);
 return game;
}
function doGet(e){
 const p=(e&&e.parameter)||{},action=norm_(p.action).toLowerCase();
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const game=updateWeeklyCycle_();
  if(action==='config')return jsonp_({ok:true,game_key:game.game_key,game_datetime:game.game_datetime,default_weekday:2,default_time:'22:00'},p.callback);
  if(action==='guests')return jsonp_({ok:true,game_key:game.game_key,data:cx160Guests_(game.game_key)},p.callback);
  if(action==='reset'||action==='ensure')return jsonp_({ok:true,game_key:game.game_key,cycle:game.game_key,reset:false},p.callback);
  const out=list_(game.game_key);
  out.game_key=game.game_key;out.game_datetime=game.game_datetime;out.guests=cx160Guests_(game.game_key);
  return jsonp_(out,p.callback);
 }catch(err){return jsonp_({ok:false,error:String(err.message||err)},p.callback);}
 finally{lock.releaseLock();}
}
function doPost(e){
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
  const action=norm_(body.action).toLowerCase();
  const game=updateWeeklyCycle_();
  if(action==='set_config'){
   const value=norm_(body.game_datetime);
   if(value){
    const result=cx160SetConfig_(value);
    if(!result.ok)return jsonp_(result);
   }else{
    const sh=cx160Sheet_(CX160_CONFIG,['Chave','Valor']);
    const rows=sh.getDataRange().getDisplayValues();
    const i=rows.findIndex((r,n)=>n>0&&r[0]==='game_datetime');
    if(i>=0)sh.getRange(i+1,2).setValue('');
   }
   return jsonp_({ok:true,...activeGame_()});
  }
  const requested=norm_(body.cycle||body.semana||body.game_key);
  if(requested&&requested!==game.game_key)return jsonp_({ok:false,error:'Ciclo diferente',game_key:game.game_key});
  if(action==='add_player')return jsonp_(cx160AddPlayer_(body,game.game_key));
  const name=norm_(body.jogador);
  if(!name)return jsonp_({ok:false,error:'Jogador vazio'});
  const guest=cx160UpdateGuest_(body,game.game_key);
  if(guest)return jsonp_(guest);
  const sh=sheet_(),last=sh.getLastRow();
  if(last<=HEADER_ROW)return jsonp_({ok:false,error:'Sem jogadores'});
  const names=sh.getRange(HEADER_ROW+1,2,last-HEADER_ROW,1).getDisplayValues();
  const idx=names.findIndex(r=>norm_(r[0]).toLocaleLowerCase('pt-PT')===name.toLocaleLowerCase('pt-PT'));
  if(idx<0)return jsonp_({ok:false,error:'Jogador não encontrado'});
  const row=HEADER_ROW+1+idx;
  if(Object.prototype.hasOwnProperty.call(body,'presenca'))sh.getRange(row,3).setValue(norm_(body.presenca));
  if(Object.prototype.hasOwnProperty.call(body,'pagamento'))sh.getRange(row,4).setValue(norm_(body.pagamento));
  const delta=Number(body.estatistica_delta||0),props=PropertiesService.getScriptProperties();
  const statKey='STAT|'+name.toLocaleLowerCase('pt-PT')+'|'+game.game_key;
  let total=Number(sh.getRange(row,5).getValue())||0;
  if(delta===1&&!props.getProperty(statKey)){
   total++;sh.getRange(row,5).setValue(total);props.setProperty(statKey,'1');
  }
  SpreadsheetApp.flush();
  return jsonp_({ok:true,jogador:name,game_key:game.game_key,estatistica:total});
 }catch(err){return jsonp_({ok:false,error:String(err.message||err)});}
 finally{lock.releaseLock();}
}
