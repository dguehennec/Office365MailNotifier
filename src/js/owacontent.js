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

//* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg === "getOwsDOMContent") {
        var newNbMessageUnread = 0;
        var mailFolderPane = document.getElementById("MailFolderPane.FavoritesFolders");
        if (mailFolderPane) {
            var elements = mailFolderPane.getElementsByTagName("span");
            for (var index = 0; index < elements.length; index++) {
                if (elements[index].id.indexOf(".folder") > 0) {
                    if (elements[index + 1].textContent != "") {
                        newNbMessageUnread += parseInt(elements[index + 1].textContent);
                    }
                }
            }
        }
        var calendarEvents = [];
        var elementEvents = document.getElementsByClassName("o365cs-notifications-toastControl");
        for (var index = 0; index < elementEvents.length; index++) {
            var eventTimeToStart = 0;
            var eventTitle = "";
            var eventTimeDuration = "";
            var elementTitle = elementEvents[index].getElementsByClassName("o365cs-notifications-reminders-title");
            if (elementTitle.length > 0) {
                eventTitle = elementTitle[0].textContent;
            }
            var elementTimeToStart = elementEvents[index].getElementsByClassName("o365cs-notifications-reminders-timeToStartValue");
            if (elementTimeToStart.length > 0) {
                eventTimeToStart = parseInt(elementTimeToStart[0].textContent);
            }
            var elementTimeDuration = elementEvents[index].getElementsByClassName("o365cs-notifications-reminders-timeDuration");
            if (elementTimeDuration.length > 0) {
                eventTimeDuration = elementTimeDuration[0].textContent;
            }
            calendarEvents.push({ title : eventTitle, timeDuration : eventTimeDuration, timeToStart : eventTimeToStart});
        }
        var messageEvents = [];
        var elementChats = document.getElementsByClassName("o365cs-notifications-chat-container");
        for (var index = 0; index < elementChats.length; index++) {
            var sender = "";
            var message = "";
            var elementSender = elementChats[index].getElementsByClassName("o365cs-notifications-chat-sender");
            if (elementSender.length > 0) {
                sender = elementSender[0].textContent;
            }

            var elementMessage = elementChats[index].getElementsByClassName("o365cs-notifications-chat-message");
            if (elementMessage.length > 0) {
                message = elementMessage[0].textContent;
            }
            messageEvents.push({ sender : sender, message : message});
        }
        sendResponse({newMessageUnread : newNbMessageUnread, calendarEvents : calendarEvents, messageEvents : messageEvents});
    }
});


chrome.runtime.sendMessage("owsDOMContentLoaded");

