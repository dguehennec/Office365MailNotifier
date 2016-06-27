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
 * Portions created by the Initial Developer are Copyright (C) 2014
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
 
/**
 * need to add specifique listener for safari case in order to open popup
 */
safari.application.addEventListener("command", function(event) {
   if (event.command == "openPopup") {
        safari.extension.toolbarItems.forEach(function(item) {
            if (item.identifier === 'Office365MailNotifierTab') {
                if(item.popover) {
                    if(item.popover.identifier !== 'Office365MailNotifierPopup') {
                        var identifier = item.popover.identifier;
                        item.popover.hide();
                        item.popover = null;
                        setTimeout(function() {safari.extension.removePopover(identifier);}, 100);
                    } else {
                        //already created
                        item.showPopover();
                        return;
                    }
                }
                var popup = safari.extension.createPopover("Office365MailNotifierPopup", safari.extension.baseURI + "popup.html", 350, 100);
                item.popover=popup;
                item.showPopover();
            }
        });
    }
}, false);

/**
 * need to add specifique listener for safari case in order to get tab information result
 */
safari.application.addEventListener("message", function(event) {
    if (event.name == "Office365MailNotifier_message") {
        chrome.runtime.onMessageCallback(event);
    }
},false);



/**
 * need to add specifique implementation for safari case in order to get locale translation
 */
var office365_notifier_locale = {
    locale: {},
    languages: {
        "de": "de",
        "en": "en",
        "es": "es",
        "fr": "fr",
        "it": "it",
        "pt": "pt",
        "sr": "sr",
        "tr": "tr"
    },
    getLocale: function() {
        return this.locale;
    },
    downloadLocale: function() {
        // get locale type
        var lang = (window.navigator.language || "en").replace(/-/g, "_");
        if (!this.languages[lang]) {
                lang = lang.replace(/_.*$/, "");
        }
        lang = this.languages[lang] || "en";
        // get locale file
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                office365_notifier_locale.locale =  JSON.parse(this.responseText) || {};
            }
        };
        xhr.open("GET", safari.extension.baseURI + "_locales/" + lang + "/messages.json");
        xhr.send();
    }
};
/**
 * start download locale when script is executed
 */
office365_notifier_locale.downloadLocale();

