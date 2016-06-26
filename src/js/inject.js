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

var sessionId = -1;

//* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender) {
	switch(msg) {
		case "owsGetUnreadMessages":
			getUnreadMessages();
			break;
		case "owsGetReminder":
			getReminder();
			break;
		case "owsGetMailBoxInfo":
			getMailBoxInfo();
			break;
		default:
	}
});

function getCookiesValue(key)  {
	var ca = document.cookie.split(';');
	var value = "";
	for(var i=0; i<ca.length; i++) {
		var item = ca[i].split('=');
		if ((item.length === 2) && (item[0].trim() === key)) {
			value = item[1].trim();
			break;
		}
	}
	return value;
}

function getMailBoxInfo() {
	var mailBoxInfo = { email: getCookiesValue('DefaultAnchorMailbox') };
	chrome.runtime.sendMessage({type: 'owsMailBoxInfoResult', data: mailBoxInfo});
	
}

function getUnreadMessages() {
	var data = {  
	   "__type":"FindItemJsonRequest:#Exchange",
	   Header:{  
		  "__type":"JsonRequestHeaders:#Exchange",
		  RequestServerVersion:"Exchange2016",
		  TimeZoneContext:{  
			 "__type":"TimeZoneContext:#Exchange",
			 TimeZoneDefinition:{  
				"__type":"TimeZoneDefinitionType:#Exchange",
				Id:"Romance Standard Time"
			 }
		  }
	   },
	   "Body":{  
		  "__type":"FindItemRequest:#Exchange",
		  ItemShape:{  
			 "__type":"ItemResponseShape:#Exchange",
			 BaseShape:"IdOnly"
		  },
		  ParentFolderIds:[  
			 {  
				"__type":"DistinguishedFolderId:#Exchange",
				Id:"inbox"
			 }
		  ],
		  Traversal:"Shallow",
		  Paging:{  
			 "__type":"IndexedPageView:#Exchange",
			 BasePoint:"Beginning",
			 Offset:0,
			 MaxEntriesReturned:100
		  },
		  ViewFilter:"Unread",
		  IsWarmUpSearch:false,
		  FocusedViewFilter:-1,
		  Grouping:null,
		  ShapeName:"MailListItem",
		  SortOrder:[  
			 {  
				"__type":"SortResults:#Exchange",
				Order:"Descending",
				Path:{  
				   "__type":"PropertyUri:#Exchange",
				   FieldURI:"ReceivedOrRenewTime"
				}
			 },
			 {  
				"__type":"SortResults:#Exchange",
				Order:"Descending",
				Path:{  
				   "__type":"PropertyUri:#Exchange",
				   FieldURI:"DateTimeReceived"
				}
			 }
		  ]
	   }
	};
	sendRequest('service.svc?action=FindItem&EP=1&AC=1', data, function(response) {
		var unreadMessages = [];
		if(response && response.Body && response.Body.ResponseMessages && response.Body.ResponseMessages.Items) {
			response.Body.ResponseMessages.Items.forEach(function(folder) {
				folder.RootFolder.Items.forEach(function(conversation) {
					var emailDate = (new Date(conversation.DateTimeReceived)).getTime();
					var senderMail = "";
					if(conversation.From && conversation.From.Mailbox && conversation.From.Mailbox.Name) {
					  senderMail = conversation.From.Mailbox.Name;
					}
					unreadMessages.push({id: (conversation.ConversationId.Id + emailDate), subject: conversation.Subject, content: conversation.Preview, senderMail: senderMail, date: emailDate, convId: conversation.ConversationId.Id});
				});
			});
		}
		chrome.runtime.sendMessage({type: 'owsUnreadMessagesResult', data: unreadMessages});
	});
}

function getReminder() {
	var startTime = new Date((new Date()).getTime()).toISOString().split('.')[0];
	var endTime = new Date((new Date()).getTime() + 4*7*24*60*60*1000).toISOString().split('.')[0];
	var data = {  
	   "__type":"GetRemindersJsonRequest:#Exchange",
	   Header:{  
		  "__type":"JsonRequestHeaders:#Exchange",
		  RequestServerVersion:"Exchange2016",
		  TimeZoneContext:{  
			 "__type":"TimeZoneContext:#Exchange",
			 TimeZoneDefinition:{  
				"__type":"TimeZoneDefinitionType:#Exchange",
				Id:"Romance Standard Time"
			 }
		  }
	   },
	   Body:{  
		  "__type":"GetRemindersRequest:#Exchange",
		  StartTime: startTime,
		  EndTime: endTime
	   }
	};
	sendRequest('service.svc?action=GetReminders&EP=1&AC=1', data, function(response) {
		var calendarEvents = [];
		if(response && response.Body && response.Body.Reminders) {
			response.Body.Reminders.forEach(function(reminder) {
				var currentDate = (new Date()).getTime();;
				var eventEndDate = (new Date(reminder.EndDate)).getTime();
				if(eventEndDate > currentDate) {
					var eventStartDate = (new Date(reminder.StartDate)).getTime();
					var eventReminderTime = (new Date(reminder.ReminderTime)).getTime();
					var timeConf = (eventStartDate - eventReminderTime) / (60 * 1000);
					calendarEvents.push({id: (reminder.Subject + eventStartDate), name: reminder.Subject, timestamp: eventStartDate, duration: eventEndDate - eventStartDate, timeConf: timeConf});
				}
			});
		}
		chrome.runtime.sendMessage({type: 'owsReminderResult', data: calendarEvents});
	});
}

function sendRequest(uri, postData, callback) {
	if(uri.indexOf('?') >= 0){
		uri = uri + '&ID=' + sessionId;
	} else {
		uri = uri + '?ID=' + sessionId;
	}
	sessionId--;
	// get cookie session
	var session_canary = getCookiesValue('X-OWA-CANARY');
	// get action
	var ca = uri.substring(uri.indexOf('?')+1, uri.length-1).split('&');
	var action = "";
	name = "action";
	for(var i=0; i<ca.length; i++) {
		var item = ca[i].split('=');
		if ((item.length === 2) && (item[0] === name)) {
			action = item[1];
			break;
		}
	}
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST",  uri);
	xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	xhttp.setRequestHeader("Action", action);
	xhttp.setRequestHeader("X-OWA-CANARY", session_canary);
	xhttp.setRequestHeader("X-OWA-UrlPostData", encodeURI(JSON.stringify(postData)));
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			console.log(xhttp.responseText);
			try {
				var response = JSON.parse(xhttp.responseText);
				if(callback) {
					callback(response);
				}
			} catch(e) {
				if(callback) {
					callback(null);
				}
			}
		}
	};
	xhttp.send();
}


chrome.runtime.sendMessage({type: 'owsDOMContentLoaded'});
