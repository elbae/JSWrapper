/* 
TODO
1) Show the blocked requests to the user
2) Give the possibility to enable or enable a blocked url
 */

/* 
/scripts/background.js
Is loaded as a process part of the extension
- adds listeners for requests intercepting them depending on the parameters
- loads policies from the storage chrome.storage.sync which is not volatile
- mantains policies as a variable
- creates default policies if they can't be loaded
- receives requests for policies and sends them to the active tab
*/

'use strict';
const MAIN_FRAME = "main_frame";
const SAVE_NAME = "policies";
const EXT_COMM_INDEX = 6;
const ACTION_DISABLE_REQUESTS = "disable-extcomm";
const ACTION_ENABLE_REQUESTS = "enable-extcomm";
const ACTION_GENERIC_ERROR = "generic-error";
const ACTION_LOAD_POLICIES = "load-policies";
const ACTION_SAVE_POLICIES = "save-policies";
const ACTION_LOG_EVENT = "log-event";
const ACTION_CLEAR_LOGS = "clear_logs";
const ACTION_LOG_EVENT_URL = "log-event-url";
const ACTION_REFRESH_BADGE = "refresh-badge";

var policies_array = new Array(); // boolean array, 10 elements, includes policies
var ext_comm = true;  // flag for external connections
var last_domain ="";  // url received from Before.js with log-event-url, used in clear-logs and log-event
var actual_domain = ""; // url from last external request enabled received, used while checking
var url_log_list = new Map()  // structure with the blocked values per url
var counter = 0; // a counter

