/* @TODO
1) quando blocco una connessione, mostro nella console e salvo i dati con api storage 
2) da popup metto un listener sulla parte di storage che contiene i log,
 mostro il numero (?? come -> guardare codice sorgente di adblock+ ??)
3) devo dare la possibilità all'utente di scegliere se un url tra
 quelli bloccati può essere messo in whitelist (?? da valutare)
 */
/* 
/scripts/background.js
Is loaded as a process part of the extension
- add listeners for requests intercepting them depending on the parameters
- load policies from the storage chrome.storage.sync which is not volatile
- mantain policies in a variable
- creates default policies if not found
- receive requests for policies and send them to the active tab
- receive requests for policies and send them to the popup
- receive requests for policies modification save them in both storages

*/

'use strict';

var debug=true;
var policies_array = new Array();
var ext_comm = true;
var request_domain = "";
var log1=0;
var log2=0;
var log3=0;
var log4=0;
var log5=0;

var url_log_list = new Map()
var last_domain ="";
var max_cookie_read_url ="";
var max_cookie_read=0;
var max_cookie_write_url="";
var max_cookie_write=0;
var max_eval_url="";
var max_eval=0;
var total_cookie_read=0;
var total_cookie_write=0;
var total_eval=0;
var stat_parsed=0;


if(!debug){
  console.log = function(text){
    return;
  }
  console.info = function(text){
    return;
  }
  console.error = function(text){
    return;
  }
  console.war = function(text){
    return;
  }
}
function logMEl(value, key, map) {
  stat_parsed = stat_parsed+1;
  let lsv = JSON.parse(value);
  if(lsv[1] > max_cookie_read){
    max_cookie_read = lsv[1];
    max_cookie_read_url = key;
  }
  if(lsv[2] > max_cookie_write){
    max_cookie_write = lsv[2];
    max_cookie_write_url = key;
  }
  if(lsv[4] > max_eval){
    max_eval = lsv[4];
    max_cookie_write_url = key;
  }
  total_cookie_read = total_cookie_read + lsv[1];
  total_cookie_write = total_cookie_write + lsv[2];
  total_eval = total_eval +lsv[4];
  console.log('%s | %s',key,value);

}
var printMap = function(){
  url_log_list.forEach(logMEl);
  console.log("max_cookie_read [%s] : %s",max_cookie_read,max_cookie_read_url);
  console.log("max_cookie_write [%s] : %s",max_cookie_write,max_cookie_write_url);
  console.log("max_eval [%s] : %s",max_eval,max_eval_url);
  console.log("stats");
  console.log("avg cookie read [%s] ",total_cookie_read/stat_parsed);
  console.log("avg cookie write [%s] ",total_cookie_write/stat_parsed);
  console.log("avg eval use [%s] ",total_eval/stat_parsed);
  /* statistiche
  - media cookie letti, media cookie scritti, media eval
  - max cookie letti, max cookie scritti, max eval
  */

}
//check urls in order to enable or disable connection
function checkUrls(req){
    //same url
    if(req.url.startsWith("chrome-extension://")){
      //console.log(req);
      return false;
    }
    else{
      var splitted_url =request_domain.split('/');
      var splitted_req_url = (req.url).split('/');
      var first_url = splitted_url[0]+"//"+splitted_url[2]
      var second_url = splitted_req_url[0]+'//'+splitted_req_url[2]

      // request and url are in the same domain
      // -> everything is enabled
      if(first_url === second_url){
          console.info(`${req.method} ENABLED- ${req.type} : ${req.url}\n[current url:] ${first_url} `);
          return true;        
        /*if(req.method === "POST" || req.method === "GET"){
          console.info(`${req.method} ENABLED- ${req.type} : ${req.url}\n[current url:] ${first_url} `);
          return true;
        }
        else{
          if(req.type === "stylesheet" ){
            console.info(`${req.method} ENABLED- ${req.type} : ${req.url}\n[current url:] ${first_url} `);
            return true;
          }
          else{
            console.info(`${req.method} %cdisabled- ${req.type} : ${req.url}\n[current url:] ${first_url} `,"color: red");
            return false;
          }
        }*/
      }// request and url are in different domains
      else{
        // css request are enabled
        if(req.type === "stylesheet" ){
          return true;
        } // scripts loaded <script> tag enabled
        else if(req.type === "script"){
          return true;
        } //everything else is disabled
        else{
          console.info(`${req.method} %cdisabled- ${req.type} : ${req.url}\n[current url:] ${first_url} `,"color: red");
          return false;
        }
      }
    }
    console.info(`${req.method} %cdisabled- ${req.type} : ${req.url}\n[current url:] ${first_url} `,"color: red");
    return false;
    //
}
//
console.info(`Start`);

