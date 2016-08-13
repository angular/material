describe('MdTabsPaginationService', function() {

  const TAB_WIDTH = 100;

  var MdTabsPaginationService;

  beforeEach(module('material.components.tabs'));
  beforeEach(injectGlobals);

  var customMatchers = {
    toEqualPageOffset: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          var config = decode(expected),
            result = {};

          result.pass = util.equals(actual, config.offsetStart, customEqualityTesters);

          if (!result.pass) {
            result.message = "Expected " + actual + " to equal " + config.offsetStart +
              " for pagination description '" + expected + "'.";
          }

          return result;
        }
      }
    }
  };

  beforeEach(function() {
    jasmine.addMatchers(customMatchers);
  });

  describe('#decreasePageOffset', function() {
    it('with a current offset of 0 returns 0', function() {
      var start = '[-----]----------';
      var end   = '[-----]----------';
      var config = decode(start);

      var decreasedOffset = MdTabsPaginationService.decreasePageOffset(config.elements, 0);
      expect(decreasedOffset).toEqualPageOffset(end);
    });

    it('with a current offset smaller than the offset range returns 0', function() {
      var start = '---[-----]-------';
      var end   = '[-----]----------';
      var config = decode(start);

      var decreasedOffset =
            MdTabsPaginationService.decreasePageOffset(config.elements, config.offsetStart);

      expect(decreasedOffset).toEqualPageOffset(end);
    });

    it('with a current offset larger than the offset range shows next lowest page', function() {
      var start = '---------[-----]-';
      var end   = '----[-----]------';
      var config = decode(start);

      var decreasedOffset =
            MdTabsPaginationService.decreasePageOffset(config.elements, config.offsetStart);

      expect(decreasedOffset).toEqualPageOffset(end);
    });

    it('with a max offset and partially visible tab it fully shows the tab', function() {
      var start = '---------.[.-----]'; // Tab 9 (0-based index) is partially visible
      var end   = '----.[.-----]-----'; // Tab 9 (0-based index) is the last fully visible tab
      var config = decode(start);

      var decreasedOffset =
            MdTabsPaginationService.decreasePageOffset(config.elements, config.offsetStart);

      expect(decreasedOffset).toEqualPageOffset(end);
    });
  });

  describe('#increasePageOffset', function() {
    it('with a current offset at 0 and no partial tabs shows the next page up', function() {
      var start = '[-----]----------';
      var end   = '-----[-----]-----';
      var config = decode(start);

      var increasedOffset =
            MdTabsPaginationService.increasePageOffset(config.elements, config.offsetStart);
      expect(increasedOffset).toEqualPageOffset(end);
    });

    it('with a current offset at 0 and partial tabs shows the partially hidden tab', function() {
      var start = '[-----.].---------';
      var end   = '-----[-----.].----';
      var config = decode(start);

      var increasedOffset =
            MdTabsPaginationService.increasePageOffset(config.elements, config.offsetStart);
      expect(increasedOffset).toEqualPageOffset(end);
    });

    it('with a current offset close to the max returns max', function() {
      var start   = '-----[-----.].----';
      var end     = '---------.[.-----]';
      var config = decode(start);

      var increasedOffset =
            MdTabsPaginationService.increasePageOffset(config.elements, config.offsetStart);
      expect(increasedOffset).toEqualPageOffset(end);
    });

    it('with a current offset at max returns max', function() {
      var start = '----------[-----]';
      var end   = '----------[-----]';
      var config = decode(start);

      var increasedOffset =
            MdTabsPaginationService.increasePageOffset(config.elements, config.offsetStart);
      expect(increasedOffset).toEqualPageOffset(end);
    });
  });

  describe('#getTabOffsets', function() {
    it('returns an array of tab offsets', function() {
      var descriptor = '[----]------';
      var config = decode(descriptor);

      var expected = new Array(10).fill(0).map(function(item, index) { return TAB_WIDTH * index});

      expect(MdTabsPaginationService.getTabOffsets(config.elements)).toEqual(expected);
    });
  });

  describe('#getTotalTabsWidth', function() {
    it('adds the width of ideal tabs', function() {
      var descriptor = '[-----]----------';
      var config = decode(descriptor);

      expect(MdTabsPaginationService.getTotalTabsWidth(config.elements)).toEqual(TAB_WIDTH * 15);
    });

    it('adds the width of partially visible tabs', function() {
      var descriptor = '[-----.].---------';
      var config = decode(descriptor);

      expect(MdTabsPaginationService.getTotalTabsWidth(config.elements)).toEqual(TAB_WIDTH * 15);
    });
  });

  /**
   * Decode the requested pagination description and return a config object containing the canvas
   * and tab elements, along with the start/end offset.
   *
   * The width of every tab is defined by the TAB_WIDTH constant at the top of this file.
   *
   * @param description {string} A string representing the pagination object. Each character
   * represents a portion of the tabs as follows:
   *
   *     `-` - The dash, or hyphen, represents a single tab of length TAB_WIDTH.
   *     `.` - A period represents a tab that is half-visible. It is partially hidden by the
   *           pagination wrapping. If used, you MUST have an even number of periods, and you MUST
   *           only separate them with pagination characters (i.e. don't put a tab inside a half
   *           tab).
   *     `[` - The beginning of the pagination.
   *     `]` - The end of the pagination.
   *
   * All descriptions MUST contain a series of dashes and/or dots representing tabs, as well as a
   * single beginning and ending tag for the pagination.
   *
   * Examples:
   *
   *     '[-----.].----'
   *
   * This example has 5 visible tabs; 1 tab that is half-visible, half-hidden; and 4 visible tabs.
   * The pagination starts at 0 and ends at 5.5 * TAB_WIDTH.
   *
   *     '---[---]---'
   *
   * This example has 3 hidden tabs; 3 visible tabs; and then 3 more hidden tabs. The pagination
   * starts at 3 * TAB_WIDTH and ends at 6 * TAB_WIDTH.
   *
   * @returns {{elements: {canvas: {}, tabs: Array}, offsetStart: number, offsetEnd: number}}
   */
  function decode(description) {
    var pagination = {
      elements: { canvas: {}, tabs: [] },
      offsetStart: 0,
      offsetEnd: 0
    };

    var i, char, currentWidth = 0, midTab = false;

    // Initialize our tabs and offsets
    for (i = 0; i < description.length; i++) {
      char = description.charAt(i);

      switch (char) {
        case '-':
          currentWidth += TAB_WIDTH;
          pagination.elements.tabs.push({ offsetWidth: TAB_WIDTH });
          break;
        case '.':
          currentWidth += (TAB_WIDTH / 2);

          // If we're in the middle of a tab and we see another half; go ahead and add a full tab.
          if (midTab) {
            pagination.elements.tabs.push({ offsetWidth: TAB_WIDTH });
            midTab = false;
          } else {
            midTab = true;
          }
          break;
        case '[': pagination.offsetStart = currentWidth;
          break;
        case ']': pagination.offsetEnd = currentWidth;
          break;
        default:
          throw new Error("Unrecognized char for decode(): '" + char + "'");
      }
    }

    // Initialize our canvas element
    pagination.elements.canvas.clientWidth = pagination.offsetEnd - pagination.offsetStart;

    return pagination;
  }

  function injectGlobals() {
    inject(function(_MdTabsPaginationService_) {
      MdTabsPaginationService = _MdTabsPaginationService_;
    });
  }

});
