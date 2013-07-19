Small framework for creating stateful jQuery plugins
====================================================

Sometimes jQuery plugins just do not need to store any state information.
For example - let's look at the jQuer plugin which makes a few html elements have equal height:

    jQuery.fn.equalHeight = function() {
        var maxHeight = 0;
        jQuery(this).each(function(){
            maxHeight = Math.max(jQuery(this).height(), maxHeight);
        });
        jQuery(this).height(maxHeight);
    }

Being called e.g. like shown below, this little syngie just does its job.

    jQuery('.teaserbox li').equalHeight();

This plugin does not need any state management.