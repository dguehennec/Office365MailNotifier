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

var EXPORTED_SYMBOLS = [ "office365_notifier_Service" ];

/**
 * Creates an instance of Service.
 *
 * @constructor
 * @this {Service}
 * @param {Controller}
 *            The parent controller
 */
var office365_notifier_Service = function(parent) {
    this._stateTimer = null;
    this._isInitialized = false;
    this._firstCallbackNewMsg = true;
    this._unreadMessagesManager = new office365_notifier_MessagesManager();
    this._eventsManager = new office365_notifier_eventsManager();
    this._currentMailBoxInfo = new office365_notifier_MailBoxInfo();
    this._lastErrorMessage = "";
    this._parent = parent;
    this._logger = new office365_notifier_Logger("Service");
    this._logger.info("initialized");
    this._planRefresh(3000);
    this._requestRefreshDateWithoutResponse = undefined;
    this._maxDelayResponse = 30*1000;
};

/**
 * Release Service.
 *
 * @this {Service}
 */
office365_notifier_Service.prototype.shutdown = function() {
    this._logger.info("Shutdown...");
    this._eventsManager.shutdown();
    this._stopRefreshTimer();
};

/**
 * is initialized
 *
 * @this {Service}
 * @return {boolean} true if service initialized
 */
office365_notifier_Service.prototype.isInitialized = function() {
    return this._isInitialized;
};

/**
 * Check now
 *
 * @this {Service}
 */
office365_notifier_Service.prototype.checkNow = function() {
    this._logger.info("checkNow");
    this._planRefresh(1000);

};

/**
 * preferences updated
 *
 * @this {Service}
 */
office365_notifier_Service.prototype.prefUpdated = function() {
    this._logger.trace("prefUpdated");
};

/**
 * Get number of unread messages
 *
 * @this {Service}
 * @return {Number} number of unread messages
 */
office365_notifier_Service.prototype.getNbMessageUnread = function() {
    this._logger.trace("getNbMessageUnread");
    return this._unreadMessagesManager.nbMessages();
};

/**
 * Get unread message
 *
 * @this {Service}
 * @return {Array} unread messages list
 */
office365_notifier_Service.prototype.getUnreadMessages = function() {
    this._logger.trace("getUnreadMessages");
    return this._unreadMessagesManager.getMessages();
};

/**
 * Get calendar events
 *
 * @this {Service}
 * @return {Array} calendar events list
 */
office365_notifier_Service.prototype.getCalendarEvents = function() {
    this._logger.trace("getCalendarEvents");
    return this._eventsManager.getEventsByType("CALENDAR");
};

/**
 * Get MailBox Info
 *
 * @this {Service}
 * @return {MailBoxInfo} mailBoxInfo
 */
office365_notifier_Service.prototype.getMailBoxInfo = function() {
    this._logger.trace("getMailBoxInfo");
    return this._currentMailBoxInfo;
};

/**
 * Get instant message events
 *
 * @this {Service}
 * @return {Array} instant message events list
 */
office365_notifier_Service.prototype.getInstantMessagesEvents = function() {
    this._logger.trace("getInstantMessagesEvents");
    return this._eventsManager.getEventsByType("MESSAGE");
};

/**
 * Get last error message
 *
 * @this {Service}
 * @return {String} the last error message
 */
office365_notifier_Service.prototype.getLastErrorMessage = function() {
    this._logger.trace("getLastErrorMessage");
    return this._lastErrorMessage;
};

/**
 * After the delay run the refresh state
 *
 * @private
 * @this {Service}
 * @param {Number}
 *            delayMs the delay before calling _refreshState function
 */
