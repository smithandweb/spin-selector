'use strict';
(function ($) {

  // Init
  $.fn.spinSelector = function (options, callback) {

    ///////////////////
    /// OPTIONS
    ///////////////////
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
      monthShortNames,
      i;

    window.spinSelector = $this;

    // Container
    $containerTmpl = $('<div class="spin-selector-container theme-' + settings.theme + '"/>');
    $this.append($containerTmpl);

    ////////////////////
    /// HELPERS
    ////////////////////
    monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }

    function buildSelector(label, data) {
      var $selector;
      $selector = $('<div class="selector"/>');
      $selector.append('<div class="label">' + label + '</div>');
      $selector.append('<div class="spin-up">+</div>');
      $selector.append('<div class="value-container"><div class="value-scroller"></div></div>');
      $selector.append('<div class="spin-down">-</div>');
      if (data) {
        $selector.data(data);
      }
      return $selector;
    }

    function setActive($input, value) {
      console.log('setActive', $input, value, $input.find('[data-value=' + value + ']'));
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
    }

    function buildDefault() {
      var years = [],
        $yearToAdd,
        $year,
        $month,
        $monthToAdd,
        days = [],
        $day,
        $dayToAdd;

      // Do the year first
      $year = buildSelector('Year');
      for (i = 0; i <= (settings.endYear - settings.startYear); i++) {
        years.push(settings.startYear + i);
      }
      for (i = 0; i < years.length; i++) {
        $yearToAdd = $('<div class="spin-value">' + years[i] + '</div>').attr('data-value', years[i]);
        $year.find('.value-scroller').append($yearToAdd);
      }
      // Add to template
      $year.data('type', 'year');
      $containerTmpl.append($year);
      setActive($year, new Date().getFullYear());

      // Now the months (Short name format)
      $month = buildSelector('Month');
      for (i = 0; i < monthShortNames.length; i++) {
        $monthToAdd = $('<div class="spin-value">' + monthShortNames[i] + '</div>').attr('data-value', i + 1);
        $month.find('.value-scroller').append($monthToAdd);
      }
      // Add to template
      $month.data('type', 'month');
      $containerTmpl.append($month);
      setActive($month, new Date().getMonth() + 1);

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
      setActive($day, new Date().getDate());

      // Add container data
      $containerTmpl.data({
        isDate: true,
        $year: $year,
        $month: $month,
        $day: $day
      });
    }

    function getData() {
      var currentData = [];
      $('.spin-value.active').each(function () {
        currentData.push($(this).attr('data-value'));
      });
      return currentData;
    }

    ////////////////////
    /// INIT
    ////////////////////

    // If inputs is empty, default to date mode
    if (!settings.inputs) {
      buildDefault(settings);
    }

    // Bind to updates
    $containerTmpl.on('updated', '.selector', function () {
      var $dayToAdd, days, selectedDay, newActiveDay,
        data = getData(),
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
        setActive(properties.$day, properties.$day.find('.spin-value').eq(newActiveDay).attr('data-value'));
      }

      callback && callback(data);
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
      setActive($input, value);

      $this.parent('.selector').trigger('updated');
    });

    // Bind to swipe events if touchswipe is present
    if ($this.swipe) {
      $this.find('.selector').swipe({
        swipe: function (e, dir, dis, dur) {
          var delta,
            $index,
            $input,
            inputs,
            value,
            currentEq,
            nextEq,
            valueHeight = $this.find('.spin-value').height();

          delta = Math.max(1, Math.round(dis / valueHeight));
          console.log(e, dir, dis, dur, delta);

          for (i = e.path.length - 1; i >= 0; i--) {
            $index = $(e.path[i]);
            if ($index.hasClass('selector')) {
              $input = $index;
            }
          }

          inputs = $input.find('.spin-value').length - 1;
          currentEq = $input.find('.spin-value.active').index();

          if (dir === 'up') {
            if (currentEq === inputs) {
              nextEq = 0;
            } else {
              nextEq = currentEq + 1;
            }
          } else if (dir === 'down') {
            if (currentEq === 0) {
              nextEq = inputs;
            } else {
              nextEq = currentEq - 1;
            }
          }

          value = $input.find('.spin-value').eq(nextEq).attr('data-value');
          setActive($input, value);
        },
        threshold: 25,
        triggerOnTouchEnd: false,
        allowPageScroll: "none",
        preventDefaultEvents: false
      });
    }
    return this;
  };

}(jQuery));