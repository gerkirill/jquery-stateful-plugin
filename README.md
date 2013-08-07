Small embeddable library for creating stateful jQuery plugins
=============================================================

> ###What is a stateful plugin?
> A stateful plugin is an advanced type of jQuery plugin that is self-aware — it maintains its own state, and often provides an external interface for outside code to interact with and alter the plugins state. Stateful plugins, or widgets as they are often called, often trigger events and provide callback hooks into important parts of their functionality.

> Taken from [MSDN Magazine](http://msdn.microsoft.com/en-us/magazine/ff706600.aspx)

**Known alternatives:**
    
https://github.com/gfranko/jq-boilerplate - have no clear separation between biolerplate code and code of your plugin.

http://api.jqueryui.com/jQuery.widget/ - adds external dependency (jQuery UI) to your plugin.

## What does this library do for you?

 + makes plugin functionality definition clean and separated from jQuery-related code and biolerplate code
 + provides a solution for context-dependent value of `this` keyword (e.g. in callback functions)
 + provides you with separate context for each HTML element you plugin was applied to
 + automatically registers you plugin with jQuery
 + makes calls to plugin chainable
 + provides solid interface for invoking plugin methods, changing settings and subscribing to plugin events

API for plugin development
---------------------------

### Properties

#### you may access:

 + `self.options` - object containing plugin options.
 + `self.htmlElement` - an HTML element current plugin instance is bint to.

#### you may define:

 + `defaultOptions` - These values will be used as a defaults for all plugin instances.

### Methods

#### you may invoke:

 + `self.trigger(eventName, eventData)` - triggers a named event external code may subscribe to.

#### you may define:

 +  `init()` - this method will be called when the plugin instance is created for some HTML element matched by the jQuery selector. At this point self.htmlElement is already set, as most likely you'll want to use it.

 + `<anything>()` - any method returned by the defining function can be invoked during plugin usage like this: 
        
        jQuery('<selector>').<plugin>('<method>'[,param1, param2, ...]);
        // e.g.
        jQuery('#container').slider('pause', 10, 'seconds');



API available for plugin users
------------------------------

 + `jQuery('<selector>').<plugin>([<options>])` - creates plugin instance for each element matched by the selector and calls init() method.

 + `jQuery('<selector>').<plugin>('<command>'[,<argument1>, <argument2>])` - invokes some plugin API method.

 + `jQuery('<selector>').<plugin>('on', '<event>', function(data){...})` - registers handler for some plugin event.

Library usage
--------------
Library is designed to be copy-pasted into your plugin file. Here is how your plugin file content should look like:

    ;(function($, window, undefined) {

        // you can define your plugin at the top of the file
        DefinePlugin(...)

        ////////////////////////////////////////////////////////////////////////////////
        /// Below is the code of the stateful plugins framework, not the plugin itself /
        ////////////////////////////////////////////////////////////////////////////////
        function Plugin(name) {
            ...
        function DefinePlugin(name, definingFunction) {
            ...
    }(jQuery, window));

For now you can grab library code from [concept.js](https://raw.github.com/gerkirill/jquery-stateful-plugin/master/concept.js) file.

Use case
--------

For the case when state managament is required for jQuery plugin - let's take e.g. simple slider as an example.

For each slider at the page you may want to:

 + know which image is currently shown
 + set slider options, e.g. speed
 + invoke commands on slider, which make it e.g. stop or resume
 + bind event listeners to some slider events

Actually some of this goals are achievable in some ad hoc way as well. E.g. you may store currently shown
image number into some data- attribute of slider container, etc. But I will show you better way.
Look briefly at the code below. I gives you all the points mentioned above.

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

That's all. You can now use it like that:

    $('.slider')
        .slider({interval: 500})
        .slider('on', 'slide', function(data) {
            console.log('on slide handler');
            console.log(data);
        });
    $('.slider').data('slider').stop(); //or $('.slider').slider('stop');
    $('.slider').slider('resume');