var WHITELIST = [
"https://www.google.com/recaptcha/",
"https://wu.client.hip.live.com/GetHIPData?",
"https://ip.wut.smartscreen.microsoft.com/WUTIPv6Service.svc",
"https://www.gstatic.com/",
"https://ssl.gstatic.com",
"https://lh3.googleusercontent.com",
"https://www.google.com/js",
"https://fonts.gstatic.com"
];
/* 
  One show JSON.stringify
*/
function JSONstring(value){
  let tmp_value = JSON.stringify(value)
  return tmp_value;
}
/* 
  One show JSON.parse
*/
function JSONparse(value){
  let tmp_value = JSON.parse(value)
  return tmp_value;
}
/*
  Changes the value of the number shown in the popup 
*/
function refreshBadge(){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    if(tabs !== undefined && tabs.length > 0){
      var url = tabs[0].url;
      if(url_log_list.has(url)){
        let tmp_array = JSONparse(url_log_list.get(url));
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
/*
  Prints a single line of values
*/
function logMEl(value, key, map) {
  console.log('%s | %s',key,value);
}
/*
  Prints all the values blocked which are stored in the structure
*/
var printMap = function(){
  console.info("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
  url_log_list.forEach(logMEl);
  console.info("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
}
/*
  Checks if the input url is in the whitelist
*/
function checkUrlWhitelisted(url){
  for(counter = 0; counter < WHITELIST.length; counter++){
    if(url.startsWith(WHITELIST[counter])){
      return true;
    }
  }
}
/*
  Checks urls in order to enable or disable requests
*/
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
  if(req.type === MAIN_FRAME){
    console.log("[%s] : %s",req.type,req.url);
    ext_comm = true;
    return true;
  }
  /* third check whitelisted url */
  if(checkUrlWhitelisted(req.url)){
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
  console.log(`%c${decodeURI(print_url)}`,"color: red");
  console.log(`[current url:] ${first_url}`);
  console.log(req);
  return false;
}

/* 
  Getting the policies from the chrome.storage.sync and saving them in the local storage.
  If not found, creating them and saving in the local Storage
*/
function load_policies_from_storage(){
  chrome.storage.sync.get(SAVE_NAME, function(result) {
    if(result.policies !== undefined){
      try{
        policies_array = JSONparse(result.policies);
        console.info('[Policies] loaded from storage: '+result.policies);
      }
      catch(error){console.error(error)}
    }
    else{
        console.log('%c[Policies] created',"color:green; background:AliceBlue");
        //creating custom values
        policies_array = new Array(10).fill(true);      
        chrome.storage.sync.set({SAVE_NAME: JSONstring(policies_array)},function() {});
    }
  }); 
}

/*
  Adds the listeners for the webRequests
*/
function add_webRequest_listener(){
  try{
    chrome.webRequest.onBeforeRequest.addListener(
      function(info){ 
        if(!policies_array[EXT_COMM_INDEX] && !ext_comm){
          let block_result = !checkUrls(info);
          console.log("blocked:" + block_result);
          return{cancel:block_result}; // request is block_result if res is true
        }
        return{cancel:false};
      },
      {urls: ["<all_urls>"]},
      ["blocking"]);
  }
  catch(e){
    console.error("[Background] Exception");
    console.error(e);
  }
}
/*
  Adds listener for requests: get/set
*/
function add_message_listener(){
  try{
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.action === ACTION_DISABLE_REQUESTS){ 
          /*
            disable-extcomm: 
              SENT by After.js content script 
              WHEN a password field has been focused or changed its value.
          */
          ext_comm = false;
          console.log(`%c[DISABLE]%c ${request.action} - from %c${request.domain} `,"color:red","color:black","color: green");
        }
        else if(request.action === ACTION_ENABLE_REQUESTS){ 
          /*
            enable-extcomm: 
              SENT by Before.js content script
              checking if the sender is the active tab in the browser
          */
          if(sender.hasOwnProperty('tab')){
            if(sender.tab.hasOwnProperty('active')){
              ext_comm = true;
              actual_domain = request.domain;
              console.log("%c%s","color:blue",actual_domain);
            }
          }        
        }
        else if(request.action === ACTION_GENERIC_ERROR){ 
          /*
            generic-error: printing an error.
          */
          console.error(`[GENERIC ERROR]`);
          console.error(request);
          console.error(sender);
        }
        else if(request.action === ACTION_LOAD_POLICIES){ 
          /*
            load-policies:  
              SENT by Before.js
              reply with the policies array stringified
          */
          sendResponse({policies: JSONstring(policies_array)});
        }
        else if(request.action === ACTION_SAVE_POLICIES){ 
          /*
            save-policies: 
              SENT by After.js content script
              policies are saved in the sync storage
          */
          policies_array = JSONparse(request.policies);
          console.log(`[${request.action}]  -> ${policies_array}`);
          chrome.storage.sync.set({'policies': request.policies});
        }
        else if(request.action === ACTION_LOG_EVENT){ 
          /*
            event : event's id
            value : actual value of the log
            domain : the url, can be a url or the "last" string if it is a frame
          */
          let log_event = parseInt(request.event)-1;
          let log_domain = request.domain;
          // I'm actually incrementing the value instead of changing it every time with request.value
          if(url_log_list.has(log_domain) === true){
            var tmp_array = JSONparse(url_log_list.get(log_domain));
            switch(log_event){
              case 0: case 1: case 2: case 3: case 4:
                tmp_array[log_event] = tmp_array[log_event] + 1;
                break;
              default:
                console.error(request);
                break;
            }
            let tmp_array_string = JSONstring(tmp_array);
            url_log_list.set(log_domain,tmp_array_string);
            refreshBadge();
          }
          else{
              console.info("[*] Content changed without reloading page [*] ")
              var tmp_array = new Array(5).fill(0);
              tmp_array[log_event]=1;
              let tmp_array_string = JSONstring(tmp_array);
              url_log_list.set(log_domain,tmp_array_string);
              refreshBadge();
              console.log("[*] From %s to %s [*] ",last_domain,log_domain);            
          }
        }
        else if(request.action === ACTION_CLEAR_LOGS){ 
        /*
          clear_logs: 
            SENT by After.js 
            if it is running in the top frame, logging the first data blocked by the extension
        */
            console.log("[LOG RECEIVED]: %s|%s",last_domain,request.data);
            url_log_list.set(last_domain,request.data);
        }
        else if(request.action === ACTION_LOG_EVENT_URL){ 
        /*
          log-event-url: 
            SENT by Before.js, 
            sends its url
        */
          last_domain = request.domain;
        }
        else if(request.action === ACTION_REFRESH_BADGE){
          refreshBadge()
        }
        else{
          console.error(`[REQUEST NOT DEFINED] : ${request.action}`);
          console.error(request);
        }
    });
  }
  catch(error){
    console.error('[ERROR CATCHED]');
    console.error(error);
  }
}

load_policies_from_storage();
add_message_listener();
add_webRequest_listener();
console.info(`[Working...]`);