/* 
Getting the policies from the chrome.storage.sync and saving them in the
local storage.
If not found, creating them and saving in the local Storage
*/

chrome.storage.sync.get('policies', function(result) {
  if(result.policies !== undefined){
    try{
      policies_array = JSON.parse(result.policies);
      console.info('[Policies] loaded from storage: '+result.policies);
    }
    catch(error){console.error(error)}
  }
  else{
      console.warn('[Policies] created');
      //creating values
      var arr = new Array(); var i=0;
      for(i=0;i<10;i++){
        arr[i]=false;
      }     
      policies_array = arr;        
      chrome.storage.sync.set({'policies': JSON.stringify(policies_array)},function() {});
  }
}); 

/* TEST BLOCKING REQUESTS */


try{
chrome.webRequest.onBeforeRequest.addListener(
  function(info){ 
    //console.info(`${info.method} ENABLED- ${info.type} : ${info.url}\n`);
    if(policies_array[6]){
      console.info(`${info.method} ENABLED- ${info.type} : ${info.url}`);
    }
    else{  
      // request.domain is the page address
      if(!ext_comm){
        //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          let res = !checkUrls(info);
          console.log("blocked:" + res);
          return{cancel:res};
        //});
      }
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]);
}
catch(e){
  console.error("Background.js exception")
  console.error(e);
}
/* FINE TEST BLOCKING REQUESTS */
/*
Listening for requests: get/set
*/
try{
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      /*
        Action by request.action
      */
      if(request.action === "disable-extcomm"){
        ext_comm = false;
        console.log(`%c[DISABLE]%c ${request.action} - from %c${request.domain} `,"color:red","color:black","color: green");
      }
      else if(request.action === "enable-extcomm"){
        if(sender.hasOwnProperty('tab')){
          if(sender.tab.hasOwnProperty('active')){
            ext_comm = true;
            request_domain = request.domain;
            //console.log(`${request.action} - from %c${request.domain} `,"color: green");
            console.log("Actual URL: %c%s","color:blue",request_domain);
          }
        }        
      }
      else if(request.action === "generic-error"){
        console.error(`[ERROR] : `);
        console.error(request);
        console.error(sender);
      }
      else if(request.action === "load-policies"){
        sendResponse({policies: JSON.stringify(policies_array)});
      }
      else if(request.action === "save-policies"){
        policies_array = JSON.parse(request.policies);
        console.log(`[${request.action}]  -> ${policies_array}`);
        chrome.storage.sync.set({'policies': request.policies});
      }
      else if(request.action === "log-event"){
        //console.log(request);
        // posso avere domain last e allora uso last, oppure domain normale
        let local_domain ="";
        // checking the domain
        if(request.domain === "last"){
          local_domain = last_domain;
          //console.log(local_domain);
        }
        else{
          local_domain = request.domain;
        }
        // checking the storage
        if(local_domain === ""){
          console.error("[local_domain] empty");
        }
        else{
          if(url_log_list.has(local_domain) === true){
            let local_array = JSON.parse(url_log_list.get(last_domain));
            var local_array_string;
            let local_id = parseInt(request.event) - 1;
            switch(local_id){
              case 0:
              case 1:
              case 2:
              case 3:
              case 4:
                local_array[local_id] = local_array[local_id] + 1;
                break;
              default:
                console.error(request);
                break;
            }
            local_array_string = JSON.stringify(local_array);
            url_log_list.set(last_domain,local_array_string);
          }
          else{
            console.error("[store missing index] for %s"+local_domain);
          }
        }
      }
      else if(request.action === "clear_logs"){
          //console.log("clear "+request.domain +"| "+request.data);
          url_log_list.set(last_domain,request.data);
      }
      else if(request.action === "log-event-url"){
        last_domain = request.domain;
      }
      else{
        console.error(`What is ${request.action}?`);
      }
  });
}
catch(error){
  console.error('[Error] ');
  console.error(error);
}
console.info(`[End]`);


