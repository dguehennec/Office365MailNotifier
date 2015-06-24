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

var EXPORTED_SYMBOLS = ["office365_notifier_Prefs"];

/**
 * Creates an instance of Prefs.
 *
 * @constructor
 * @this {Prefs}
 */
var office365_notifier_Prefs = {
    _prefs: null,
    _is_first_launch: false,
    _previous_version: 0
};

/**
 * pref identifiers
 *
 * @constant
 */
office365_notifier_Prefs.PREF = {
    // general
    CURRENT_VERSION                 : "currentVersion",
    // email
    EMAIL_NOTIFICATION_ENABLED      : "systemNotificationEnabled",
    EMAIL_SOUND_ENABLED             : "soundEnabled",
    EMAIL_NOTIFICATION_DURATION     : "emailNotificationDuration",
    // calendar
    CALENDAR_ENABLED                : "calendarEnabled",
    CALENDAR_NOTIFICATION_ENABLED   : "calendarSystemNotificationEnabled",
    CALENDAR_SOUND_ENABLED          : "calendarSoundEnabled",
    CALENDAR_REMINDER_NB_REPEAT     : "calendarReminderRepeatNb",
    // message
    MESSAGE_ENABLED                 : "messageEnabled",
    MESSAGE_NOTIFICATION_ENABLED    : "messageSystemNotificationEnabled",
    MESSAGE_SOUND_ENABLED           : "messageSoundEnabled"
};
office365_notifier_Util.deepFreeze(office365_notifier_Prefs.PREF);

/**
 * Load preferences
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.load = function() {
    
    // Get the previous version
    var previous_version = this._getPref(this.PREF.CURRENT_VERSION);

    // Check if this is the first time the extension is started
    if (previous_version===0) {
        this._is_first_launch = true;
    }
    
    // Set the current version
    this.pref_current_version = office365_notifier_Constant.VERSION;
    this._prefs.setPref(this.PREF.CURRENT_VERSION, this.pref_current_version);
    
    // email
    this.pref_email_notification_enabled   = this._getPref(this.PREF.EMAIL_NOTIFICATION_ENABLED);
    this.pref_email_sound_enabled          = this._getPref(this.PREF.EMAIL_SOUND_ENABLED);
    this.pref_email_notification_duration  = this._getPref(this.PREF.EMAIL_NOTIFICATION_DURATION);
    // calendar
    this.pref_calendar_enabled               = this._getPref(this.PREF.CALENDAR_ENABLED);
    this.pref_calendar_notification_enabled  = this._getPref(this.PREF.CALENDAR_NOTIFICATION_ENABLED);
    this.pref_calendar_sound_enabled         = this._getPref(this.PREF.CALENDAR_SOUND_ENABLED);
    this.pref_calendar_reminder_nb_repeat    = this._getPref(this.PREF.CALENDAR_REMINDER_NB_REPEAT);
    // message
    this.pref_message_enabled               = this._getPref(this.PREF.MESSAGE_ENABLED);
    this.pref_message_notification_enabled  = this._getPref(this.PREF.MESSAGE_NOTIFICATION_ENABLED);
    this.pref_message_sound_enabled         = this._getPref(this.PREF.MESSAGE_SOUND_ENABLED);
};

/**
 * Init preference object, listen for preference change
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.init = function(callback) {
    if (!this._prefs) {
        this._prefs = PrefsService;
	this._prefs.init( function() {
		office365_notifier_Prefs.load();
		if(callback) {
		    callback();
		}
	});
    }
    else {
        this.load();
        if(callback) {
            callback();
        }
    }
};

/**
 * Remove observer, called from shutdown
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.release = function() {
    if (this._prefs) {
        this._prefs = null;
    }
};

/**
 * get preference
 *
 * @this {Prefs}
 * @param {String} key of the preference
 * @return {Object} value of the preference key
 */
office365_notifier_Prefs.getPref = function(key) {
    var value = undefined;
    switch (key) {
        // email
        case this.PREF.EMAIL_NOTIFICATION_ENABLED:
            value = this.pref_email_notification_enabled;
            break;

        case this.PREF.EMAIL_SOUND_ENABLED:
            value = this.pref_email_sound_enabled;
            break;

        case this.PREF.EMAIL_NOTIFICATION_DURATION:
            value = this.pref_email_notification_duration;
            break;

        // calendar
        case this.PREF.CALENDAR_ENABLED:
            value = this.pref_calendar_enabled;
            break;

        case this.PREF.CALENDAR_NOTIFICATION_ENABLED:
            value = this.pref_calendar_notification_enabled;
            break;

        case this.PREF.CALENDAR_SOUND_ENABLED:
            value = this.pref_calendar_sound_enabled;
            break;

        case this.PREF.CALENDAR_REMINDER_NB_REPEAT:
            value = this.pref_calendar_reminder_nb_repeat;
            break;

        // message
        case this.PREF.MESSAGE_ENABLED:
            value = this.pref_message_enabled;
            break;

        case this.PREF.MESSAGE_NOTIFICATION_ENABLED:
            value = this.pref_message_notification_enabled;
            break;

        case this.PREF.MESSAGE_SOUND_ENABLED:
            value = this.pref_message_sound_enabled;
            break;

        default:
            break;
    }
    return value;
}

