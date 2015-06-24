#Office 365 Mail Notifier (Chrome Addon)

## Description

Office 365 Notifier checks your Office 365 webmail account and notifies the number of unread messages.
When new message arrive in your mailbox, a system notification is posted
You can view your next appointments (save in your Office 365 calendar) and be notified by the system.
Tracking chat with users is also available.

### User with Mac OS X:
Don't forget to install Growl (http://growl.info/) to be notify by system notification.

## Usage

	# Maven is used to generate Firefox extension (xpi) of Office 365 Mail Notifier sources.
	# There are 2 profiles (Dev en Prod)
	
	# In Dev mode, just des sources is packaging, use the next command line
	mvn clean install
	
	# In Prod mode, jsDoc is generated and Sonar is executed
	# (it is necessary to have Sonar installed on localhost), use the next command line
	mvn clean install -PProd
	

 

