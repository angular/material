angular
	.module('tstrap.formFields')
	.directive('tsInput', TsInput);


/**
 * @ngdoc directive
 * @name tsInput
 * @module tsstrap.formFields
 *
 * @description
 * `<ts-input>` is a common component to match the required stules
 *
 * There is an example below of how this should look.
 *
 * @param {string} label A lable for the input
 * @param {string} type A type for the input
 * @param {string} name A name used for the form input
 * @param {string=} ng-model A string used to preset and/or be used
 * @param {boolean} required Requires the the input filled
 * @param {boolean} optional Shows optional text to user
 *
 * @usage
 * ### Basic Example
 * <hljs lang="html">
 *	<ts-input
 *		label="First Name"
 *		type="text"
 *		ng-model="sample.user.firstname"
 *		name="firstname"
 *		required>
 *	</ts-input>
 * </hljs>
 */

function TsInput() {
	return {
		restrict: 'E',
		require: '?ngModel',
		link: function(scope, elm, attr, ctrl){
			if(!ctrl) return;

			var pattern;

			elm.find('label').text(attr.label);
			elm.find('input').attr({
				'type': attr.type,
				'name': attr.name,
				'placeholder': attr.placeholder
			});

			if(angular.isDefined(attr.required) || angular.isUndefined(attr.optional)){
				elm.find('span').remove();
			}

			if(attr.type === 'email'){
				pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			} else if(angular.isDefined(attr.pattern)){
				pattern = new RegExp(attr.pattern);
			}

			elm.find('input').on('focus', function focus(){
				elm.addClass('focus');
				elm.find('label').addClass('focus');
				elm.find('span').addClass('focus');

				ctrl.$setTouched();
				scope.$apply();
			});

			elm.find('input').on('blur', function(){
				elm.removeClass('focus');

				if(elm.find('input').val() === ''){
					elm.find('span').removeClass('focus');
					elm.find('label').removeClass('focus');
				}
			});

			elm.find('input').on('keyup', function(){
				ctrl.$setViewValue(elm.find('input').val());
				ctrl.$commitViewValue();
			});

			elm.find('i').on('click', function(){
				elm.find('input').val('');
				ctrl.$setViewValue('');
				ctrl.$commitViewValue();
				elm.find('input')[0].focus();
			});

			scope.$watch(attr.ngModel, function(newValue){
				if(!ctrl.$isEmpty(newValue)){
					elm.find('input').val(newValue);
					elm.find('label').addClass('focus');
				}
			});

			ctrl.$validators.pattern = function(modelValue, viewValue){
				return ctrl.$isEmpty(viewValue) || angular.isUndefined(pattern) || pattern.test(viewValue);
			};

			ctrl.$validators.required = function(modelValue, viewValue){
				return angular.isUndefined(attr.required) || viewValue !== '';
			};
		},
		template: function(){
			return '<span class="optional">Optional</span>\
					<input />\
					<label></label>\
					<i class="fa fa-times-circle-o clear"></i>';
		}
	};
}