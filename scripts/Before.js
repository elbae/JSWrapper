'use strict'
const ACTION_ENABLE_REQUESTS = 'enable-extcomm'
const ACTION_LOAD_POLICIES = 'load-policies'
/* global vars */
var policyArray // An array of 10 elements used for the policies
var customHead	// Node element for the custom head
var customScript// Script element for the custom script
var count = 0			// Int counter variable for loops
var isFrame			// A boolean variable used to check if the execution is on the main frame or inside a subframe
var names = ['', 'window-event', 'cookie-read', 'cookie-write', 'document-write', 'eval'] // names used in the log

isFrame = (window !== window.top)
/*
	Immediately asks for enabling connection
*/
if (!isFrame) {
  try {
    chrome.runtime.sendMessage({action: ACTION_ENABLE_REQUESTS, domain: window.location.origin}, function () {})
  } catch (e) {
    // console.error('Error on chrome.runtime.sendMessage - {action:"enable-extcomm"} ')
    console.error(e)
  }
}

/*

*/
/*
	@callback Policies request callback
	@description Functions which creates the custom script tag and place it under the head
*/
var includeScripts = function () {
		// console.log('%c[B] %c Policies used %s','color:purple','color:black',JSON.stringify(policyArray));
  customScript.innerHTML = `
			'use strict';
			/* 
				variable used to block multiple write on console
				default value: false -> log shown in popup
			*/
			window["cookieReadNotice"] = false;
			window["cookieWriteNotice"] = false;
			window["uiNotice"] = false;
			window["evalNotice"] = false;
			window["documentWriteNotice"] = false;

			// We do not modify the console logging methods			
			try
			{
				// permissionUi
				Object.defineProperty(window,'permissionUi',{
				      value:${policyArray[0]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionReadCookie
				Object.defineProperty(window,'permissionReadCookie',{
				      value:${policyArray[1]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionWriteCookie
				Object.defineProperty(window,'permissionWriteCookie',{
				      value:${policyArray[2]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionDocumentWrite 
				Object.defineProperty(window,'permissionDocumentWrite',{
				      value:${policyArray[3]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionLocalStorage 
				Object.defineProperty(window,'permissionLocalStorage',{
				      value:${policyArray[4]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionSessionStorage
				Object.defineProperty(window,'permissionSessionStorage',{
				      value:${policyArray[5]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionExternalCommunication 
				Object.defineProperty(window,'permissionExternalCommunication',{
				      value:${policyArray[6]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionNavigator 
				Object.defineProperty(window,'permissionNavigator',{
				      value:${policyArray[7]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				// permissionNotification 
				Object.defineProperty(window,'permissionNotification',{
				      value:${policyArray[8]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
				//(Object.freeze || Object)(Object.prototype);			
				// permissionEval 
				Object.defineProperty(window,'permissionEval',{
				      value:${policyArray[9]},
				      configurable:false,
				      writable:false,
				      enumerable:false
				    });
			}
			catch(error){
				console.error()
				console.error(error);

			}
			if( window.hasOwnProperty('permissionUi') && (!permissionUi)){
				// wrapping alert function
				try
				{
					var alert =  new Proxy(function() {}, {
					  apply: function(target, thisArg, argumentsList) {
					  	if(window["uiNotice"]){
					  		window["uiNotice"] = false;
					    	try{
					    		console.log('UI DISABLED');
					    	}
					    	catch(error){
					    		//pass
					    	}
					  	}
					  	try{
					  		let log1 = document.getElementById('jswrapper-log1');
					  		log1.value = parseInt(log1.value)+1;
					  	}
					  	catch(error){

					  	}
					  }
					});
					Object.defineProperty(window,'alert',{
				    configurable:false,
				    writable:false,
				    enumerable:false
				  });			
			  }
			  catch(error){
			  	console.error(error);
			  }
				// window.prompt
				try
				{
					var prompt =  new Proxy(function() {}, {
					  apply: function(target, thisArg, argumentsList) {
					  	if(window["uiNotice"]){
					  		try{
					  			window["uiNotice"] = false;
					    		console.log('UI DISABLED');
					    	}
					    	catch(error){
					    		//pass
					    	}
					  	}
					  	try{
						  	let log1 = document.getElementById('jswrapper-log1');
						  	log1.value = parseInt(log1.value)+1;
						  }
						  catch(error){
						  	//pass
						  }
					  }
					});
					Object.defineProperty(window,'prompt',{
				    configurable:false,
				    writable:false,
				    enumerable:false
				  });							
			  }
			  catch(error){
			  	console.error(error);
			  }
				// window.confirm
				try
				{
					var confirm =  new Proxy(function() {}, {
					  apply: function(target, thisArg, argumentsList) {
					  	if(window["uiNotice"]){
					  		try{
					  			window["uiNotice"] = false;
					  			console.log('UI DISABLED');
					  		}
					  		catch(error){
					  			//pass
					  		}
					  	}
					  	try{
					  		let log1 = document.getElementById('jswrapper-log1');
					  		log1.value = parseInt(log1.value)+1;
					  	}
					  	catch(error){
					  		//pass
					  	}
					  }
					});
					Object.defineProperty(window,'confirm',{
				    configurable:false,
				    writable:false,
				    enumerable:false
				   });			
			  }
			  catch(error){
			  	console.error(error);
			  }
				// window.open
				try
				{
					var open =  new Proxy(function() {}, {
					  apply: function(target, thisArg, argumentsList) {
					  	if(window["uiNotice"]){
					  		try{
						  		window["uiNotice"] = false;
						    	console.log('UI DISABLED');
						    }
						    catch(error){
						    	//pass
						    }
					  	}
					  	try{
					  		let log1 = document.getElementById('jswrapper-log1');
					  		log1.value = parseInt(log1.value)+1;	
					  	}
					  	catch(error){
					  		//pass
					  	}
					  	
					  }
					});
					Object.defineProperty(window,'open',{
				    configurable:false,
				    writable:false,
				    enumerable:false
				  });			
			  }
			  catch(error){
			  	console.error(error);
			  }
				try
				{
					if(true){
						window.onbeforeunload = function(e){return ""};
						Object.defineProperty(window,'onbeforeunload',{
					    configurable:false,
					    writable:false,
					    enumerable:false
					  });			
					}
			  }
			  catch(error){
			  	console.error(error);
			  }
			}
			if(window.hasOwnProperty('permissionReadCookie') && window.hasOwnProperty('permissionWriteCookie'))
			{
				// false - false
				if( (permissionReadCookie === false) && (permissionWriteCookie == false)){
					try
					{
						Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
						Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});				
						Object.defineProperty(document, 'cookie', {
						    get: function() {
						    	if(window["cookieReadNotice"]){
						    		try{
						    			window["cookieReadNotice"]=false;
					        		console.log('READ COOKIE DISABLED for '+location );		        
					        	}
					        	catch(error){
					        		//pass
					        	}
						    	}
						    	try{
								  	let log2 = document.getElementById('jswrapper-log2');
								  	log2.value = parseInt(log2.value)+1;
								  }
								  catch(error){

								  }
							  	return "";
							    },
						    set: function(val) {
						    	if(window["cookieWriteNotice"]){
						    		try{
						    			window["cookieWriteNotice"]=false;
					        		console.log('WRITE COOKIE DISABLED for '+location + 'with value: '+val );	
					        	}
					        	catch(error){
					        		//pass
					        	}
						    	}
						    	try{
						    		let log3 = document.getElementById('jswrapper-log3');
							  		log3.value = parseInt(log3.value)+1;
							  	}
							  	catch(error){
							  		//pass
							  	}
						    }
						});			
				  }
				  catch(error){
				  	console.error(error);
				  }					
				} // false - true
				else if( (permissionReadCookie === false) && (permissionWriteCookie == true)){
					try
					{
						let old_cookie = Object.getOwnPropertyDescriptor(Document.prototype,'cookie');
						Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
						Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});				
						Object.defineProperty(document, 'cookie', {
						    get: function() {
						    	if(window["cookieReadNotice"]){
						    		try{
							    		window["cookieReadNotice"]=false;
						        	console.log('READ COOKIE DISABLED for '+location );		        
						        }
						        catch(error){
						        	//pass
						        }
						    	}
						    	try{
								  	let log2 = document.getElementById('jswrapper-log2');
								  	log2.value = parseInt(log2.value)+1;
								  }
								  catch(error){
								  	//pass
								  }
							  	return "";
						    },
						    set: function(val) {
						    	old_cookie.set.call(document,val);
						    }
						});	
				  }
				  catch(error){
				  	console.error(error);
				  }
				} // true - false
				else if( (permissionReadCookie === true) && (permissionWriteCookie == false)){
					try
					{
						let old_cookie = Object.getOwnPropertyDescriptor(Document.prototype,'cookie');
						Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
						Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});				
						Object.defineProperty(document, 'cookie', {
						    get: function() {
						    	return old_cookie.get.call(document);
						    },
						    set: function(val) {
						    	if(window["cookieWriteNotice"]){
						    		try{
							    		window["cookieWriteNotice"]=false;
						        	console.log('WRITE COOKIE DISABLED for '+location + 'with value: '+val );	
						        }
						        catch(error){
						        	//pass
						        }
						    	}
						    	try{
								  	let log3 = document.getElementById('jswrapper-log3');
								  	log3.value = parseInt(log3.value)+1;
								  }
								  catch(error){
								  	//pass
								  }
						    }
						});			
				  }
				  catch(error){
				  	console.error(error);
				  }		
				}	// true - true
				else{
					// clone the descriptor in old_cookie
					try
					{
						let old_cookie = Object.getOwnPropertyDescriptor(Document.prototype,'cookie');
						// hiding getter and setter for the visible descriptor, disable modification
						Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
						Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});

						// Editing getter and setter 
						Object.defineProperty(document, 'cookie',{
					    get: function() {
					    	try{
					    		try{
								  	let log2 = document.getElementById('jswrapper-log2');
								  	log2.value = parseInt(log2.value)+1;
								  }
								  catch(error){

								  }
					    	}
					    	catch(error){
					    		//pass
					    	}
					      return old_cookie.get.call(document);
					    },
					    set: function(value) {
					    	try{
						    	try{
								  	let log3 = document.getElementById('jswrapper-log3');
								  	log3.value = parseInt(log3.value)+1;
								  }
								  catch(error){

								  }
						    }
						    catch(error){
						    	//pass
						    }
						   	return old_cookie.set.call(document,value);
					    }
						});
				  }
				  catch(error){
				  	console.error(error);
				  }
				}
			}


			if(window.hasOwnProperty('permissionDocumentWrite') && (!permissionDocumentWrite)){
				try
				{
					document.write =  new Proxy(function() {}, {
					  apply: function(target, thisArg, argumentsList) {					  			  	
					  	if(window["documentWriteNotice"]){
					  		try{
						  		window["documentWriteNotice"]=false;
						    	console.log('DOCUMENT WRITE DISABLED for '+location );	
						    }
						    catch(error){
						    	//
						    }
					  	}
					  	try{
						  	let log4 = document.getElementById('jswrapper-log4');
						  	log4.value = parseInt(log4.value)+1;
						  }
						  catch(error){
						  	//pass
						  }
					    //return undefined;
					  }
					});
					Object.defineProperty(Document.prototype,'write',{
				    configurable:false,
				    writable:false,
				    enumerable:false
				 	});
				}
				catch(error){
				 	console.error(error);
				}
			}
			// Window.localStorage
			if(window.hasOwnProperty('permissionLocalStorage') && (!permissionLocalStorage)){
				try{
					Object.defineProperty(window,'localStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   	});
				}
				catch(error){
				 	console.error(error);
				}
			}
			// Window.sessionStorage
			if(window.hasOwnProperty('permissionSessionStorage') && (!permissionSessionStorage)){
				try{
					Object.defineProperty(window,'sessionStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   	});
				}
				catch(error){
				 	console.error(error);
				}
			}
			
			if( window.hasOwnProperty('permissionNavigator') && (!permissionNavigator)){
				try{ /* writable : false, configurable : true*/
					Object.defineProperty(window, 'navigator', {
					value: null,
				  configurable:false,
				  writable:false,
				  enumerable:false
					});
				  Object.defineProperty(window, 'Navigator', {
				   	value:null,
					  configurable:false,
					  writable:false,
					  enumerable:false
					});
				}
				catch(error){
					console.error(error);
				}
			}
			if( window.hasOwnProperty('permissionNotification') && (!permissionNotification)){
				try{ /* writable : false, configurable : true*/
					Object.defineProperty(window, 'Notification', {
					value: null,
				  configurable:false,
				  writable:false,
				  enumerable:false
					});
				}
				catch(error){
					console.error(error);
				}
			}
			if( window.hasOwnProperty('permissionEval') && (!permissionEval)){
				try{
					window.eval = new Proxy(function() {}, {
					  apply: function(target, thisArg, argumentsList) {			  	
				    	if(window["evalNotice"]){
				    		try{
				    			window["evalNotice"]=false;
				      		console.log('EVAL DISABLED for '+location );	
				      	}
				      	catch(error){
				      		//pass
				      	}
				    	}
				    	try{
						  	let log5 = document.getElementById('jswrapper-log5');
						  	log5.value = parseInt(log5.value)+1;
						  }
						  catch(error){
						  	//pass
						  }
					  }
					});
				  Object.defineProperty(window, 'eval', {
					  configurable:false,
					  writable:false,
					  enumerable:false
					});
				}
				catch(error){
					console.error(error);
				}
			}
			else{
				let old_eval = window.eval
				try{
					window.eval = new Proxy(function() {}, {
					  apply: function(target, thisArg, argumentsList) {				    	
				    	try{
						  	let log5 = document.getElementById('jswrapper-log5');
						  	log5.value = parseInt(log5.value)+1;
						  }
						  catch(error){
						  	//pass
						  }
						  old_eval.apply(thisArg,argumentsList)
					  }
					});
				  Object.defineProperty(window, 'eval', {
					  configurable:false,
					  writable:false,
					  enumerable:false
					});
				}
				catch(error){
					console.error(error);
				}
				
			}			
			
			`
// console.log(`%c[B] %c End with policies : mm:ss:mmm ${getTime()}`,'color:purple','color:black');
}

