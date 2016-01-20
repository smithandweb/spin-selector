;(function ($, window, document, undefined) {

  $.spinSelector = function (element, options) {

    // Default options
    var defaults = {

        selectors: 3,
        theme: 'dark',
        width: null,
        startYear: new Date().getFullYear() - 5,
        currentYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 5,
        inputs: null,
        buttons: null,
        callback: function () {},
        monthShortNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
    // Assignments 
      spinSelector = this,
      $element = $(element),
      $containerTmpl,
      $selectorContainer,
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
    // user-provided options (if any)
    spinSelector.settings = $.extend({}, defaults, options);

    // Container
    $containerTmpl = $('<div class="spin-selector-container theme-' + spinSelector.settings.theme + '"/>');
    $selectorContainer = $('<div class="selector-container"/>');
    if (spinSelector.settings.width) {
      $containerTmpl.css('width', spinSelector.settings.width);
    }
    $element.append($containerTmpl);
    $containerTmpl.append($selectorContainer);

    // Prototypal
    spinSelector.getData = function () {
      var currentData = [];
      $containerTmpl.find('.spin-value.active').each(function () {
        currentData.push($(this).attr('data-value'));
      });
      return currentData;
    };

    spinSelector.setActive = function ($input, value) {
      $input = ($input instanceof jQuery) ? $input : $($input);
      if ($input.find('[data-value="' + value + '"]').length <= 0) {
        return;
      }
      var $active, pos,
        $scroller = $input.find('.value-scroller');

      // Toggle active class
      $input.find('.active').toggleClass('active');
      $active = $input.find('[data-value="' + value + '"]');
      $active.toggleClass('active');

      // Set position
      pos = $input.find('[data-value="' + value + '"]').position().top;
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
        $yearsToAdd = [],
        $year,
        $month,
        $monthsToAdd = [],
        days = [],
        $day,
        $daysToAdd = [] ;

      // Do the year first
      $year = buildSelector('Year');
      for (i = 0; i <= (spinSelector.settings.endYear - spinSelector.settings.startYear); i++) {
        years.push(spinSelector.settings.startYear + i);
      }
      for (i = 0; i < years.length; i++) {
        $yearsToAdd.push('<div class="spin-value" data-value="' + years[i] + '">' + years[i] + '</div>');
      }
      $year.find('.value-scroller').html($yearsToAdd.join(""));
      // Add to template
      $year.data('type', 'year');
      $selectorContainer.append($year);
      spinSelector.setActive($year, new Date().getFullYear());

      // Now the months (Short name format)
      $month = buildSelector('Month');
      for (i = 0; i < spinSelector.settings.monthShortNames.length; i++) {
        $monthsToAdd.push('<div class="spin-value" data-value="' + (i + 1) + '">' + spinSelector.settings.monthShortNames[i] + '</div>');
      }
      $month.find('.value-scroller').html($monthsToAdd.join(""));
      // Add to template
      $month.data('type', 'month');
      $selectorContainer.append($month);
      spinSelector.setActive($month, new Date().getMonth() + 1);

      // Finally the days
      $day = buildSelector('Day');
      // Get days based on active selections
      days = daysInMonth(($month.find('.spin-value.active').attr('data-value')), $year.find('.spin-value.active').attr('data-value'));
      // Add them to the spin selector
      for (i = 0; i < days; i++) {
        $daysToAdd.push('<div class="spin-value" data-value="' + (i + 1) + '">' + (i + 1) + '</div>')
      }
      $day.find('.value-scroller').html($daysToAdd.join(""));
      // Add to template
      $day.data('type', 'day');
      $selectorContainer.append($day);
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
        if (!$selector.data('hammer')) {
          hammeredSelector = new window.Hammer(selectors[i], {
            touchAction: 'none'
          });

          $selector.data('hammer', hammeredSelector);

          hammeredSelector.get('swipe').set({direction: window.Hammer.DIRECTION_ALL, threshold: 0, velocity: 0.1});

          hammeredSelector.on('swipeup swipedown', function (e) {
            touchHandler(e);
          });
        }
      }
    };

    // Init
    spinSelector.init = function () {
      var i, v, $selector, $selectorToAdd, $button, $buttonsContainer;

      // If inputs is empty, default to date mode
      if (!spinSelector.settings.inputs) {
        buildDefault();
      // Build out inputs if supplied
      } else if (spinSelector.settings.inputs.length > 0) {
        for (i = 0; i < spinSelector.settings.inputs.length; i++) {
          $selector = buildSelector(spinSelector.settings.inputs[i].label);

          for (v = 0; v < spinSelector.settings.inputs[i].values.length; v++) {
            $selectorToAdd = $('<div class="spin-value">' + spinSelector.settings.inputs[i].values[v] + '</div>').attr('data-value', spinSelector.settings.inputs[i].values[v]);
            $selector.find('.value-scroller').append($selectorToAdd);
          }
          // Add to template
          $selectorContainer.append($selector);
          spinSelector.setActive($selector, spinSelector.settings.inputs[i].values[0]);
        }
      }

      // Build out buttons if supplied
      if (spinSelector.settings.buttons && spinSelector.settings.buttons.length > 0) {
        $buttonsContainer = $containerTmpl.append('<div class="buttons-container"/>').find('.buttons-container');
        for (i = 0; i < spinSelector.settings.buttons.length; i++) {
          $button = $('<a href="#" class="button"/>').text(spinSelector.settings.buttons[i].label);

          if (spinSelector.settings.buttons[i].link) {
            $button.attr('href', spinSelector.settings.buttons[i].link);
          }

          if (spinSelector.settings.buttons[i].css) {
            $button.addClass(spinSelector.settings.buttons[i].css);
          }

          // Assign callback to button if there's no link and a callback function is supplied
          if (spinSelector.settings.buttons[i].callback && !spinSelector.settings.buttons[i].link && typeof spinSelector.settings.buttons[i].callback === 'function') {
            $button.on('click', spinSelector.settings.buttons[i].callback);
          }

          $buttonsContainer.append($button);
        }
      }

      // Bind to updates
      $containerTmpl.on('updated', '.selector', function (e) {
        var $daysToAdd = [], days, selectedDay, newActiveDay,
          data = spinSelector.getData(),
          properties = $containerTmpl.data();
        if (properties.isDate && $(this).data('type') !== 'day') {
          selectedDay = properties.$day.find('.spin-value.active').index();
          properties.$day.find('.value-scroller').empty();
          days = daysInMonth((properties.$month.find('.spin-value.active').attr('data-value')), properties.$year.find('.spin-value.active').attr('data-value'));
          // Add them to the spin selector
          for (i = 0; i < days; i++) {
            $daysToAdd.push('<div class="spin-value" data-value="' + (i + 1) + '">' + (i + 1) + '</div>')
          }
          properties.$day.find('.value-scroller').html($daysToAdd.join(""));

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

        // in the jQuery version of the element
        // store a reference to the new plugin object
        $(this).data('spinSelector', new $.spinSelector(this, options));

      }

    });

  };

}(jQuery, window, document));