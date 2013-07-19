/*
Plugin implements all the communication between jquery and concrete plugin, 
so all the interface concrete plugin defines - is for Plugin class. If plugin class do not invoke smth - 
no need to expose it.

On the other hand, concrete plugin may invoke methods of the Plugin class, the ones designed for that.
And re-declare methods, also designed for that.

I want auto-complete to show me methods available for invocation and ones I can define. For the ones I can define - 
show me arguments they get.
*/


// Plugin class is both factory and prototype for newly created objects
// (instance of this class is only used as prototype)
;(function($, window, undefined) {

    // you can define your plugin at the top of the file
    DefinePlugin('motion', function(self) {
        // totally protected (incapsulation), here you may use only self to access context
        function _helper() {
            console.log('start->_helper invoked');
            console.log(self);
        }

        // all returned stuff will be merged into plugin instance
        // you can use this or self below - no matter
        return {
            // re-declared deaults
            defaultOptions: {
                color: 'blue'
            },
            // re-declared initialization
            init: function() {
                // accessing htmlElement
                $(self.htmlElement).css('color', self.options.color);
            },
            // public commands
            start: function(when, why) {
                // chance for extenal event handler
                // TODO: global event handlers ?
                self.trigger('start', {'when': when, why: why});
                // call to the context-aware private helper
                _helper();
            },
            stop: function() {
                self.trigger('stop', {'some': 'data'});
                console.log('stopped.')
            }
        };
    });

    ////////////////////////////////////////////////////////////////////////////////
    /// Below is the code of the stateful plugins framework, not the plugin itself /
    ////////////////////////////////////////////////////////////////////////////////
    function Plugin(name) {
        this.name = name;          // common for all instances (of the same plugin)
        this.defaultOptions = {}; // common for all instances

        // creates instances for matched html elements, manages binding
        this.construct = function(htmlElement, options){
            this.htmlElement = htmlElement;
            this.options = $.extend({}, this.defaultOptions, options);
            $(this.htmlElement).data(name, this);
            this.init();
        };

        // @override
        this.init = function(){}

        // manage options. if you need more - override this
        this.getOption = function(option){
            return this.options[option];
        };
        this.setOption = function(option, value){
            this.options[option] = value;
        };

        // manage events binding and triggering
        this.on = function(event, callback){
            this.eventCallbacks[event] = callback;
        };
        this.trigger = function(event, data){
            // TODO: make sure handlers are callable
            if ('undefined' !== typeof this.eventCallbacks[event]) {
                return this.eventCallbacks[event].call(this, data);
            } else if('undefined' !== typeof this.options['on'+event]) {
                return this.options['on'+event].call(this, data);
            }
        };
    }

    // method used to define your plugin
    function DefinePlugin(name, definingFunction) {
        // define plugin constructor
        var ConcretePlugin = function(htmlElement, options) {

            this.options = {};        // sepearate per instance
            this.htmlElement = null;  // accessible from plugin, separate per instance
            this.eventCallbacks = {}; // sepearate per instance

            $.extend(this, definingFunction.call(this, this));
            this.construct(htmlElement, options);
        };
        // extend constructor's prototype
        //ConcretePlugin.prototype = $.extend({}, new Plugin(name), definingFunction());
        ConcretePlugin.prototype = new Plugin(name);

        // bind to jQuery
        $.fn[name] = function(param1) {
            if ('string' === typeof param1) {
                /* command invocation mode */
                var command = param1;
                var commandArguments = arguments;
                Array.prototype.shift.call(commandArguments);
                $(this).each(function(){
                    var $element = $(this);
                    var pluginInstance = $element.data(name);
                    // check element.plugin is defined, element.plugin[command] defined and callable
                    if (pluginInstance && pluginInstance.name === name && $.isFunction(pluginInstance[command])) {
                        pluginInstance[command].apply(pluginInstance, commandArguments);
                    }
                })
            } else {
                /* plugin instance factory */
                var options = param1;
                $(this).each(function(){
                    new ConcretePlugin(this, options);
                })
            }
            return this;
        }
    }
}(jQuery, window));