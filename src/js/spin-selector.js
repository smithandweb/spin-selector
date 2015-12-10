'use strict';
(function ($) {

  // here we go!
  $.spinSelector = function (element, options) {

    // Default options
    var defaults = {

        selectors: 3,
        theme: 'dark',
        startYear: new Date().getFullYear() - 5,
        currentYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 5,
        inputs: null,
        callback: function () {},
        monthShortNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
    // Assignments 
      spinSelector = this,
      $element = $(element),
      $containerTmpl,
    // Private methods
      daysInMonth,
      buildSelector,
      buildDefault,
      touchHandler,
      initHammer;

    // Build settings.
    // Internal reference: spinSelector.settings.propertyName
    // External reference: $(element).data('spinSelector').settings.propertyName
    spinSelector.settings = {};

    // Container
    $containerTmpl = $('<div class="spin-selector-container theme-' + spinSelector.settings.theme + '"/>');
    $element.append($containerTmpl);

    // public methods
    spinSelector.getData = function () {
      var currentData = [];
      $('.spin-value.active').each(function () {
        currentData.push($(this).attr('data-value'));
      });
      return currentData;
    };

    spinSelector.setActive = function ($input, value) {
      if ($input.find('[data-value=' + value + ']').length <= 0) {
        return;
      }
      var $active, pos,
        $scroller = $input.find('.value-scroller');

      // Toggle active class
      $input.find('.active').toggleClass('active');
      $active = $input.find('[data-value=' + value + ']');
      $active.toggleClass('active');

      // Set position
      pos = $input.find('[data-value=' + value + ']').position().top;
      $scroller.css('top', '-' + pos + 'px');
    };

    // private methods
    daysInMonth = function (month, year) {
      return new Date(year, month, 0).getDate();
    };

    buildSelector = function (label, data) {
      var $selector, innerHtml;
      $selector = $('<div class="selector"/>');
      if (data) {
        $selector.data(data);
      }

      innerHtml = '<div class="label">' + label + '</div>';
      innerHtml += '<div class="spin-up">+</div>';
      innerHtml += '<div class="value-container"><div class="value-scroller"></div></div>';
      innerHtml += '<div class="spin-down">-</div>';

      $selector.html(innerHtml);

      return $selector;
    };

    buildDefault = function () {
      var i, years = [],
        $yearToAdd,
        $year,
        $month,
        $monthToAdd,
        days = [],
        $day,
        $dayToAdd;

      // Do the year first
      $year = buildSelector('Year');
      for (i = 0; i <= (spinSelector.settings.endYear - spinSelector.settings.startYear); i++) {
        years.push(spinSelector.settings.startYear + i);
      }
      for (i = 0; i < years.length; i++) {
        $yearToAdd = $('<div class="spin-value">' + years[i] + '</div>').attr('data-value', years[i]);
        $year.find('.value-scroller').append($yearToAdd);
      }
      // Add to template
      $year.data('type', 'year');
      $containerTmpl.append($year);
      spinSelector.setActive($year, new Date().getFullYear());

      // Now the months (Short name format)
      $month = buildSelector('Month');
      for (i = 0; i < spinSelector.settings.monthShortNames.length; i++) {
        $monthToAdd = $('<div class="spin-value">' + spinSelector.settings.monthShortNames[i] + '</div>').attr('data-value', i + 1);
        $month.find('.value-scroller').append($monthToAdd);
      }
      // Add to template
      $month.data('type', 'month');
      $containerTmpl.append($month);
      spinSelector.setActive($month, new Date().getMonth() + 1);

      // Finally the days
      $day = buildSelector('Day');
      // Get days based on active selections
      days = daysInMonth(($month.find('.spin-value.active').attr('data-value')), $year.find('.spin-value.active').attr('data-value'));
      // Add them to the spin selector
      for (i = 0; i < days; i++) {
        $dayToAdd = $('<div class="spin-value">' + (i + 1) + '</div>').attr('data-value', i + 1);
        $day.find('.value-scroller').append($dayToAdd);
      }
      // Add to template
      $day.data('type', 'day');
      $containerTmpl.append($day);
      spinSelector.setActive($day, new Date().getDate());

      // Add container data
      $containerTmpl.data({
        isDate: true,
        $year: $year,
        $month: $month,
        $day: $day
      });
    };

    // Bind to swipe events if touchswipe is present
    touchHandler = function (e) {
      var inputs,
        currentEq,
        nextEq,
        value,
        dir = e.type,
        $input = $(e.target);

      if (!($input.hasClass('selector'))) {
        $input = $input.closest('.selector');
      }

      inputs = $input.find('.spin-value').length - 1;
      currentEq = $input.find('.spin-value.active').index();

      if (dir === 'swipeup') {
        if (currentEq === inputs) {
          nextEq = 0;
        } else {
          nextEq = currentEq + 1;
        }
      } else if (dir === 'swipedown') {
        if (currentEq === 0) {
          nextEq = inputs;
        } else {
          nextEq = currentEq - 1;
        }
      }

      value = $input.find('.spin-value').eq(nextEq).attr('data-value');
      spinSelector.setActive($input, value);
    };

    initHammer = function () {
      var i, $selector,
        hammeredSelector,
        selectors = document.getElementsByClassName('selector');
      for (i = selectors.length - 1; i >= 0; i--) {
        $selector = $(selectors[i]);
        hammeredSelector = new window.Hammer(selectors[i], {
          touchAction: 'none'
        });

        $selector.data('hammer', hammeredSelector);

        hammeredSelector.get('swipe').set({direction: window.Hammer.DIRECTION_ALL, threshold: 0, velocity: 0.1});

        hammeredSelector.on('swipeup swipedown', function (e) {
          touchHandler(e);
        });
      }
    };

    // Init
    spinSelector.init = function () {

      // user-provided options (if any)
      spinSelector.settings = $.extend({}, defaults, options);

      // If inputs is empty, default to date mode
      if (!spinSelector.settings.inputs) {
        buildDefault();
      }

      // Bind to updates
      $containerTmpl.on('updated', '.selector', function () {
        var i, $dayToAdd, days, selectedDay, newActiveDay,
          data = spinSelector.getData(),
          properties = $containerTmpl.data();
        if (properties.isDate && $(this).data('type') !== 'day') {
          selectedDay = properties.$day.find('.spin-value.active').index();
          properties.$day.find('.value-scroller').empty();
          days = daysInMonth((properties.$month.find('.spin-value.active').attr('data-value')), properties.$year.find('.spin-value.active').attr('data-value'));
          // Add them to the spin selector
          for (i = 0; i < days; i++) {
            $dayToAdd = $('<div class="spin-value">' + (i + 1) + '</div>').attr('data-value', i + 1);
            properties.$day.find('.value-scroller').append($dayToAdd);
          }

          if (days <= selectedDay) {
            newActiveDay = days - 1;
          } else {
            newActiveDay = selectedDay;
          }
          spinSelector.setActive(properties.$day, properties.$day.find('.spin-value').eq(newActiveDay).attr('data-value'));
        }

        spinSelector.settings.callback(data);
      });

      // Update the ticker when spin buttons clicked
      $containerTmpl.on('click', '.spin-up, .spin-down', function () {
        var currentEq,
          nextEq,
          $input,
          value,
          $this = $(this),
          inputs = $this.parent('.selector').find('.spin-value').length - 1;

        currentEq = $this.parent('.selector').find('.spin-value.active').index();

        if ($this.hasClass('spin-up')) {
          if (currentEq === inputs) {
            nextEq = 0;
          } else {
            nextEq = currentEq + 1;
          }
        } else if ($this.hasClass('spin-down')) {
          if (currentEq === 0) {
            nextEq = inputs;
          } else {
            nextEq = currentEq - 1;
          }
        }

        $input = $this.parent('.selector');
        value = $this.parent('.selector').find('.spin-value').eq(nextEq).attr('data-value');
        spinSelector.setActive($input, value);

        $this.parent('.selector').trigger('updated');
      });

      if (window.Hammer) {
        initHammer();
      }
    };

    // Start
    spinSelector.init();

  };

  // add the plugin to the jQuery.fn object
  $.fn.spinSelector = function (options) {

    // iterate through the DOM elements we are attaching the plugin to
    return this.each(function () {

      // if plugin has not already been attached to the element
      if (undefined === $(this).data('spinSelector')) {

        // create a new instance of the plugin
        var spinSelector = new $.spinSelector(this, options);

        // in the jQuery version of the element
        // store a reference to the plugin object
        $(this).data('spinSelector', spinSelector);

      }

    });

  };

}(jQuery));