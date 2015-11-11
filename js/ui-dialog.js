/*!
 *  
 * https://www.recmh.com
 *
 * Copyright 2015-2020 fafer
 * Released under the MIT license
 */

!$(function() {
    'use strict';
    if(!$.ui) {
        $.ui = {};
    }

    $('body').on('click','.ui-dialog [data-ui-close]',function() {
        var selector =  $(this).closest('.ui-dialog');
        $.ui.dialog.hide(selector);
    }).on('click','[trigger-dialog]',function() {
        var selector = $(this).attr('trigger-dialog');
        $.ui.dialog.show(selector);
    }).on('click',function(e) {
        var container = $(e.target).closest('.ui-dialog-container');
        if(!container.length) {
            var parent = $(e.target).parent('.ui-dialog');
            var modal = parent.attr('modal');
            if(modal !== 'true') {
                $.ui.dialog.hide(parent);
            }
        }
    });

    $.ui.dialog = {
        __adjustPosition:function(dialog) {
            var container = $('.ui-dialog-container',dialog);
            dialog.css({
                width:$('body').outerWidth() +'px',
                height:$('body').outerHeight() +'px'
            });
            container.css({
                'position':'absolute',
                'top':($('html').outerHeight())/2 + $(window).scrollTop() + 'px',
                'left':($('html').outerWidth())/2 + $(window).scrollLeft() + 'px',
                'margin-top':-container.outerHeight()/2 + 'px',
                'margin-left':-container.outerWidth()/2 + 'px'
            });
        },
        show:function(selector) {
            var dom = $(selector);
            if(!dom.hasClass('ui-dialog')) return this;
            var animation = dom.attr('animation');
            dom.fadeIn(animation);
            this.__adjustPosition(dom);
            $('body').css('overflow','hidden');
            return this;
        },
        hide:function(selector) {
            var dom = $(selector);
            if(!dom.hasClass('ui-dialog')) return this;
            var animation = dom.attr('animation');
            dom.fadeOut(animation);
            $('body').css('overflow','');
            return this;
        }
    };

    $(window).on('resize',function() {
        $.ui.dialog.__adjustPosition($('.ui-dialog:not(:hidden)'));
    });

    $.ui.dialog.show($('.ui-dialog[show]'));
});
 
 
