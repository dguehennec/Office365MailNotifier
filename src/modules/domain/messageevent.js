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

var EXPORTED_SYMBOLS = [ "office365_notifier_messageEvent" ];

/**
 * Creates an instance of messageEvent.
 * 
 * @constructor
 * @this {messageEvent}
 * 
 * @param {String}
 *            name the messageEvent name
 * @param {String}
 *            duration the duration
 * @param {Number}
 *            timeToStart the time to start
 */
var office365_notifier_messageEvent = function(sender, message) {
    this.type = "MESSAGE";
    this.key = office365_notifier_Util.crc32(sender + message);
    this.name = sender;
    this.message = message;
    this.isInvalid = true;
    this._delayMs = 60 * 1000;
    this._nbTimeShow = 0;
    this._notifier = null;
    this.notify();
};

/**
 * stop notification
 * 
 * @this {messageEvent}
 */
office365_notifier_messageEvent.prototype.stopNotification = function() {
    if (this._notifier) {
        clearTimeout(this._notifier);
    } else {
        this._notifier = null;
    }
};

/**
 * notify
 * 
 * @this {messageEvent}
 */
office365_notifier_messageEvent.prototype.notify = function() {
    if ((office365_notifier_Prefs.getCalendarReminderNbRepeat() < this._nbTimeShow) || !office365_notifier_Prefs.isMessageEnabled()) {
        return;
    }

    this._nbTimeShow++;
    if (office365_notifier_Prefs.isMessageSoundEnabled()) {
        office365_notifier_Util.playSound();
    }
    if (office365_notifier_Prefs.isMessageNotificationEnabled()) {
        var messageEventTitle = office365_notifier_Util.maxStringLength(office365_notifier_Util.getBundleString("connector.notification.messageEvent") + this.name, 32);
        office365_notifier_Util.showNotification(messageEventTitle, this.message, office365_notifier_Prefs.getEmailNotificationDuration(), function() {
            office365_notifier_Util.openURL(office365_notifier_Constant.URLS.SITE_DEFAULT);
        }, null);
    }

    var object = this;
    this._notifier = office365_notifier_Util.setTimer(this._notifier, function() {
        object.notify();
    }, this._delayMs);
};

/**
 * Freeze the interface
 */
Object.freeze(office365_notifier_messageEvent);
