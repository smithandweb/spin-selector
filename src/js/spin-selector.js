'use strict';
(function ($) {

  // Init
  $.fn.spinSelector = function (options) {

    // Helpers
    var monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }

    function setActive($input, value) {
      var $active, pos,
        $scroller = $input.find('.value-scroller');

      // Toggle active class
      $input.find('.active').toggleClass('active');
      $active = $input.find('[data-value=' + value + ']');
      $active.toggleClass('active');

      // Set position
      pos = $input.find('[data-value=' + value + ']').position().top;
      $scroller.css('top', '-' + pos + 'px');
    }

    function buildDefault(settings) {
      var years = [],
        $yearToAdd,
        $year,
        $month,
        $monthToAdd,
        days = [],
        $day,
        $dayToAdd;

      // Do the year first
      $year = $('<div class="selector"/>');
      $year.append('<div class="label">Year</div>');
      $year.append('<div class="spin-up">+</div>');
      $year.append('<div class="value-container"><div class="value-scroller"></div></div>');
      $year.append('<div class="spin-down">-</div>');

      for (i = 0; i <= (settings.endYear - settings.startYear); i++) {
        years.push(settings.startYear + i);
      }

      for (i = 0; i < years.length; i++) {
        $yearToAdd = $('<div class="spin-value">' + years[i] + '</div>').attr('data-value', years[i]);
        $year.find('.value-scroller').append($yearToAdd);
      }

      $containerTmpl.append($year);
      setActive($year, new Date().getFullYear());

      // Now the months (Short name format)
      $month = $('<div class="selector"/>');
      $month.append('<div class="label">Month</div>');
      $month.append('<div class="spin-up">+</div>');
      $month.append('<div class="value-container"><div class="value-scroller"></div></div>');
      $month.append('<div class="spin-down">-</div>');

      for (var i = 0; i < monthShortNames.length; i++) {
        $monthToAdd = $('<div class="spin-value">' + monthShortNames[i] + '</div>').attr('data-value', i);
        $month.find('.value-scroller').append($monthToAdd);
      };

      $containerTmpl.append($month);
      setActive($month, new Date().getMonth());

      // Finally the days
      $day = $('<div class="selector"/>');
      $day.append('<div class="label">Day</div>');
      $day.append('<div class="spin-up">+</div>');
      $day.append('<div class="value-container"><div class="value-scroller"></div></div>');
      $day.append('<div class="spin-down">-</div>');

      // Get days based on active selections
      days = daysInMonth(($month.find('.spin-value.active').attr('data-value') + 1), $year.find('.spin-value.active').attr('data-value'))
      
      // Add them to the spin selector
      for (var i = 0; i < days; i++) {
        $dayToAdd = $('<div class="spin-value">' + i + '</div>').attr('data-value', i);
        $day.find('.value-scroller').append($dayToAdd);
      };

      $containerTmpl.append($day);
      setActive($day, new Date().getDate());

    }

    // Options
    var settings = $.extend({
        selectors: 3,
        theme: 'light',
        startYear: new Date().getFullYear() - 5,
        currentYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 5,
        inputs: null,
      }, options),
      $this = $(this),
      $containerTmpl,
      i;

    window.spinSelector = $this;

    // Container
    $containerTmpl = $('<div class="spin-selector-container theme-' + settings.theme + '"/>');
    $this.append($containerTmpl);

    // Create inputs

    // If inputs is empty, default to date mode
    if (!settings.inputs) {
      buildDefault(settings);
    }

    return this;
  };

}(jQuery));