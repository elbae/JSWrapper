'use strict';
var d = new Date();
var time = "[mm:ss:mmmm] "+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
time = "";
window['message_disable'] = true;
var tm = new Map();
console.log(`%c[A]%c Start : mm:ss:mmm ${time} on %c${document.domain}`,'color:Chocolate','color:black',"color: green");
//at first i want to enable every connection

//then i want to add the listener

/*
function _sendPostData(){
  try{    
    var params = JSON.stringify({"parametro" : "asdfasdfasdfas"});
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "https://accounts.google.com/signin/challenge/sl/password");
    oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    oReq.setRequestHeader("Finiro-mai-sta-tesi", ":(");
    oReq.send(params);
  }
  catch(e){
    console.log('Error in _sendData() function');
    console.error(e);
  }
}
function _sendGetData(){
// GET HTTPS REQUEST
  try{    
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "https://www.google.it/search?q="+'lol');
    oReq.send();
  }
  catch(e){
    console.log('Error in _sendData() function');
    console.error(e);
  }
}*/

console.log(document);
function handler_normal(){
  chrome.runtime.sendMessage({action:"background_disable_ext_comm", domain:document.domain}, function(){
    if(window['message_disable']){
      window['message_disable']=false;
      console.log(`%c[A]%c asks for disable external requests`,'color:Chocolate','color:black');
    }
  });             
}
function handler_check(){
  if(this.type === "password"){
    chrome.runtime.sendMessage({action:"background_disable_ext_comm",domain: document.domain}, function(){
      if(window['message_disable']){
        window['message_enable']=false;
        console.log(`%c[A]%c asks for disable external requests`,'color:Chocolate','color:black');
      }
    });             
  }
}
function secureInputTags(){
  try{
    var item_list = document.getElementsByTagName('input');
    var index=0, list_size = item_list.length;
    while(index<list_size){
      // setting values inside map 
      var t_id;
      var t_value;
      if(item_list[index].hasAttribute('id')){
        t_id = item_list[index].id;
        t_value = item_list[index].value;
        if(!tm.has(t_id)){
          tm.set(t_id,t_value);
        }
      }
      // if type is already password
      if(item_list[index].type==="password"){
        // check if value has changed
        if(tm.has(t_id)){
          let tm_value = tm.get(t_id);
          if(tm_value !== t_value){
            handler_normal();
            tm.set(t_id,t_value);
          }
        }
        //focus event
        item_list[index].addEventListener("focus",handler_normal,{capture:true,once:true,passive:true},true);
        // keypress event
        item_list[index].addEventListener("keypress",handler_normal,{capture:true,once:true,passive:true},true);        
      } //if type is changed from something to password
      else{
        // focuse event
        item_list[index].addEventListener("focus",handler_check,{capture:true,once:true,passive:true},true);
        // keypress event
        item_list[index].addEventListener("keypress",handler_check,{capture:true,once:true,passive:true},true);        
      }
      index+=1;
    }
  }
  catch(error){
    console.error(`[After.js] error : reload listener`);
    console.error(error);
  }
}

secureInputTags();
window.setInterval(function(){secureInputTags();}, 250);
var d = new Date();
var time = "[mm:ss:mmmm] "+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
time = "";
console.log(`%c[A]%c End : mm:ss:mmm ${time} on %c${document.domain}`,'color:Chocolate','color:black',"color: green");
