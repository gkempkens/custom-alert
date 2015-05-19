# custom-alert
jQuery plugin for style the alert() (it overrides the custom alert with a visual popup)

 Problem

When you are developing a lot of Microsoft .NET application, you'll probably run into the thing that validation alert boxes can't be style nicer because it relies heavily on the build-in browser alert().

Solution

This javascript can be included to override the default browser alert() functionality. The script provides the regular alert() to become available under _alert(). With this new alert, you are also capable of defining a few extra options.

    Custom styling (without this the javascript will also provide some default styling)
    Custom header text
    Custom button(s) (more than just OK, so this can be used as confirmation as well.
    Configurable options for positioning e.g.

Usage

To use the alertbox just:

    include jquery because the script depends on this.
    include the (alert-box.js).
    set your global customization/configuration
    call the alert.

To call the alert: 

alert('alert this message!');

alert('alert this message!', { header: { title: 'alert title'} });

alert('alert this message!', { header: { title: 'alert title'}, footer: { buttons: [ { text:'close' } ] } });

alert('alert this message!', { main: { class:'abox__box' }, header: { title: 'alert title'}, footer: { buttons: [ { text:'close', action:'_this.close()' } ] } });

alert('alert this message!', { usecontainer: false, insidefirst:false, main: { cssclass:'abox__box-alt' }, header: { title: 'alert title'}, footer: { buttons: [ { text:'ok', action:'_this.close()', cssclass:'abox__btn', element:'button' }, { text:'cancel', action:'console.log("cancel")', element:'div' } ] } });
