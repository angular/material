var InputErrorsPage = require('./input-errors.page.js'),
  page;

describe('inputs', function() {
  beforeEach(function() {
    page = new InputErrorsPage();
  });

  describe('with ng-messages', function() {

    it('hides the client email errors before user interaction', function() {
      page.email.expectErrorMessages(page.ERROR_MESSAGES.NO_ERRORS);
    });

    it('shows email errors after entering invalid email', function() {
      page.email.type('');
      page.email.expectErrorMessages(page.ERROR_MESSAGES.INVALID);
    });

    it('animates description properly when messages change', function() {
      // Clear the field, should see required
      page.description.type('');
      page.description.expectErrorMessages(page.ERROR_MESSAGES.REQUIRED);

      // Enter a very long description; should see maxlength error
      page.description.type('make the value too long so the length message appears');
      page.description.expectErrorMessages(page.ERROR_MESSAGES.MAXLENGTH);

      // Clear the field again, should see required
      page.description.type('');
      page.description.expectErrorMessages(page.ERROR_MESSAGES.REQUIRED);
    });

    it('does not add extra messages when a field is blurred', function() {
      // Type a few invalid responses
      page.hourlyRate.type('5000');
      page.hourlyRate.type('12345');

      // Then type a valid response
      page.hourlyRate.type('1234');

      // Focus another field
      page.description.focus();

      // Expect the hourly rate to not have any messages
      expect(page.hourlyRate.errorMessages().count()).toBe(0);
    });

  });
});
