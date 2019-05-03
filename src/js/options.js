/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is 365 Mail Notifier.
 *
 * The Initial Developer of the Original Code is
 * David GUEHENNEC.
 * Portions created by the Initial Developer are Copyright (C) 2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * Creates an instance of options.
 *
 * @constructor
 * @this {Options}
 */
var office365_notifier_options = {};

/**
 * init
 *
 * @public
 * @this {Options}
 * @param {background} the background extension context
 */
office365_notifier_options.init = function(background) {
    if (!background || !background['office365_notifier_Controller'] || !background['office365_notifier_Prefs']) {
        $('.content').text(chrome.i18n.getMessage("tooltip_errorInitPage_title"));
        return;
    }
    this._office365_notifier_Controller = background['office365_notifier_Controller'];
    this._office365_notifier_Prefs = background['office365_notifier_Prefs'];

    // select tab
    if(location.href.split("#").length>1) {
        this.showContent(location.href.split("#")[1], 0);
    }
    else {
        this.showContent(0, 0);
    }

    // Register
    this._office365_notifier_Controller.addCallBackRefresh(this);

    // Add button event
    $(".menu a").click(function(evt) {
        evt.preventDefault();
        var contentId = $(this).attr("contentid");
        office365_notifier_options.showContent(contentId, 200);
    });

    // refresh screen
    this.refresh();
}

/**
 * Call when the window is closed
 *
 * @public
 * @this {Option}
 */
office365_notifier_options.release = function() {
    if(!this._office365_notifier_Controller) {
        return;
    }

    this._office365_notifier_Controller.removeCallBackRefresh(this);
};

/**
 * show selected content
 *
 * @public
 * @this {Options}
 * @param {Number} content Id
 * @param {Number} animation Time
 */
office365_notifier_options.showContent = function(contentId, animationTime) {
    if(!$.isNumeric(contentId) || (Math.floor(contentId) != contentId) || (contentId<0) || (contentId>1) ) {
        contentId = 0;
    }
    $.when($(".tabContent").fadeOut("fast")).done(function() {
        $(".tabContent").eq(contentId).animate({
            opacity : 'show',
            height : 'show'
        }, animationTime);
    });

    $('.menu > li > a').each(function(index) {
        $(this).removeClass('active');
        if (index == contentId) {
            $(this).addClass('active');
        }
    });
}

/**
 * Refresh.
 *
 * @public
 * @this {Option}
 * @param {Event} the refresh event
 * @param {Boolean} is forced (optional)
 */
office365_notifier_options.refresh = function(event) {
    //initialize values
    $("*").each(function() {
        var attr = $(this).attr("pref");
        if (attr) {
            // Initialize value
            var value = office365_notifier_options._office365_notifier_Prefs.getPref(attr);
            if ($(this).attr("type") === "checkbox") {
                $(this).attr("checked", value && 1);
            } else {
                $(this).val(value);
            }

            $(this).on('change', function() {
                if ($(this).attr("type") === "checkbox") {
                    office365_notifier_options._office365_notifier_Prefs.updatePref($(this).attr("pref"), $(this).is(":checked"));
                } else {
                    office365_notifier_options._office365_notifier_Prefs.updatePref($(this).attr("pref"), $(this).val());
                }
            });
        }
    });
};

/**
 * add event listener to notify when content is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    office365_notifier_options.init(backgroundPage);
});

/**
 * add event listener to notify when content is unloaded
 */
$(window).on('unload', function() {
    office365_notifier_options.release();
});
