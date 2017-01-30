/* @TODO
1) quando blocco una connessione, mostro nella console e salvo i dati con api storage 
2) da popup metto un listener sulla parte di storage che contiene i log, mostro il numero (?? come -> guardare codice sorgente di adblock+ ??)
3) devo dare la possibilità all'utente di scegliere se un url tra quelli bloccati può essere messo in whitelist (?? da valutare)
4) non posso usare storage sync perchè ho il limite nella dimensione a 1mB(?)
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
function getTime(){
  var d = new Date();
  var time = "[mm:ss:mmmm] "+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
    //return time;
  return "";
}
//check urls in order to enable or disable connection
function checkUrls(url, req){
    //same url
    if(req.url.startsWith("chrome-extension://")){
      console.log(req);
      return true
    }
    else{
      var splitted_url =url.split('/');
      var splitted_req_url = (req.url).split('/');
      var first_url = splitted_url[0]+"//"+splitted_url[2]
      var second_url = splitted_req_url[0]+'//'+splitted_req_url[2]
      if(first_url === second_url){
        if(req.method === "POST"){
          console.info(`${req.method} ENABLED- ${req.type} : ${req.url}\n[current url:] ${first_url} \nTIME ${getTime()}`);
          return true;
        }
        else{
          console.info(`${req.method} %cdisabled- ${req.type} : ${req.url}\n[current url:] ${first_url} \nTIME ${getTime()}`,"color: red");
          return false;
        }
      }
      else{
        console.info(`${req.method} %cdisabled- ${req.type} : ${req.url}\n[current url:] ${first_url} \nTIME ${getTime()}`,"color: red");
        return false;
      }
    }
    console.info(`${req.method} %cdisabled- ${req.type} : ${req.url}\n[current url:] ${first_url} \nTIME ${getTime()}`,"color: red");
    return false;
    //
}
//
//var a = require('backbone-before.js');
//
var debug=true;
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
console.info(`[Background.js] Start : mm:ss:mmm ${getTime()}`);

var policies_array = new Array();
var ext_comm = true;

//random string
var min=97; var max=123; var length=10;
function getRandomInt(min,max){
  return Math.random()*(max-min)+min;
}
function getRandomChar(min,max,length){
  var i; var result=""; 
  for(i=0;i<length;i++){result+=String.fromCharCode(getRandomInt(min,max));} 
    return result;
}

var random_string = getRandomChar(min,max,length);
console.log(random_string);

/* 
Getting the policies from the chrome.storage.sync and saving them in the
local storage.
If not found, creating them and saving in the local Storage
*/

chrome.storage.sync.get('policies', function(result) {
  if(result.policies !== undefined){
    try{
      policies_array = JSON.parse(result.policies);
      console.info('[Background.js] Policies loaded from storage: '+result.policies);
    }
    catch(error){console.error(error)}
  }
  else{
      console.warn('[Background.js] Policies not found : creating');
      //creating values
      var arr = new Array(); var i=0;
      for(i=0;i<10;i++){
        arr[i]=true;
      }     
      policies_array = arr;        
      chrome.storage.sync.set({'policies': JSON.stringify(policies_array)},function() {console.info('[Background.js] data saved');});
  }
}); 

/* TEST BLOCKING REQUESTS */


try{
chrome.webRequest.onBeforeRequest.addListener(
  function(info){ 
    //console.info(`${info.method} ENABLED- ${info.type} : ${info.url}\n`);
    if(!ext_comm){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if(tabs[0]!== undefined){
            return{cancel:(!checkUrls(tabs[0].url,info))}
          }
          else{
            return{cancel:true}

          }
      });
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking","requestBody"]);
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
        console.log(`${request.action} at time ${getTime()} from %c${request.domain} `,"color: green");
      }
      else if(request.action === "enable-extcomm"){
        if(sender.hasOwnProperty('tab')){
          if(sender.tab.hasOwnProperty('active')){
            ext_comm = true;
            console.log(`${request.action} at time ${getTime()} from %c${request.domain} `,"color: green");
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
        console.log(`[Background.js] Request : ${request.action}  -> ${policies_array}`);
      }
      else if(request.action === "save-policies"){
        policies_array = JSON.parse(request.policies);
        console.log(`[Background.js] Policies changed to : ${policies_array}`);
        chrome.storage.sync.set({'policies': request.policies});
      }
      else{
        console.error(`What is ${request.action}?`);
      }
  });
}
catch(error){
  console.error('[Background.js] Requests error: get/set ');
  console.error(error);
}
console.info(`[Background.js] End : mm:ss:mmm ${getTime()}`);