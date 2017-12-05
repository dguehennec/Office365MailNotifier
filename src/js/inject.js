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

/**
 * sessionId
 * @type {Number}
 */
var sessionId = -1;

/**
 * getCookiesValue
 * @param  {String} key
 * @return {String}
 */
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

/**
 * sendRequest
 * @param  {Number}   type
 * @param  {String}   uri
 * @param  {String}   postData
 * @param  {Function} callback
 */
function sendRequest(type, uri, postData, callback) {
	if(uri.indexOf('?') >= 0){
		uri = uri + '&ID=' + sessionId;
	} else {
		uri = uri + '?ID=' + sessionId;
	}
	sessionId--;
	// get cookie session
	var session_canary = getCookiesValue('X-OWA-CANARY');
	// get action
	var ca = uri.substring(uri.indexOf('?')+1, uri.length).split('&');
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
	xhttp.open("POST", window.location.href.split("/owa/")[0] + "/owa/" + uri, true);
	xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	xhttp.setRequestHeader("Action", action);
	xhttp.setRequestHeader("X-OWA-CANARY", session_canary);
	if(type === 2016) {
		xhttp.setRequestHeader("X-OWA-UrlPostData", encodeURI(JSON.stringify(postData)));
	}
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			try {
				var response = JSON.parse(xhttp.responseText);
				if(callback) {
					callback(response);
				}
			} catch(e) {
				if(callback) {
					callback();
				}
			}
		}
	};
	if(type === 2016) {
		xhttp.send();
	} else {
		xhttp.send(JSON.stringify(postData));
	}
}

/**
 * define exchange 2016 interface
 *
 */
var exchange2016 = function() {
}
exchange2016.type = 'exchange2016';
/**
 * [getMailBoxInfo description]
 * @param {Function} callback
 */
exchange2016.getMailBoxInfo = function(callback) {
	var mailBoxInfo = { email: getCookiesValue('DefaultAnchorMailbox') };
	if(callback) {
		callback(mailBoxInfo);
	}
};
/**
 * getUnreadMessages
 * @param {Function} callback
 */
exchange2016.getUnreadMessages = function(callback) {
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
	sendRequest(2016, 'service.svc?action=FindItem&EP=1&AC=1', data, function(response) {
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
		if(callback) {
			callback(unreadMessages);
		}
	});
};
/**
 * getReminder
 * @param  {Function} callback
 */
exchange2016.getReminder = function(startTime, endTime, callback) {
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
	sendRequest(2016, 'service.svc?action=GetReminders&EP=1&AC=1', data, function(response) {
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
		if(callback) {
			callback(calendarEvents);
		}
	});
};

/**
 * define exchange 2016 interface
 *
 */
var exchange2013 = function() {
};
exchange2013.type = 'exchange2013';
/**
 * [getMailBoxInfo description]
 * @param {Function} callback
 */
exchange2013.getMailBoxInfo = function(callback) {
	var data = {};
	sendRequest(2013, 'service.svc?action=GetOwaUserConfiguration&AC=1', data, function(response) {
		if(response && response.SessionSettings && response.SessionSettings.UserEmailAddress) {
			if(callback) {
				var session = response.SessionSettings;
				callback({displayName: session.UserDisplayName, email: session.UserEmailAddress, QuotaSend: session.QuotaSend, QuotaUsed: session.QuotaUsed});
			}
		}
	});
};
/**
 * getUnreadMessages
 * @param {Function} callback
 */
exchange2013.getUnreadMessages = function(callback) {
	var data = {
	   "__type":"FindConversationJsonRequest:#Exchange",
	   "Header":{
	      "__type":"JsonRequestHeaders:#Exchange",
	      "RequestServerVersion":"Exchange2013",
	      "TimeZoneContext":{
	         "__type":"TimeZoneContext:#Exchange",
	         "TimeZoneDefinition":{
	            "__type":"TimeZoneDefinitionType:#Exchange",
	            "Id":"Romance Standard Time"
	         }
	      }
	   },
	   "Body":{
	      "__type":"FindConversationRequest:#Exchange",
	      "ParentFolderId":{
	         "__type":"TargetFolderId:#Exchange",
	         "BaseFolderId":{
	            "__type":"DistinguishedFolderId:#Exchange",
	            "Id":"inbox"
	         }
	      },
	      "ConversationShape":{
	         "__type":"ConversationResponseShape:#Exchange",
	         "BaseShape":"IdOnly"
	      },
	      "ShapeName":"ConversationListView",
	      "Paging":{
	         "__type":"IndexedPageView:#Exchange",
	         "BasePoint":"Beginning",
	         "Offset":0,
	         "MaxEntriesReturned":100
	      },
	      "ViewFilter":"Unread",
	      "SortOrder":[
	         {
	            "__type":"SortResults:#Exchange",
	            "Order":"Descending",
	            "Path":{
	               "__type":"PropertyUri:#Exchange",
	               "FieldURI":"ConversationLastDeliveryTime"
	            }
	         }
	      ]
	   }
	};
	sendRequest(2013, 'service.svc?action=FindConversation&AC=1', data, function(response) {
		var unreadMessages = [];
		if(response && response.Body && response.Body.Conversations) {
			response.Body.Conversations.forEach(function(conversation) {
				var emailDate = (new Date(conversation.LastDeliveryTime)).getTime();
				var senderMail = "";
				if(conversation.From && conversation.From.Mailbox && conversation.From.Mailbox.Name) {
				  senderMail = conversation.From.Mailbox.Name;
				}
				unreadMessages.push({id: (conversation.ConversationId.Id + emailDate), subject: conversation.ConversationTopic, content: conversation.Preview, senderMail: senderMail, date: emailDate, convId: conversation.ConversationId.Id});
			});
		}
		if(callback) {
			callback(unreadMessages);
		}
	});
};
/**
 * getReminder
 * @param  {Function} callback
 */
