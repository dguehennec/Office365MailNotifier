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
 * The Original Code is office365 Mail Notifier.
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
 * Creates an instance of popup.
 * 
 * @constructor
 * @this {Popup}
 */
var office365_notifier_popup = {};

/**
 * init
 * 
 * @this {Popup}
 */
office365_notifier_popup.init = function(background) {
    if(!background) {
        return;
    }

    // add event listener on button
    $('#office365_mail_notifier_tooltipCheckNow').on('click', $.proxy(function(evt) {
        evt.stopPropagation();
        this.checkNowClick();
    }, this));
    $('#office365_mail_notifier_tooltipHome').on('click', $.proxy(function(evt) {
        evt.stopPropagation();
        this._office365_notifier_Controller.openWebInterface();
    }, this));
    $('#office365_mail_notifier_tooltipOption').on('click', $.proxy(function(evt) {
        evt.stopPropagation();
        this.optionClick();
    }, this));

    // initialize background objects
    if (!background || !background['office365_notifier_Controller'] || !background['office365_notifier_Prefs'] || !background['office365_notifier_Util']) {
        $('#office365_mail_notifier_tooltipTitle').text(chrome.i18n.getMessage("tooltip_errorInitPage_title"));
        $('#office365_mail_notifier_tooltipCalendarGroup').hide();
        $('#office365_mail_notifier_tooltipMessageGroup').hide();
        return;
    }
    this._office365_notifier_Controller = background['office365_notifier_Controller'];
    this._office365_notifier_Prefs = background['office365_notifier_Prefs'];
    this._office365_notifier_Util = background['office365_notifier_Util'];

    // Register
    this._office365_notifier_Controller.addCallBackRefresh(this);

    this.refresh();
};

/**
 * Call when the window is closed
 * 
 * @this {Popup}
 */
office365_notifier_popup.release = function() {
    this._office365_notifier_Controller.removeCallBackRefresh(this);
};

/**
 * Initiliaze tooltip
 * 
 * @this {Popup}
 */
office365_notifier_popup.refresh = function() {
    var errorMsg = this._office365_notifier_Controller.getLastErrorMessage();
    if (this._office365_notifier_Controller.isInitialized()) {
        $('#office365_mail_notifier_tooltipCheckNow').show();

        if (errorMsg !== "") {
            $('#office365_mail_notifier_tooltipTitle').text(chrome.i18n.getMessage("tooltip_errorConnected_title"));
            $('#office365_mail_notifier_tooltipDescription').text(errorMsg);
        } else {
            // show title informations
            var msgTitle = chrome.i18n.getMessage("tooltip_unreadMessages_title");
            msgTitle = msgTitle.replace("%NB%", this._office365_notifier_Controller.getNbMessageUnread());
            $('#office365_mail_notifier_tooltipTitle').text(msgTitle);

            // show State and account informations
            $("#office365_mail_notifier_tooltipDescription").empty();
            $('<div/>', {
                text : chrome.i18n.getMessage("tooltip_connected_descriptionStatus")
            }).appendTo("#office365_mail_notifier_tooltipDescription");
            var msgDesc = chrome.i18n.getMessage("tooltip_connected_descriptionAccount");
            $('<div/>', {
                text : msgDesc
            }).appendTo("#office365_mail_notifier_tooltipDescription");
        }

        // show calendar
        if (this._office365_notifier_Prefs.isCalendarEnabled()) {
            $('#office365_mail_notifier_tooltipCalendarGroup').show();
            this.initializeTooltipCalendar();
        } else {
            $('#office365_mail_notifier_tooltipCalendarGroup').hide();
        }

        // show tasks
        if (this._office365_notifier_Prefs.isMessageEnabled()) {
            $('#office365_mail_notifier_tooltipMessageGroup').show();
            this.initializeTooltipMessage();
        } else {
            $('#office365_mail_notifier_tooltipMessageGroup').hide();
        }
    } else {
        $('#office365_mail_notifier_tooltipCheckNow').hide();

        if (errorMsg !== "") {
            $('#office365_mail_notifier_tooltipTitle').text(chrome.i18n.getMessage("tooltip_notConnected_title"));
            $('#office365_mail_notifier_tooltipDescription').text(errorMsg);
        } else {
            $('#office365_mail_notifier_tooltipTitle').text(chrome.i18n.getMessage("tooltip_notConnected_title"));
            $('#office365_mail_notifier_tooltipDescription').text(chrome.i18n.getMessage("tooltip_notConnected_description"));
        }
        $('#office365_mail_notifier_tooltipCalendarGroup').hide();
        $('#office365_mail_notifier_tooltipMessageGroup').hide();
    }
};

