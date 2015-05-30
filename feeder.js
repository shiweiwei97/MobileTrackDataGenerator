'use strict';

var mysql = require('mysql'),
    walk = require('walk'),
    fs = require('fs'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    async = require('async'),
    _ = require('lodash'),
    log = require('log4js').getLogger();

function getAttrKey (attr) {
    var p, res;
    for (p in attr) {
        if (Object.prototype.hasOwnProperty.call(attr, p)) {
            res = p;
            break;
        }
    }
    return res;
}

module.exports = function () {

    // setup connection pool
    var pool  = mysql.createPool({
            connectionLimit: 10,
            host           : '127.0.0.1',
            database       : 'mobiletrack',
            user           : 'root',
            password       : ''
        });

    // insert device record
    var insertDevice = function (data, callback) {
        pool.query('insert ignore into devices set ?', {
            uuid: data.deviceId,
            model: data.deviceModel,
            name: data.deviceName,
            created: new Date(data.startTime)
        }, function (err, result) {
            data.devicePKId = result.insertId;
            callback(err, data);
        });
    };

    // get new/existing device id
    var getDeviceId = function (data, callback) {
        if (data.devicePKId > 0) {
            callback(null, data);
        } else {
            // same device already exists
            pool.query('select id from devices where uuid = ?', [data.deviceId], function (err, rows) {
                data.devicePKId = rows[0].id;
                callback(err, data);
            });
        }
    };

    // insert app version
    var insertAppVersion = function (data, callback) {
        pool.query('insert ignore into apps set ?', {
            app_key: data.appKey,
            app_version: data.appVersion,
            sdk_version: data.SDKVersion,
            created: new Date(data.startTime)
        }, function (err, result) {
            data.appPKId = result.insertId;
            callback(err, data);
        });
    };

    // get app version id
    var getAppVersionId = function (data, callback) {
        if (data.appPKId > 0) {
            callback(null, data);
        } else {
            // same device already exists
            pool.query(
                'select id from apps where app_key = ? and app_version = ?',
                [data.appKey, data.appVersion],
                function (err, rows) {
                    data.appPKId = rows[0].id;
                    callback(err, data);
                }
            );
        }
    };

    // insert session
    var insertSession = function (data, callback) {
        pool.query('insert ignore into sessions set ?', {
            uuid: data.sessionId,
            device_id: data.devicePKId,
            app_id: data.appPKId,
            start_time: new Date(data.startTime),
            end_time: new Date(data.endTime),
            duration: data.endTime - data.startTime,
            page_count: data.pageViews.length,
            event_count: data.events.length
        }, function (err, result) {
            data.sessionPKId = result.insertId;
            callback(err, data);
        });
    };

    var getSessionId = function (data, callback) {
        if (data.sessionPKId > 0) {
            callback(null, data);
        } else {
            // same device already exists
            pool.query(
                'select id from sessions where uuid = ?',
                [data.sessionId],
                function (err, rows) {
                    data.sessionPKId = rows[0].id;
                    callback(err, data);
                }
            );
        }
    };

    // insert page views
    var insertPageviews = function (data, callback) {
        async.map(data.pageViews, function (pv, cb) {
            pool.query('insert ignore into pageviews set ?', {
                device_id: data.devicePKId,
                app_id: data.appPKId,
                session_id: data.sessionPKId,
                name: pv.pageName,
                start_time: new Date(pv.startTime),
                end_time: new Date(pv.endTime),
                duration: pv.endTime - pv.startTime
            }, function (err, result) {
                pv.pagePKId = result.insertId;
                cb(err, pv);
            });
        }, function (err, result) {
            data.pageViews = result;
            callback(err, data);
        });
    };

    // insert events
    var insertEvents = function (data, callback) {

        async.map(data.events, function (evt, cb) {
            var evtDbObj = {
                device_id: data.devicePKId,
                app_id: data.appPKId,
                session_id: data.sessionPKId,
                name: evt.eventId,
                label: evt.label,
                key: evt.keyName,
                start_time: new Date(evt.startTime),
                end_time: new Date(evt.endTime),
                duration: evt.endTime - evt.startTime,
                count: evt.count
            };

            _.each(evt.attributes, function (attr, index) {
                var key = getAttrKey(attr);
                evtDbObj["attr_key_" + (index + 1)] = key;
                evtDbObj["attr_val_" + (index + 1)] = attr[key];
            });

            pool.query('insert ignore into events set ?', evtDbObj, function (err, result) {
                evt.eventPKId = result.insertId;
                cb(err, evt);
            });
        }, function (err, result) {
            data.events = result;
            callback(err, data);
        });

    };

    var feedSession = function (data, cb) {

        async.waterfall([
            function (callback) { callback(null, data); },
            insertDevice,
            getDeviceId,
            insertAppVersion,
            getAppVersionId,
            insertSession,
            getSessionId,
            insertPageviews,
            insertEvents
        ], function (err, result) {
            log.info(result.sessionId);
            cb(err, result);
        });
    };

    // walk data dir
    var walker = walk.walk("./data/2014/1/01", {});

    walker.on("file", function (root, fileStats, next) {

        var filePath = path.join(root, fileStats.name),
            json = jsonfile.readFileSync(filePath);

        // log.info(json.sessionId);
        feedSession(json, function (err, result) {
            next();
        });
    });

    walker.on("errors", function (root, nodeStatsArray, next) {
        next();
    });

    walker.on("end", function () {
        log.info("all done");

        pool.end(function (err) {
            log.info("closing connection pool");
        });
    });
};