/**
 * Update preference
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.updatePref = function(key, value) {

    if (this._prefs) {
        this._prefs.setPref(key, value);
    }

    switch (key) {
        // email
        case this.PREF.EMAIL_NOTIFICATION_ENABLED:
            this.pref_email_notification_enabled = value;
            break;

        case this.PREF.EMAIL_SOUND_ENABLED:
            this.pref_email_sound_enabled = value;
            break;

        case this.PREF.EMAIL_NOTIFICATION_DURATION:
            this.pref_email_notification_duration = value;
            break;

        // calendar
        case this.PREF.CALENDAR_ENABLED:
            this.pref_calendar_enabled = value;
            break;

        case this.PREF.CALENDAR_NOTIFICATION_ENABLED:
            this.pref_calendar_notification_enabled = value;
            break;

        case this.PREF.CALENDAR_SOUND_ENABLED:
            this.pref_calendar_sound_enabled = value;
            break;

        case this.PREF.CALENDAR_REMINDER_NB_REPEAT:
            this.pref_calendar_reminder_nb_repeat = value;
            break;
            
        // message
        case this.PREF.MESSAGE_ENABLED:
            this.pref_message_enabled = value;
            break;

        case this.PREF.MESSAGE_NOTIFICATION_ENABLED:
            this.pref_message_notification_enabled = value;
            break;

        case this.PREF.MESSAGE_SOUND_ENABLED:
            this.pref_message_sound_enabled = value;
            break;
          
        default:
            break;
    }
};

/* *************************** Public *************************** */

/**
 * Check if this is the first start of the extension
 *
 * @this {Prefs}
 * @param {Boolean} True if the flag should be reseted
 */
office365_notifier_Prefs.isFirstStart = function(reset) {
    var ret = this._is_first_launch;
    if (reset) {
        this._is_first_launch = false;
    }
    return ret;
};

/* *************************** email *************************** */

/**
 * indicate the current version
 *
 * @this {Prefs}
 * @return {Number} the current version
 */
office365_notifier_Prefs.getCurrentVersion = function() {
    return this.pref_current_version;
};

/**
 * indicate if email notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isEmailNotificationEnabled = function() {
    return this.pref_email_notification_enabled;
};

/**
 * indicate if sound is enabled for email notification
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isEmailSoundEnabled = function() {
    return this.pref_email_sound_enabled;
};

/**
 * indicate the duration of the email notification
 *
 * @this {Prefs}
 * @return {Number} The duration of the notification in ms
 */
office365_notifier_Prefs.getEmailNotificationDuration = function() {
    return (this.pref_email_notification_duration * 1000);
};

/* *************************** calendar *************************** */

/**
 * indicate if Calendar is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isCalendarEnabled = function() {
    return this.pref_calendar_enabled;
};

/**
 * indicate if Calendar System Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isCalendarNotificationEnabled = function() {
    return this.pref_calendar_notification_enabled;
};

/**
 * indicate if Calendar Sound Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isCalendarSoundEnabled = function() {
    return this.pref_calendar_sound_enabled;
};

/**
 * get Calendar Reminder number repeat
 *
 * @this {Prefs}
 * @return {Number}
 */
office365_notifier_Prefs.getCalendarReminderNbRepeat = function() {
    return this.pref_calendar_reminder_nb_repeat;
};

/* *************************** message *************************** */

/**
 * indicate if Message is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isMessageEnabled = function() {
    return this.pref_message_enabled;
};

/**
 * indicate if Message System Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isMessageNotificationEnabled = function() {
    return this.pref_message_notification_enabled;
};

/**
 * indicate if Message Sound Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isMessageSoundEnabled = function() {
    return this.pref_message_sound_enabled;
};

/* *************************** Private *************************** */

/**
 * get preference
 *
 * @private
 *
 * @this {Prefs}
 *
 * @param {String}
 *            pref the preference name
 * @return {Object} the preference value
 */
office365_notifier_Prefs._getPref = function(pref) {
    if (this._prefs) {
        return this._prefs.getPref(pref);
    }
    return null;
};

/**
 * get a complex preference
 *
 * @private
 * @this {Prefs}
 *
 * @param {String}
 *            pref the preference name
 * @return {Object} the preference value
 */
office365_notifier_Prefs._getComplexPref = function(pref) {
    var value = null;
    try {
        var strVal = this._prefs.getPref(pref);
        if (strVal && strVal.length > 0) {
            value = JSON.parse(strVal);
        }
    }
    catch (e) {
    }
    return value;
};

/**
 * Creates an instance of PrefsService.
 *
 * @constructor
 * @this {PrefsService}
 */
var PrefsService = {
    _defaultsPref : {
        prefs : {
            'currentVersion' : 0,
            'systemNotificationEnabled' : true,
            'soundEnabled' : true,
            'emailNotificationDuration' : 16,
            'calendarEnabled' : true,
            'calendarSystemNotificationEnabled' : true,
            'calendarSoundEnabled' : true,
            'calendarReminderRepeatNb' : 0,
            'messageEnabled' : true,
            'messageSystemNotificationEnabled' : true,
            'messageSoundEnabled' : true
        }
    },
    _currentPref : undefined
};

/**
 * initialize the PrefsService.
 *
 * @this {PrefsService}
 * @param {Function} the callback when initialized
 */
PrefsService.init = function(callback) {
    chrome.storage.sync.get(this._defaultsPref, function(storage) {
        PrefsService._currentPref = storage;
        if (callback) {
            callback();
        }
    });
};

/**
 * get the value of the key.
 *
 * @this {PrefsService}
 * @param {String} the key
 * @return {Object} the value
 */
PrefsService.getPref = function(key) {
    var value = null;
    if(this._currentPref) {
        value = this._currentPref.prefs[key];
    }
    return value;
};

/**
 * set the value of the key.
 *
 * @this {PrefsService}
 * @param {String} the key
 * @param {Object} the value
 */
PrefsService.setPref = function(key, value) {
    this._currentPref.prefs[key] = value;
    //synchronise preference
    chrome.storage.sync.set(this._currentPref);
};


