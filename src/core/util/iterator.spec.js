describe('iterator', function() {
  beforeEach(module('material.core'));

  describe('use to provide accessor API ', function () {

    var list, iter;

    beforeEach(inject(function ($mdUtil) {
      list = [ 13, 14, 'Marcy', 15, 'Andrew', 16, 21, 'Adam', 37, 'Max', 99 ];
      iter = $mdUtil.iterator(list);
    }));

    it('should construct properly', inject(function($mdUtil) {
      expect(iter.count()).toEqual(11);

      var iter2 = $mdUtil.iterator();
      expect(iter2.count()).toEqual(0);
    }));

    it('should publish read-only access to the dataset', function () {
      var ds = iter.items();

      ds[0] = 'Thomas';

      expect(list[0]).toEqual(13);
    });

    it('should provide indexOf() accessor', function () {

      expect(iter.indexOf(13)).toBe(0);
      expect(iter.indexOf(99)).toBe(10);
      expect(iter.indexOf(15)).toBe(3);
      expect(iter.indexOf(10)).toBe(-1);

      expect(iter.indexOf('Max')).toBe(9);
      expect(iter.indexOf('max')).toBe(-1);
      expect(iter.indexOf('Marcy')).toBe(2);
    });

    it('should provide inRange() accessor', function () {

      expect(iter.inRange(-1)).toBe(false);
      expect(iter.inRange(10)).toBe(true);
      expect(iter.inRange(11)).toBe(false);
      expect(iter.inRange(13)).toBe(false);

    });

    it('should provide contains()', function () {

      expect(iter.contains(16)).toBeTruthy();
      expect(iter.contains(98)).toBeFalsy();
      expect(iter.contains('Max')).toBe(true);
      expect(iter.contains('max')).toBe(false);

      expect(iter.itemAt(0)).toBe(13);
      expect(iter.itemAt(10)).toBe(99);
      expect(iter.itemAt(7)).toBe('Adam');
      expect(iter.itemAt(2)).toBe('Marcy');
    });

    it('should provide itemAt()', function () {

      expect(iter.itemAt(0)).toBe(13);
      expect(iter.itemAt(10)).toBe(99);
      expect(iter.itemAt(7)).toBe('Adam');
      expect(iter.itemAt(2)).toBe('Marcy');

      // Out of range
      expect(iter.itemAt(12)).toBeNull();
      expect(iter.itemAt(-1)).toBeNull();
      expect(iter.itemAt(27)).toBeNull();
    });

  });

  describe('use to provide mutator API ', function () {
    var list, iter;

    beforeEach(inject(function ($mdUtil) {
      list = [ 13, 14, 'Marcy', 15, 'Andrew', 16, 21, 'Adam', 37, 'Max', 99 ];
      iter = $mdUtil.iterator(list);
    }));

    it('should use add() to append or insert items properly', function () {

      iter.add("47");

      // Original list remains the data provider
      expect(iter.count()).toEqual(12);
      expect(list.length).toEqual(12);

      iter.add({firstName: 'Thomas', lastName: 'Burleson'});
      expect(iter.itemAt(12).lastName).toBe('Burleson');

      iter.add('Thomas', 1);
      expect(iter.count()).toEqual(14);
      expect(iter.itemAt(1)).toEqual('Thomas');

      iter.add(null);
      expect(iter.count()).toEqual(14);

      iter.add();
      expect(iter.count()).toEqual(14);

    });

    it('should remove() items properly', function () {

      // Remove 1st item
      iter.remove(13);
      expect(iter.count()).toEqual(10);
      expect(iter.itemAt(0)).toBe(14);

      // Remove last item
      iter.remove(99);
      expect(iter.count()).toEqual(9);
      expect(iter.itemAt(8)).toBe('Max');

      // Remove interior item
      iter.remove('Andrew');
      expect(iter.count()).toEqual(8);
      expect(iter.itemAt(3)).toBe(16);

      iter.remove(null);
      expect(iter.itemAt(3)).toBe(16);

    });

  });

  describe('use to provide navigation API ', function () {
    var list, iter;

    beforeEach(inject(function ($mdUtil) {
      list = [ 13, 14, 'Marcy', 15, 'Andrew', 16, 21, 'Adam', 37, 'Max', 99 ];
      iter = $mdUtil.iterator(list);
    }));

    it('should use first() properly', function () {

      expect(iter.first()).toBe(13);

      iter.add("47");
      expect(iter.first()).toBe(13);

      iter.add('Md', 0);
      expect(iter.first()).toBe('Md');

      iter.remove('Md');
      expect(iter.first()).toBe(13);

      iter.remove(iter.first());
      expect(iter.first()).toBe(14);
    });

    it('should last() items properly', inject(function ($mdUtil) {

      expect(iter.last()).toBe(99);

      iter.add("47");
      expect(iter.last()).toBe("47");

      iter.add('Md', list.length);
      expect(iter.last()).toBe('Md');

      iter.remove('Md');
      expect(iter.last()).toBe("47");

      iter.remove(iter.last());
      iter.remove(iter.last());
      expect(iter.last()).toBe('Max');

      iter.remove(12);
      expect(iter.last()).toBe('Max');
      expect(iter.first()).toBe(13);

      iter = $mdUtil.iterator([ 2, 5 ]);
      iter.remove(2);
      expect(iter.last()).toBe(iter.first());

    }));

    it('should use hasNext() properly', function () {

      expect( iter.hasNext( iter.first()) ).toBe(true);
      expect( iter.hasNext( iter.last()) ).toBe(false);
      expect( iter.hasNext(99)).toBe(false);
      expect( iter.hasNext('Andrew')).toBe(true);

      iter.add(100);
      expect( iter.hasNext(99) ).toBe(true);
      iter.remove(100);
      expect( iter.hasNext(99) ).toBe(false);

    });

    it('should use hasPrevious() properly', inject(function ($mdUtil) {

      expect( iter.hasPrevious( iter.first()) ).toBe(false);
      expect( iter.hasPrevious( iter.last()) ).toBe(true);
      expect( iter.hasPrevious(99)).toBe(true);
      expect( iter.hasPrevious(13)).toBe(false);
      expect( iter.hasPrevious('Andrew')).toBe(true);

      iter.add(100);
      expect( iter.hasPrevious(99) ).toBe(true);
      iter.remove(100);
      expect( iter.hasPrevious(99) ).toBe(true);

      iter.remove(13);
      expect( iter.hasPrevious(iter.first()) ).toBe(false);

      iter =  $mdUtil.iterator(list = [ 2, 3 ]);
      expect( iter.hasPrevious(iter.last()) ).toBe(true);
      iter.remove(2);
      expect( iter.hasPrevious(iter.last()) ).toBe(false);
      expect( iter.hasPrevious(iter.first()) ).toBe(false);

      iter.remove(iter.first());
      expect( iter.count() ).toBe(0);
      expect( iter.hasPrevious(iter.first()) ).toBe(false);


      expect( iter.hasPrevious(null) ).toBe(false);
    }));

    it('should use next() properly', function () {

      expect( iter.next(iter.first()) ).toBe(14);

      iter.add("47",0);
      expect( iter.next(iter.first()) ).toBe(13);

      var index = list.length - 3;
      expect( iter.next(iter.itemAt(index)) ).toBe('Max');

      expect( iter.next(99) ).toBeNull();
      expect( iter.next(null) ).toBeNull();
    });

    it('should use previous() properly', function () {

      expect( iter.previous(iter.last()) ).toBe('Max');
      expect( iter.previous(iter.first()) ).toBeNull();

      iter.add("47",0);
      expect( iter.previous(iter.itemAt(1)) ).toBe("47");

      var index = list.length - 3;
      expect( iter.previous(iter.itemAt(index)) ).toBe('Adam');

      expect( iter.previous(99) ).toBe('Max');
      expect( iter.previous(null) ).toBeNull();
    });

  });

  describe('use to provide navigation with validation ', function () {
    var list, iter;
    var validate = function(item) { return (item !== 14) && (item !== 'Andrew'); };

    beforeEach(inject(function ($mdUtil) {
      list = [ 13, 14, 'Marcy', 15, 'Andrew', 16, 21, 'Adam', 37, 'Max', 99 ];
      iter = $mdUtil.iterator(list);
    }));

    it('should use next() properly', function () {

      expect( iter.next(13,      validate) ).toBe('Marcy');
      expect( iter.next('Marcy', validate) ).toBe(15);
      expect( iter.next(15,      validate) ).toBe(16);

    });

    it('should use previous() properly', function () {

      expect( iter.previous(16,      validate) ).toBe(15);
      expect( iter.previous(15,      validate) ).toBe('Marcy');
      expect( iter.previous('Marcy', validate) ).toBe(13);

    });

  });

  describe('use to provide navigation API with relooping', function () {
    var list, iter;

    beforeEach(inject(function ($mdUtil) {
      list = [13, 14, 'Marcy', 15, 'Andrew', 16, 21, 'Adam', 37, 'Max', 99];
      iter = $mdUtil.iterator(list, true);
    }));

    it('should use first() properly', inject(function ($mdUtil) {
      expect(iter.first()).toBe(13);

      iter.add("47");
      expect(iter.first()).toBe(13);

      iter.add('Md', 0);
      expect(iter.first()).toBe('Md');

      iter.remove('Md');
      expect(iter.first()).toBe(13);

      iter.remove(iter.first());
      expect(iter.first()).toBe(14);

      iter = $mdUtil.iterator([2, 5]);
      iter.remove(5);
      expect(iter.first()).toBe(iter.last());
    }));

    it('should last() items properly', inject(function ($mdUtil) {
      expect(iter.last()).toBe(99);

      iter.add("47");
      expect(iter.last()).toBe("47");

      iter.add('Md', list.length);
      expect(iter.last()).toBe('Md');

      iter.remove('Md');
      expect(iter.last()).toBe("47");

      iter.remove(iter.last());
      iter.remove(iter.last());
      expect(iter.last()).toBe('Max');

      iter.remove(12);
      expect(iter.last()).toBe('Max');
      expect(iter.first()).toBe(13);

      iter = $mdUtil.iterator([2, 5]);
      iter.remove(2);
      expect(iter.last()).toBe(iter.first());
    }));

    it('should use hasNext() properly', inject(function ($mdUtil) {
      expect(iter.hasNext(iter.first())).toBe(true);
      expect(iter.hasNext(iter.last())).toBe(false);
      expect(iter.hasNext(99)).toBe(false);
      expect(iter.hasNext('Andrew')).toBe(true);

      iter.add(100);
      expect(iter.hasNext(99)).toBe(true);
      iter.remove(100);
      expect(iter.hasNext(99)).toBe(false);

      iter = $mdUtil.iterator(list = [2, 3]);
      expect(iter.hasNext(iter.first())).toBe(true);
      iter.remove(3);
      expect(iter.hasNext(iter.first())).toBe(false);
      expect(iter.hasNext(iter.last())).toBe(false);

      iter.remove(iter.last());
      expect(iter.count()).toBe(0);
      expect(iter.hasNext(iter.last())).toBe(false);

      expect(iter.hasNext(null)).toBe(false);
    }));

    it('should use hasPrevious() properly', inject(function ($mdUtil) {
      expect(iter.hasPrevious(iter.first())).toBe(false);
      expect(iter.hasPrevious(iter.last())).toBe(true);
      expect(iter.hasPrevious(99)).toBe(true);
      expect(iter.hasPrevious(13)).toBe(false);
      expect(iter.hasPrevious('Andrew')).toBe(true);

      iter.add(100);
      expect(iter.hasPrevious(99)).toBe(true);
      iter.remove(100);
      expect(iter.hasPrevious(99)).toBe(true);

      iter.remove(13);
      expect(iter.hasPrevious(iter.first())).toBe(false);

      iter = $mdUtil.iterator(list = [2, 3]);
      expect(iter.hasPrevious(iter.last())).toBe(true);
      iter.remove(2);
      expect(iter.hasPrevious(iter.last())).toBe(false);
      expect(iter.hasPrevious(iter.first())).toBe(false);

      iter.remove(iter.first());
      expect(iter.count()).toBe(0);
      expect(iter.hasPrevious(iter.first())).toBe(false);

      expect(iter.hasPrevious(null)).toBe(false);
    }));

    it('should use next() properly', function () {
      expect(iter.next(iter.first())).toBe(14);

      iter.add('47',0);
      expect(iter.next(iter.first())).toBe(13);

      var index = list.length - 3;
      expect(iter.next(iter.itemAt(index))).toBe('Max');

      expect(iter.next(99)).toBe('47');
      expect(iter.next(null)).toBeNull();
    });

    it('should use previous() properly', function () {
      expect(iter.previous(iter.last())).toBe('Max');

      iter.add('47',0);
      expect(iter.previous(iter.itemAt(1))).toBe("47");

      var index = list.length - 3;
      expect(iter.previous(iter.itemAt(index))).toBe('Adam');

      expect(iter.previous(99)).toBe('Max');
      expect(iter.previous('47')).toBe(99);
      expect(iter.previous(null)).toBeNull();
    });
  });

  describe('use to provide navigation API with relooping and validation', function () {
    var list, iter;
    var validate1 = function (item) { return (item !== 14) && (item !== 'Andrew'); };
    var validate2 = function () { return false; };

    beforeEach(inject(function ($mdUtil) {
      list = [13, 14, 'Marcy', 15, 'Andrew', 16, 21, 'Adam', 37, 'Max', 99];
      iter = $mdUtil.iterator(list, true);
    }));

    it('should use next() properly', function () {
      expect(iter.next(13, validate1)).toBe('Marcy');
      expect(iter.next('Marcy', validate1)).toBe(15);
      expect(iter.next(15, validate1)).toBe(16);
      expect(iter.next(99, validate1)).toBe(13);

      expect(iter.next(iter.first(), validate2)).toBeNull();
      expect(iter.next(iter.last(), validate2)).toBeNull();
    });

    it('should use previous() properly', function () {
      expect(iter.previous(16, validate1)).toBe(15);
      expect(iter.previous(15, validate1)).toBe('Marcy');
      expect(iter.previous('Marcy', validate1)).toBe(13);
      expect(iter.previous(13, validate1)).toBe(99);

      expect(iter.previous(iter.last(), validate2)).toBeNull();
      expect(iter.previous(iter.first(), validate2)).toBeNull();
    });
  });

  describe('use to provide a search API ', function () {
    var list, iter;

    beforeEach(inject(function ($mdUtil) {
      list = [
        { gender:"male", name:'Thomas' },
        { gender:"male", name:'Andrew' },
        { gender:"female", name:'Marcy' },
        { gender:"female", name:'Naomi' },
        { gender:"male", name:'Adam' },
        { gender:"male", name:'Max' }
      ];
      iter = $mdUtil.iterator(list);
    }));

    it('should use findBy() properly', function () {

      // Datasets found
      expect(iter.findBy("gender","male").length).toBe(4);
      expect(iter.findBy("gender","female").length).toBe(2);

      // Existing Record found
      expect(iter.findBy("name","Naomi").length).toBe(1);

      // Record not found
      expect(iter.findBy("gender","Ryan").length).toBe(0);

      // Property not found
      expect(iter.findBy("age",27).length).toBe(0);

    });

  });

});
