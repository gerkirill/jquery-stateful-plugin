
;(function($, window, undefined) {
    DefinePlugin('slider', function(self) {
        
        var $images;
        var visibleImageIndex = 0;
        var paused = false;

        function showNext() {
            $($images[visibleImageIndex]).hide();
            if (++visibleImageIndex = $images.length) visibleImageIndex = 0;
            $($images[visibleImageIndex]).show();
            self.trigger('slide', {image_index: visibleImageIndex});
        }

        return {
            defaultOptions: {
                interval: 200
            },
            init: function() {
                $images = $(self.htmlElement).find('img');
                $images.hide();
                window.setInterval(function(){                    
                    !paused && showNext();
                }, self.options.interval);
            },
            // public commands
            resume: function() {
                paused = false;
            },
            stop: function() {
                paused = true;
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