'use strict';

var log   = require('log4js').getLogger(),
    Random = require('random-js'),
    fs = require('fs'),
    path = require('path'),
    r = new Random(Random.engines.mt19937().autoSeed()),
    _ = require('lodash');

// constants
var startDate = new Date('2014-1-1'),
    endDate = new Date('2014-7-1'),
    dailyUsersMin = 80,
    dailyUsersMax = 120,
    lifeMin = 50,
    lifeMax = 70,
    appKey = '5555dcee67e58e9646000a25',
    SDKVersion = '1.0.0',
    AppVerson = '1.0.0',
    activeness = [ 2, 1, 1, 1, 1, 1,
                   2, 3, 9, 6, 5, 4,
                   3, 2, 2, 2, 2, 2,
                   3, 3, 2, 2, 2, 2 ],
    activenessMap = [],
    models = [ 'iPhone', 'iPad'],
    OSs = [ '8.3', '8.2', '8.1.3', '8.1.2', '8.1.1', '8.1', '7.1.2', '7.1.1', '7.1', '7.0.4' ],
    pagePaths = [ [ 'Home', 'SingleGame', 'PlaySingleGame' ],
                  [ 'Home', 'OnlineGame', 'PlayOnlineGame' ] ],
    eventTypes = [ 'startEvent', 'pauseEvent', 'stopEvent' ],
    eventKey = 'testKey',
    dataDir = './data';

// generate hour map
_.each(activeness, function (val, index) {
    var i;
    for (i = 0; i < val; i++) {
        activenessMap.push(index);
    }
});

function mkdirpSync (dirpath) {
    var parts = dirpath.split(path.sep),
        i;
    for (i = 1; i <= parts.length; i++ ) {
        try {
            fs.mkdirSync(path.join.apply(null, parts.slice(0, i)));
        } catch (e) {}
    }
}

function saveSessionData(session) {
    var dt = new Date(session.startTime),
        year = '' + dt.getFullYear(),
        month = '' + (dt.getMonth() + 1),
        date = dt.getDate() < 10? '0' + dt.getDate(): '' + dt.getDate(),
        ts = dt.getTime(),
        dir = path.join(dataDir, year, month, date),
        file = path.join(dir, ts + '-' + session.sessionId + '.json'),
        jsonStr;

    // create folder
    mkdirpSync(dir);

    // save file
    jsonStr = JSON.stringify(session, null, 4);
    fs.writeFileSync(file, jsonStr);

    // log.info('created file: ' + file);
}

function generateSession(startTime, deviceId, model, os) {
    var session = {
        "deviceId": deviceId,
        "deviceModel": model,
        "deviceName": "test device - " + deviceId,
        "SDKVersion": SDKVersion,
        "OSVersion": os,
        "sessionId": r.uuid4(),
        "appKey": appKey,
        "appVersion": AppVerson,
        "startTime": startTime,
        "pageViews": [],
        "events": []
    };

    var pagePath = pagePaths[r.integer(0, pagePaths.length - 1)],
        pages = r.integer(1, 3),
        eventCnt = r.integer(0, 5),
        pageView,
        eventData,
        eventType,
        attr,
        curTime = startTime,
        i;

    // page views
    for (i = 0; i < pages; i++) {
        pageView = {
            pageName: pagePath[i]
        };

        curTime += r.integer(500, 1000);
        pageView.startTime = curTime;

        curTime += r.integer(2000, 10000);
        pageView.endTime = curTime;

        session.pageViews.push(pageView);
    }

    // events
    for (i = 0; i < eventCnt; i++) {
        eventType = eventTypes[r.integer(0, eventTypes.length - 1)];
        eventData = {
            eventId: eventType,
            label: eventType,
            keyName: eventKey,
            count: r.integer(1, 3),
            attributes: []
        };

        attr = {};
        attr['key_' + r.integer(1, 5)] = 'value_' + r.integer(1, 5);
        eventData.attributes.push(attr);

        curTime += r.integer(2000, 10000);
        eventData.startTime = curTime;

        curTime += r.integer(2000, 10000);
        eventData.endTime = curTime;

        session.events.push(eventData);
    }

    curTime += r.integer(2000, 10000);
    session.endTime = curTime;

    // log.info(session);

    saveSessionData(session);
}

function simulateUser(startDate, deviceId, days, model, os) {

    var i,
        j,
        sessCnt,
        lucky,
        startTime;

    log.info("simulating device: " + deviceId);

    for (i = 0; i < days; i++) {
        sessCnt = r.integer(0, 4);
        for (j = 0; j < sessCnt; j++) {

            lucky = r.integer(0, 100 * (days - i) / days);
            if (lucky >= 25) {
                // lucky enough, then generate one session
                startTime = startDate.getTime() + activenessMap[r.integer(0, activenessMap.length - 1)] * 3600000 + r.integer(0, 3600000) + i * 3600000 * 24;
                generateSession(startTime, deviceId, model, os);
            }
        }
    }
}

module.exports = function () {

    var curDate = startDate,
        dailyUsers,
        i,
        model,
        OS;

    while (curDate < endDate) {
        dailyUsers = r.integer(dailyUsersMin, dailyUsersMax);

        for (i = 0; i < dailyUsers; i++) {
            model = models[r.integer(0, models.length - 1)];
            OS = OSs[r.integer(0, OSs.length - 1)];
            simulateUser(curDate, r.uuid4(), r.integer(lifeMin, lifeMax), model, OS);
        }

        curDate = new Date(curDate.getTime() + 24 * 3600 * 1000);
    }
};
