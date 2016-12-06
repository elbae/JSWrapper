'use strict';
var d = new Date();
var time = "[mm:ss:mmmm] "+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
var debug=true;
if(!debug){
	console.log = function(text){
		return;
	}
	console.info = function(text){
		return;
	}
	console.error = function(text){
		return;
	}
	console.war = function(text){
		return;
	}
}
console.info(`[Before.js] Start : mm:ss:mmm ${time}`);
/*
Setting PostMessage listeners
*/
try{
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		/* 
		Receive requests from the popup, save the data in the localStorage 
		and sends them to the background js
		*/
		if(request.action === 'before_reload'){
				console.info(`[Before.js] Request : ${request.action}`);
	    	window.location.reload();
		}
	});
}
catch(error){
	console.error(`[Before.js] error : reload listener`);
	console.error(error);
}
/* 
If the policies are not defined it asks for them to the background
*/

try{	

	console.info(`[Before.js] asking for policies`);
	chrome.runtime.sendMessage({action:"background_load"}, 
		function(response) {
			var policy_array;
			var myhead;
			var my_script;
			console.info(`[Before.js] receiving : ${response.policies}`);
			policy_array = JSON.parse(response.policies);

			myhead = document.createElement('head');
			(document.head || document.documentElement).appendChild(myhead);
			my_script = document.createElement('script');
			my_script.innerHTML = `
'use strict';
window["random_value"]=true; 
window["random_list"] = new Map();
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
// magari posso bloccare solo le chiamate fuori dall'host attuale
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
	
	
	//mancano  domaccess-read e domaccess-write

	var c;
	if(!permission_ui){
		// windo.alert
		var alert =  new Proxy(function() {}, {
		  apply: function(target, thisArg, argumentsList) {
		    console.log('ui alert DISABLED');
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
		    console.log('ui prompt DISABLED');
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
		    console.log('ui confirm DISABLED');
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
		    console.log('ui open DISABLED');
		  }
		});
		Object.defineProperty(window,'open',{
      configurable:false,
      writable:false,
      enumerable:false
     });				
		//(Object.freeze || Object)(Object.prototype);				
	}
	if(!permission_read_cookie && !permission_write_cookie){
		Object.defineProperty(document, 'cookie', {
		    get: function() {
	        	console.log('operation read cookie DISABLED');		        
		    },
		    set: function(val) {
		    	console.log('operation set cookie DISABLED');
		    }
		});
	}
	else if(!permission_read_cookie || !permission_write_cookie){
		if(!permission_read_cookie){
			c = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
			Object.defineProperty(document, 'cookie', {
	    		get: function() {
        		console.log('operation read cookie DISABLED');
	    		},		    
			    set: function(val) {
		        	c.set.call(document,val)		        //
			    }
			});
		}
		if(!permission_write_cookie){
			c = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
			Object.defineProperty(document, 'cookie', {
			    get: function() {
		        	return c.get.call(document);
			    },		    
			    set: function(val) {
		        	console.log('operation set cookie DISABLED \\n'+val);
		        }
		});
		}
	}
	else{
		c = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
			Object.defineProperty(document, 'cookie', {
		    get: function() {
		    	console.info('Cookie have been read;')
	        	return c.get.call(document);
		    },		    
		    set: function(val) {
		    	console.info('Cookie have been set to %s;',val)
		    	c.set.call(document,val)
        }
		});
	}
	
	if(!permission_document_write){
		document.write =  new Proxy(function() {}, {
		  apply: function(target, thisArg, argumentsList) {					  			  	
		    console.log('write on document DISABLED');
		    console.log('trying to write:'+argumentsList);
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
	    console.log('eval DISABLED');
	  }
	});
  Object.defineProperty(window, 'eval', {
	  configurable:false,
	  writable:false,
	  enumerable:false
	});
	//(Object.freeze || Object)(Object.prototype);				
}

if(!permission_change_location_href){
	//location writable : true, configurable : false	
	console.info('location can still be accessed because\\nwritable:true\\nconfigurable:false');
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
    let old_addEventListener = EventTarget.prototype.addEventListener;
    let stopConnection = function(){
    	console.log('Before handler');
    	var port = chrome.extension.connect();
			port.postMessage({action:"background_block_ext_comm_disabled"});


      /*chrome.runtime.sendMessage({action:"background_block_ext_comm_disabled"}, function(){
        console.log('[Before.js] asks for disable external requests');
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
});			`;
			(document.head||document.documentElement).appendChild(my_script);
			my_script.parentNode.removeChild(my_script);
		}
	); 	
}
catch(error){
	console.error(`[Before.js] error : injection`);
	console.error(error);
}

var d = new Date();
var time = "[mm:ss:mmmm] "+ d.getMinutes() +":"+d.getSeconds()+":"+d.getMilliseconds();
console.info(`[Before.js] End : mm:ss:mmm ${time}`);