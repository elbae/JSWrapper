'use strict';
/**
 * Represents the Popup controller.
 * @constructor
 */
var PopupController = function () {
  this.SAVE_NAME = "policies";
  this.button_ = document.getElementById('bt_reload');
  this.button_enable = document.getElementById('bt_enable');
  this.button_disable = document.getElementById('bt_disable');
  this.check_ui = document.getElementsByName('check_ui')[0];
  this.setValues();
  this.addCheckListeners();
};

PopupController.prototype = {
  button_: null,
  check_ui: null,
  /*
  @description Retrieves the values from the switches in the user interface and saves them in the background's env
  */
  setValues: function(){ 
    var background_window = chrome.extension.getBackgroundPage();
    var ext_list = background_window.policies_array;
    var input_list = document.getElementsByTagName('input');
    var i=0;
    for(i=0;i<ext_list.length && i<input_list.length;i++){
        if(ext_list[i]===true){
          input_list[i].checked=true;
        }
        else{
          input_list[i].checked=false;
        }
    }
  },
  saveValues : function(){
    var input_list = document.getElementsByTagName('input');
    var value_array = new Array();
    var i=0;
    for(i=0;i<input_list.length;i++){
      value_array[i]=input_list[i].checked;
    }    
    var background_window = chrome.extension.getBackgroundPage();
    background_window.policies_array = value_array; 
    var ext_list = JSON.stringify(value_array);
    chrome.storage.sync.set({SAVE_NAME: ext_list},function(){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      });
    });
  },
  addCheckListeners: function (){
    this.button_.addEventListener('click', this.handleClick_.bind(this));
    this.button_enable.addEventListener('click', this.handleClick_enable.bind(this));
    this.button_disable.addEventListener('click', this.handleClick_disable.bind(this));
    var i=0;
    var input_list = document.getElementsByTagName('input');
    for(i=0;i<input_list.length;i++){
      input_list[i].addEventListener('change',this.saveValues.bind(this));  
    }  
  },
  handleClick_: function (){    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
  },
  handleClick_enable: function (){    
    var background_window = chrome.extension.getBackgroundPage();
    var policies_array = [true, true, true, true, true, true, true, true, true, true]
    background_window.policies_array = policies_array;
    var ext_list = JSON.stringify(policies_array);
    chrome.storage.sync.set({SAVE_NAME: ext_list},function(){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      });
    });
    this.setValues();
  },
  handleClick_disable: function (){     
    var background_window = chrome.extension.getBackgroundPage();
    var policies_array = [false, false, false, false, false, false, false, false, false, false];
    background_window.policies_array = policies_array;
    var ext_list = JSON.stringify(policies_array);
    chrome.storage.sync.set({SAVE_NAME: ext_list},function(){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      });
    });
    this.setValues();
  },
  updateValues : function(){
    let background_window = chrome.extension.getBackgroundPage(); 
    let list = background_window.url_log_list;
    let local_array;
    let actual_url;
    chrome.tabs.getSelected(null,function(tab){
      var actual_url = tab.url;
      if(list.has(actual_url) === true){
            local_array = JSON.parse(list.get(actual_url));
                var log1 = document.getElementById("log1");
                log1.innerHTML = '<b>'+local_array[0]+'</b>';
                var log2 = document.getElementById("log2");
                log2.innerHTML = '<b>'+local_array[1]+'</b>';
                var log3 = document.getElementById("log3");
                log3.innerHTML = '<b>'+local_array[2]+'</b>';
                var log4 = document.getElementById("log4");
                log4.innerHTML = '<b>'+local_array[3]+'</b>';
                var log5 = document.getElementById("log5");
                log5.innerHTML = '<b>'+local_array[4]+'</b>';
      }
      else{
        // anything blocked
        //console.error("Not present");
      }   

    });    
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.PC = new PopupController();  
  window.setInterval(function(){window.PC.updateValues();}, 500);
});