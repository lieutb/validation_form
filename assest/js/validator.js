function Validator(option) {
    const selectRules = {}
    const formElement = document.querySelector(option.formSelector)
    if (formElement) {
        // handle submit form, loop and validate all input
        formElement.onsubmit = function (e) {
            e.preventDefault()
            let isFormValid = true
            option.rule.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector)
                let isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            });

            if (isFormValid) {
                // submit with javascript
                if (typeof option.onSubmit == 'function') {
                    let enableInputs = formElement.querySelectorAll('[name]')
                    let formData = Array.from(enableInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})

                    // callback
                    option.onSubmit(formData)
                } else {
                    // submit with default form
                    formElement.submit()
                }
            }
        }

        option.rule.forEach(rule => {
            let inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach((inputElement) => {
                if (inputElement) {
                    let parent = inputElement.closest(option.formGroupSelector)

                    // save rules in selectRules
                    if (Array.isArray(selectRules[rule.selector])) {
                        selectRules[rule.selector].push(rule.check)
                    } else {
                        selectRules[rule.selector] = [rule.check]
                    }

                    // handle onblur, show message when blur
                    inputElement.onblur = function () {
                        validate(inputElement, rule)
                    }

                    // handle oninput, remove message when typing
                    inputElement.oninput = function () {
                        parent.classList.remove('invalid')
                        parent.querySelector(option.errorSelector).innerText = ''
                    }

                    // handle onchange select
                    inputElement.onchange = function () {
                        if (!inputElement.value) {
                            validate(inputElement, rule)
                        }
                        console.log(inputElement.value);
                        // parent.classList.remove('invalid')
                        // parent.querySelector(option.errorSelector).innerText = ''
                    }
                }
            })
        })
    }

    // handle validate
    function validate(inputElement, rule) {
        let errorMessage
        let parent = inputElement.closest(option.formGroupSelector)

        // get rule of selector
        let currentRule = selectRules[rule.selector]

        // loop and check input
        for (let i = 0; i < currentRule.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = currentRule[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default:
                    errorMessage = currentRule[i](inputElement.value)
            }

            // exit on errorMessage available
            if (errorMessage) break
        }

        if (errorMessage) {
            parent.classList.add('invalid')
            parent.querySelector(option.errorSelector).innerText = errorMessage
        } else {
            parent.classList.remove('invalid')
            parent.querySelector(option.errorSelector).innerText = ''
        }

        return !errorMessage
    }
}

Validator.isRequired = function (selector, message) {
    return {
        selector,
        check(value) {
            return value ? undefined : message || 'Vui l??ng nh???p tr?????ng n??y!'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector,
        check(value) {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Tr?????ng n??y ph???i l?? email!'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector,
        check(value) {
            return value.length >= min ? undefined : message || `Vui l??ng nh???p t???i thi???u ${min} k?? t???!`
        }
    }
}

Validator.isSpacing = function (selector, message) {
    return {
        selector,
        check(value) {
            return value.includes(' ') ? message || 'M???t kh???u kh??ng ???????c ch???a k?? t??? kho???ng tr???ng!' : undefined
        }
    }
}

Validator.isConfirmed = function (selector, message, getConfirmValue) {
    return {
        selector,
        check(value) {
            return value === getConfirmValue() ? undefined : message || 'Gi?? tr??? nh???p v??o kh??ng ch??nh x??c!'
        }
    }
}