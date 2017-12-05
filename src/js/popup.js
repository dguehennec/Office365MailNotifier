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
        window.close();
    }, this));
    $('#office365_mail_notifier_tooltipOption').on('click', $.proxy(function(evt) {
        evt.stopPropagation();
        this.optionClick();
    }, this));

    // initialize background objects
    if (!background || !background['office365_notifier_Controller'] || !background['office365_notifier_Prefs'] || !background['office365_notifier_Util']) {
        $('#office365_mail_notifier_tooltipTitle').text(chrome.i18n.getMessage("tooltip_errorInitPage_title"));
        $('#office365_mail_notifier_tooltipMessageGroup').hide();
        $('#office365_mail_notifier_tooltipCalendarGroup').hide();
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
    this.initializeTooltipIdentifier();
    this.initializeTooltipMessage();
    this.initializeTooltipCalendar();
};


/**
 * Initialize tooltip identifier
 *
 * @private
 * @this {office365_notifier_popup}
 */
office365_notifier_popup.initializeTooltipIdentifier = function() {
    var errorMsg = this._office365_notifier_Controller.getLastErrorMessage();

    // clean message
    $("#office365_mail_notifier_tooltipIdentifierTitle").empty();
    $("#office365_mail_notifier_tooltipIdentifierMessage").empty();

    if (this._office365_notifier_Controller.isInitialized() && (errorMsg === "")) {
        $('#office365_mail_notifier_tooltipCheckNow').show();
        // show title informations
        var email = this._office365_notifier_Controller.getMailBoxInfo().email;
        if(email) {
            email = email.split('@')[0];
        }
        $('<div/>', {
            text : chrome.i18n.getMessage("tooltip_connected_descriptionAccount").replace("%EMAIL%", email)
        }).appendTo('#office365_mail_notifier_tooltipIdentifierTitle');
         // show State and account informations
        $('<div/>', {
            text : chrome.i18n.getMessage("tooltip_connected_descriptionStatus")
        }).appendTo("#office365_mail_notifier_tooltipIdentifierMessage");
        var msgDesc = chrome.i18n.getMessage("tooltip_unreadMessages_title");
        msgDesc = msgDesc.replace("%NB%", this._office365_notifier_Controller.getNbMessageUnread());
        $('<div/>', {
            text : msgDesc
        }).appendTo("#office365_mail_notifier_tooltipIdentifierMessage");
    } else {
        $('#office365_mail_notifier_tooltipCheckNow').hide();
        if (errorMsg !== "") {
            $('<div/>', {
                text : chrome.i18n.getMessage("tooltip_notConnected_title")
            }).appendTo("#office365_mail_notifier_tooltipIdentifierTitle");
                $('<div/>', {
                text : errorMsg
            }).appendTo("#office365_mail_notifier_tooltipIdentifierMessage");
        } else {
            $('<div/>', {
                text : chrome.i18n.getMessage("tooltip_notConnected_title")
            }).appendTo("#office365_mail_notifier_tooltipIdentifierTitle");
                $('<div/>', {
                text : chrome.i18n.getMessage("tooltip_notConnected_description")
            }).appendTo("#office365_mail_notifier_tooltipIdentifierMessage");
        }
    }
}

/**
 * Initialize tooltip messages
 *
 * @private
 * @this {offie365_notifier_popup}
 */
