console.log('month');
(function() {
  'use strict';


  angular.module('material.components.calendar', [
    'material.core', 'material.components.virtualRepeat'
  ]).directive('mdCalendarMonth', mdCalendarMonth);


  function mdCalendarMonth() {
    return {
      require: ['^^mdCalendar', 'mdCalendarMonth'],
      scope: {offset: '=mdMonthOffset'},
      controller: CalendarMonthCtrl,
      controllerAs: 'mdMonthCtrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var calendarCtrl = controllers[0];
        var monthCtrl = controllers[1];
        monthCtrl.calendarCtrl = calendarCtrl;
        console.log('initial: ', monthCtrl.offset);

        element.empty();
        element.append(monthCtrl.getContent());

        scope.$watch(function() { return monthCtrl.offset }, function(offset, oldOffset) {
          console.log('watch: ', offset);
          if (offset != oldOffset) {
            element.empty();
            element[0].appendChild(monthCtrl.getContent());
          }
        });
      }
    };
  }

  function CalendarMonthCtrl($$mdDateUtil, $$mdDateLocale) {
    this.dateUtil = $$mdDateUtil;
    this.dateLocale = $$mdDateLocale;
    this.calendarCtrl = null;
  }

  CalendarMonthCtrl.prototype.getContent = function() {
    var date = this.dateUtil.incrementMonths(this.calendarCtrl.displayDate, this.offset);
    return this.buildCalendarForMonth(date);
  };

  /**
   * Creates a single cell to contain a date in the calendar with all appropriate
   * attributes and classes added. If a date is given, the cell content will be set
   * based on the date.
   * @param {Date=} opt_date
   * @returns {HTMLElement}
   */
  CalendarMonthCtrl.prototype.buildDateCell = function(opt_date) {
    var cell = document.createElement('td');
    cell.classList.add('md-calendar-date');

    if (opt_date) {
      // Add a indicator for select, hover, and focus states.
      var selectionIndicator = document.createElement('span');
      cell.appendChild(selectionIndicator);
      selectionIndicator.classList.add('md-calendar-date-selection-indicator');
      selectionIndicator.textContent = this.dateLocale.dates[opt_date.getDate()];

      cell.setAttribute('tabindex', '-1');
      cell.id = this.calendarCtrl.getDateId(opt_date);
      cell.dataset.timestamp = opt_date.getTime();
      cell.addEventListener('click', this.calendarCtrl.cellClickHandler);
    }

    return cell;
  };

  /**
   * Builds the <tbody> content for the given date's month.
   * @param {Date=} opt_dateInMonth
   * @returns {DocumentFragment} A document fragment containing the <tr> elements.
   */
  CalendarMonthCtrl.prototype.buildCalendarForMonth = function(opt_dateInMonth) {
    var date = this.dateUtil.isValidDate(opt_dateInMonth) ? opt_dateInMonth : new Date();

    var firstDayOfMonth = this.dateUtil.getFirstDateOfMonth(date);
    var firstDayOfTheWeek = firstDayOfMonth.getDay();
    var numberOfDaysInMonth = this.dateUtil.getNumberOfDaysInMonth(date);

    // Store rows for the month in a document fragment so that we can append them all at once.
    var monthBody = document.createDocumentFragment();

    var row = document.createElement('tr');
    monthBody.appendChild(row);

    // Add a label for the month. If the month starts on a Sunday or a Monday, the month label
    // goes on a row above the first of the month. Otherwise, the month label takes up the first
    // two cells of the first row.
    var blankCellOffset = 0;
    var monthLabelCell = document.createElement('td');
    monthLabelCell.classList.add('md-calendar-month-label');
    if (firstDayOfTheWeek <= 1) {
      monthLabelCell.setAttribute('colspan', '7');

      var monthLabelRow = document.createElement('tr');
      monthLabelRow.appendChild(monthLabelCell);
      monthBody.insertBefore(monthLabelRow, row);
    } else {
      blankCellOffset = 2;
      monthLabelCell.setAttribute('colspan', '2');
      row.appendChild(monthLabelCell);
    }

    monthLabelCell.textContent = this.dateLocale.shortMonths[date.getMonth()];

    // DEBUG
    monthLabelCell.textContent += ' ' + date.getFullYear();

    // Add a blank cell for each day of the week that occurs before the first of the month.
    // For example, if the first day of the month is a Tuesday, add blank cells for Sun and Mon.
    // The blankCellOffset is needed in cases where the first N cells are used by the month label.
    for (var i = blankCellOffset; i < firstDayOfTheWeek; i++) {
      row.appendChild(this.buildDateCell());
    }

    // Add a cell for each day of the month, keeping track of the day of the week so that
    // we know when to start a new row.
    var dayOfWeek = firstDayOfTheWeek;
    var iterationDate = firstDayOfMonth;
    var weekCount = 1;
    for (var d = 1; d <= numberOfDaysInMonth; d++) {
      // If we've reached the end of the week, start a new row.
      if (dayOfWeek === 7) {
        dayOfWeek = 0;
        row = document.createElement('tr');
        monthBody.appendChild(row);
        weekCount++;
      }

      iterationDate.setDate(d);
      var cell = this.buildDateCell(iterationDate);
      row.appendChild(cell);

      dayOfWeek++;
    }

    // Ensure that all months have 6 rows. This is necessary for now because the virtual-repeat
    // requires that all items have exactly the same height.
    while (monthBody.childNodes.length < 6) {
      var whitespaceRow = document.createElement('tr');
      whitespaceRow.appendChild(this.buildDateCell());
      monthBody.appendChild(whitespaceRow);
    }

    return monthBody;
  };

})();
