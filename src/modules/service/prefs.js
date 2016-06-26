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
    // Message
    MESSAGE_ENABLED                 : "messageEnabled",
    MESSAGE_NB_DISPLAYED            : "messageNbDisplayed",
    MESSAGE_NB_CHARACTERS_DISPLAYED : "messageNbCharactersDisplayed",
    // calendar
    CALENDAR_ENABLED                : "calendarEnabled",
    CALENDAR_PERIOD_DISPLAYED       : "calendarPeriodDisplayed",
    CALENDAR_NB_DISPLAYED           : "calendarNbDisplayed",
    CALENDAR_NOTIFICATION_ENABLED   : "calendarSystemNotificationEnabled",
    CALENDAR_SOUND_ENABLED          : "calendarSoundEnabled",
    CALENDAR_REMINDER_TIME_CONF     : "calendarReminderTimeConf",
    CALENDAR_REMINDER_NB_REPEAT     : "calendarReminderRepeatNb",
    // message
    INSTANT_MESSAGE_ENABLED         : "instantMessageEnabled",
    INSTANT_MESSAGE_NOTIFICATION_ENABLED    : "instantMessageSystemNotificationEnabled",
    INSTANT_MESSAGE_SOUND_ENABLED           : "instantMessageSoundEnabled"
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
    // message
    this.pref_message_enabled                 = this._getPref(this.PREF.MESSAGE_ENABLED);
    this.pref_message_nb_displayed            = this._getPref(this.PREF.MESSAGE_NB_DISPLAYED);
    this.pref_message_nb_characters_displayed = this._getPref(this.PREF.MESSAGE_NB_CHARACTERS_DISPLAYED);
    // calendar
    this.pref_calendar_enabled               = this._getPref(this.PREF.CALENDAR_ENABLED);
    this.pref_calendar_period_displayed      = this._getPref(this.PREF.CALENDAR_PERIOD_DISPLAYED);
    this.pref_calendar_nb_displayed          = this._getPref(this.PREF.CALENDAR_NB_DISPLAYED);
    this.pref_calendar_notification_enabled  = this._getPref(this.PREF.CALENDAR_NOTIFICATION_ENABLED);
    this.pref_calendar_sound_enabled         = this._getPref(this.PREF.CALENDAR_SOUND_ENABLED);
    this.pref_calendar_reminder_time_conf    = this._getPref(this.PREF.CALENDAR_REMINDER_TIME_CONF);
    this.pref_calendar_reminder_nb_repeat    = this._getPref(this.PREF.CALENDAR_REMINDER_NB_REPEAT);
    // instant message
    this.pref_instant_message_notification_enabled   = this._getPref(this.PREF.INSTANT_MESSAGE_ENABLED);
    this.pref_instant_message_sound_enabled          = this._getPref(this.PREF.INSTANT_MESSAGE_SOUND_ENABLED);
    this.pref_instant_message_notification_duration  = this._getPref(this.PREF.INSTANT_MESSAGE_NOTIFICATION_DURATION);
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

         // message
        case this.PREF.MESSAGE_ENABLED:
            value = this.pref_message_enabled;
            break;

        case this.PREF.MESSAGE_NB_DISPLAYED:
            value = this.pref_message_nb_displayed;
            break;

        case this.PREF.MESSAGE_NB_CHARACTERS_DISPLAYED:
            value = this.pref_message_nb_characters_displayed;
            break;

        // calendar
        case this.PREF.CALENDAR_ENABLED:
            value = this.pref_calendar_enabled;
            break;

        case this.PREF.CALENDAR_PERIOD_DISPLAYED:
            value = this.pref_calendar_period_displayed;
            break;

        case this.PREF.CALENDAR_NB_DISPLAYED:
            value = this.pref_calendar_nb_displayed;
            break;

        case this.PREF.CALENDAR_NOTIFICATION_ENABLED:
            value = this.pref_calendar_notification_enabled;
            break;

        case this.PREF.CALENDAR_SOUND_ENABLED:
            value = this.pref_calendar_sound_enabled;
            break;

        case this.PREF.CALENDAR_REMINDER_TIME_CONF:
            value = this.pref_calendar_reminder_time_conf;
            break;

        case this.PREF.CALENDAR_REMINDER_NB_REPEAT:
            value = this.pref_calendar_reminder_nb_repeat;
            break;

        // instant message
        case this.PREF.INSTANT_MESSAGE_NOTIFICATION_ENABLED:
            value = this.pref_instant_message_notification_enabled;
            break;

        case this.PREF.INSTANT_MESSAGE_SOUND_ENABLED:
            value = this.pref_instant_message_sound_enabled;
            break;

        case this.PREF.INSTANT_MESSAGE_NOTIFICATION_DURATION:
            value = this.pref_instant_message_notification_duration;
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

        // message
        case this.PREF.MESSAGE_ENABLED:
            this.pref_message_enabled = value;
            break;

        case this.PREF.MESSAGE_NB_DISPLAYED:
            this.pref_message_nb_displayed = value;
            break;

        case this.PREF.MESSAGE_NB_CHARACTERS_DISPLAYED:
            this.pref_message_nb_characters_displayed = value;
            break;

        // calendar
        case this.PREF.CALENDAR_ENABLED:
            this.pref_calendar_enabled = value;
            break;

        case this.PREF.CALENDAR_PERIOD_DISPLAYED:
            this.pref_calendar_period_displayed = value;
            break;

        case this.PREF.CALENDAR_NB_DISPLAYED:
            this.pref_calendar_nb_displayed = value;
            break;

        case this.PREF.CALENDAR_NOTIFICATION_ENABLED:
            this.pref_calendar_notification_enabled = value;
            break;

        case this.PREF.CALENDAR_SOUND_ENABLED:
            this.pref_calendar_sound_enabled = value;
            break;

        case this.PREF.CALENDAR_REMINDER_TIME_CONF:
            this.pref_calendar_reminder_time_conf = value;
            break;

        case this.PREF.CALENDAR_REMINDER_NB_REPEAT:
            this.pref_calendar_reminder_nb_repeat = value;
            break;

        // instant message
        case this.PREF.INSTANT_MESSAGE_NOTIFICATION_ENABLED:
            this.pref_instant_message_notification_enabled = value;
            break;

        case this.PREF.INSTANT_MESSAGE_SOUND_ENABLED:
            this.pref_instant_message_sound_enabled = value;
            break;

        case this.PREF.INSTANT_MESSAGE_NOTIFICATION_DURATION:
            this.pref_instant_message_notification_duration = value;
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
 * get Message number displayed
 *
 * @this {Prefs}
 * @return {Number}
 */
