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
  return time;
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
var ext_list = new Array();
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
try{
  chrome.storage.sync.get('policies', function(result) {
    if(result.policies !== undefined){
      ext_list = JSON.parse(result.policies);
      console.info('[Background.js] Policies loaded : '+result.policies);
    }
    else{
        console.warn('[Background.js] Policies not found : creating');
        //creating values
        var arr = new Array(); var i=0;
        for(i=0;i<10;i++){
          arr[i]=true;
        }     
        ext_list = arr;
        
        chrome.storage.sync.set({'policies': JSON.stringify(ext_list)}, 
            function() {
              console.info('[Background.js] data saved');
        });
        console.info(ext_list);
    }
  });  
}
catch(error){
  console.error('[Background.js] Policies error: loading/creation ');
  console.error(error);
}
/* TEST BLOCKING REQUESTS WITH onResponseStarted */
/*
try{
  chrome.webRequest.onResponseStarted.addListener(
    function(info){
      console.info('onResponseStarted');
      console.log(info);
      return{cancel:false};
    },{urls: ["<all_urls>"]});         //  optional array of strings
}
catch(e){
  console.error('Error onResponseStarted');
  console.error(e);
}
*/
/* FINE TEST BLOCKING REQUESTS WITH onResponseStarted */
/* TEST BLOCKING REQUESTS WITH onBeforeSendHeaders */
/*
try{
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info){
      console.info('onBeforeSendHeaders');
      console.log(info);
      return{cancel:false};
    },{urls: ["<all_urls>"]},
  ["blocking"]);         //  optional array of strings
}
catch(e){
  console.error('Error onBeforeSendHeaders');
  console.error(e);
}
*/
/* FINE TEST BLOCKING REQUESTS WITH onBeforeSendHeaders */
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
    /*
    if(ext_comm===false){ //external comm variable
      //actual location
      if(info.method === "POST" ){
        if(info.type !== "ping"){
          console.info(`POST enabled\n[method:] ${info.method}\t[url:] ${info.url}\t[type:] ${info.type}`);
          var lista = info.requestBody.formData;
          var tstring ="";
          var l;
          for(l in lista){
            if( !((l.toString()).includes("password")) )
              tstring+=l.toString()+": "+lista[l]+"\n";
          }
          console.log(tstring);
        }
      }
      else{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if(tabs[0]!== undefined){
            var a = tabs[0].url.split('/');
            var b = a[0]+'/'+a[1]+'/'+a[2]+'/';
            if(info.url.startsWith(b) || info.url.startsWith("chrome-extension://") || info.url.startsWith(b.replace("http","https"))){
              return {cancel:false};
            }
            else{
              console.info(`${info.method} %cdisabled: ${info.url}\n[current url:] ${b} `,"color: red");
              console.log(info);
              return {cancel:true};
            }
          }
          else{
            return {cancel:true};
          }

        });
      }  
    }
    else{
      console.log(`[${info.method}] enabled: ${info.url} `);
    }
    return {cancel:false};
    */
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
      // check for content script tab
      if(sender.hasOwnProperty('tab')){
        // check for active tab property
        if(sender.tab.hasOwnProperty('active')){
          // check for active tab positive value
          if(sender.tab.active){
            // check for get policies request
            if(request.action === "background_disable_ext_comm"){
              ext_comm = false;
              console.log('background_disable_ext_comm');
            }
            if(request.action === "background_enable_ext_comm"){

              ext_comm = true;
              console.log(`background_enable_ext_comm at time ${getTime()}`);
            }            
            if(request.action === "background_load"){
              console.log(`[Background.js] Request : ${request.action}
                  Reply: ${ext_list}`);
              sendResponse({policies: JSON.stringify(ext_list)});
            }
          }
        }
      }
      //request from the popup
      if(sender.url.endsWith("popup.html",sender.url.length)){
        // check for save policies request
        if(request.action === "background_set"){
          console.log(`[Background.js] Request : ${request.action}
                  policies: ${request.policies}`);
          // saving to storage.sync
          ext_list = JSON.parse(request.policies);
          chrome.storage.sync.set({'policies': request.policies}, 
            function() {
              console.info('[Background.js] data saved');
          });
        }
        // check for get policies request
        if(request.action === "background_load"){
          console.log(`[Background.js] Request : ${request.action}
                  Reply: ext_list`);
          sendResponse({policies: JSON.stringify(ext_list)});
        }
      }
  });
}
catch(error){
  console.error('[Background.js] Requests error: get/set ');
  console.error(error);
}



console.info(`[Background.js] End : mm:ss:mmm ${getTime()}`);