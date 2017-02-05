'use strict';
/* 
	global variables
*/
var policy_array; // An array of 10 elements used for the policies
var custom_head;	// Node element for the custom head
var custom_script;// Script element for the custom script
var count=0;			// Int counter variable for loops
var retrieved; 		// A string variable
/*
	Function which gets the time from a Date object
*/
function getTime(){
  var d = new Date();
  var time = ""+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
  return time;
}

console.log('%c[B] %c Start : %s on %c%s','color:purple','color:black',getTime(),'color: green',document.domain);

/* 
	Creation of the custom head and custom script tags
*/
custom_head = document.createElement('head');
(document.head || document.documentElement).appendChild(custom_head);

custom_script = document.createElement('script');
custom_script.setAttribute("type","text/javascript");
custom_head.appendChild(custom_script);
/* 
	Immediately asks for enabling connection
*/
try{
	console.log(`%c[B] %c asks for enable external requests at ${getTime()}`,'color:purple','color:black');
	chrome.runtime.sendMessage({action:"background_enable_ext_comm", domain:document.domain}, function(){});
}
catch(e){
	alert('Error on chrome.runtime.sendMessage - {action:"background_enable_ext_comm"} ');
	console.error(e);
}
/*
	Setting message listener
*/
try{
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'before_reload'){
			getNReload();
		}	    
	});
}
catch(error){
	console.error(`%c[B] %c error : reload listener`,'color:purple','color:black');
	console.error(error);
}

