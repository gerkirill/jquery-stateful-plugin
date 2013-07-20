Small embeddable library for creating stateful jQuery plugins
====================================================

Sometimes jQuery plugins just do not need to store any state information.
For example - let's look at the jQuery plugin which makes a few html elements have equal height:

    jQuery.fn.equalHeight = function() {
        var maxHeight = 0;
        jQuery(this).each(function(){
            maxHeight = Math.max(jQuery(this).height(), maxHeight);
        });
        jQuery(this).height(maxHeight);
    }

Being called e.g. like shown below, this little thingie just does its job.

    jQuery('.teaserbox li').equalHeight();

This plugin does not need any state management. For the case when state menegament is required - let's 
take e.g. simple slider as an example.

For each slider at the page you may want to:

    - know which image is currently shown
    - set slider options, e.g. speed
    - invoke commands on slider, which make it e.g. stop or resume
    - bind event listeners to some slider events

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


Library usage
=============

Here is how your plugin file content should look like:

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

For now you can grab library code from concept.js file.