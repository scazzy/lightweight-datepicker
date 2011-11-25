# References jQuery
$ = jQuery

settings = 
  multiple: false
  onChange: null
  firstDayOfTheWeekIndex: 1
  autoFillToday: false
  autoHideAfterClick: false
  alwaysVisible: false
  parseDate: null
  formatDate: null
  startDate: null
  endDate: null
  # startDate: new Date 2011, 9, 15
  # endDate: new Date 2012, 1, 15
  dowNames: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
  # dowNames: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  # monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  #   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  margin: 6

checkEqualDates = (date1, date2) ->
  return false if date1.getFullYear() isnt date2.getFullYear()
  return false if date1.getMonth() isnt date2.getMonth() 
  date1.getDate() is date2.getDate()

class LightweightDatepicker

  currentInput: null
  activeDate: null
  canSelectPreviousMonth: true
  canSelectNextMonth: true
  shouldHide: true

  constructor: (settings) ->
    @settings = settings
    @isIE = $.browser.msie and parseInt($.browser.version) <= 8

    @todayDate = new Date
    @currentDate = new Date
    # @currentDate = new Date 2021, 1, 1 # February 2021 takes 4 rows
    # @currentDate = new Date 2012, 0, 1 # January 2012 takes 6 rows

    @wrapper = $ '<div class="lw-dp"/>'
    @toolbar = $('<div class="lw-dp-toolbar"/>').appendTo @wrapper
    @previous = $('<div class="lw-dp-previous">◄</div>').appendTo @toolbar
    @next = $('<div class="lw-dp-next">►</div>').appendTo @toolbar
    @month = $('<div class="lw-dp-month"/>').appendTo @toolbar
    @renderDows().appendTo @wrapper
    @days = $('<div />').appendTo @wrapper

    @updateMonth()

    @wrapper.bind 'mousedown', (e) =>
      e.preventDefault()
      e.stopPropagation()
      if @isIE then @shouldHide = false

    # Events binding
    event = if @isIE then 'mousedown' else 'click'
    @wrapper.delegate '.lw-dp-next', event, @onNextClick
    @wrapper.delegate '.lw-dp-previous', event, @onPreviousClick
    $(@days).delegate 'li:not(.lw-dp-active-day)', event, (e) =>
      currentLi = $(e.currentTarget)
      @selectDay currentLi
      # if @isIE
      #   setTimeout =>
      #     @currentInput?.focus()
      # e.preventDefault()
      # e.stopPropagation()

    @wrapper.appendTo document.body

  # Changes active day
  selectDay: (currentLi, fromEvent = true) ->
    year = @currentDate.getFullYear()
    month = @currentDate.getMonth()
    day = parseInt currentLi.text()
    diff = 0

    if currentLi.hasClass('lw-dp-neighbour-month-day')
      diff = if day > 10 then -1 else 1

    selectedDate = new Date year, month + diff, day
      
    if not @settings.startDate? or selectedDate.getTime() >= @settings.startDate.getTime()
      if not @settings.endDate? or selectedDate.getTime() <= @settings.endDate.getTime()
        currentLi.parent().parent().find('li').removeClass 'lw-dp-active-day'
        currentLi.addClass 'lw-dp-active-day'
        @activeDate = selectedDate
        if diff isnt 0 then @updateMonth diff  

    @updateInput()

    if @settings.autoHideAfterClick and fromEvent
      @currentInput?.blur()

    if typeof @settings.onChange is 'function'
      @settings.onChange @currentInput, @activeDate  

  # Changes value of binded input to active date
  updateInput: ($el = @currentInput) ->
    $el?.val @formatDate @activeDate
  
  # Parses string to Date object
  parseDate: (string) ->
    if typeof @settings.parseDate is 'function'
      @settings.parseDate string
    else
      new Date (Date.parse string)

  # Format date as text
  formatDate: (date) ->
    if typeof @settings.formatDate is 'function'
      @settings.formatDate date
    else
      if date?
      # By default in USA format: M/d/yyyy
        (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear()
      else
        ''

  # Show next month
  onNextClick: =>
    @updateMonth 1

  # Show previous month
  onPreviousClick: =>
    @updateMonth -1

  # Render month
  updateMonth: (diff = 0) =>
    @currentDate.setMonth @currentDate.getMonth() + diff
    
    # Updating month name and year
    @month.html @settings.monthNames[@currentDate.getMonth()] + ', ' + @currentDate.getFullYear()

    # Updating dates
    cd = @currentDate

    # Enabling or disabling selectors of previous and next months
    lastDayOfPreviousMonth = new Date cd.getFullYear(), cd.getMonth(), 0
    if @settings.startDate? and lastDayOfPreviousMonth.getTime() < @settings.startDate.getTime()
      @canSelectPreviousMonth = false
      $(@previous).hide()
    else
      @canSelectPreviousMonth = true
      $(@previous).show()
    
    firstDayOfNextMonth = new Date cd.getFullYear(), cd.getMonth()+1, 1
    if @settings.endDate? and firstDayOfNextMonth.getTime() > @settings.endDate.getTime()
      @canSelectNextMonth = false
      $(@next).hide()
    else
      @canSelectNextMonth = true
      $(@next).show()

    firstDayDow = (new Date cd.getFullYear(), cd.getMonth(), 1).getDay()
    lastDowIndex = (@settings.firstDayOfTheWeekIndex + 6) % 7
    
    daysInFirstWeek = (7 - firstDayDow + @settings.firstDayOfTheWeekIndex) % 7
    if daysInFirstWeek is 0 then daysInFirstWeek = 7
    
    daysInPreviousMonth = lastDayOfPreviousMonth.getDate()
    date = new Date cd.getFullYear(), cd.getMonth(), daysInFirstWeek - 6
    
    daysInMonth = (new Date cd.getFullYear(), cd.getMonth() + 1, 0).getDate()
    weeks = Math.ceil (daysInMonth + 7 - daysInFirstWeek) / 7.0

    renderDay = (day) =>
      classes = []
      classAttribute = ''

      liContent = day.getDate()

      # Handles days of previous and next month
      if day.getMonth() isnt cd.getMonth()
        classes.push 'lw-dp-neighbour-month-day'
      
      # Handles weekends
      if day.getDay() is 0 or day.getDay() is 6 # weekends
        classes.push 'lw-dp-weekend'
      
      # Handles right borders
      if day.getDay() is lastDowIndex
        classes.push 'lw-dp-week-last-column'

      # Handles today
      if checkEqualDates day, @todayDate
        classes.push 'lw-dp-today'
        liContent = """<span>#{liContent}</span>"""

      # Handles active day
      if @activeDate? and checkEqualDates day, @activeDate
        classes.push 'lw-dp-active-day'

      # Handles date interval borders
      if @settings.startDate and day.getTime() <= @settings.startDate.getTime()
        classes.push 'lw-dp-out-of-interval'
        liContent = ''
      if @settings.endDate and day.getTime() >= @settings.endDate.getTime()
        classes.push 'lw-dp-out-of-interval'
        liContent = ''

      if classes.length
        classAttribute = " class='#{classes.join " "}'"
      
      day.setDate day.getDate() + 1

      """<li#{classAttribute}>#{liContent}</li>"""

    html = ''

    for week in [1..weeks]
      if week is 1
        html += '<ul class="lw-dp-week lw-dp-firstweek">'
      else if week is weeks
        html += '<ul class="lw-dp-week lw-dp-lastweek">'
      else # Common week
        html += '<ul class="lw-dp-week">'
      for day in [1..7]
        html += renderDay date
      html += '</ul>'    

    @days.html html

  # Renders names of days of the week
  renderDows: ->
    first = @settings.dowNames[@settings.firstDayOfTheWeekIndex]
    found = false
    html = '<ul class="lw-dp-dows">'
    temp = ''
    for name in @settings.dowNames
      if name is first then found = true
      day = "<li>#{name}</li>"
      if found then html += day else temp += day
    html += temp
    html += '</ul>'
    $ html # Creates jQuery object from html code

  updatePosition: (input) ->
    inputOffset = input.offset()    
    wrapperOuterWidth = @wrapper.outerWidth()
    wrapperOuterHeight = @wrapper.outerHeight()

    # Horizontal position
    left = inputOffset.left
    if $('body').width() > left + wrapperOuterWidth
      @wrapper.css 'left': left
    else
      if inputOffset.left > wrapperOuterWidth + @settings.margin
        @wrapper.css 'left': inputOffset.left - wrapperOuterWidth - @settings.margin
      else
        @wrapper.css 'left': left

    # Vertical position
    top = inputOffset.top + input.outerHeight() + @settings.margin
    if $(document).height() > top + wrapperOuterHeight
      @wrapper.css 'top': top
    else
      if inputOffset.top > wrapperOuterHeight + @settings.margin
        @wrapper.css 'top': inputOffset.top - wrapperOuterHeight - @settings.margin
      else
        @wrapper.css 'top': top

  onChange: (e)=>
    @saveData $(e.currentTarget)
    @updateMonth()
    @updateInput $(e.currentTarget)

  # Hides day picker
  hide: (e) =>
    if not @settings.alwaysVisible and @shouldHide
      @wrapper.addClass('lw-dp-hidden')
      @wrapper.css 'top': '-9999px'
    if not @shouldHide
      @currentInput?.focus()
    @shouldHide = true
    if e?
      @onChange e      

  # Shows day picker
  show: (e) =>
    @wrapper.removeClass('lw-dp-hidden')
    if e?
      @loadData $ e.currentTarget
      # Datepicker positioning
      @updatePosition $(e.currentTarget)
    @updateMonth()
  
  loadData: ($el) ->
    data = $el.data 'lw-datepicker'
    $.extend @, data

  # Validates Date object
  isDateValid: (date) ->
    if Object.prototype.toString.call(date) isnt '[object Date]'
      return false;
    # Add check for interval
    return !isNaN(date.getTime())    

  # Saves data to jQuery...
  saveData: ($el) ->
    parsedDate = @parseDate $el.val()
    if @isDateValid parsedDate
      # @currentDate = new Date parsedDate.getTime()
      @activeDate = new Date parsedDate.getTime()
    else if @settings.autoFillToday
      @activeDate = new Date @todayDate.getTime()
    $el.data 'lw-datepicker',
      activeDate: @activeDate
      currentDate: new Date @currentDate.getTime()
      currentInput: $el

  # Adds current input to list of elements binded to this date picker
  bindTo: (el) =>
    $el = $(el)
    $el.bind 'focus', @show
    $el.bind 'blur', @hide
    $el.bind 'change', @onChange
    $el.bind 'keydown', @handleKeyDown
    @saveData $el
    @loadData $el
    @updatePosition $el
    @updateInput $el
    @updateMonth()
    @hide()

  # Selects same day in changed month
  changeMonth: =>
    if @activeDate?
      activeIndex = @activeDate.getDate() - 1
      activeDate = new Date @activeDate.getTime()
      activeDate.setMonth @currentDate.getMonth()
      activeDate.setFullYear @currentDate.getFullYear()
      days = $(@days).find 'li:not(.lw-dp-neighbour-month-day)'
      if days.length <= activeIndex
        @selectDay days.last(), false
      else if @settings.endDate? and activeDate.getTime() > @settings.endDate.getTime()
        @selectDay days.eq(@settings.endDate.getDate() - 2), false
      else if @settings.startDate? and activeDate.getTime() < @settings.startDate.getTime()
        @selectDay days.eq(@settings.startDate.getDate()), false
      else
        @selectDay days.eq(activeIndex), false

  # Selects previous or next day
  changeDay: (action) =>
    direction = if action is 'prev' then 'last' else 'first'
    if @activeDate?
      $current = $(@days).find('li.lw-dp-active-day')
      $el = $current[action]()
      if not $el.length 
        $el = $current.parent()[action]().children()[direction]()
    else
      $el = $(@days).find('li.lw-dp-today')
    @selectDay $el, false

  # Handles keyboard-navigation
  handleKeyDown: (e) =>
    keyCode = e.keyCode
    handled = true
    switch keyCode
      when 33 # PgUp
        if @canSelectPreviousMonth
          @onPreviousClick()
          @changeMonth()
      when 34 # PgDown
        if @canSelectNextMonth
          @onNextClick()
          @changeMonth()
      when 38 # Up
        @changeDay 'prev'
      when 40 # Down
        @changeDay 'next'
      else
        handled = false
    @updateMonth
    if handled then return false

# Adds plugin object to jQuery
$.fn.lwDatepicker = (options) ->
  options = $.extend settings, options
  instance = null

  return @each ->
    if $(@).is 'input, textarea'
      if options.multiple
        picker = new LightweightDatepicker options
        picker.bindTo @
      else
        if not instance
          instance = new LightweightDatepicker options
        instance.bindTo @
