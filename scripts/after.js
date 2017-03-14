'use strict';
const ACTION_LOG_EVENT = "log-event";
const ACTION_CLEAR_LOGS = "clear_logs";
const ACTION_DISABLE_REQUESTS = "disable-extcomm";
const ACTION_LOG_EVENT_URL = "log-event-url";
const ACTION_REFRESH_BADGE = "refresh-badge";

window['message_disable'] = true;
var elements_values_map = new Map(); // a map which includes
var log_url = "";   // the url
var counter = 0;    // a basic counter


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
  Sends:
  - the page url
  - the first set of log values

*/
function first_logs(){
  if(window === window.top){
    log_url = window.location.href;
    chrome.runtime.sendMessage({action:ACTION_LOG_EVENT_URL,domain:log_url},function(){});
    for(counter = 1; counter < 6;counter++){
      window[`lt${counter}`] = document.getElementById(`jswrapper-log${counter}`);
      window[`lt${counter}`] = parseInt(window[`lt${counter}`].value);
    }
    var tmp_string = JSON.stringify(new Array(lt1,lt2,lt3,lt4,lt5));
    chrome.runtime.sendMessage({action:ACTION_CLEAR_LOGS,domain:log_url,data:tmp_string}, function(){});
  }
  else{
    log_url = (window.location != window.parent.location)? document.referrer: document.location.href;
  }
}
/*
  Sends a message to the background script 
  asking for disabling the external requests
*/
function handler_normal(){
  chrome.runtime.sendMessage({action:ACTION_DISABLE_REQUESTS, domain:document.domain}, function(){
    if(window['message_disable']){
      window['message_disable']=false;
      //console.log(`%c[A]%c asks for disable external requests`,'color:Chocolate','color:black');
    }
  });             
}
/*
  Sends a message to the background script 
  asking for disabling the external requests
  only if the type of this element is password
*/
function handler_check(){
  if(this.type === "password"){
    chrome.runtime.sendMessage({action:ACTION_DISABLE_REQUESTS, domain: document.domain}, function(){
      if(window['message_disable']){
        window['message_enable']=false;
        console.log(`%c[A]%c asks for disable external requests`,'color:Chocolate','color:black');
      }
    });             
  }
}
/*
  Retrieves all the input elements 
  sets the handlers
*/
function secureInputTags(){
  try{
    var item_list = document.getElementsByTagName('input');
    counter = 0;
    while(counter<item_list.length){
      // setting values inside map 
      var item_id;
      var item_value;
      // check 1: using only items which have an id
      if(item_list[counter].hasAttribute('id')){
        item_id = item_list[counter].id;
        item_value = item_list[counter].value;
        if(!elements_values_map.has(item_id)){
          elements_values_map.set(item_id,item_value);
        }
      }
      // check 2: item has type password
      if(item_list[counter].type==="password"){
        // check if value has changed since the last check
        if(elements_values_map.has(item_id)){
          let saved_value = elements_values_map.get(item_id);
          if(saved_value !== item_value){
            handler_normal();
            elements_values_map.set(item_id,item_value);
          }
        }
        //focus event
        item_list[counter].addEventListener("focus",handler_normal,{capture:true,once:true,passive:true},true);
        // keypress event
        item_list[counter].addEventListener("keypress",handler_normal,{capture:true,once:true,passive:true},true);        
      } //if type is changed from something to password
      else{
        // focuse event
        item_list[counter].addEventListener("focus",handler_check,{capture:true,once:true,passive:true},true);
        // keypress event
        item_list[counter].addEventListener("keypress",handler_check,{capture:true,once:true,passive:true},true);        
      }
      counter+=1;
    }
  }
  catch(error){
    console.error(`[After.js] error : reload listener`);
    console.error(error);
  }
}

/*
  Adds listeners on logs elements present in the page
  when a value changes it is sent to the background
*/
function add_logs_listeners() {
  // select the target nodes
  var target1 = document.getElementById('jswrapper-log1');
  var target2 = document.getElementById('jswrapper-log2');
  var target3 = document.getElementById('jswrapper-log3');
  var target4 = document.getElementById('jswrapper-log4');
  var target5 = document.getElementById('jswrapper-log5');
  // create an observer instance
  var observer1 = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      //if(document.hasFocus()){
        if(window !== window.top){
          var url = (window.location != window.parent.location)? document.referrer: document.location.href;
          chrome.runtime.sendMessage({action:ACTION_LOG_EVENT,event:mutation.target.id.replace("jswrapper-log",""),value:mutation.target.value,domain:url},function(){});
        }
        else{
          chrome.runtime.sendMessage({action:ACTION_LOG_EVENT,event:mutation.target.id.replace("jswrapper-log",""),value:mutation.target.value,domain:location.href},function(){});
        }
      //}    
    });    
  });
  // configuration of the observer:
  var config = { attributes: true, childList: false, characterData: false,attributeFilter :['value'] }; 
  // pass in the target node, as well as the observer options
  observer1.observe(target1, config);
  observer1.observe(target2, config);
  observer1.observe(target3, config);
  observer1.observe(target4, config);
  observer1.observe(target5, config); 
}

/* 
  Refreshes the badge value if the focus is changed
*/
function add_focus_listener(){
  if(window === window.top){
    window.onfocus = function(){
      try{
        let req_url = location.href;
        chrome.runtime.sendMessage({action:ACTION_REFRESH_BADGE, url:req_url},function(){});
      }
      catch(err){
        console.info("Req error");
        console.error(err);
      }
    }
  }
}

// main
first_logs();
secureInputTags();
window.setInterval(function(){secureInputTags();}, 250);
add_logs_listeners();
add_focus_listener();

console.log(`%c[JSWrapper]%c  : %c${document.location.href}`,'color:Chocolate','color:black',"color: green");
