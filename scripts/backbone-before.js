			'use strict';
			//window["random_value"]=true; 
			//window["random_list"] = new Map();

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
			// permission_read_cookie
			Object.defineProperty(window,'permission_read_cookie',{
			      value:${policy_array[1]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			// permission_write_cookie
			Object.defineProperty(window,'permission_write_cookie',{
			      value:${policy_array[2]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			// permission_document_write 
			Object.defineProperty(window,'permission_document_write',{
			      value:${policy_array[3]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			// permission_local_storage 
			Object.defineProperty(window,'permission_local_storage',{
			      value:${policy_array[4]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			// permission_session_storage
			Object.defineProperty(window,'permission_session_storage',{
			      value:${policy_array[5]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			// permission_external_communication 
			Object.defineProperty(window,'permission_external_communication',{
			      value:${policy_array[6]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			// permission_navigator 
			Object.defineProperty(window,'permission_navigator',{
			      value:${policy_array[7]},
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
			// permission_frame_comm = true; //framecomm
			Object.defineProperty(window,'permission_frame_comm',{
			      value:false,
			      configurable:false,
			      writable:false,
			      enumerable:false
			});
			// hide_document_prototype = false;
			Object.defineProperty(window,'permission_frame_comm',{
			      value:false,
			      configurable:false,
			      writable:false,
			      enumerable:false
			    });
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
						
			//missing  domaccess-read e domaccess-write
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
			}
			// false - false
			if( (permission_read_cookie === false) && (permission_write_cookie == false)){
				Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
				Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});				
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
			} // false - true
			else if( (permission_read_cookie === false) && (permission_write_cookie == true)){
				let old_cookie = Object.getOwnPropertyDescriptor(Document.prototype,'cookie');
				Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
				Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});				
				Object.defineProperty(document, 'cookie', {
				    get: function() {
				    	if(window["cookie_read_notice"]){
				    		window["cookie_read_notice"]=false;
			        	console.log('READ COOKIE DISABLED for '+location );		        
				    	}
				    },
				    set: function(val) {
				    	old_cookie.set.call(document,val);
				    }
				});	
			} // true - false
			else if( (permission_read_cookie === true) && (permission_write_cookie == false)){
				let old_cookie = Object.getOwnPropertyDescriptor(Document.prototype,'cookie');
				Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
				Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});				
				Object.defineProperty(document, 'cookie', {
				    get: function() {
				    	return old_cookie.get.call(document);
				    },
				    set: function(val) {
				    	if(window["cookie_write_notice"]){
				    		window["cookie_write_notice"]=false;
			        	console.log('WRITE COOKIE DISABLED for '+location + 'with value: '+val );	
				    	}
				    }
				});		
			}	// true - true
			else{
				// clone the descriptor in old_cookie
				let old_cookie = Object.getOwnPropertyDescriptor(Document.prototype,'cookie');

				// hiding getter and setter for the visible descriptor, disable modification
				Object.defineProperty(Document.prototype, 'cookie',{get : function(){},set : function(value){}});
				Object.defineProperty(Document.prototype, 'cookie',{ configurable:false, writable:false});

				// Editing getter and setter 
				Object.defineProperty(document, 'cookie',{
			    get: function() {
			    	console.log('Getting cookie...');
			      return old_cookie.get.call(document);
			    },
			    set: function(value) {
			    	console.log('Setting cookie...'+value);
				   	return old_cookie.set.call(document,value);
			    }
				});
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
			if( (permission_session_storage === false) && (permission_local_storage === false)){
				// local storage
				Object.defineProperty(window,'localStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//session storage
				Object.defineProperty(window,'sessionStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
			}
			else if( (permission_local_storage === false) && (permission_session_storage === true)){
				Object.defineProperty(window,'localStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
				//(Object.freeze || Object)(Object.prototype);					
			}
			else if((permission_local_storage === true) && (permission_session_storage === false)){
				//session storage
				Object.defineProperty(window,'sessionStorage',{
					value: null,
			    configurable:false,
			    writable:false,
			    enumerable:false
			   });				
			}
			else{}
			
			if(!permission_navigator){
				/* writable : false, configurable : true*/
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
			if(!permission_notification){	
			Object.defineProperty(window, 'Notification', {
					value: null,
				  configurable:false,
				  writable:false,
				  enumerable:false
				});	
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
			}
			// due to twitter modification of console.log must wrap it
			if(true){
				let old_log = console.log;
				let old_error = console.error;
				let old_info = console.info;

			  Object.defineProperty(window.console, 'log', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
			  Object.defineProperty(window.console, 'error', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});	
			  Object.defineProperty(window.console, 'info', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});				
				Object.defineProperty(window, 'console', {
				  configurable:false,
				  writable:false,
				  enumerable:false
				});
			}