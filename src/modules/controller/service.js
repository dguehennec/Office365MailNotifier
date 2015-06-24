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
    this._nbMessageUnread = 0;
    this._eventsManager = new office365_notifier_eventsManager();
    this._lastErrorMessage = "";
    this._parent = parent;
    this._logger = new office365_notifier_Logger("Service");
    this._logger.info("initialized");
    this._planRefresh(3000);
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
    this._logger.trace("isInitialized");
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
    return this._nbMessageUnread;
};

/**
 * Get calendar events
 * 
 * @this {Service}
 * @return {Array} calendar events list
 */
office365_notifier_Service.prototype.getCalendarEvents = function() {
    this._logger.trace("getCalEvents");
    return this._eventsManager.getEventsByType("CALENDAR");
};

/**
 * Get message events
 * 
 * @this {Service}
 * @return {Array} message events list
 */
office365_notifier_Service.prototype.getMessageEvents = function() {
    this._logger.trace("getMessageEvents");
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
        chrome.tabs.sendMessage(object._parent._currentInterfaceListener, "getOwsDOMContent", null, function(msg, sender, sendResponse) {
            object._refreshState(msg);
        });
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
 * refresh state
 * 
 * @private
 * @this {Service}
 */
office365_notifier_Service.prototype._refreshState = function(msg) {
    this._logger.info("refresh");
    this._planRefresh(10000);
    
    if (!msg) {
        this._lastErrorMessage = office365_notifier_Util.getBundleString("connector.error.unreadmsg").replace("%REASON%", office365_notifier_Util.getBundleString("connector.error.reason0"))
        // refresh listeners
        this._parent.event();
    }

    var callback = function() {
        office365_notifier_Util.openURL(office365_notifier_Constant.URLS.SITE_DEFAULT);
    };

    // Check unread mail
    this._logger.info("Check unread mail");
    this._logger.trace("nbMessageUnread: " + this._nbMessageUnread + ", newNbMessageUnread: " + msg.newMessageUnread);
    if (msg.newMessageUnread > this._nbMessageUnread && this._isInitialized) {
        // Play a sound if there is new unread email
        if (msg.newMessageUnread > 0 && office365_notifier_Prefs.isEmailSoundEnabled()) {
            office365_notifier_Util.playSound();
        }
        // Display a notification with the new unread email
        if (msg.newMessageUnread > 0 && office365_notifier_Prefs.isEmailNotificationEnabled()) {
            var title = '';
            var msgTxt = '';
            // Build title
            title = office365_notifier_Util.getBundleString("connector.notification.nbUnreadMessages");
            title = title.replace("%NB%", msg.newMessageUnread);
            office365_notifier_Util.showNotification(title, "", office365_notifier_Prefs.getEmailNotificationDuration(), callback, null);
        }
    }
    this._nbMessageUnread = msg.newMessageUnread;
    this._lastErrorMessage = "";

    this._isInitialized = true;

    // Invalidate all last events recorded in events manager
    this._eventsManager.invalidateAllEvents();
    
    this._logger.info("Check calendar events");
    var events = msg.calendarEvents;
    for (var index = 0; index < events.length; index++) {
        this._eventsManager.addNewEvent(new office365_notifier_calEvent(events[index].title, events[index].timeDuration, events[index].timeToStart));
    }
    
    this._logger.info("Check message events");
    var messages = msg.messageEvents;
    for (var index = 0; index < messages.length; index++) {
        this._eventsManager.addNewEvent(new office365_notifier_messageEvent(messages[index].sender, messages[index].message));
    }
    
    // clean events not validate in the last loop
    this._eventsManager.cleanEventsInvalidate();
    
    // refresh listeners
    this._parent.event();
};

/**
 * Freeze the interface
 */
Object.freeze(office365_notifier_Service);
