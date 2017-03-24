'use strict'
/**
 * Represents the Popup controller.
 * @constructor
 */
var PopupController = function () {
  //this.policies = 'policies'
  this.buttonReload = document.getElementById('bt_reload')
  this.buttonEnable = document.getElementById('bt_enable')
  this.buttonDisable = document.getElementById('bt_disable')
  this.checkUi = document.getElementsByName('check_ui')[0]
  this.setValues()
  this.addCheckListeners()
}

PopupController.prototype = {
  button_: null,
  check_ui: null,
  /*
  @description Retrieves the values from the switches in the user interface and saves them in the background's env
  */
  setValues: function () {
    var backgroundWindow = chrome.extension.getBackgroundPage()
    var extList = backgroundWindow.policiesArray
    var inputList = document.getElementsByTagName('input')
    var i = 0
    for (i = 0; i < extList.length && i < inputList.length; i++) {
      if (extList[i] === true) {
        inputList[i].checked = true
      } else {
        inputList[i].checked = false
      }
    }
  },
  saveValues: function () {
    var inputList = document.getElementsByTagName('input')
    var valueArray = new Array()
    var i = 0
    for (i = 0; i < inputList.length; i++) {
      valueArray[i] = inputList[i].checked
    }
    var backgroundWindow = chrome.extension.getBackgroundPage()
    backgroundWindow.policiesArray = valueArray
    var extList = JSON.stringify(valueArray)
    chrome.storage.sync.set({policies: extList}, function () {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
      })
    })
  },
  addCheckListeners: function () {
    this.buttonReload.addEventListener('click', this.handleClick_.bind(this))
    this.buttonEnable.addEventListener('click', this.handleClick_enable.bind(this))
    this.buttonDisable.addEventListener('click', this.handleClick_disable.bind(this))
    var i = 0
    var inputList = document.getElementsByTagName('input')
    for (i = 0; i < inputList.length; i++) {
      inputList[i].addEventListener('change', this.saveValues.bind(this))
    }
  },
  handleClick_: function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
    })
  },
  handleClick_enable: function () {
    var backgroundWindow = chrome.extension.getBackgroundPage()
    var policiesArray = [true, true, true, true, true, true, true, true, true, true]
    backgroundWindow.policiesArray = policiesArray
    var extList = JSON.stringify(policiesArray)
    chrome.storage.sync.set({policies: extList}, function () {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
      })
    })
    this.setValues()
  },
  handleClick_disable: function () {
    var backgroundWindow = chrome.extension.getBackgroundPage()
    var policiesArray = [false, false, false, false, false, false, false, false, false, false]
    backgroundWindow.policiesArray = policiesArray
    var extList = JSON.stringify(policiesArray)
    chrome.storage.sync.set({policies: extList}, function () {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
      })
    })
    this.setValues()
  },
  updateValues: function () {
    let backgroundWindow = chrome.extension.getBackgroundPage()
    let list = backgroundWindow.urlLogList
    var localArray
    chrome.tabs.getSelected(null, function (tab) {
      var actualUrl = tab.url
      if (list.has(actualUrl) === true) {
        localArray = JSON.parse(list.get(actualUrl))
        var log1 = document.getElementById('log1')
        log1.innerHTML = '<b>' + localArray[0] + '</b>'
        var log2 = document.getElementById('log2')
        log2.innerHTML = '<b>' + localArray[1] + '</b>'
        var log3 = document.getElementById('log3')
        log3.innerHTML = '<b>' + localArray[2] + '</b>'
        var log4 = document.getElementById('log4')
        log4.innerHTML = '<b>' + localArray[3] + '</b>'
        var log5 = document.getElementById('log5')
        log5.innerHTML = '<b>' + localArray[4] + '</b>'
      } else {
        // anything blocked
        // console.error("Not present");
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', function () {
  window.PC = new PopupController()
  window.setInterval(function () { window.PC.updateValues() }, 500)
})
