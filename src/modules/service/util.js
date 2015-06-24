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

var EXPORTED_SYMBOLS = [ "office365_notifier_Util" ];

/**
 * Creates a global instance of office365_notifier_Util
 * 
 * @constructor
 * @this {Util}
 * 
 */
var office365_notifier_Util = {
    /**
     * @private bundle
     */
    _bundle : null
};

/**
 * get bundle.
 * 
 * @this {Util}
 * 
 * @param {String}
 *            param parameter value to get
 * @return {String} value of parameter
 */
office365_notifier_Util.getBundleString = function(param) {
    try {
        if (this._bundle === null) {
            this._bundle = chrome.i18n;
        }
        return this._bundle.getMessage(param.replace(/\./g,'_'));
    }
    catch (e) {
        return '';
    }
};

/**
 * Create and launch a timer
 * 
 * @warning You must keep a reference of the timer as long as he lives
 * 
 * @this {Util}
 * 
 * @param {nsITimer}
 *            timer A previous instance of a timer to reuse, can be null: create a new one
 * @param {Function}
 *            func The callback to be fired when the timer timeout
 * @param {Number}
 *            delay The number of ms
 * 
 * @return {nsITimer} The created timer
 */
office365_notifier_Util.setTimer = function(timer, func, delay) {
    clearTimeout(timer);
    timer =  setTimeout(func, delay)
    return timer;
};

/**
 * return max length string
 * 
 * @this {Util}
 * @param {String}
 *            text text to limit.
 * @param {Number}
 *            length max text length.
 * @return {String} text limited with ....
 */
office365_notifier_Util.maxStringLength = function(text, length) {
    if (text === null || (text.length < length)) {
        return text;
    }
    if (length <= 0) {
        return '';
    }
    if (length < 6) {
        return text.substring(0, length);
    }
    return text.substring(0, length - 3) + "...";
};

/**
 * Show notification
 * 
 * @param {String}
 *            title The title of the notification
 * @param {String}
 *            text The text of the notification
 * @param {Number}
 *            duration Minimum duration of the notification (ms)
 * @param {Function}
 *            callback The function to call
 * @param {Object}
 *            callbackThis The context of the function (this)
 * 
 * @return {Boolean} true if success
 */
office365_notifier_Util.showNotification = function(title, text, duration, callback, callbackThis) {
    try {
        // Show the notification
        chrome.notifications.create("", { type: "basic", iconUrl : "skin/images/office365_mail_notifier.png", title : title, message : text, isClickable : true, buttons : [{ title : " ", iconUrl : "skin/images/button_home.png"}]}, function (notificationId) {
            chrome.notifications.onButtonClicked.addListener(function(notificationIdClicked) {
                if(notificationIdClicked == notificationId) {
                    callback();
                    chrome.notifications.clear(notificationId);
                }
            });
            // hide notification after the duration timeout
            office365_notifier_Util.setTimer(null, function() {
                chrome.notifications.clear(notificationId);
            }, duration);
        });
    }
    catch (e) {
        return false;
    }
    return true;
};

/**
 * play new mail sound
 * 
 * @return {Boolean} true if success
 */
office365_notifier_Util.playSound = function() {
    var sound = document.getElementById('sound');
    if(sound) {
        sound.play();
        return true;
    }
    return false;
};

/**
 * open url in a new browser tab
 * 
 * @this {Util}
 * @param {UrlToGoTo}
 *            UrlToGoTo url to open.
 * @return {boolean} true of successful.
 */
office365_notifier_Util.openURL = function(UrlToGoTo) {
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for ( var i = 0; i < extensionTabs.length; i++) {
            if (extensionTabs[i].url.indexOf(UrlToGoTo)>=0) {
                found = true;
                chrome.tabs.update(extensionTabs[i].id, {
                    "selected" : true
                });
            }
        }
        if (found == false) {
            chrome.tabs.create({
                url : UrlToGoTo
            });
        }
    });
};

/**
 * crc32.
 * 
 * @this {Util}
 * @param {String}
 *            str
 * @return {String} crc32
 */
office365_notifier_Util.crc32 = function(str) {
    var c, n, i, k;
    var crc = 0 ^ (-1);
    var crcTable = [];
    for (n = 0; n < 256; n++) {
        c = n;
        for (k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    for (i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
};

/**
 * notifyObservers.
 * 
 * @this {Util}
 * @param {String}
 *            topic the topic
 * @param {String}
 *            data the data
 */
office365_notifier_Util.notifyObservers = function(topic, data) {
    Services.obs.notifyObservers(null, topic, data);
};

/**
 * Extend the Object properties
 * 
 * @param {Object}
 *            base The base object
 * @param {Object}
 *            sub The sub object
 * @param {String}
 *            superPropName The name of the property to access of parent "class"
 */
office365_notifier_Util.extend = function(base, sub, superPropName) {
    var tmp = function() {
    };
    // Copy the prototype from the base to setup inheritance
    tmp.prototype = base.prototype;
    sub.prototype = new tmp();
    // The constructor property was set wrong, let's fix it
    sub.prototype.constructor = sub;
    if (!superPropName) {
        superPropName = '_super';
    }
    sub.prototype[superPropName] = base.prototype;
};

/**
 * Dump the content of an object
 * 
 * @param {Object}
 *            obj The object to dump
 * @param {String}
 *            pref The prefix to display for each line
 */
office365_notifier_Util.dump = function(obj, pref) {
    if (!pref && pref !== '') {
        pref = '=> ';
    }
    for (var p in obj) {
        try {
            console.log(pref + p);
            var v = obj[p];
            if (v) {
                if (typeof(v) === 'object') {
                    console.log("\n");
                    zimbra_notifier_Util.dump(v, pref + p + '.');
                }
                else if (typeof(v) !== 'function') {
                    console.log(" : " + v + ";");
                }
            }
            else {
                console.log(" : " + v + ";");
            }
        }
        catch (e) {
            console.log(" ... ");
        }
        finally {
            console.log("\n");
        }
    }
};

/**
 * Freeze enum / constant object recursively
 * 
 * @param {Object}
 *            obj The object to freeze
 */
office365_notifier_Util.deepFreeze = function(obj) {
    // First freeze the object
    Object.freeze(obj);
    // Iterate over properties of object
    for ( var propKey in obj) {
        if (obj.hasOwnProperty(propKey)) {
            var prop = obj[propKey];
            if (typeof (prop) === 'object') {
                office365_notifier_Util.deepFreeze(prop);
            }
        }
    }
    return obj;
};

/**
 * Prevent any modifications of the Util object
 */
Object.seal(office365_notifier_Util);
