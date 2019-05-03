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
 * The Original Code is 365 Mail Notifier.
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

var EXPORTED_SYMBOLS = [ "office365_notifier_eventsManager" ];

/**
 * Creates an instance of eventsManager.
 * 
 * @constructor
 * @this {eventsManager}
 * 
 */
var office365_notifier_eventsManager = function() {
    this._events = [];
};

/**
 * Add new event
 * 
 * @this {eventsManager}
 * @param {Event}
 *            event the event
 */
office365_notifier_eventsManager.prototype.addNewEvent = function(event) {
    var eventExist = this.getEvent(event);
    if (eventExist) {
        eventExist.isInvalid = false;
        return false;
    } else if (event.name !== "") {
        event.isInvalid = false;
        this._events.push(event);
    }
    return true;
};

/**
 * Release eventsManager.
 * 
 * @this {eventsManager}
 */
office365_notifier_eventsManager.prototype.shutdown = function() {
    for (var index = 0; index < this._events.length; index++) {
        this._events[index].stopNotification();
    }
};

/**
 * Invalidate all events
 * 
 * @this {eventsManager}
 */
office365_notifier_eventsManager.prototype.invalidateAllEvents = function() {
    for (var index = 0; index < this._events.length; index++) {
        this._events[index].isInvalid = true;
    }
};

/**
 * clean events invalidate
 * 
 * @this {eventsManager}
 */
office365_notifier_eventsManager.prototype.cleanEventsInvalidate = function() {
    for (var index = this._events.length - 1; index >= 0; index--) {
        if (this._events[index].isInvalid) {
            this._events[index].stopNotification();
            this._events.splice(index, 1);
        }
    }
};

/**
 * Find event already recorded
 * 
 * @this {eventsManager}
 * @param {Onject}
 *            event the event
 */
office365_notifier_eventsManager.prototype.getEvent = function(event) {
    for (var index = 0; index < this._events.length; index++) {
        if (this._events[index].key === event.key) {
            return this._events[index];
        }
    }
    return null;
};

/**
 * Find event already recorded
 * 
 * @this {eventsManager}
 * @param {Onject}
 *            event the event
 */
office365_notifier_eventsManager.prototype.updateEvent = function(oldEvent, newEvent) {
    for (var index = 0; index < this._events.length; index++) {
        if (this._events[index].key === oldEvent.key) {
            this._events[index] = newEvent;
            break;
        }
    }
};

/**
 * Get events by type
 * 
 * @this {eventsManager}
 * @param {String}
 *            type the event type
 * @return {Array} events list
 */
office365_notifier_eventsManager.prototype.getEventsByType = function(type) {
    var events = [];
    for (var index = 0; index < this._events.length; index++) {
        if (this._events[index].type === type) {
            events.push(this._events[index]);
        }
    }
    return events
};

/**
 * Freeze the interface
 */
Object.freeze(office365_notifier_eventsManager);