/*
	Functions which creates the policies array initializing it to false*10
*/
var createCustom = function(){
	policy_array = new Array(10);
	for(count=0;count<10;count++){
		policy_array[count]=false;
	}
}
/*
	Function which loads from the chrome.storage.sync and save into the localStorage
*/
var getNReload = function(){
	try{	
		var pre = JSON.parse(localStorage.getItem('policies'));
		var post;
		chrome.storage.sync.get('policies', function(result) {		
			console.log('%c[B] %c Policies waiting at %s','color:purple','color:black',getTime());
			if(result.policies === undefined){
				chrome.storage.sync.set('policies',JSON.stringify(pre),function(){});
				console.log('%c[B] %c Policies created','color:purple','color:black');
			}
	    else{
	      policy_array = JSON.parse(result.policies);
	      console.log('%c[B] %c Policies loaded on %c%s %c at %s','color:purple','color:black','color:green',document.domain,'color:black',getTime());
	    } 
	    for(count=0;count<10;count++){
	    	if(pre[count] !== policy_array[count]){
	    		localStorage.setItem('policies',JSON.stringify(policy_array));
	    		window.location.reload();
	    	}
	    }
	    localStorage.setItem('policies',JSON.stringify(policy_array));
			
	  });
	  
	}
	catch(error){
		console.error(`%c[B] %c error : injection`,'color:purple','color:black');
		console.error(error);
	}
}
/*
	Functions which creates the custom script tag and place it under the head
*/
var includeScripts = function () {
		console.log('%c[B] %c Policies used %s','color:purple','color:black',JSON.stringify(policy_array));
		custom_script.innerHTML = `
			'use strict';
			window["random_value"]=true; 
			window["random_list"] = new Map();

			window["cookie_read_notice"] = true;
			window["cookie_write_notice"] = true;
			window["ui_notice"] = true;
			window["eval_notice"] = true;
			window["document_write_notice"] = true;


			// permission_ui
			Object.defineProperty(window,'permission_ui',{
			      value:${policy_array[0]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			////(Object.freeze || Object)(Object.prototype);
			// permission_read_cookie
			Object.defineProperty(window,'permission_read_cookie',{
			      value:${policy_array[1]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			////(Object.freeze || Object)(Object.prototype);	
			// permission_write_cookie
			Object.defineProperty(window,'permission_write_cookie',{
			      value:${policy_array[2]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			////(Object.freeze || Object)(Object.prototype); 		
			// permission_document_write 
			Object.defineProperty(window,'permission_document_write',{
			      value:${policy_array[3]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			////(Object.freeze || Object)(Object.prototype);			
			// permission_local_storage 
			Object.defineProperty(window,'permission_local_storage',{
			      value:${policy_array[4]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			////(Object.freeze || Object)(Object.prototype);			
			// permission_session_storage
			Object.defineProperty(window,'permission_session_storage',{
			      value:${policy_array[5]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// permission_external_communication 
			Object.defineProperty(window,'permission_external_communication',{
			      value:${policy_array[6]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// permission_navigator 
			Object.defineProperty(window,'permission_navigator',{
			      value:${policy_array[7]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// permission_frame_comm = true; //framecomm
			Object.defineProperty(window,'permission_frame_comm',{
			      value:false,
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// hide_document_prototype = false;
			Object.defineProperty(window,'permission_frame_comm',{
			      value:false,
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// permission_notification 
			Object.defineProperty(window,'permission_notification',{
			      value:${policy_array[8]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// permission_eval 
			Object.defineProperty(window,'permission_eval',{
			      value:${policy_array[9]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// hide_document_prototype = false;

			Object.defineProperty(window,'hide_document_prototype',{
			      value:false,
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);	

			// permission_create_element_iframe = false; TODO TRUE 
			Object.defineProperty(window,'permission_create_element_iframe',{
			      value:true,
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);			
			// permission_change_location_href = false;
			Object.defineProperty(window,'permission_change_location_href',{
			      value:false,
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			//(Object.freeze || Object)(Object.prototype);	
				
				
			//missing  domaccess-read e domaccess-write

			var c;
			if(!permission_ui){
				// windo.alert
				var alert =  new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {
				  	if(window["ui_notice"]){
				  		window["ui_notice"] = false;
				    	console.log('UI DISABLED');
				  	}
				  }
				});
				Object.defineProperty(window,'alert',{
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);
				// window.prompt
				var prompt =  new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {
				  	if(window["ui_notice"]){
				  		window["ui_notice"] = false;
				    	console.log('UI DISABLED');
				  	}
				  }
				});
				Object.defineProperty(window,'prompt',{
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);
				// window.confirm
				var confirm =  new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {
				  	if(window["ui_notice"]){
				  		window["ui_notice"] = false;
				    	console.log('UI DISABLED');
				  	}
				  }
				});
				Object.defineProperty(window,'confirm',{
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);	
				// window.open
				var open =  new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {
				  	if(window["ui_notice"]){
				  		window["ui_notice"] = false;
				    	console.log('UI DISABLED');
				  	}
				  }
				});
				Object.defineProperty(window,'open',{
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);				
			}
			// false - false
			if( (permission_read_cookie === false) && (permission_write_cookie == false)){
				Object.defineProperty(document, 'cookie', {
				    get: function() {
				    	if(window["cookie_read_notice"]){
				    		window["cookie_read_notice"]=false;
			        	console.log('READ COOKIE DISABLED for '+location );		        
				    	}
				    },
				    set: function(val) {
				    	if(window["cookie_write_notice"]){
				    		window["cookie_write_notice"]=false;
			        	console.log('WRITE COOKIE DISABLED for '+location + 'with value: '+val );	
				    	}
				    }
				});
				/*Object.defineProperty(Document.prototype, 'cookie', {
				    get: function() {
				    	if(window["cookie_read_notice"]){
				    		window["cookie_read_notice"]=false;
			        	console.log('READ COOKIE DISABLED for '+location );		        
				    	}
				    },
				    set: function(val) {
				    	if(window["cookie_write_notice"]){
				    		window["cookie_write_notice"]=false;
			        	console.log('WRITE COOKIE DISABLED for '+location + 'with value: '+val );	
				    	}
				    }
				});*/
			} // false - true
			else if( (permission_read_cookie === false) && (permission_write_cookie == true)){
				Object.defineProperty(document, 'cookie', {
				    get: function() {
				    	if(window["cookie_read_notice"]){
				    		window["cookie_read_notice"]=false;
			        	console.log('READ COOKIE DISABLED for '+location );		        
				    	}
				    },
				    set: function(val) {
				    	if(window["cookie_write_notice"]){
				    		c = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
				        c.set.call(document,val)
				    	}
				    }
				});		
				/*
				Object.defineProperty(Document.prototype, 'cookie', {
				    get: function() {
				    	if(window["cookie_read_notice"]){
				    		window["cookie_read_notice"]=false;
			        	console.log('READ COOKIE DISABLED for '+location );		        
				    	}
				    },
				    set: function(val) {
				    	if(window["cookie_write_notice"]){
				    		c = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
				        c.set.call(document,val)
				    	}
				    }
				});				*/	
			} // true - false
			else if( (permission_read_cookie === true) && (permission_write_cookie == false)){
				Object.defineProperty(document, 'cookie', {
				    get: function() {
			    		c = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
		        	return c.get.call(document);				    	
				    },
				    set: function(val) {
				    	if(window["cookie_write_notice"]){
				    		window["cookie_write_notice"]=false;
			        	console.log('WRITE COOKIE DISABLED for '+location + 'with value: '+val );	
				    	}
				    }
				});
				/*
				Object.defineProperty(Document.prototype, 'cookie', {
				    get: function() {
			    		c = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
		        	return c.get.call(document);				    	
				    },
				    set: function(val) {
				    	if(window["cookie_write_notice"]){
				    		window["cookie_write_notice"]=false;
			        	console.log('WRITE COOKIE DISABLED for '+location + 'with value: '+val );	
				    	}
				    }
				});				*/			
			}	// true - true
			else{

			}


			if(!permission_document_write){
				document.write =  new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {					  			  	
				  	if(window["document_write_notice"]){
				  		window["document_write_notice"]=false;
				    	console.log('DOCUMENT WRITE DISABLED for '+location );	
				  	}
				    //return undefined;
				  }
				});
				Object.defineProperty(Document.prototype,'write',{
			    configurable:false,
			    writable:false,
			    enumerable:false
			 	});				
				//(Object.freeze || Object)(Object.prototype);
			}
			/*
			Object.getOwnPropertyDescriptor(window,'localStorage');
			Object.getOwnPropertyDescriptor(window,'sessionStorage');
			gives:
			configurable :true
			true if and only if the type of this property descriptor may be 
			changed and if the property may be deleted from the corresponding object.
			writable: false
			true if and only if the value associated with the property may be 
			changed with an assignment operator.
			So I can only delete
			*/
			//Window.localStorage e Window.sessionStorage
			if(!permission_session_storage && !permission_local_storage){
				// local storage
				Object.defineProperty(window,'localStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);

				//session storage
				Object.defineProperty(window,'sessionStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);
			}
			else{
				if(!permission_local_storage){
				Object.defineProperty(window,'localStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);					
				}
				if(!permission_session_storage){
				//session storage
				Object.defineProperty(window,'sessionStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);					
				}
			}
			if(!permission_external_communication){
				/* TODO 
				devo fare in modo che non possa fare connessione all'esterno
				ma che ne possa fare al url nello stesso url tip /getQualcosa 
				mancano altri metodi di XMLHttpRequest
				*/
				/*
				if(true){
				  let old_open = XMLHttpRequest.prototype.open;
				  XMLHttpRequest.prototype.open = new Proxy(function() {}, {
				      apply: function(target, thisArg, argumentsList) {
				          if(window.random_value){
				              let result = old_open.apply(thisArg, argumentsList);
				              return result;
				              console.log(result);
				          }
				          else{
				              console.warn("Blocked external connection");
				          }
				      }
				  });
				}
				Object.defineProperty(XMLHttpRequest.prototype,'open',{
				    configurable:false,
				    writable:false,
				    enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);
				if(true){
				  let old_send = XMLHttpRequest.prototype.send;
				  XMLHttpRequest.prototype.send = new Proxy(function() {}, {
				    apply: function(target, thisArg, argumentsList) {
				      if(window.random_value){
				        console.log(argumentsList);
				        let result= old_send.apply(thisArg, argumentsList);
				        console.log(result);
				        return result;
				      }
				      else{
				        console.warn('Blocked send operation')
				      }
				    }
				  });
				}*/
				/*
				Object.defineProperty(XMLHttpRequest.prototype,'send',{
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);
				// PostMessage
				var postMessage = new Proxy(function(){},{
					apply:function(targe,thisArg,argumentsList){
						console.log('post message to' + argumentsList);
						//return undefined
					},
				  get: function(){
				  	console.log('trying to get postMessage');
				  	//return undefined;
				  }
				});			
				Object.defineProperty(window,'postMessage',{
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);		
			}
			if(!permission_navigator){
				/* writable : false, configurable : true
				Object.defineProperty(window, 'navigator', {
					value: null,
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);	
			    Object.defineProperty(window, 'Navigator', {
			   	value:null,
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);	
				*/
			}
			if(!permission_notification){		
			/* TODO 
			Object.getOwnPropertyDescriptor(Notification.prototype,'timestamp');	
			Per ogni elemento di Notification.prototype devo annullare
			*/
				Object.defineProperty(window, 'notification', {
			    get: function() {		    	
			      	console.log('notification DISABLED');
			      	//return undefined;
			    }});
			    Object.defineProperty(window, 'Notification', {
			    get: function() {		    	
			      	console.log('Notification DISABLED');
			      	//return undefined;
			    }});
			}
			if(!permission_eval){
				window.eval = new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {			  	
			    	if(window["eval_notice"]){
			    		window["eval_notice"]=false;
			      	console.log('EVAL DISABLED for '+location );	
			    	}
				  }
				});
			  Object.defineProperty(window, 'eval', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);				
			}
			// due to twitter modification of console.log must wrap it
			if(true){
				let old_log = console.log;
				let old_error = console.error;
				let old_info = console.info;

				//first is console.log
				/*console.log = new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {	
				  	var count = 0;
				  	for(count = 0; count < argumentsList.length; count++);{
				  		old_log.call(window,argumentsList)[0];
				  	}
				  	//var result = old_log.apply(target,thisArg,argumentsList);
				  	//return result;
				  }
				});*/
			  Object.defineProperty(window.console, 'log', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				// second console.error
				/*
				console.error = new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {	
				  	var result = old_error.call(thisArg,argumentsList);
				  	return result;
				  }
				});*/
			  Object.defineProperty(window.console, 'error', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});	
				// third console.info
				/*
				console.info = new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {	
				  	var result = old_info.call(thisArg,argumentsList);
				  	return result;
				  }
				});*/
			  Object.defineProperty(window.console, 'info', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				// last lock console
				
				Object.defineProperty(window, 'console', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);				
			}
			if(!permission_change_location_href){
				//location writable : true, configurable : false	
				//console.info('location can still be accessed because\\nwritable:true\\nconfigurable:false');
			}

			//document create element iframe
			if(!permission_create_element_iframe){
				let old_create = document.createElement;
				document.createElement = new Proxy(function() {}, {
				  apply: function(target, thisArg, argumentsList) {
				  	var just_created = old_create.call(document,argumentsList[0]);
				  	if(just_created.tagName === 'FRAME' || just_created.tagName ==='IFRAME'){
				  		console.log('createElement '+argumentsList+' DISABLED.');
				  	}
				  	else{
				  		return just_created;
				  	}
				  }
				});
				Object.defineProperty(Document.prototype, 'createElement', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
				//(Object.freeze || Object)(Object.prototype);			
				
			}
			//hiding the prototype of document

			if(hide_document_prototype){
				document.__proto__ = null;
			}

			//console.log('document.__proto__ '+document.__proto__);

			//console.log('window.__proto__ '+window.__proto__);

			if(false){
				// TODO - PERCHÈ HO SCRITTO QUESTA COSA?
			    let old_addEventListener = EventTarget.prototype.addEventListener;
			    let stopConnection = function(){
			    	console.log('Before handler');
			    	var port = chrome.extension.connect();
						port.postMessage({action:"background_block_ext_comm_disabled"});


			      /*chrome.runtime.sendMessage({action:"background_block_ext_comm_disabled"}, function(){
			        console.log('[B] asks for disable external requests');
			      });*/
			    }
			    EventTarget.prototype.addEventListener = new Proxy(function() {}, {
			        apply: function(target, thisArg, argumentsList) { 
				        try{
				            //check for input element
				            if(thisArg.tagName ==="INPUT" && thisArg.type === "password" && argumentsList[0] === "focus"){
				                if(window["random_list"].get(thisArg) === undefined){
				                    //aggiungo il mio evento
				                    old_addEventListener.apply(thisArg,["focus",stopConnection]);
				                    //aggiungo il suo evento
				                    old_addEventListener.apply(thisArg,argumentsList);
				                    //
				                    window["random_list"].set(thisArg,true);
				                }
				            }
				            else{
				            	old_addEventListener.apply(thisArg,argumentsList);
				            }
				        }
				        catch(error){
				        	old_addEventListener.apply(thisArg,argumentsList);
				        }
			        }
			    });
			}
			Object.defineProperty(EventTarget.prototype, 'addEventListener', {
			  configurable:false,
			  writable:false,
			  enumerable:false
			});
`;
			/*
			var test = document.createElement('img');
			console.log(document);
			document.insertBefore(test,document.head);
			console.log(document);
			(document.head||document.documentElement).appendChild(my_script);
			console.log(document);
			my_script.parentNode.removeChild(my_script);
			*/
console.log(`%c[B] %c End : mm:ss:mmm ${getTime()}`,'color:purple','color:black');
}

/* 
	Main part of the contentScript
*/
try{
	retrieved = localStorage.getItem('policies');
	if(retrieved!==null){
		policy_array = JSON.parse(retrieved);
		for(count=0;count<10;count++){
			if(typeof policy_array[count] !== "boolean"){
				createCustom();
				break;
			}
		}		
	}
	else{
		createCustom();
	}
}
catch(error){
	console.error(error);
	createCustom();
}
includeScripts();
getNReload();






console.log(`%c[B] %c End without policies: mm:ss:mmm ${getTime()}`,'color:purple','color:black');

/*
TODO MODIFICHE
- come faccio ora risolvo il problema dello script caricato nell'head della pagina 
che può rompere quello che wrappo

posso fare che il primo colpo 

devo ritornare a come prima che carico lo script nell'header
mando messaggio e aspetto la risposta
quando ho la risposta popolo il tag script