office365_notifier_popup.initializeTooltipMessage = function() {
    var index, label, that = this;
    var errorMsg = this._office365_notifier_Controller.getLastErrorMessage();

    // clean message
    $("#office365_mail_notifier_tooltipMessage").empty();

    if (!this._office365_notifier_Controller.isInitialized() || (errorMsg !== "") || !this._office365_notifier_Prefs.isMessageEnabled()) {
        $('#office365_mail_notifier_tooltipMessageGroup').hide();
        return;
    }
    $('#office365_mail_notifier_tooltipMessageGroup').show();

    var unreadMessages = [];
    this._office365_notifier_Controller.getUnreadMessages().forEach(function(message) {
        var content = message.subject;
        if(message.content != "") {
            if(content !== "") {
                content += " - " + message.content;
            } else {
                content = message.content;
            }
        }
        unreadMessages.push({date: message.date, content: content});
    });
    // sort unread messages
    unreadMessages = unreadMessages.sort(function(a, b) {
        return b.date - a.date;
    });
    // display messages
    if (unreadMessages.length === 0) {
        $('<div/>', {
            class : 'eventLabelDesc',
            text : chrome.i18n.getMessage("tooltip_noUnreadMessage")
        }).appendTo("#office365_mail_notifier_tooltipMessage");
    } else {
        var nbDisplayed = this._office365_notifier_Prefs.getMessageNbDisplayed();
        var nbCharactersDisplayed = this._office365_notifier_Prefs.getMessageNbCharactersDisplayed();
        var currentDisplayed = 0;
        for (index = 0; (index < unreadMessages.length) && (currentDisplayed < nbDisplayed); index++) {
            currentDisplayed++;
            $('<div/>', {
                class : 'eventLabelDate',
                text : unreadMessages[index].date.toLocaleString()
            }).appendTo("#office365_mail_notifier_tooltipMessage");
            $('<div/>', {
                id : 'office365_mail_notifier_tooltipMessage' + index,
                class : 'eventLabelDesc tooltipMessageAbstract',
                text : this._office365_notifier_Util.maxStringLength(unreadMessages[index].content, nbCharactersDisplayed)
            }).appendTo("#office365_mail_notifier_tooltipMessage");
            $('#office365_mail_notifier_tooltipMessage' + index).on('click', function() {
                that._office365_notifier_Controller.openWebInterface();
                window.close();
            });
        }
    }
};

/**
 * Initiliaze tooltip calendar
 *
 * @private
 */
office365_notifier_popup.initializeTooltipCalendar = function() {
   var index, label;
    var errorMsg = this._office365_notifier_Controller.getLastErrorMessage();

    // clean calendar
    $("#office365_mail_notifier_tooltipCalendar").empty();

    if (!this._office365_notifier_Controller.isInitialized() || (errorMsg !== "")  || !this._office365_notifier_Prefs.isCalendarEnabled()) {
        $('#office365_mail_notifier_tooltipCalendarGroup').hide();
        return;
    }
    $('#office365_mail_notifier_tooltipCalendarGroup').show();

    var events = this._office365_notifier_Controller.getCalendarEvents();
    // sort events
    events = events.sort(function(a, b) {
        return a.startDate - b.startDate;
    });
    if (events.length === 0) {
        $('<div/>', {
            class : 'eventLabelDesc',
            text : chrome.i18n.getMessage("tooltip_noEvent")
        }).appendTo("#office365_mail_notifier_tooltipCalendar");
    } else {
        var lastDate = "";
        var nbDisplayed = this._office365_notifier_Prefs.getCalendarNbDisplayed();
        var currentDisplayed = 0;
        for (index = 0; (index < events.length) && (currentDisplayed < nbDisplayed); index++) {
            currentDisplayed++;
            var currentEvent = events[index];
            var startDate = currentEvent.startDate;
            var starttime = startDate.toLocaleTimeString();
            starttime = starttime.substring(0, 5) + starttime.substring(8);
            var currentDate = chrome.i18n.getMessage("tooltip_week").replace("%WEEK%", currentEvent.startWeek) + " - " + startDate.toLocaleDateString();
            if (lastDate !== currentDate) {
                lastDate = currentDate;
                $('<div/>', {
                    class : 'eventLabelDate',
                    text : currentDate
                }).appendTo("#office365_mail_notifier_tooltipCalendar");
            }
            var endDate = currentEvent.endDate;
            var endTime = endDate.toLocaleTimeString();
            endTime = endTime.substring(0, 5) + endTime.substring(8);
            var text = "";
            if (currentEvent.duration < 86400000) {
                text = starttime + "-" + endTime + "   " + this._office365_notifier_Util.maxStringLength(currentEvent.name, 40);
            } else {
                text = this._office365_notifier_Util.maxStringLength(currentEvent.name, 50);
            }
            $('<div/>', {
                class : 'eventLabelDesc',
                text : text
            }).appendTo("#office365_mail_notifier_tooltipCalendar");
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
            if (extensionTabs[i].url && optionsUrl == extensionTabs[i].url.split("#")[0]) {
                found = true;
                chrome.tabs.update(extensionTabs[i].id, {
                    "active" : true,
                    "url" : "options.html"+selectedTab
                });
            }
        }
        if (found == false) {
            chrome.tabs.create({
                url : "options.html"+selectedTab
            });
        }
        window.close();
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
    var backgroundPage = chrome.extension.getBackgroundPage();
    office365_notifier_popup.init(backgroundPage);
});

$(window).on("unload", function() {
    office365_notifier_popup.release();
});