office365_notifier_Service.prototype._planRefresh = function(delayMs) {
    this._logger.trace("planRefresh: " + delayMs);
    var object = this;
    this._stateTimer = office365_notifier_Util.setTimer(this._stateTimer, function() {
        if(object._requestRefreshDateWithoutResponse && ((new Date()).getTime() > (object._requestRefreshDateWithoutResponse.getTime() + object._maxDelayResponse))) {
            object._lastErrorMessage = office365_notifier_Util.getBundleString("connector.error.mailboxinfo").replace("%REASON%", office365_notifier_Util.getBundleString("connector.error.req_timeout"));
            // refresh listeners
            object._parent.event();
        }
        object._requestRefreshDateWithoutResponse = new Date();
        chrome.tabs.sendMessage(object._parent._currentInterfaceListener, "owsGetUnreadMessages");
        chrome.tabs.sendMessage(object._parent._currentInterfaceListener, "owsGetReminder");
        chrome.tabs.sendMessage(object._parent._currentInterfaceListener, "owsGetMailBoxInfo");
        object._planRefresh(30 * 1000);
    }, delayMs);
};

/**
 * Cancel the running timer to the refresh state
 *
 * @private
 * @this {Service}
 */
office365_notifier_Service.prototype._stopRefreshTimer = function() {
    this._logger.trace("stopRefreshTimer");
    if (this._stateTimer) {
        clearTimeout(this._stateTimer);
    } else {
        this._stateTimer = null;
    }
};

/**
 * Generate and notify new message
 *
 * @this {Service}
 * @param {msg}
 *            msg of the inject script
 */
office365_notifier_Service.prototype.injectCallback = function(msg) {
    if(!msg) {
        return;
    }
    this._logger.trace("injectCallback message:" + msg.type);
    switch(msg.type) {
        case "owsUnreadMessagesResult":
            this.callbackNewMessages(msg.data);
            break;
        case "owsReminderResult":
            this.callbackReminder(msg.data);
            break;
        case "owsMailBoxInfoResult":
            this.callbackMailBoxInfo(msg.data);
            break;
        default:
    }
}

/**
 * Generate and notify new message
 *
 * @this {Service}
 * @param {Message[]}
 *            listMsg messages unread
 */
office365_notifier_Service.prototype.callbackNewMessages = function(unreadMessages) {
    var mapConvId = {};
    var listNewSubject = [];
    var nbNewMsg = 0;
    var lastSender = null;
    var nbNewMsg = 0;

    this._requestRefreshDateWithoutResponse = undefined;

    this._isInitialized = true;
    if (!unreadMessages) {
        this._lastErrorMessage = office365_notifier_Util.getBundleString("connector.error.mailboxinfo").replace("%REASON%", office365_notifier_Util.getBundleString("connector.error.req_server"))
        // refresh listeners
        this._parent.event();
        return;
    }

    this._isInitialized = true;
    this._lastErrorMessage = '';
    // Check unread mail
    this._logger.info("Check unread mail");
    this._logger.trace("nbMessageUnread: " + this._unreadMessagesManager.nbMessages() + ", newNbMessageUnread: " + unreadMessages.length);
    for (var idxMsg = 0; idxMsg < unreadMessages.length; idxMsg++) {
        var unreadMsg = unreadMessages[idxMsg];
        var nb = this._unreadMessagesManager.addMessage(new office365_notifier_Message(
                        unreadMsg.id, unreadMsg.date, unreadMsg.subject, unreadMsg.content, unreadMsg.senderMail, unreadMsg.convId));
        if (nb > 0) {
            nbNewMsg += nb;
            lastSender = unreadMsg.senderMail;
            if (unreadMsg.subject && unreadMsg.convId && !mapConvId[unreadMsg.convId]) {
                listNewSubject.push(unreadMsg.subject);
                mapConvId[unreadMsg.convId] = true;
            }
        }
    }
    this._unreadMessagesManager.endAddingMessages();

    try {
        var notify = true;

        // Check if we need to notify the user of new messages
        // Notify the user for the first refresh if the delay between the connect is 'long'
        if (this._firstCallbackNewMsg) {
            this._firstCallbackNewMsg = false;
            notify = false;
        }

        // Play a sound if there is new unread email
        if (notify && nbNewMsg > 0 && office365_notifier_Prefs.isEmailSoundEnabled()) {
            office365_notifier_Util.playSound();
        }
        // Display a notification with the new unread email
        if (notify && nbNewMsg > 0 && office365_notifier_Prefs.isEmailNotificationEnabled()) {
            var title = '';
            var msgTxt = '';

            // Build title
            if (nbNewMsg > 1 || !lastSender) {
                title = office365_notifier_Util.getBundleString("connector.notification.nbUnreadMessages");
                title = title.replace("%NB%", nbNewMsg);
            }
            else {
                title = office365_notifier_Util.getBundleString("connector.notification.NewMessage");
                title = title.replace("%EMAIL%", lastSender);
            }

            // Build message
            for (var idx = 0; idx < listNewSubject.length &&
                              idx < office365_notifier_Constant.SERVICE.NOTIFY_MAX_NB_MSG; ++idx) {

                msgTxt += "\n" + office365_notifier_Util.maxStringLength(
                    listNewSubject[idx], office365_notifier_Constant.SERVICE.NOTIFY_MAX_LEN_TITLE) + "\n";
            }
            if (listNewSubject.length > office365_notifier_Constant.SERVICE.NOTIFY_MAX_NB_MSG) {
                msgTxt += "\n...\n";
            }

            // Notify
            office365_notifier_Util.showNotification(title, msgTxt,
                office365_notifier_Prefs.getEmailNotificationDuration(), this._parent.openWebInterface, this._parent);
        }
    }
    catch (e) {
        this._logger.error("Failed to notify new messages: " + e);
    }
    // refresh listeners
    this._parent.event();
}

