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
 * Portions created by the Initial Developer are Copyright (C) 2013
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
 * The Class Main.
 * 
 * @constructor
 * @this {Main}
 */
var office365_notifier_main = {};

/**
 * Init module.
 * 
 * @this {Main}
 */
office365_notifier_main.init = function() {
    try {
        chrome.browserAction.setIcon({
            path : "skin/images/icon_disabled.png"
        });
        chrome.browserAction.setBadgeText({
            text : String("")
        });

        office365_notifier_Controller.addCallBackRefresh(this);
    } catch (e) {
        console.error("FATAL in office365_notifier_main.init: " + e + "\n");
    }
};

/**
 * release Main.
 * 
 * @this {Main}
 */
office365_notifier_main.release = function() {
    office365_notifier_Controller.removeCallBackRefresh(this);
};

/**
 * refresh interface.
 * 
 * @this {Main}
 */
office365_notifier_main.refresh = function(inProgress) {
    if (inProgress) {
        chrome.browserAction.setIcon({
            path : "skin/images/icon_refresh.png"
        });
    } else {
        var nbUnreadMessages = -1;
        if (office365_notifier_Controller.isInitialized()) {
            var hasError = (office365_notifier_Controller.getLastErrorMessage() !== '');
            nbUnreadMessages = office365_notifier_Controller.getNbMessageUnread();
            if (hasError) {
                chrome.browserAction.setIcon({
                    path : "skin/images/icon_warning.png"
                });
            } else {
                chrome.browserAction.setIcon({
                    path : "skin/images/icon_default.png"
                });
            }
        } else {
            chrome.browserAction.setIcon({
                path : "skin/images/icon_disabled.png"
            });
        }
        // ToolBar
        if (nbUnreadMessages > 0) {
            chrome.browserAction.setBadgeText({
                text : String(nbUnreadMessages)
            });
        } else {
            chrome.browserAction.setBadgeText({
                text : String("")
            });
        }
    }
};


/**
 * Checks if URL is Office 365.
 * 
 * @this {Main}
 * @param {String}
 *            href the url to test
 * @return {Boolean} true, if URL is Office 365 web site
 */
office365_notifier_main.isOffice365WebSite = function(href) {
    return (href.indexOf(office365_notifier_Constant.URLS.SITE_DEFAULT) >= 0);
};


/**
 * add events listener to notify when ows content is loaded or unloaded
 */
chrome.runtime.onMessage.addListener(function(msg, sender) {
    if(!msg) {
        return;
    }
    switch(msg.type) {
        case "owsDOMContentLoaded":
            office365_notifier_Controller.office365InterfaceLoaded(sender.tab.id, sender.tab.url);
            break;
        default:
            if (office365_notifier_Controller._currentInterfaceListener === sender.tab.id) {
                office365_notifier_Controller.getService().injectCallback(msg);
            }
    }

});

chrome.tabs.onUpdated.addListener(function(tabId , info) {
    if (office365_notifier_Controller._currentInterfaceListener === tabId) {
        if(info.url && !office365_notifier_Controller.office365IsCurrentInterface(info.url)) {
            office365_notifier_Controller.office365InterfaceUnloaded(office365_notifier_Controller._currentInterfaceListener, info.url);
        }
    }    
});

chrome.tabs.onRemoved.addListener(function(tabId , info) {
    if(office365_notifier_Controller._currentInterfaceListener === tabId) {
        office365_notifier_Controller.office365InterfaceUnloaded(office365_notifier_Controller._currentInterfaceListener, null);
    }
});

/**
 * add event listener to notify when content is loaded or unloaded
 */
document.addEventListener('DOMContentLoaded', function() {
    office365_notifier_main.init();
});

document.addEventListener('onbeforeunload', function() {
    office365_notifier_main.release();
});
