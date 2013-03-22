/*
# Global Variables
*/


(function() {
  var SETTINGS, alarms, browserAction, checkNewIllustation, load, makeNotice, save, storage, tabs, updateCount;

  SETTINGS = {};

  SETTINGS.bookmark_url = "http://www.pixiv.net/bookmark_new_illust.php";

  SETTINGS.reload_time = 5;

  SETTINGS.max_page = 5;

  browserAction = chrome.browserAction;

  storage = chrome.storage.local;

  alarms = chrome.alarms;

  tabs = chrome.tabs;

  /*
  # Initialize Chrome Extension
  */


  browserAction.setBadgeBackgroundColor({
    color: "#0072bc"
  });

  /*
  # Functions
  */


  save = function(obj, callback) {
    return storage.set(obj, callback);
  };

  load = function(callback) {
    return storage.get(callback);
  };

  makeNotice = function(icon, title, message) {
    return webkitNotifications.createNotification(icon, title, message);
  };

  updateCount = function(count) {
    if (count === 0) {
      count = "";
    }
    return browserAction.setBadgeText({
      text: count.toString()
    });
  };

  checkNewIllustation = function(page, callback) {
    var count, reache_last_check, url;

    url = SETTINGS.bookmark_url;
    page = page + 0 || 1;
    if (page > 1) {
      url += "?p=" + page;
    }
    if (page > SETTINGS.max_page) {
      callback(0);
      return 0;
    }
    count = 0;
    reache_last_check = false;
    return load(function(data) {
      var last_check;

      last_check = data.last_check || 0;
      return $.get(url, function(html) {
        var illustations;

        html = html.replace(/<(img|link|script|iframe)[^>]*>/g, "");
        data = $(html);
        illustations = data.find('.image-items li');
        illustations.each(function(i, v) {
          var illust_id, item, link;

          item = $(v);
          link = item.find('.work').attr('href');
          illust_id = link.substr(link.indexOf('illust_id=') + 10);
          if (i === 0 && page === 1) {
            save({
              latest_check: illust_id
            });
          }
          if (last_check.toString() !== illust_id.toString()) {
            return count++;
          } else {
            reache_last_check = true;
            return false;
          }
        });
        if (!reache_last_check && last_check !== 0) {
          checkNewIllustation(page + 1, function(next_page_count) {
            count += next_page_count;
            return callback(count);
          });
          return;
        }
        return callback(count);
      }, "html");
    });
  };

  /*
  # Events
  */


  browserAction.onClicked.addListener(function(tab) {
    return tabs.create({
      url: SETTINGS.bookmark_url
    }, function() {
      return load(function(data) {
        updateCount(0);
        return save({
          count: 0,
          last_check: data.latest_check
        });
      });
    });
  });

  alarms.onAlarm.addListener(function() {
    var current_count;

    current_count = 0;
    return load(function(data) {
      current_count = data.count;
      return checkNewIllustation(1, function(count) {
        if (count > current_count) {
          updateCount(count);
          makeNotice("img/icon_48.png", "New Illustation", "You have " + count + " illustations not viewed").show();
          save({
            count: count
          });
        }
        return alarms.create({
          delayInMinutes: SETTINGS.reload_time
        });
      });
    });
  });

  /*
  # Bootstrap
  */


  checkNewIllustation(1, function(count) {
    updateCount(count);
    return alarms.create({
      delayInMinutes: SETTINGS.reload_time
    });
  });

}).call(this);