exchange2013.getReminder = function(startTime, endTime, callback) {
	var data = {
	   "__type":"FindItemJsonRequest:#Exchange",
	   "Header":{
		  "__type":"JsonRequestHeaders:#Exchange",
		  "RequestServerVersion":"Exchange2013",
		  "TimeZoneContext":{
			 "__type":"TimeZoneContext:#Exchange",
			 "TimeZoneDefinition":{
				"__type":"TimeZoneDefinitionType:#Exchange",
				"Id":"Romance Standard Time"
			 }
		  }
	   },
	   "Body":{
		  "__type":"FindItemRequest:#Exchange",
		  "ItemShape":{
			 "__type":"ItemResponseShape:#Exchange",
			 "BaseShape":"IdOnly",
			 "AdditionalProperties":[
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"ItemParentId"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"Sensitivity"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"AppointmentState"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"IsCancelled"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"HasAttachments"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"LegacyFreeBusyStatus"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"CalendarItemType"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"Start"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"End"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"IsAllDayEvent"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"Organizer"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"Subject"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"IsMeeting"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"UID"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"InstanceKey"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"ItemEffectiveRights"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"JoinOnlineMeetingUrl"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"ConversationId"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"CalendarIsResponseRequested"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"Categories"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"IsRecurring"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"IsOrganizer"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"EnhancedLocation"
				},
				{
				   "__type":"PropertyUri:#Exchange",
				   "FieldURI":"IsSeriesCancelled"
				}
			 ]
		  },
		  "ParentFolderIds":[
			 {
				"__type":"DistinguishedFolderId:#Exchange",
				"Id":"calendar"
			 }
		  ],
		  "Traversal":"Shallow",
		  "Paging":{
			 "__type":"CalendarPageView:#Exchange",
			 "StartDate": startTime,
			 "EndDate": endTime
		  }
	   }
    };
	sendRequest(2013, 'service.svc?action=FindItem&AC=1', data, function(response) {
		var calendarEvents = [];
		if(response && response.Body && response.Body.ResponseMessages && response.Body.ResponseMessages.Items) {
			response.Body.ResponseMessages.Items.forEach(function(folder) {
				folder.RootFolder.Items.forEach(function(conversation) {
					var currentDate = (new Date()).getTime();;
					var eventEndDate = (new Date(conversation.End)).getTime();
					if(eventEndDate > currentDate) {
						var eventStartDate = (new Date(conversation.Start)).getTime();
							var timeConf = eventStartDate;
						calendarEvents.push({id: (conversation.Subject + eventStartDate), name: conversation.Subject, timestamp: eventStartDate, duration: eventEndDate - eventStartDate, timeConf: timeConf});
					}
				});
			});
		}
		if(callback) {
			callback(calendarEvents);
		}
	});
};

// start notifier only if cookie is defined
if(getCookiesValue('X-OWA-CANARY')){
	// select exchange version used to request api
	var currentExchange = exchange2016;
	if (!getCookiesValue('DefaultAnchorMailbox')) {
		currentExchange = exchange2013;
	}
	//* Listen for notifier messages */
	chrome.runtime.onMessage.addListener(function(msg, sender) {
		switch(msg) {
			case "owsGetUnreadMessages":
				currentExchange.getUnreadMessages(function(data) {
					chrome.runtime.sendMessage({type: 'owsUnreadMessagesResult', data: data});
				});
				break;
			case "owsGetReminder":
				var startTime = new Date((new Date()).getTime()).toISOString().split('.')[0];
				var endTime = new Date((new Date()).getTime() + 4*7*24*60*60*1000).toISOString().split('.')[0];
				currentExchange.getReminder(startTime, endTime, function(data) {
					chrome.runtime.sendMessage({type: 'owsReminderResult', data: data});
				});
				break;
			case "owsGetMailBoxInfo":
				currentExchange.getMailBoxInfo(function(data) {
					chrome.runtime.sendMessage({type: 'owsMailBoxInfoResult', data: data});
				});
				break;
			default:
		}
	});
    chrome.runtime.sendMessage({type: 'owsDOMContentLoaded'});
}
