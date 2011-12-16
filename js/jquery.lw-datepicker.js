(function() {
  /*!
   * Lightweight DatePicker - jQuery Plugin
   * Provides themeable and customizable date picker
   *
   * © 2011 Maxim Zhukov (zhkv.mxm@gmail.com)
   * 
   * Version: 1.0+
   * Requires: jQuery v1.6+
   *
   * Dual licensed under the MIT and GPL licenses:
   *   http://www.opensource.org/licenses/mit-license.php
   *   http://www.gnu.org/licenses/gpl.html
   */
  var $, LW_DP_ACTIVE_DAY_CLASS, LW_DP_CLASS, LW_DP_DATA_KEY, LW_DP_DOWS_CLASS, LW_DP_DOWS_LAST_COLUMN_CLASS, LW_DP_FIRSTWEEK_CLASS, LW_DP_HIDDEN_CLASS, LW_DP_LASTWEEK_CLASS, LW_DP_MONTH_CLASS, LW_DP_NEIGHBOUR_MONTH_DAY_CLASS, LW_DP_NEXT_CLASS, LW_DP_OUT_OF_INTERVAL_CLASS, LW_DP_PREVIOUS_CLASS, LW_DP_TODAY_CLASS, LW_DP_TOOLBAR_CLASS, LW_DP_WEEKEND_CLASS, LW_DP_WEEK_CLASS, LW_DP_WEEK_LAST_COLUMN_CLASS, LightweightDatepicker, compareDates, isDateValid, settings;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = jQuery;
  settings = {
    'startDate': null,
    'endDate': null,
    'dowNames': ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    'monthNames': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    'firstDayOfTheWeekIndex': 0,
    'autoFillToday': false,
    'alwaysVisible': false,
    'autoHideAfterClick': false,
    'parseDate': null,
    'formatDate': null,
    'onChange': null
  };
  LW_DP_CLASS = 'lw-dp';
  LW_DP_ACTIVE_DAY_CLASS = 'lw-dp-active-day';
  LW_DP_DOWS_CLASS = 'lw-dp-dows';
  LW_DP_DOWS_LAST_COLUMN_CLASS = 'lw-dp-dows-last-column';
  LW_DP_FIRSTWEEK_CLASS = 'lw-dp-firstweek';
  LW_DP_HIDDEN_CLASS = 'lw-dp-hidden';
  LW_DP_LASTWEEK_CLASS = 'lw-dp-lastweek';
  LW_DP_MONTH_CLASS = 'lw-dp-month';
  LW_DP_NEIGHBOUR_MONTH_DAY_CLASS = 'lw-dp-neighbour-month-day';
  LW_DP_NEXT_CLASS = 'lw-dp-next';
  LW_DP_OUT_OF_INTERVAL_CLASS = 'lw-dp-out-of-interval';
  LW_DP_PREVIOUS_CLASS = 'lw-dp-previous';
  LW_DP_TODAY_CLASS = 'lw-dp-today';
  LW_DP_TOOLBAR_CLASS = 'lw-dp-toolbar';
  LW_DP_WEEK_CLASS = 'lw-dp-week';
  LW_DP_WEEK_LAST_COLUMN_CLASS = 'lw-dp-week-last-column';
  LW_DP_WEEKEND_CLASS = 'lw-dp-weekend';
  LW_DP_DATA_KEY = 'lw-datepicker';
  compareDates = function(date1, date2) {
    if (date1.getFullYear() < date2.getFullYear()) {
      return -1;
    }
    if (date1.getFullYear() > date2.getFullYear()) {
      return 1;
    }
    if (date1.getMonth() < date2.getMonth()) {
      return -1;
    }
    if (date1.getMonth() > date2.getMonth()) {
      return 1;
    }
    if (date1.getDate() < date2.getDate()) {
      return -1;
    }
    if (date1.getDate() > date2.getDate()) {
      return 1;
    }
    return 0;
  };
  isDateValid = function(date) {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
      return false;
    }
    return !isNaN(date.getTime());
  };
  LightweightDatepicker = (function() {
    LightweightDatepicker.prototype.input = null;
    LightweightDatepicker.prototype.activeDate = null;
    LightweightDatepicker.prototype.canSelectPreviousMonth = true;
    LightweightDatepicker.prototype.canSelectNextMonth = true;
    LightweightDatepicker.prototype.shouldHide = true;
    function LightweightDatepicker(el, settings) {
      this.handleKeyDown = __bind(this.handleKeyDown, this);
      this.show = __bind(this.show, this);
      this.hide = __bind(this.hide, this);
      this.onChange = __bind(this.onChange, this);
      this.onPreviousClick = __bind(this.onPreviousClick, this);
      this.onNextClick = __bind(this.onNextClick, this);
      this.isDateInsidePeriod = __bind(this.isDateInsidePeriod, this);
      this.setDate = __bind(this.setDate, this);
      this.updateMonth = __bind(this.updateMonth, this);
      this.getDateFromElement = __bind(this.getDateFromElement, this);      this.input = el;
      this.input.bind('focus', this.show);
      this.input.bind('blur', this.hide);
      this.input.bind('keydown', this.handleKeyDown);
      this.input.bind('change', this.onChange);
      this.input.bind('click', __bind(function() {
        if (!$('body').children("." + LW_DP_CLASS).has(this.wrapper).length) {
          return this.show();
        }
      }, this));
      this.isIE = $.browser.msie && parseInt($.browser.version) <= 8;
      this.input.data(LW_DP_DATA_KEY, true);
      this.settings = {
        startDate: settings['startDate'],
        endDate: settings['endDate'],
        dowNames: settings['dowNames'],
        monthNames: settings['monthNames'],
        firstDayOfTheWeekIndex: settings['firstDayOfTheWeekIndex'],
        autoFillToday: settings['autoFillToday'],
        alwaysVisible: settings['alwaysVisible'],
        autoHideAfterClick: settings['autoHideAfterClick'],
        parseDate: settings['parseDate'],
        formatDate: settings['formatDate'],
        onChange: settings['onChange']
      };
      this.activeDate = new Date;
      this.todayDate = new Date;
      this.currentDate = new Date;
      this.createDatepicker();
      this.wrapper.appendTo(document.body);
      this.margin = parseInt(this.wrapper.css('margin-top'), 10);
      this.wrapper.css('margin', 0);
      this.bindEvents();
      if (this.settings.alwaysVisible) {
        this.updatePosition();
      }
      this.updateInput();
      this.updateMonth();
      this.hide();
      this.setDate(new Date(2011, 11, 13));
    }
    LightweightDatepicker.prototype.createDatepicker = function() {
      this.wrapper = $("<div class=" + LW_DP_CLASS + "/>");
      this.toolbar = $("<div class=" + LW_DP_TOOLBAR_CLASS + "/>").appendTo(this.wrapper);
      this.previous = $("<div class=" + LW_DP_PREVIOUS_CLASS + ">◄</div>").appendTo(this.toolbar);
      this.next = $("<div class=" + LW_DP_NEXT_CLASS + ">►</div>").appendTo(this.toolbar);
      this.month = $("<div class=" + LW_DP_MONTH_CLASS + "/>").appendTo(this.toolbar);
      this.renderDows().appendTo(this.wrapper);
      return this.days = $('<div/>').appendTo(this.wrapper);
    };
    LightweightDatepicker.prototype.bindEvents = function() {
      var event;
      this.wrapper.bind('mousedown', __bind(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.isIE) {
          return this.shouldHide = false;
        }
      }, this));
      event = this.isIE ? 'mousedown' : 'click';
      this.wrapper.delegate("." + LW_DP_NEXT_CLASS, event, this.onNextClick);
      this.wrapper.delegate("." + LW_DP_PREVIOUS_CLASS, event, this.onPreviousClick);
      return $(this.days).delegate("li:not(." + LW_DP_ACTIVE_DAY_CLASS + ")", event, __bind(function(e) {
        var currentLi;
        currentLi = $(e.currentTarget);
        this.setDate(this.getDateFromElement(currentLi));
        if (this.settings.autoHideAfterClick) {
          this.hide();
        }
        if (typeof this.settings.onChange === 'function') {
          return this.settings.onChange(this.activeDate);
        }
      }, this));
    };
    LightweightDatepicker.prototype.getDateFromElement = function(el) {
      var currentDay, currentMonth, currentYear, diff;
      currentDay = el.text();
      currentYear = this.currentDate.getFullYear();
      diff = 0;
      if (el.hasClass(LW_DP_NEIGHBOUR_MONTH_DAY_CLASS)) {
        diff = currentDay > 10 ? -1 : 1;
      }
      currentMonth = this.currentDate.getMonth() + diff;
      return new Date(currentYear, currentMonth, currentDay);
    };
    LightweightDatepicker.prototype.updateInput = function() {
      return this.input.val(this.formatDate(this.activeDate));
    };
    LightweightDatepicker.prototype.updateMonth = function() {
      var cd, date, day, daysInFirstWeek, daysInMonth, daysInPreviousMonth, firstDayDow, firstDayOfNextMonth, html, lastDayOfPreviousMonth, lastDowIndex, renderDay, week, weeks;
      this.month.html(this.settings.monthNames[this.currentDate.getMonth()] + ', ' + this.currentDate.getFullYear());
      cd = this.currentDate;
      lastDayOfPreviousMonth = new Date(cd.getFullYear(), cd.getMonth(), 0);
      if ((this.settings.startDate != null) && lastDayOfPreviousMonth.getTime() < this.settings.startDate.getTime()) {
        this.canSelectPreviousMonth = false;
        $(this.previous).hide();
      } else {
        this.canSelectPreviousMonth = true;
        $(this.previous).show();
      }
      firstDayOfNextMonth = new Date(cd.getFullYear(), cd.getMonth() + 1, 1);
      if ((this.settings.endDate != null) && firstDayOfNextMonth.getTime() > this.settings.endDate.getTime()) {
        this.canSelectNextMonth = false;
        $(this.next).hide();
      } else {
        this.canSelectNextMonth = true;
        $(this.next).show();
      }
      firstDayDow = (new Date(cd.getFullYear(), cd.getMonth(), 1)).getDay();
      lastDowIndex = (this.settings.firstDayOfTheWeekIndex + 6) % 7;
      daysInFirstWeek = (7 - firstDayDow + this.settings.firstDayOfTheWeekIndex) % 7;
      if (daysInFirstWeek === 0) {
        daysInFirstWeek = 7;
      }
      daysInPreviousMonth = lastDayOfPreviousMonth.getDate();
      date = new Date(cd.getFullYear(), cd.getMonth(), daysInFirstWeek - 6);
      daysInMonth = (new Date(cd.getFullYear(), cd.getMonth() + 1, 0)).getDate();
      weeks = Math.ceil((daysInMonth + 7 - daysInFirstWeek) / 7.0);
      renderDay = __bind(function(day) {
        var classAttribute, classes, liContent;
        classes = [];
        classAttribute = '';
        liContent = day.getDate();
        if (day.getMonth() !== cd.getMonth()) {
          classes.push(LW_DP_NEIGHBOUR_MONTH_DAY_CLASS);
        }
        if (day.getDay() === 0 || day.getDay() === 6) {
          classes.push(LW_DP_WEEKEND_CLASS);
        }
        if (day.getDay() === lastDowIndex) {
          classes.push(LW_DP_WEEK_LAST_COLUMN_CLASS);
        }
        if (compareDates(day, this.todayDate) === 0) {
          classes.push(LW_DP_TODAY_CLASS);
          liContent = "<span>" + liContent + "</span>";
        }
        if ((this.activeDate != null) && compareDates(day, this.activeDate) === 0) {
          classes.push(LW_DP_ACTIVE_DAY_CLASS);
        }
        if (!this.isDateInsidePeriod(date)) {
          classes.push(LW_DP_OUT_OF_INTERVAL_CLASS);
          liContent = '';
        }
        if (classes.length) {
          classAttribute = " class='" + (classes.join(" ")) + "'";
        }
        day.setDate(day.getDate() + 1);
        return "<li" + classAttribute + ">" + liContent + "</li>";
      }, this);
      html = '';
      for (week = 1; 1 <= weeks ? week <= weeks : week >= weeks; 1 <= weeks ? week++ : week--) {
        if (week === 1) {
          html += "<ul class='" + LW_DP_WEEK_CLASS + " " + LW_DP_FIRSTWEEK_CLASS + "'>";
        } else if (week === weeks) {
          html += "<ul class='" + LW_DP_WEEK_CLASS + " " + LW_DP_LASTWEEK_CLASS + "'>";
        } else {
          html += "<ul class=" + LW_DP_WEEK_CLASS + ">";
        }
        for (day = 1; day <= 7; day++) {
          html += renderDay(date);
        }
        html += '</ul>';
      }
      return this.days.html(html);
    };
    LightweightDatepicker.prototype.setDate = function(date) {
      var activeLi, oldDate;
      if (!isDateValid(date)) {
        return false;
      }
      if (!this.isDateInsidePeriod(date)) {
        return false;
      }
      oldDate = this.activeDate;
      this.currentDate = this.activeDate = date;
      if (date.getFullYear() === oldDate.getFullYear() && date.getMonth() === oldDate.getMonth()) {
        this.days.find("li." + LW_DP_ACTIVE_DAY_CLASS).removeClass(LW_DP_ACTIVE_DAY_CLASS);
        activeLi = this.days.find("li:not(." + LW_DP_NEIGHBOUR_MONTH_DAY_CLASS + ")").filter(function() {
          return parseInt($(this).text(), 10) === date.getDate();
        });
        activeLi.addClass(LW_DP_ACTIVE_DAY_CLASS);
      } else {
        this.updateMonth();
      }
      return this.updateInput();
    };
    LightweightDatepicker.prototype.isDateInsidePeriod = function(date) {
      if ((this.settings.startDate != null) && (compareDates(date, this.settings.startDate) === -1)) {
        return false;
      }
      if ((this.settings.endDate != null) && (compareDates(date, this.settings.endDate) === 1)) {
        return false;
      }
      return true;
    };
    LightweightDatepicker.prototype.parseDate = function(string) {
      if (typeof this.settings.parseDate === 'function') {
        return this.settings.parseDate(string);
      } else {
        return new Date(Date.parse(string));
      }
    };
    LightweightDatepicker.prototype.formatDate = function(date) {
      if (typeof this.settings.formatDate === 'function') {
        return this.settings.formatDate(date);
      } else {
        if (date != null) {
          return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        } else {
          return '';
        }
      }
    };
    LightweightDatepicker.prototype.onNextClick = function() {
      return this.updateMonth(1);
    };
    LightweightDatepicker.prototype.onPreviousClick = function() {
      return this.updateMonth(-1);
    };
    LightweightDatepicker.prototype.renderDows = function() {
      var day, first, found, html, name, temp, _i, _len, _ref;
      first = this.settings.dowNames[this.settings.firstDayOfTheWeekIndex];
      found = false;
      html = "<ul class=" + LW_DP_DOWS_CLASS + ">";
      temp = '';
      _ref = this.settings.dowNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (name === first) {
          found = true;
        }
        day = "<li>" + name + "</li>";
        if (found) {
          html += day;
        } else {
          temp += day;
        }
      }
      html += temp;
      html += '</ul>';
      return $(html);
    };
    LightweightDatepicker.prototype.updatePosition = function() {
      var inputOffset, left, top, wrapperOuterHeight, wrapperOuterWidth;
      inputOffset = this.input.offset();
      wrapperOuterWidth = this.wrapper.outerWidth();
      wrapperOuterHeight = this.wrapper.outerHeight();
      left = inputOffset.left;
      if ($('body').width() > left + wrapperOuterWidth) {
        this.wrapper.css({
          'left': left
        });
      } else {
        if (inputOffset.left > wrapperOuterWidth + this.margin) {
          this.wrapper.css({
            'left': inputOffset.left - wrapperOuterWidth - this.margin
          });
        } else {
          this.wrapper.css({
            'left': left
          });
        }
      }
      top = inputOffset.top + this.input.outerHeight() + this.margin;
      if ($(document).height() > top + wrapperOuterHeight) {
        return this.wrapper.css({
          'top': top
        });
      } else {
        if (inputOffset.top > wrapperOuterHeight + this.margin) {
          return this.wrapper.css({
            'top': inputOffset.top - wrapperOuterHeight - this.margin
          });
        } else {
          return this.wrapper.css({
            'top': top
          });
        }
      }
    };
    LightweightDatepicker.prototype.onChange = function() {
      this.updateMonth();
      return this.updateInput();
    };
    LightweightDatepicker.prototype.hide = function() {
      var _ref;
      if (!this.settings.alwaysVisible && this.shouldHide) {
        this.wrapper.detach();
      }
      if (!this.shouldHide) {
        if ((_ref = this.input) != null) {
          _ref.focus();
        }
      }
      return this.shouldHide = true;
    };
    LightweightDatepicker.prototype.show = function() {
      this.wrapper.appendTo(document.body);
      this.updatePosition();
      return this.updateMonth();
    };
    LightweightDatepicker.prototype.changeMonth = function() {
      var activeDate, activeIndex, days;
      if (this.activeDate != null) {
        activeIndex = this.activeDate.getDate() - 1;
        activeDate = new Date(this.activeDate.getTime());
        activeDate.setMonth(this.currentDate.getMonth());
        activeDate.setFullYear(this.currentDate.getFullYear());
        days = $(this.days).find("li:not(." + LW_DP_NEIGHBOUR_MONTH_DAY_CLASS + ")");
        if (days.length <= activeIndex) {
          return this.selectDay(days.last(), false);
        } else if ((this.settings.endDate != null) && activeDate.getTime() > this.settings.endDate.getTime()) {
          return this.selectDay(days.eq(this.settings.endDate.getDate() - 2), false);
        } else if ((this.settings.startDate != null) && activeDate.getTime() < this.settings.startDate.getTime()) {
          return this.selectDay(days.eq(this.settings.startDate.getDate()), false);
        } else {
          return this.selectDay(days.eq(activeIndex), false);
        }
      }
    };
    LightweightDatepicker.prototype.handleKeyDown = function(e) {
      var handled, keyCode;
      keyCode = e.keyCode;
      handled = true;
      switch (keyCode) {
        case 27:
          this.input.blur();
          break;
        case 33:
          if (this.canSelectPreviousMonth) {
            this.onPreviousClick();
            this.changeMonth();
          }
          break;
        case 34:
          if (this.canSelectNextMonth) {
            this.onNextClick();
            this.changeMonth();
          }
          break;
        case 38:
          this.setDate(new Date(this.activeDate.getFullYear(), this.activeDate.getMonth(), this.activeDate.getDate() - 1));
          break;
        case 40:
          this.setDate(new Date(this.activeDate.getFullYear(), this.activeDate.getMonth(), this.activeDate.getDate() + 1));
          break;
        default:
          handled = false;
      }
      return !handled;
    };
    return LightweightDatepicker;
  })();
  $.fn['lwDatepicker'] = function(options) {
    options = $.extend(settings, options);
    return this.each(function() {
      var $el;
      $el = $(this);
      if (($el.is('input, textarea')) && !$el.data(LW_DP_DATA_KEY)) {
        return new LightweightDatepicker($el, options);
      }
    });
  };
}).call(this);
