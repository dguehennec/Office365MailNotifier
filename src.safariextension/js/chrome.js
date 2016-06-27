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

 if(typeof chrome === "undefined") {
    chrome = {
        _callbacksCookie: [],
        _notifications: [],
        _callbacksNotification: [],
        _callbacksMessage: [],
        _tabs: [],
        browserAction: {
            setIcon: function(details, callback) {
                if (!details || !details.path) {
                    return;
                }
                safari.extension.toolbarItems.forEach(function(item) {
                    if (item.identifier === 'Office365MailNotifierTab') {
                        item.image = safari.extension.baseURI + details.path;
                    }
                });
                if(callback) {
                    callback();
                }
            },
            setBadgeText: function(details, callback) {
                if (!details) {
                    return;
                }
                safari.extension.toolbarItems.forEach(function(item) {
                    if (item.identifier === 'Office365MailNotifierTab') {
                        if(details.text !== '') {
                            item.badge = details.text;
                        } else {
                            item.badge = 0;
                        }
                    }
                });
                if(callback) {
                    callback();
                }
            }
        },
        cookies: {
            callbackResult: function(details) {
                for(var index = (chrome._callbacksCookie.length - 1); index >= 0 ; index--) {
                    if(chrome._callbacksCookie[index].id = details.id) {
                        if(chrome._callbacksCookie[index].callback) {
                            chrome._callbacksCookie[index].callback(details);
                        }
                        chrome._callbacksCookie.splice(index, 1);
                    }
                }
            },
            remove: function(details, callback) {
                var tab = chrome.tabs.getTab(details.url);
                if(tab && details) {
                    details.id = (new Date()).getTime();
                    tab.page.dispatchMessage("Office365MailNotifier_removeCookie", details);
                    chrome._callbacksCookie.push({id: details.id, callback: callback});
                } else if(callback) {
                    callback(null);
                }
            },
            get: function(details, callback) {
                var tab = chrome.tabs.getTab(details.url);
                if(tab && details) {
                    details.id = (new Date()).getTime();
                    tab.page.dispatchMessage("Office365MailNotifier_getCookie", details);
                    chrome._callbacksCookie.push({id: details.id, callback: callback});
                }
                else if(callback) {
                    callback(null);
                }
            },
            set: function(details, callback) {
                var tab = chrome.tabs.getTab(details.url);
                if(tab && details) {
                    details.id = (new Date()).getTime();
                    tab.page.dispatchMessage("Office365MailNotifier_setCookie", details);
                    chrome._callbacksCookie.push({id: details.id, callback: callback});
                }
                else if(callback) {
                    callback(null);
                }
            }
        },
        storage: {
            local: {
                get: function(defaultPrefs, callback) {
                    if (callback) {
                        var prefs = localStorage.getItem('prefs')
                        if (prefs) {
                            try {
                                prefs = JSON.parse(prefs);
                            }
                            catch(e) {
                                
                            }
                            callback(prefs);
                        } else {
                            callback(defaultPrefs);
                        }
                    }
                },
                set: function(prefs) {
                    if (prefs) {
                        localStorage.setItem('prefs', JSON.stringify(prefs));
                    } else {
                        localStorage.setItem('prefs', null);
                    }
                }
            }
        },
        tabs: {
            getTab: function(url) {
                var tabDetected = null;
                if(url) {               
                    var _tabs = [];
                    safari.application.browserWindows.forEach(function (brWindow, wI) {
                        brWindow.tabs.forEach(function (brTab, tabI) {
                            var id;
                            chrome._tabs.forEach(function (rTab) {
                                if(rTab.target === brTab) {
                                    id = rTab.id;
                                }
                            });
                            if(!id) {
                                id = (new Date()).getTime();
                            }
                            brTab.id = id;
                            _tabs.push({id: id, target: brTab})
                            if(brTab.url && brTab.url.indexOf(url)>=0) {
                                tabDetected = brTab;
                            }
                        })
                    });
                    chrome._tabs = _tabs;
                }
                return tabDetected;
            },
            create: function (obj, callback) {
                if(!obj.url) {
                    return;
                }

                if(obj.url.indexOf('://')<0) {
                    safari.extension.toolbarItems.forEach(function(item) {
                        if (item.identifier === 'Office365MailNotifierTab') {
                            var url = chrome.extension.getURL(obj.url);
                            if(item.popover) {
                                var identifier = item.popover.identifier;
                                item.popover.hide();
                                setTimeout(function() {
                                    item.popover = null;
                                    safari.extension.removePopover(identifier);
                                    var popup = safari.extension.createPopover("Office365MailNotifierOption", url, 760, 530);
                                    item.popover = popup;
                                    item.showPopover();
                                }, 100);            
                            } else {
                                var popup = safari.extension.createPopover("Office365MailNotifierOption", url, 760, 530);
                                item.popover=popup;
                                item.showPopover();
                            }
                        }
                    });
                } else {
                    var newTab = safari.application.activeBrowserWindow.openTab();
                    newTab.url = obj.url;
                    newTab.id = (new Date()).getTime();
                    chrome._tabs.push({id: id, target: newTab});
                    if(obj.active) {
                        newTab.activate();
                    }
                    if(callback) {
                        callback(newTab);
                    }
                }
            },
            get: function (tabId, callback) {
                var tab;
                chrome._tabs.forEach(function (brTab) {
                    if(brTab.id === tabId) {
                        tab = brTab.target;
                    }
                });
                if(callback) {
                    callback(tab);
                }
            },
            update: function(tabId, updateProperties, callback) {
                chrome.tabs.get(tabId, function(tab) {
                    if(tab) {
                        if(updateProperties.url) {
                            tab.url = updateProperties.url;
                        }
                        if(updateProperties.selected) {
                            tab.activate();
                        }
                    }
                    if (callback) {
                        callback(tab);
                    }
                });
            },
            onUpdated: {
                addListener: function(listener) {

                }
            },
            onRemoved: {
                addListener: function(listener) {

                }
            },
            reload: function(tabId, callback) {
                chrome.tabs.get(tabId, function(tab) {
                    if(tab) {
                        tab.page.dispatchMessage("Office365MailNotifier_reload");
                    }
                    if (callback) {
                        callback(tab);
                    }
                });
            },
            query: function(queryInfo, callback) {
                if (callback) {
                    var tabs = [];
                    var _tabs = [];
                    safari.application.browserWindows.forEach(function (brWindow, wI) {
                        brWindow.tabs.forEach(function (brTab, tabI) {
                            var id;
                            chrome._tabs.forEach(function (rTab) {
                                if(rTab.target === brTab) {
                                    id = rTab.id;
                                }
                            });
                            if(!id) {
                                id = (new Date()).getTime();
                            }
                            brTab.id = id;
                            _tabs.push({id: id, target: brTab})
                            tabs.push(brTab);
                        })
                    });
                    chrome._tabs = _tabs;
                    callback(tabs);
                }
            },
            sendMessage: function(tabId, message) {
                chrome.tabs.get(tabId, function(tab) {
                    if(tab) {
                        tab.page.dispatchMessage("Office365MailNotifier_sendMessage", message);
                    }
                });
            }
        },
        extension: {
            getURL: function (url) {
                return safari.extension.baseURI + url;
            },
            getBackgroundPage: function() {
                return safari.extension.globalPage.contentWindow;
            }
        },
        runtime: {
            onMessageCallback: function(result) {
                var id;
                chrome._tabs.forEach(function (tab) {
                    if(tab.target === result.target) {
                        id = tab.id;
                    }
                });
                if(!id) {
                    id = (new Date()).getTime();
                    chrome._tabs.push({ id: id, target: result.target});
                }
                var sender = {tab: {id: id, url: result.target.url} };
                chrome._callbacksMessage.forEach(function (callback) {
                    callback(result.message, sender);
                });
            },
            onMessage: {
                addListener: function(listener) {
                    chrome._callbacksMessage.push(listener);
                }
            }
        },
        i18n: {
            getMessage: function(key) {
                var value = '';
                try {
                    var locale = chrome.extension.getBackgroundPage().office365_notifier_locale.getLocale();
                    if(locale[key]){
                        value = locale[key].message;
                    }
                } catch (e) {
                }
                return value;
            }
        },
        notifications: {
            create: function(notificationId, options, callback) {
                if (window.Notification.permission === "granted") {
                    if(!notificationId) {
                        notificationId = (new Date).getTime();
                    }
                    var notification = new window.Notification(options.title, {icon: chrome.extension.getURL(options.iconUrl), body: options.message, tag: notificationId});
                    chrome._notifications[notificationId] = notification;
                    notification.onclick = function(event) {
                        event.preventDefault();
                        chrome._callbacksNotification.forEach(function(callback) {
                            callback(event.target.tag);
                        });
                    };
                    if(callback) {
                        callback(notificationId);
                    }
                } else {
                    window.Notification.requestPermission(callbackFunction);
                }
            },
            onClicked: {
                addListener: function(listener) {
                    chrome._callbacksNotification.push(listener);
                }
            },
            clear: function(notificationId, callback) {
                if(chrome._notifications[notificationId]) {
                    chrome._notifications[notificationId].cancel();
                    chrome._notifications[notificationId] = undefined;
                    if(callback) {
                        callback(true);
                    }
                } else if(callback) {
                    callback(false);
                }
            }
        }
    };
}