/**
 * Initiliaze tooltip calendar
 * 
 * @private
 */
office365_notifier_popup.initializeTooltipCalendar = function() {
    var index, label;

    // clean calendar
    $("#office365_mail_notifier_tooltipCalendar").empty();

    var events = this._office365_notifier_Controller.getCalendarEvents();
    if (events.length === 0) {
        $('<div/>', {
            class : 'eventLabelTitle',
            text : chrome.i18n.getMessage("tooltip_noEvent")
        }).appendTo("#office365_mail_notifier_tooltipCalendar");
    } else {
        for (index = 0; index < events.length; index++) {
            var currentEvent = events[index];
            $('<div/>', {
                class : 'eventLabelTitle',
                text : this._office365_notifier_Util.maxStringLength(currentEvent.name, 50)
            }).appendTo("#office365_mail_notifier_tooltipCalendar");
            $('<div/>', {
                class : 'eventLabelTitle',
                text : this._office365_notifier_Util.maxStringLength(currentEvent.duration, 50)
            }).appendTo("#office365_mail_notifier_tooltipCalendar");
        }
    }
};

/**
 * Initiliaze tooltip message
 * 
 * @private
 */
office365_notifier_popup.initializeTooltipMessage = function() {
    var index, label;

    // clean message
    $("#office365_mail_notifier_tooltipMessage").empty();

    var events = this._office365_notifier_Controller.getMessageEvents();
    if (events.length === 0) {
        $('<div/>', {
            class : 'eventLabelTitle',
            text : chrome.i18n.getMessage("tooltip_noEvent")
        }).appendTo("#office365_mail_notifier_tooltipMessage");
    } else {
        for (index = 0; index < events.length; index++) {
            var currentEvent = events[index];
            $('<div/>', {
                class : 'eventLabelTitle',
                text : this._office365_notifier_Util.maxStringLength(currentEvent.name, 50)
            }).appendTo("#office365_mail_notifier_tooltipMessage");
            $('<div/>', {
                class : 'eventLabelDesc',
                text : this._office365_notifier_Util.maxStringLength(currentEvent.duration, 50)
            }).appendTo("#office365_mail_notifier_tooltipMessage");
        }
    }
};

/**
 * call on check now event
 */

office365_notifier_popup.openOptionPage = function(tab) {
    var selectedTab = "";
    if(tab) {
        selectedTab = "#"+tab;
    }
    var optionsUrl = chrome.extension.getURL("options.html");
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for ( var i = 0; i < extensionTabs.length; i++) {
            if (optionsUrl == extensionTabs[i].url.split("#")[0]) {
                found = true;
                chrome.tabs.update(extensionTabs[i].id, {
                    "selected" : true,
                    "url" : "options.html"+selectedTab
                });
            }
        }
        if (found == false) {
            chrome.tabs.create({
                url : "options.html"+selectedTab
            });
        }
    });
};

/**
 * call on check now event
 */
office365_notifier_popup.checkNowClick = function() {
    this._office365_notifier_Controller.checkNow();
};

/**
 * call on option event
 */
office365_notifier_popup.optionClick = function() {
    this.openOptionPage();
}

/**
 * add event listener to notify when content is loaded or unloaded
 */
document.addEventListener("DOMContentLoaded", function() {
    if(chrome && chrome.runtime && chrome.runtime.getBackgroundPage) {
        chrome.runtime.getBackgroundPage(function(bg) {
            office365_notifier_popup.init(bg);
        });
    }
});

$(window).on("unload", function() {
    office365_notifier_popup.release();
});
