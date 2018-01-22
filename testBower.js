angular.module('WSI.validation-directives', ['pascalprecht.translate'])
.directive('dsField', function ($compile) {
    return {
        scope: {
            value: '=dsField'
        },
        restrict: 'AC',
        link: function (scope, element, attributes) {
            var input = element.find('input, select');
            var label = element.find('label');

            element.addClass('ds-field');
                if (input[0] && input[0].tagName === 'SELECT') {
                element.addClass('ds-field--select');
            }
            input.addClass('ds-field__input');
            label.addClass('ds-field__label');

            input.on('focus', function () {
                element.addClass('ds-field--has-focus');
            });
            input.on('blur', function () {
                element.removeClass('ds-field--has-focus');
            });

            scope.$watch('value', function (newValue) {
                if (newValue) {
                    element.addClass('ds-field--is-dirty');
                } else {
                    element.removeClass('ds-field--is-dirty');
                }
            });
        }
    };
})
.directive('validate', function ($translate) {
    //TODO: Create checkbox logic for enroller/sponsor ids...
    //TODO: Create animation when continue button is clicked..

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var formcompletecheck = true;
            var StopExecution = true;
            /*--Window Blur logic---*/

            /* Note: In Chrome - if focused on an input and then you blur out of the browser ie: Click on a different application - two blurs get called
            the input blur and window.blur - the following logic addresses this use case. A check for windowBlur happens in showErr() method below... */

            var windowBlur = false;
            $(window).blur(function () { windowBlur = true; });
            $(window).focus(function () { windowBlur = false; });



            element.focus(function () {
                //on focus remove all visible error states/msgs
                element.closest('.control-group').removeClass('has-error');
                element.closest('.control-group').find(".has-error").remove();
                element.parent('.ds-field').removeClass('ds-field--has-error');
                element.parent('.ds-field').find(".has-error").remove();
                element.find('state-error').remove();
                element.removeClass('state-error');
                element.removeClass('state-success');
                element.find('state-success').remove();

            });

            /*---Cancel Validation Logic--*/
            var cancelBox = element.closest(".controls").find('.cancel-validation');
            cancelBox.click(function () {

                element.toggleClass('novalidate');

                if ($(this).is(":checked")) {
                    element.closest('.control-group').removeClass('has-error');
                    element.closest('.control-group').find(".has-error").remove();
                    element.closest('.control-group').hide();
                    scope.$apply(attrs.updateId);

                }
                else {

                    element.closest('.control-group').show();

                }

            });


            element.blur(function () {
                StopExecution = false;
                checkForm(element, 0);
            });

            element.keypress("keydown keypress", function (e) {

                if (!!element.attr('inputspace')) {

                    var altkeypress;
                    if (e.altKey) {
                        altkeypress = true;
                    }
                    else {
                        if (altkeypress) {
                            altkeypress = false;
                            return false;
                        }
                    }

                    if (e.which === 32 || e.which === 33 || e.which === 34 || e.which === 35 || e.which === 36 || e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40 || e.which === 41 || e.which === 42 || e.which === 43 || e.which === 44 || e.which === 46 || e.which === 47 || e.which === 45 || e.which === 58 || e.which === 59 || e.which === 60 || e.which === 61 || e.which === 62 || e.which === 63 || e.which === 64 || e.which === 91 || e.which === 93 || e.which === 92 || e.which === 94 || e.which === 95 || e.which === 96 || e.which === 123 || e.which === 124 || e.which === 125 || e.which === 126) {
                        return false;
                    }
                }
                if (!!element.attr('inputonlynumber')) {
                    if ((e.which >= 32 && e.which <= 47) || e.which === 58 || e.which === 59 || e.which === 60 || e.which === 61 || e.which === 62 || e.which === 63 || e.which === 64 || (e.which <= 122 && e.which >= 65) || e.which === 123 || e.which === 124 || e.which === 125 || e.which === 126) {
                        return false;
                    }
                }
                if (!!element.attr('inputmobilespacendash')) {
                    if (e.which === 33 || e.which === 34 || e.which === 35 || e.which === 36 || e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40 || e.which === 41 || e.which === 42 || e.which === 43 || e.which === 44 || e.which === 46 || e.which === 47 || e.which === 58 || e.which === 59 || e.which === 60 || e.which === 61 || e.which === 62 || e.which === 63 || e.which === 64 || e.which === 91 || e.which === 93 || e.which === 92 || e.which === 94 || e.which === 95 || e.which === 96 || e.which === 123 || e.which === 124 || e.which === 125 || e.which === 126) {
                        return false;
                    }
                }
                if (!!element.attr('inputspacehypens')) {
                    if (e.which === 32 || e.which === 45) {
                        return false;
                    }
                }
            });

            var checkForm = function (element, type) {
                var msg, attr;
                var value = element.val();


                /*--attrs is not used because when the continue button is clicked attrs held the value of the button and not the element we passsed in - instead
                we check the old fashioned way with jQuery to see what validation needs to be done.--*/
                //not empty validation
                if (!!element.attr('noempty')) {
                    if ($.trim(value) === '') {
                        if (type === 0) {
                                element.parent('.ds-field').find(".has-error").remove();
                            showError('error_required_field', element);
                        }
                        else {
                            formcompletecheck = false;
                        }

                    }
                    else {
                        showSuccess(element);
                    }
                }

                if (!!element.attr('ValidName')) {
                    if (value.match(/[*^|\":<>[\]{}\\()';?/~!,]/)) {
                        if (type === 0) {
                            showError('error_special_char', element);
                        }
                        else {
                            formcompletecheck = false;
                        }
                    }
                    else {
                        showSuccess(element);
                    }
                }

                if (!!element.attr('phoneno')) {
                    if (!value.match(/^\d*$/)) {

                        if (type === 0) {
                            showError("error_only_numbers", element);
                        }
                        else {
                            formcompletecheck = false;
                        }

                    }
                }

                //min length validation
                if (!!element.attr('minmumlength')) {
                    attr = element.attr('minmumlength');
                    if (value) {
                        if (value.length < attr) {
                            if (type === 0) {
                                showError("error_minimum_chars", element, attr);
                            }
                            else {
                                formcompletecheck = false;
                            }
                        }
                        else {
                            showSuccess(element);
                        }
                    }
                }

                //email validation
                if (!!element.attr('email')) {
                    if (value) {
                        validateEmail(value);
                    }
                }
                function validateEmail(value) {
                    var filter = new RegExp('^([\\w-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([\\w-]+\\.)+))([a-zA-Z]{2,10}|[0-9]{1,3})(\\]?)$');
                    if (filter.test(value)) {
                        showSuccess(element);
                    }
                    else {
                        if (type === 0) {
                            showError("error_valid_email", element);
                        }
                        else {
                            formcompletecheck = false;
                        }
                    }
                }

                if (!!element.attr('password-match')) {
                    var currentPw = $('#txtPassword').val();
                    var pwStatus = $('.password-match');
                    if (element.val()) {
                        if (currentPw == element.val()) {
                            showSuccess(element);
                        } else {
                            if (type === 0) {
                                showError("password_not_match", element, attr);
                            }
                            else {
                                formcompletecheck = false;
                            }
                        }
                    }
                }

                //no spaces
                if (!!element.attr('nospaces')) {
                    if (value.match(/\s/g)) {
                        if (type === 0) {
                            showError('error_spaces_not_permitted', element);
                        }
                        else {
                            formcompletecheck = false;
                        }
                    }
                    else {
                        showSuccess(element);
                    }
                }

                //select validation
                if (!!element.attr('validate-select')) {
                    value = element.find('option:selected').text();

                    if (value.match(/Select a/) || value === "") {
                        if (type === 0) {
                            showError('error_make_selection', element);
                        }
                        else {
                            formcompletecheck = false;
                        }
                    }
                    else {
                        showSuccess(element);
                    }
                }

                //checkbox validation
                if (!!element.attr('checkbox-validate')) {

                    if (!element.is(":checked")) {
                        if (type === 0) {
                            showError('checkbox_required', element.parent());
                        }
                        else {
                            formcompletecheck = false;
                        }

                    }
                    else {
                        showSuccess(element);
                    }
                }

                //regex validation
                if (!!element.attr('regxvalid')) {
                    if (value) {
                        regexValidate(value, element.attr('regxvalidValue'));
                    }

                }
                function regexValidate(value, regxExp) {
                    var filter = new RegExp(regxExp);
                    if (filter.test(value)) {
                        showSuccess(element);
                    }
                    else {
                        if (type === 0) {
                            showError("INVALID_PASSWORD_FORMAT", element);
                        }
                        else {
                            formcompletecheck = false;
                        }
                    }
                }

                //regex validation
                if (!!element.attr('regxvalidzip')) {
                    if (value) {
                        regexValidateZip(value, element.attr('regexcountry').toUpperCase());
                    }
                }
                function regexValidateZip(value, countrycode) {
                    var regxExp = getRegex(countrycode);
                    var filter = new RegExp(regxExp);
                    if (filter.test(value)) {
                        showSuccess(element);
                    }
                    else {
                        if (type === 0) {
                                showError("invalid_zip_code", element);
                        }
                        else {
                            formcompletecheck = false;
                        }
                    }
                }
                function getRegex(countryCode) {
                    var regex;
                    switch (countryCode) {
                        case "AR":
                            //  regex = /^([A-HJ-TP-Z]{1}\d{4}[A-Z]{3}|[a-z]{1}\d{4}[a-hj-tp-z]{3})$/;
                            regex = /^[a-zA-Z0-9 _.-]*$/;
                            break;
                        case "AT":
                        case "AU":
                        case "BE":
                        case "HU":
                        case "NZ":
                        case "PH":
                            regex = /^\d{4}$/;
                            break;
                        case "CR":
                        case "DE":
                        case "ES":
                        case "FR":
                        case "MX":
                        case "PE":
                            regex = /^\d{5}$/;
                            break;
                        case "PA":
                        case "RU":
                        case "EC":
                        case "SG":
                        case "IN":
                            regex = /^\d{6}$/;
                            break;
                        case "JP":
                            regex = /^\d{7}$/;
                            break;
                        case "CA":
                            regex = /^([ABCEGHJKLMNPRSTVXYabceghjklmnprstvxy]\d[ABCEGHJKLMNPRSTVWXYZabceghjklmnprstvwxyz])\ {0,1}(\d[ABCEGHJKLMNPRSTVWXYZabceghjklmnprstvwxyz]\d)$/;
                            break;
                        case "CL":
                            regex = /^(\d{7}|\d{3}[-]\d{4})$/;
                            break;
                        case "KR":
                            regex = /^(\d{6}|\d{3}[-]\d{3})$/;
                            break;
                        case "NL":
                            regex = /^[1-9][0-9]{3}\s?([a-zA-Z]{2})?$/;
                            break;
                        case "PT":
                            regex = /^\d{4}([\-]?\d{3})?$/;
                            break;
                        case "US":
                            regex = /^\d{5}([\-]?\d{4})?$/;
                            break;
                        case "GB":
                            // regex = /^([g][i][r][0][a][a])$|^((([a-pr-uwyz]{1}([0]|[1-9]\d?))|([a-pr-uwyz]{1}[a-hk-y]{1}([0]|[1-9]\d?))|([a-pr-uwyz]{1}[1-9][a-hjkps-uw]{1})|([a-pr-uwyz]{1}[a-hk-y]{1}[1-9][a-z]{1}))(\d[abd-hjlnp-uw-z]{2})?)$/i;
                            //  regex = /^ ?(([BEGLMNSWbeglmnsw][0-9][0-9]?)|(([A-PR-UWYZa-pr-uwyz][A-HK-Ya-hk-y][0-9][0-9]?)|(([ENWenw][0-9][A-HJKSTUWa-hjkstuw])|([ENWenw][A-HK-Ya-hk-y][0-9][ABEHMNPRVWXYabehmnprvwxy])))) ?[0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}$/;
                            //   regex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([AZa-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
                            regex = /^([A-Pa-pR-Ur-uWYZwyz](([0-9](([0-9]|[A-Ha-hJKSTUWjkstuw])?)?)|([A-Ha-hK-Yk-y][0-9]([0-9]|[ABEHMNPRVWXYabehmnprvwxy])?)) [0-9][ABabD-Hd-hJLNjlnP-Up-uW-Zw-z]{2})|GIRgir 0AAaa$/;

                            break;
                        default:
                            regex = /^[a-zA-Z0-9 _.-]*$/;
                            break;
                    }
                    return regex;
                }
            };

            var showError = function (msg, element, value) {
                if (!element.hasClass('novalidate') && !windowBlur) {
                    if (element.closest('.control-group').find('span').hasClass('has-error')) {
                    }
                    else {
                        //create and display error message
                        element.removeClass('state-success');
                        element.addClass('state-error');
                        var container = $("<small />");
                        var nextEl = element.next();

                            msg = $translate(msg, { value: value });
                            container.text(msg).addClass('has-error help-block ng-scope').attr('translate', '');

                            //remove from end of codition and add on top of if condotion
                            element.parent(".ds-field").addClass('ds-field--has-error');

                            if (element.hasClass('errNextElem')) {
                                if (element.parent().hasClass('input-group')) {
                                    // element.parent().after(container);
                                }
                                else {
                                    // nextEl.after(container);
                                }
                            }
                            else {
                                if (element.hasClass('ds-checkbox') || element.hasClass('ds-radio')) {
                                    element.append(container);
                                } if (element.parent().hasClass('ds-field--has-error')) {
                                    element.after(container);
                                }
                            }
                            element.closest(".control-group").addClass('has-error');
                        }
                    }
                };
                var showSuccess = function (element, value) {
                    if (!element.hasClass('novalidate') && !windowBlur) {
                        if (element.closest('.control-group').find('span').hasClass('has-error')) {
                        }
                        else {
                            //create and display error message 
                            element.removeClass('state-error');
                            element.addClass('state-success');
                        }
                    }
                };

            if (attrs.triggerCheck) {
                element.click(function (ev) {
                    StopExecution = true;
                    ev.preventDefault();
                    //remove any visible errors
                    $('.control-group.has-error').not('.ccvalidation, .sumlength').removeClass('has-error');
                    $('.control-group').not('.ccvalidation, .sumlength').find(".has-error").remove();

                    scope.$apply(attrs.pvCheck);

                    //grab all inputs set for validation minus the button triggering the check
                    var inputs = $("[validate]").not("input[trigger-check]").not('.novalidate');

                    //loop through inputs and send them through checkForm
                    inputs.each(function (i, e) {
                        var element = $(e);
                        checkForm(element, 0);
                    });

                    //special pw check that happens only on btn click and if pw field exists
                    if ($("#password1").length > 0) {
                        var pw1 = $("#password1");
                        var pw2 = $("#password2");
                        var ctrlGrps = pw1.closest('.controls-row').find('.control-group');
                        if (pw1.val() !== pw2.val()) {
                            ctrlGrps.addClass('has-error');
                            $(".password-match").text("No Match").addClass('has-error');

                        }
                    }
                    var errors = $(".control-group.has-error");
                    if (errors.length === 0) {

                        scope.$apply(function () {

                            if (scope.account) {

                                $.each(scope.account, function (i, e) {

                                    scope.order.profile[i] = scope.account[i];
                                    scope.order.payment[i] = scope.order.payment[i];
                                    // scope.order.shipping[i]=scope.shipping[i];
                                });
                            }

                            if (scope.payment) {

                                $.each(scope.payment, function (i, e) {
                                    scope.order.payment[i] = scope.payment[i];
                                });

                                $.each(scope.shipping, function (i, e) {
                                    scope.order.shipping[i] = scope.shipping[i];
                                });
                            }

                            if (scope.signature) {
                                scope.order.signature = scope.signature;
                            }

                        });

                        scope.$apply(attrs.success);
                    } else {
                        var target = $(".control-group.has-error")[0];
                        $('html, body').animate({
                            scrollTop: $(target).offset().top -100
                        }, 1000); //animate scroll to first error
                    }
                });
            }
        }

    };
});