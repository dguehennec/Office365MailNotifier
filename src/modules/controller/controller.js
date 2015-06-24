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

var EXPORTED_SYMBOLS = [ "office365_notifier_Controller" ];

/**
 * Creates an instance of Controller.
 * 
 * @constructor
 * @this {Controller}
 */
var office365_notifier_Controller = {
    /** @private */
    /** The listeners list. */
    _callbackList : [],
    /** @private */
    /** The logger. */
    _logger : new office365_notifier_Logger("Controller"),
    /** @private */
    /** The current interface listener. */
    _currentInterfaceListener : undefined,
    /** @private */
    /** The service */
    _service : undefined
};

/**
 * initialize controller
 *
 * @this {Controller}
 */
office365_notifier_Controller.init = function() {
    office365_notifier_Prefs.init();
}

/**
 * add CallBack Refresh
 * 
 * @this {Controller}
 * @param {Object}
 *            callback the callback listener
 */
office365_notifier_Controller.addCallBackRefresh = function(callback) {
    this._logger.info("addCallBackRefresh");
    this._callbackList.push(callback);
};

/**
 * remove CallBack Refresh
 * 
 * @this {Controller}
 * @param {Object}
 *            callback the callback listener
 */
office365_notifier_Controller.removeCallBackRefresh = function(callback) {
    this._logger.info("removeCallBackRefresh");
    for (var index = 0; index < this._callbackList.length; index++) {
        if (this._callbackList[index] === callback) {
            this._callbackList.splice(index, 1);
            break;
        }
    }
};

/**
 * send event to callback listeners
 * 
 * @this {Controller}
 * @param {Object}
 *            event the event
 */
office365_notifier_Controller.event = function(event) {
    for (var index = 0; index < this._callbackList.length; index++) {
        var callback = this._callbackList[index];
        if (callback && callback.refresh) {
            callback.refresh(event);
        }
    }
};

/**
 * notify the controller that the office365Interface is loaded
 * 
 * @this {Controller}
 * @param {Object}
 *            listener the listener
 * @param {DOMDocument}
 *            doc the document of the current page
 */
office365_notifier_Controller.office365InterfaceLoaded = function(listener, doc) {
    this._logger.info("office365InterfaceLoaded");
    if (this._service) {
        return;
    }
    this._currentInterfaceListener = listener;
    this._service = new office365_notifier_Service(this);
    this.event(true);
};

/**
 * notify the controller that the office365Interface is unloaded
 * 
 * @this {Controller}
 * @param {Object}
 *            listener the listener
 */
office365_notifier_Controller.office365InterfaceUnloaded = function(listener) {
    this._logger.info("office365InterfaceUnloaded");
    if (this._currentInterfaceListener != listener) {
        return;
    }
    this._currentInterfaceListener = undefined;
    this._service.shutdown();
    this._service = undefined;
    this.event();
};

/**
 * Get the service singleton
 * 
 * @this {Controller}
 * @return {Service} the service
 */
office365_notifier_Controller.getService = function() {
    return this._service;
};

/**
 * is initialized
 * 
 * @this {Controller}
 * @return {boolean} true if interface initialized
 */
office365_notifier_Controller.isInitialized = function() {
    if (this._service && this._service.isInitialized()) {
        return true;
    }
    return false;
};

/**
 * Check now
 * 
 * @this {Controller}
 */
office365_notifier_Controller.checkNow = function() {
    if (!this.isInitialized()) {
        return;
    }
    this._service.checkNow();
    this.event(true);
};

/**
 * Open Web Interface
 * 
 * @this {Controller}
 */
office365_notifier_Controller.openWebInterface = function() {
    this._logger.info("openWebInterface");
    if (!this.isInitialized()) {
        office365_notifier_Util.openURL(office365_notifier_Constant.URLS.SITE_AUTHENT);
    } else {
        office365_notifier_Util.openURL(office365_notifier_Constant.URLS.SITE_DEFAULT);
    }
};

/**
 * Get number of unread messages
 * 
 * @this {Controller}
 * @return {Number} number of unread messages
 */
office365_notifier_Controller.getNbMessageUnread = function() {
    if (!this.isInitialized()) {
        return 0;
    }
    return this._service.getNbMessageUnread();
};

/**
 * Get calendar events
 * 
 * @this {Controller}
 * @return {Array} calendar events list
 */
office365_notifier_Controller.getCalendarEvents = function() {
    if (!this.isInitialized()) {
        return [];
    }
    return this._service.getCalendarEvents();
};

/**
 * Get message events
 * 
 * @this {Controller}
 * @return {Array} message events list
 */
office365_notifier_Controller.getMessageEvents = function() {
    if (!this.isInitialized()) {
        return [];
    }
    return this._service.getMessageEvents();
};

/**
 * Get last error message
 * 
 * @this {Controller}
 * @return {String} the last service error message
 */
office365_notifier_Controller.getLastErrorMessage = function() {
    if (!this._service) {
        return "";
    }
    return this._service.getLastErrorMessage();
}

office365_notifier_Controller.init();