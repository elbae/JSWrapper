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


window.onbeforeunload = function(e) {
  var dialogText = 'Dialog text here';
  e.returnValue = dialogText;
  return dialogText;
};


*/

'use strict';

// var debug=true;
// boolean array, 10 elements, includes policies
var policies_array = new Array();
// flag for external connections
var ext_comm = true;
// url received from Before.js with log-event-url, used in clear-logs and log-event
var last_domain ="";
// url from last external request enabled received, used while checking
var actual_domain = "";
// logs
var log1=0;
var log2=0;
var log3=0;
var log4=0;
var log5=0;
// structure with the blocked values per url
var url_log_list = new Map()
/*
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
*/
/*
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
*/
function refreshBadge(){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    if(tabs !== undefined && tabs.length > 0){
      var url = tabs[0].url;
      if(url_log_list.has(url)){
        let tmp_array = JSON.parse(url_log_list.get(url));
        let sum = tmp_array[0]+tmp_array[1]+tmp_array[2]+tmp_array[3]+tmp_array[4];
        if(sum <= 9999){
          chrome.browserAction.setBadgeText({text: `${sum}`});
        }
        else{
          chrome.browserAction.setBadgeText({text: `${"9999+"}`});
        }
      }
      else{
        chrome.browserAction.setBadgeText({text: `${0}`});
      }
    }            
  });
}
function logMEl(value, key, map) {
  /*
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
  */
  console.log('%s | %s',key,value);

}
var printMap = function(){
  console.info("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
  url_log_list.forEach(logMEl);
  console.info("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
  /*
  console.log("max_cookie_read [%s] : %s",max_cookie_read,max_cookie_read_url);
  console.log("max_cookie_write [%s] : %s",max_cookie_write,max_cookie_write_url);
  console.log("max_eval [%s] : %s",max_eval,max_eval_url);
  console.log("stats");
  console.log("avg cookie read [%s] ",total_cookie_read/stat_parsed);
  console.log("avg cookie write [%s] ",total_cookie_write/stat_parsed);
  console.log("avg eval use [%s] ",total_eval/stat_parsed);
  */
  /* statistiche
  - media cookie letti, media cookie scritti, media eval
  - max cookie letti, max cookie scritti, max eval
  */

}
//check urls in order to enable or disable connection
function checkUrls(req){
  /*
  EDIT 21/02/2017
  What should be enabled by default:
  - request to url "chrome-extension://*"
  - request with type main_frame
  - request with url in the whitelist
  When ext_com is false the checks are in this order:
  - url for extension, simply enabled 
  - main_frame, enabled and set ext_com to true
  - whitelist site, enabled and log that is enabled
  - any other request is blocked
  */
  /* first check url chrome-extension */
  if(req.url.startsWith("chrome-extension://")){
    return true;
  }
  /* second check main_frame */
  if(req.type === "main_frame"){
    console.log("[%s] : %s",req.type,req.url);
    ext_comm = true;
    return true;
  }
  /* third check whitelisted url */
  if(req.url.startsWith("https://www.google.com/recaptcha/") ||
    req.url.startsWith("https://wu.client.hip.live.com/GetHIPData?") ||
    req.url.startsWith("https://ip.wut.smartscreen.microsoft.com/WUTIPv6Service.svc") ||
    req.url.startsWith("https://www.gstatic.com/") ||
    req.url.startsWith("https://ssl.gstatic.com") ||
    req.url.startsWith(" https://lh3.googleusercontent.com") ||
    req.url.startsWith("https://www.google.com/js") ||
    req.url.startsWith("https://fonts.gstatic.com")){
    console.info(`${req.method} %c WHITELISTED - ${req.type} : ${req.url}\n[current url:] ${actual_domain} `,"color: purple");
    return true;
  }
  /* fourth check, same url */
  let splitted_url =actual_domain.split('/');
  let splitted_req_url = (req.url).split('/');
  let first_url = splitted_url[0]+"//"+splitted_url[2]
  let second_url = splitted_req_url[0]+'//'+splitted_req_url[2]
  if(first_url === second_url){
    console.log("[%s %s], [%s] === actual[%s]",req.method,req.type,first_url,req.url);
    return true;
  }
  /* fifth check, login.yahoo.com === auth.yahoo.com */
  let first_dot_splitted = first_url.split('.');
  let second_dot_splitted = second_url.split('.');
  if(first_dot_splitted[1]===second_dot_splitted[1]){
    console.log("[%s %s], [%s] === actual[%s]",req.method,req.type,first_url,req.url);
    return true;
  }
  /* end of checks, request disabled */
  console.info(`${req.method} ${req.type} %c DISABLED  : `,"color: red");
  let print_url = req.url;
  console.log(`%c${print_url}`,"color: red");
  console.log(`%c${decodeURI(print_url)}`,"color: red");
  console.log(`[current url:] ${first_url}`);
  console.log(req);
  return false;
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
      //console.info(`${info.method} ENABLED- ${info.type} : ${info.url}`);
      return{cancel:false};
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
      disable-extcomm: sent by After.js content script once a password field has been focused or changed its value.
      */
      if(request.action === "disable-extcomm"){
        ext_comm = false;
        console.log(`%c[DISABLE]%c ${request.action} - from %c${request.domain} `,"color:red","color:black","color: green");
      }
      else if(request.action === "enable-extcomm"){
        /*
        enable-extcomm: sent by Before.js content script, checking if the sender is the active tab in the browser
        */
        if(sender.hasOwnProperty('tab')){
          if(sender.tab.hasOwnProperty('active')){
            ext_comm = true;
            actual_domain = request.domain;
            //console.log(`${request.action} - from %c${request.domain} `,"color: green");
            console.log("%c%s","color:blue",actual_domain);
          }
        }        
      }
      else if(request.action === "generic-error"){
        /*
        generic-error: printing an error.
        */
        console.error(`[ERROR] : `);
        console.error(request);
        console.error(sender);
      }
      else if(request.action === "load-policies"){
        /*
        load-policies:  sent by Before.js, reply with the policies array stringified
        */
        sendResponse({policies: JSON.stringify(policies_array)});
      }
      else if(request.action === "save-policies"){
        /*
        save-policies: sent by After.js content script, policies are saved in the sync storage
        */
        policies_array = JSON.parse(request.policies);
        console.log(`[${request.action}]  -> ${policies_array}`);
        chrome.storage.sync.set({'policies': request.policies});
      }
      else if(request.action === "log-event"){
        /*
        event : event's id
        value : actual value of the log
        domain : the url, can be a url or the "last" string if it is a frame
        */
        // posso avere domain last e allora uso last, oppure domain normale
        // ho appena eliminato l'uso di last

        let log_event = parseInt(request.event)-1;
        //let log_value = request.value;
        let log_domain = request.domain;
        if(url_log_list.has(log_domain) === true){
          var tmp_array = JSON.parse(url_log_list.get(log_domain));
          var tmp_array_string;
          console.log(log_domain + " : "+log_event);
          switch(log_event){
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
              tmp_array[log_event] = tmp_array[log_event] + 1;
              break;
            default:
              console.error(request);
              break;
          }
          tmp_array_string = JSON.stringify(tmp_array);
          url_log_list.set(log_domain,tmp_array_string);
          refreshBadge();
        }
        else{
            console.info("[*] Content changed without reloading page [*] ")
            // devo creare un entry e metterci il valore appena loggato
            var tmp_array = new Array(5);
            tmp_array = [0,0,0,0,0];
            tmp_array[log_event]=1;
            var tmp_array_string = JSON.stringify(tmp_array);
            url_log_list.set(log_domain,tmp_array_string);
            refreshBadge();
            console.log("From %s to %s",last_domain,log_domain);            
        }
        /*
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
            console.log(last_domain + " : "+request.event)
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
            chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
              try{ 
                if(tabs !== undefined && tabs.length > 0){
                  //console.log(tabs);
                  var url = tabs[0].url;
                  if(url === last_domain){
                    //console.log(url +"==="+last_domain);
                    let sum = local_array[0]+local_array[1]+local_array[2]+local_array[3]+local_array[4];
                    if(sum <= 9999){
                      chrome.browserAction.setBadgeText({text: `${sum}`});
                    }
                    else{
                      chrome.browserAction.setBadgeText({text: `${"9999+"}`});
                    }
                  }
                  else{
                    if(url_log_list.has(url)){
                      let jstring = url_log_list.get(url);
                      let jarr = JSON.parse(jstring);
                      let sum = jarr[0]+jarr[1]+jarr[2]+jarr[3]+jarr[4];
                      if(sum <= 9999){
                        chrome.browserAction.setBadgeText({text: `${sum}`});
                      }
                      else{
                        chrome.browserAction.setBadgeText({text: `${"9999+"}`});
                      }
                    }
                    else{
                      chrome.browserAction.setBadgeText({text: `${0}`});
                    }
                  }
                  
                }
              }
              catch(error){
                console.info(error);
              }
            });
            
            local_array_string = JSON.stringify(local_array);
            url_log_list.set(last_domain,local_array_string);
          }
          else{
            console.info("[*] Content changed without reloading page [*] ")
            console.log("From %s to %s",last_domain,local_domain);            
          }
        }
        */
      }
      else if(request.action === "clear_logs"){
      /*
        clear_logs: sent by After.js if it is running in the top frame, logging the first data blocked by the extension
      */
        // received from after.js
          //console.log("clear "+request.domain +"| "+request.data);
          //console.log("last domain "+last_domain);
          //console.log("request domain"+request.domain);
          //console.log("data "+request.data);
          // because it is already in last_domain 
          console.log("[CLEAR]: %s|%s",last_domain,request.data);
          url_log_list.set(last_domain,request.data);
          //console.log(last_domain + " : "+request.data)
      }
      else if(request.action === "log-event-url"){ 
      /*
      log-event-url: sent by Before.js, sends its url
      */
        last_domain = request.domain;
      }
      else if(request.action === "refresh-badge"){
        /*let jstring = url_log_list.get(request.url);
        let jarr = JSON.parse(jstring);
        let sum = jarr[0]+jarr[1]+jarr[2]+jarr[3]+jarr[4];
        if(sum <= 9999){
          chrome.browserAction.setBadgeText({text: `${sum}`});
        }
        else{
          chrome.browserAction.setBadgeText({text: `${"9999+"}`});
        }
        */
        refreshBadge()
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