office365_notifier_Prefs.getMessageNbDisplayed = function() {
    return this.pref_message_nb_displayed;
};

/**
 * get Message number characters displayed
 *
 * @this {Prefs}
 * @return {Number}
 */
office365_notifier_Prefs.getMessageNbCharactersDisplayed = function() {
    return this.pref_message_nb_characters_displayed;
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
 * get Calendar Period Displayed
 *
 * @this {Prefs}
 * @return {Number}
 */
office365_notifier_Prefs.getCalendarPeriodDisplayed = function() {
    return this.pref_calendar_period_displayed;
};

/**
 * get Calendar Number Displayed
 *
 * @this {Prefs}
 * @return {Number}
 */
office365_notifier_Prefs.getCalendarNbDisplayed = function() {
    return this.pref_calendar_nb_displayed;
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
 * get Calendar Reminder Time Configuration
 *
 * @this {Prefs}
 * @return {Number}
 */
office365_notifier_Prefs.getCalendarReminderTimeConf = function() {
    return this.pref_calendar_reminder_time_conf;
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

/* *************************** instant message *************************** */

/**
 * indicate if instant message is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isInstantMessageEnabled = function() {
    return this.pref_instant_message_enabled;
};

/**
 * indicate if instant message System Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isInstantMessageNotificationEnabled = function() {
    return this.pref_instant_message_notification_enabled;
};

/**
 * indicate if Message Sound Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isInstantMessageSoundEnabled = function() {
    return this.pref_instant_message_sound_enabled;
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
            'emailNotificationDuration' : 14,
            'messageEnabled' : true,
            'messageNbDisplayed' : 5,
            'messageNbCharactersDisplayed' : 80,
            'calendarEnabled' : true,
            'calendarPeriodDisplayed' : 14,
            'calendarNbDisplayed' : 5,
            'calendarSystemNotificationEnabled' : true,
            'calendarSoundEnabled' : true,
            'calendarReminderTimeConf' : -1,
            'calendarReminderRepeatNb' : 3,
            'instantMessageEnabled' : true,
            'instantMessageSystemNotificationEnabled' : true,
            'instantMessageSoundEnabled' : true
        }
    },
    _currentPref : undefined,
    _saveTimerDelay : undefined
};

/**
 * initialize the PrefsService.
 *
 * @this {PrefsService}
 * @param {Function} the callback when initialized
 */
PrefsService.init = function(callback) {
    var loadFunction = function(storage) {
        PrefsService._currentPref = storage;
        if (callback) {
            callback();
        }
    };
    if(chrome.storage.sync) {
        chrome.storage.sync.get(this._defaultsPref, loadFunction);
    } else {
        chrome.storage.local.get(this._defaultsPref, loadFunction);
    }
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
    if(this._currentPref && this._currentPref.prefs[key] !== undefined) {
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
    this.synchronize();
};

/**
 * remove the key.
 *
 * @this {PrefsService}
 * @param {String} the key
 */
PrefsService.removePref = function(key) {
    if(this._currentPref.prefs[key] !== undefined) {
        delete this._currentPref.prefs[key];
        this.synchronize();
    }
};

/**
 * synchronize preferences
 *
 * @private
 * @this {PrefsService}
 * @param {String} the key
 */
PrefsService.synchronize = function(forced) {
    //synchronise preference after 1 seconds no change delay if not forced
    clearTimeout(this._saveTimerDelay);
    var that = this;
    var saveFunction = function() {
        if(chrome.storage.sync) {
            chrome.storage.sync.set(that._currentPref);
        } else {
            chrome.storage.local.set(that._currentPref);
        }
    };
    if(forced) {
        saveFunction();
    } else {
        this._saveTimerDelay = setTimeout(function() {
            saveFunction();
        }, 1000);
    }
};