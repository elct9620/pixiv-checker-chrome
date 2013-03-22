###
# Global Variables
###

SETTINGS = {}

SETTINGS.bookmark_url = "http://www.pixiv.net/bookmark_new_illust.php"
SETTINGS.reload_time = 5 # 5 Minutes
SETTINGS.max_page = 5 # Pixiv max show 20 * 100 ( = 2000 ) new illustation

browserAction = chrome.browserAction
storage = chrome.storage.local # Development Version use local version
alarms = chrome.alarms
tabs = chrome.tabs

###
# Initialize Chrome Extension
###

browserAction.setBadgeBackgroundColor({color: "#0072bc"}); # Badge Background Color

###
# Functions
###

save = (obj, callback) ->
  storage.set(obj, callback)

load = (callback) ->
  storage.get(callback)

makeNotice = (icon, title, message) ->
  webkitNotifications.createNotification icon, title, message


updateCount = (count) ->
  if count is 0
    count = ""

  browserAction.setBadgeText {text: count.toString()}

checkNewIllustation = (page, callback) ->
  url = SETTINGS.bookmark_url
  page = page + 0 || 1
  if page > 1
    url += "?p=#{page}"

  if page > SETTINGS.max_page
    callback 0
    return 0

  count = 0
  reache_last_check = false

  load (data) ->
    last_check = data.last_check || 0

    $.get url, (html) ->
      html = html.replace(/<(img|link|script|iframe)[^>]*>/g,""); # remove not needless resource, it may be improve by cut some html part
      data = $(html)

      illustations = data.find('.image-items li')

      illustations.each (i, v) ->
        item = $(v)
        link = item.find('.work').attr('href')
        illust_id = link.substr(link.indexOf('illust_id=') + 10)

        if i is 0 and page is 1
          save({latest_check: illust_id})

        if last_check.toString() isnt illust_id.toString()
          count++
        else
          reache_last_check = true
          return false

      if not reache_last_check and last_check isnt 0
        checkNewIllustation page + 1, (next_page_count) ->
          count += next_page_count
          callback count
        return

      callback count
    , "html"

###
# Events
###

browserAction.onClicked.addListener (tab) ->
  tabs.create {url: SETTINGS.bookmark_url}, ->
    load (data) ->
      updateCount(0)
      save {count: 0, last_check: data.latest_check}

alarms.onAlarm.addListener ->
  current_count = 0
  load (data) ->
    current_count = data.count

    checkNewIllustation 1, (count) ->
      if count > current_count
        updateCount count
        makeNotice("img/icon_48.png", "New Illustation", "You have #{count} illustations not viewed").show()
        save {count: count}

      alarms.create {delayInMinutes: SETTINGS.reload_time}

###
# Bootstrap
###

checkNewIllustation 1, (count) ->
  updateCount count
  alarms.create {delayInMinutes: SETTINGS.reload_time}