/*
Main function,
1 - creates the element used to log the blocked execution requests, one per log name
2 - checks if executing inside a frame or in the global environment
3 -
MAIN_FRAME:
- loads the policies and sends the domain
- creates the false <head><script></script></head> tags
- includes the script content
SUB_FRAME:
TODO -> differentiation: at this time we execute the same actions
*/
var main = function () {
  for (count = 1; count < names.length; count++) {
    window[`jswrapper-log${count}`] = document.createElement('input')
    window[`jswrapper-log${count}`].type = 'hidden'
    window[`jswrapper-log${count}`].value = 0
    window[`jswrapper-log${count}`].name = names[count]
    window[`jswrapper-log${count}`].id = `jswrapper-log${count}`
    document.documentElement.appendChild(window[`jswrapper-log${count}`])
  }
  if (isFrame) {
    chrome.runtime.sendMessage({action: ACTION_LOAD_POLICIES, domain: document.domain}, function (response) {
      try {
        policyArray = JSON.parse(response.policies)
        customHead = document.createElement('head')
        document.documentElement.insertBefore(customHead, document.head)
        customScript = document.createElement('script')
        customScript.setAttribute('type', 'text/javascript')
        customHead.appendChild(customScript)
        includeScripts()
      } catch (e) {
        console.error(e)
      }
    })
  } else {
    chrome.runtime.sendMessage({action: ACTION_LOAD_POLICIES, domain: window.location.href}, function (response) {
      try {
        policyArray = JSON.parse(response.policies)
        customHead = document.createElement('head')
        document.documentElement.insertBefore(customHead, document.head)
        customScript = document.createElement('script')
        customScript.setAttribute('type', 'text/javascript')
        customHead.appendChild(customScript)
        includeScripts()
      } catch (e) {
        console.error(e)
      }
    })
  }
}
main()
