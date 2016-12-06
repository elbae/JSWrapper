'use strict';
var PopupController = function () {
  this.button_ = document.getElementById('bt_reload');
  this.check_ui = document.getElementsByName('check_ui')[0];
  this.setValues();
  this.addCheckListeners();
};

PopupController.prototype = {
  button_: null,
  check_ui: null,
  setValues: function(){ 
    /* i want to load from the background.js */
    chrome.runtime.sendMessage({action: "background_load"},
      function(response) {
        //response.policies is a string
        var bool_list = JSON.parse(response.policies);
        var input_list = document.getElementsByTagName('input');
        var i=0;
        for(i=0;i<bool_list.length && i<input_list.length;i++){
          if(bool_list[i]===true){
            input_list[i].checked=true;
          }
          else{
            input_list[i].checked=false;
          }
        }
      }
    );
  },
  saveValues_ : function(){
    var input_list = document.getElementsByTagName('input');
    var value_array = new Array();
    var i=0;
    for(i=0;i<input_list.length;i++){
      value_array[i]=input_list[i].checked;
    }
    var ext_list = JSON.stringify(value_array);
    chrome.runtime.sendMessage({action: "background_set",policies:ext_list});
    this.sendReloadMessage();    
  },
  addCheckListeners: function () {
    this.button_.addEventListener('click', this.handleClick_.bind(this));
    var i=0;
    var input_list = document.getElementsByTagName('input');
    for(i=0;i<input_list.length;i++){
      input_list[i].addEventListener('change',this.saveValues_.bind(this));  
    }
  },
  sendReloadMessage:function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action:'before_reload'}, function(response) {
      //nothing to do here
      });
    });
  },
  handleClick_: function () {    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        window.close();
    });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.PC = new PopupController();  
});