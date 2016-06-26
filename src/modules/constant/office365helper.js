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

var EXPORTED_SYMBOLS = [ "office365_notifier_Constant" ];

/**
 * Creates a global instance of office365_notifier_Constant
 * 
 * @constructor
 */
var office365_notifier_Constant = {};

/**
 * The version of the extension
 * 
 * @constant
 */
office365_notifier_Constant.VERSION = 0x010102;

/**
 * Logger level
 * 
 * @constant
 */
office365_notifier_Constant.LOGGER = {
    LEVEL : 0,
    PRINT_STACK : false,
    PRINT_DATE : false
};

/**
 * URLs
 * 
 * @constant
 */
office365_notifier_Constant.URLS = {
    SITE_AUTHENT : "https://login.microsoftonline.com/"
};

/**
 * Oberver
 * 
 * @constant
 */
office365_notifier_Constant.OBSERVER = {
    PREF_SAVED : "office365_mail_notifier.pref.saved"
};

/**
 * The string bundle info
 * 
 * @constant
 */
office365_notifier_Constant.STRING_BUNDLE = {
    DEFAULT_URL : "chrome://office365_mail_notifier/locale/office365_mail_notifier.properties"
};

/**
 * Notifier
 *
 * @constant
 *
 */
office365_notifier_Constant.NOTIFIER = {
    REPEAT_DELAY_MS : 60000
};

/**
 * Service
 *
 * @constant
 *
 */
office365_notifier_Constant.SERVICE = {
    NOTIFY_MAX_NB_MSG : 15,
    NOTIFY_MAX_LEN_TITLE : 75,
    NB_MAX_MSG_WITH_CONTENT : 200
};