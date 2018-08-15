//
//Copyright (C) 2018 Łukasz Uznański <lukasz@uznanski.pl>
//
//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.
//*
//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//Author of Script: Łukasz Uznański <lukasz@uznanski.pl>
//
registerPlugin({
        name: 'Automessage',
        version: '1.0.0',
        description: 'Message to ServerGroup when user joins specified channel',
        author: 'Łukasz Uznański',
        vars: {
            channelId: {
                title: 'Support channel',
                type: 'channel'
            },
            supporterGroupId: {
                title: 'Supporter group id - comma separated',
                type: 'string'
            },
            messageToUser: {
                title: "Message to user - %u for Username",
                type: 'string',
                placeholder: "Hello %u! A Supporter will help you soon!"
            },
            messageToSupporter: {
                title: "Message to supporter - %u for Username",
                type: 'string',
                placeholder: "User %u has joined the support channel!"
            }
        }
    },
    function (sinusbot, config) {

        var event = require('event');
        var store = require('store');
        var backend = require('backend');

        var messageToUser = config.messageToUser.split('%u');
        var messageToSupporter = config.messageToSupporter.split('%u');
        var supporterGroupId = config.supporterGroupId.split(',');

        store.set(config.Supporter, []);

        event.on('clientMove', function (e) {
            var isSupporter = false;
            var serverGroups = sinusbot.getServerGroups();
            serverGroups.forEach(function (serverGroup) {
                supporterGroupId.forEach(function (supporterGroup) {
                    if (parseInt(serverGroup.id) === parseInt(supporterGroup)) {
                        isSupporter = true;
                    }
                });
            });
            var supporters = store.get(config.Supporter);

            if (isSupporter === true) {
                var singleSupporter = backend.getClientByID(e.client.id());
                if (singleSupporter) {
                    var clientGroups = singleSupporter.getServerGroups();
                }
                if(clientGroups instanceof Array) {
                    clientGroups.forEach( function (clientGroup) {
                        if(supporterGroupId.indexOf(clientGroup.id()) >= 0) {
                            supporters.push(singleSupporter.id());
                            store.set(config.Supporter, supporters);
                        }
                    });
                }
            }

            if (e.toChannel && e.toChannel.id() === config.channelId) {
                if (messageToUser.length === 2) {
                    messageToUserToSend = messageToUser[0] + '[b]' + e.client.name() + '[/b]' + messageToUser[1];
                }
                else {
                    messageToUserToSend = messageToUser[0];
                }
                if (messageToSupporter.length === 2) {
                    messageToSupporterToSend = messageToSupporter[0] + '[b]' + e.client.name() + '[/b]' + messageToSupporter[1];
                }
                else {
                    messageToSupporterToSend = messageToSupporter[0];
                }

                store.get(config.Supporter).forEach(function (supporterId) {
                    var supporter = backend.getClientByID(supporterId);
                    supporter.chat(messageToSupporterToSend);
                });
                var user = backend.getClientByID(e.client.id());
                user.chat(messageToUserToSend);
            }
        });
    }
);
