'use strict';

function InputErrorsPage() {
  browser.get('/#/demo/input');

  this.ERROR_MESSAGES = {
    NO_ERRORS: null,
    REQUIRED: /required/i,
    MAXLENGTH: /less than/i,
    INVALID: /^You/
  };

  this.description = new Field(this, 'description');
  this.email = new Field(this, 'clientEmail');
  this.hourlyRate = new Field(this, 'rate');
}

function Field(page, name) {
  this.page = page;
  this.name = name;
}

/**
 * Retrieves the input element
 */
Field.prototype.input = function() {
  return element(by.model('project.' + this.name));
};

/**
 * Focuses the input element
 */
Field.prototype.focus = function() {
  var input = this.input();

  input.click();
};

/**
 * Clears, then types the requested text into the field,
 * and tabs out to blur the element.
 *
 * @param text The text to be typed into the field.
 */
Field.prototype.type = function(text) {
  var input = this.input();

  // Clear, then type the text
  input.clear();
  input.sendKeys(text);

  // Tab out of the element
  input.sendKeys(protractor.Key.TAB);

  // Sleep for a half second to let the animations finish
  // TODO: This should not be necessary, but the expectations fail without it
  browser.sleep(500);

  return input;
};


/**
 * Retrieves the field's current error messages.
 */
Field.prototype.errorMessages = function() {
  var base = '[ng-messages="projectForm.' + this.name + '.$error"]';
  var selectors = [
    base + ' [ng-message]',
    base + ' [ng-message-exp]'
  ];
  return element.all(by.css(selectors.join()));
};


/**
 * Runs the expectations for the requested error message.
 *
 * @param kind {pattern} The kind of error. One of:
 *  - ERROR_MESSAGES.NO_ERRORS
 *  - ERROR_MESSAGES.REQUIRED
 *  - ERROR_MESSAGES.MAXLENGTH
 */
Field.prototype.expectErrorMessages = function(kind) {
  var messages = this.errorMessages();

  if (kind == this.page.ERROR_MESSAGES.NO_ERRORS) {
    expect(messages.getText()).toEqual(['']);
  } else {
    // Should see the matching message
    expect(messages.getText()).toMatch(kind);
    expect(messages.getCssValue('margin-top')).toEqual(['0px']);
  }
};

module.exports = InputErrorsPage;