/**
 * Generate and notify new event
 *
 * @this {Service}
 * @param {events[]}
 *            events
 */
office365_notifier_Service.prototype.callbackReminder = function(events) {
    if(!events) {
        return;
    }

    // Invalidate all last events recorded in events manager
    this._eventsManager.invalidateAllEvents();
    this._logger.info("Check calendar events: " + events.length);
    for (var index = 0; index < events.length; index++) {
        var newEvent = new office365_notifier_CalEvent(events[index].id, events[index].name, events[index].timestamp, events[index].duration, events[index].timeConf);
        if(this._eventsManager.addNewEvent(newEvent)) {
            newEvent.notifier = new office365_notifier_Notifier(newEvent, office365_notifier_Prefs.getCalendarReminderTimeConf(),
                                             office365_notifier_Prefs.getCalendarReminderNbRepeat(),
                                             office365_notifier_Prefs.isCalendarSoundEnabled(),
                                             office365_notifier_Prefs.isCalendarNotificationEnabled());
        } else {
            var oldEvent = this._eventsManager.getEvent(newEvent);
            // Keep the old notifier object
            newEvent.notifier = oldEvent.notifier;
            oldEvent.notifier = null;
            newEvent.isInvalid = false;
            this._eventsManager.updateEvent(oldEvent, newEvent);
            // refresh notifier
            newEvent.notifier.update(newEvent, office365_notifier_Prefs.getCalendarReminderTimeConf(),
                                             office365_notifier_Prefs.getCalendarReminderNbRepeat(),
                                             office365_notifier_Prefs.isCalendarSoundEnabled(),
                                             office365_notifier_Prefs.isCalendarNotificationEnabled());
        }
    }
    // clean events not validate in the last loop
    this._eventsManager.cleanEventsInvalidate();
    // refresh listeners
    this._parent.event();
};

/**
 * callback new MailBox Info
 *
 * @this {Service}
 * @param {MailBoxInfo}
 *            mailBoxInfo
 */
office365_notifier_Service.prototype.callbackMailBoxInfo = function(mailBoxInfo) {
    if (!mailBoxInfo) {
        return;
    }
    this._logger.info("Check mailbox info: " + mailBoxInfo.email);
    this._currentMailBoxInfo = new office365_notifier_MailBoxInfo(mailBoxInfo);
    // refresh listeners
    this._parent.event();
};

/**
 * Freeze the interface
 */
Object.freeze(office365_notifier_Service);
