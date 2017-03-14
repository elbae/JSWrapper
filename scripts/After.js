'use strict'
const ACTION_LOG_EVENT = 'log-event'
const ACTION_CLEAR_LOGS = 'clear_logs'
const ACTION_DISABLE_REQUESTS = 'disable-extcomm'
const ACTION_LOG_EVENT_URL = 'log-event-url'
const ACTION_REFRESH_BADGE = 'refresh-badge'

window['message_disable'] = true
var elementsValuesMap = new Map() // a map which includes
var logUrl = ''   // the url
var counter = 0    // a basic counter

/*
  One show JSON.stringify
*/
function JSONstring (value) {
  let tmpValue = JSON.stringify(value)
  return tmpValue
}
/*
  One show JSON.parse
*/
function JSONparse (value) {
  let tmpValue = JSON.parse(value)
  return tmpValue
}

/*
  Sends:
  - the page url
  - the first set of log values

*/
function firstLogs () {
  if (window === window.top) {
    logUrl = window.location.href
    chrome.runtime.sendMessage({action: ACTION_LOG_EVENT_URL, domain: logUrl}, function () {})
    for (counter = 1; counter < 6; counter++) {
      window[`lt${counter}`] = document.getElementById(`jswrapper-log${counter}`)
      window[`lt${counter}`] = parseInt(window[`lt${counter}`].value)
    }
    var tmpString = JSONstring(new Array(lt1, lt2, lt3, lt4, lt5))
    chrome.runtime.sendMessage({action: ACTION_CLEAR_LOGS, domain: logUrl, data: tmpString}, function () {})
  } else {
    logUrl = (window.location !== window.parent.location) ? document.referrer : window.location.href
  }
}
/*
  Sends a message to the background script
  asking for disabling the external requests
*/
function handlerNormal () {
  chrome.runtime.sendMessage({action: ACTION_DISABLE_REQUESTS, domain: document.domain}, function () {
    if (window['message_disable']) {
      window['message_disable'] = false
      // console.log(`%c[A]%c asks for disable external requests`,'color:Chocolate','color:black');
    }
  })
}
/*
  Sends a message to the background script
  asking for disabling the external requests
  only if the type of this element is password
*/
function handlerCheck () {
  if (this.type === 'password') {
    chrome.runtime.sendMessage({action: ACTION_DISABLE_REQUESTS, domain: document.domain}, function () {
      if (window['message_disable']) {
        window['message_enable'] = false
        console.log(`%c[A]%c asks for disable external requests`, 'color:Chocolate', 'color:black')
      }
    })
  }
}
/*
  Retrieves all the input elements
  sets the handlers
*/
function secureInputTags () {
  try {
    var itemList = document.getElementsByTagName('input')
    counter = 0
    while (counter < itemList.length) {
      // setting values inside map
      var itemId
      var itemValue
      // check 1: using only items which have an id
      if (itemList[counter].hasAttribute('id')) {
        itemId = itemList[counter].id
        itemValue = itemList[counter].value
        if (!elementsValuesMap.has(itemId)) {
          elementsValuesMap.set(itemId, itemValue)
        }
      }
      // check 2: item has type password
      if (itemList[counter].type === 'password') {
        // check if value has changed since the last check
        if (elementsValuesMap.has(itemId)) {
          let savedValue = elementsValuesMap.get(itemId)
          if (savedValue !== itemValue) {
            handlerNormal()
            elementsValuesMap.set(itemId, itemValue)
          }
        }
        // focus event
        itemList[counter].addEventListener('focus', handlerNormal, {capture: true, once: true, passive: true}, true)
        // keypress event
        itemList[counter].addEventListener('keypress', handlerNormal, {capture: true, once: true, passive: true}, true)
      } else { // if type is changed from something to password
        // focuse event
        itemList[counter].addEventListener('focus', handlerCheck, {capture: true, once: true, passive: true}, true)
        // keypress event
        itemList[counter].addEventListener('keypress', handlerCheck, {capture: true, once: true, passive: true}, true)
      }
      counter += 1
    }
  } catch (error) {
    console.error(`[After.js] error : reload listener`)
    console.error(error)
  }
}

/*
  Adds listeners on logs elements present in the page
  when a value changes it is sent to the background
*/
function addLogsListeners () {
  // select the target nodes
  var target1 = document.getElementById('jswrapper-log1')
  var target2 = document.getElementById('jswrapper-log2')
  var target3 = document.getElementById('jswrapper-log3')
  var target4 = document.getElementById('jswrapper-log4')
  var target5 = document.getElementById('jswrapper-log5')
  // create an observer instance
  var observer1 = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      // if(document.hasFocus()){
      if (window !== window.top) {
        var url = (window.location !== window.parent.location) ? document.referrer : window.location.href
        chrome.runtime.sendMessage({action: ACTION_LOG_EVENT, event: mutation.target.id.replace('jswrapper-log', ''), value: mutation.target.value, domain: url}, function () {})
      } else {
        chrome.runtime.sendMessage({action: ACTION_LOG_EVENT, event: mutation.target.id.replace('jswrapper-log', ''), value: mutation.target.value, domain: window.location.href}, function () {})
      }
      // }
    })
  })
  // configuration of the observer:
  var config = { attributes: true, childList: false, characterData: false, attributeFilter: ['value'] }
  // pass in the target node, as well as the observer options
  observer1.observe(target1, config)
  observer1.observe(target2, config)
  observer1.observe(target3, config)
  observer1.observe(target4, config)
  observer1.observe(target5, config)
}

/*
  Refreshes the badge value if the focus is changed
*/
function addFocusListener () {
  if (window === window.top) {
    window.onfocus = function () {
      try {
        let reqUrl = window.location.href
        chrome.runtime.sendMessage({action: ACTION_REFRESH_BADGE, url: reqUrl}, function () {})
      } catch (err) {
        console.info('Req error')
        console.error(err)
      }
    }
  }
}

// main
firstLogs()
secureInputTags()
window.setInterval(function () { secureInputTags() }, 250)
addLogsListeners()
addFocusListener()

console.log(`%c[JSWrapper]%c  : %c${window.location.href}`, 'color:Chocolate', 'color:black', 'color: green')
