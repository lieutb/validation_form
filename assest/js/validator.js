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
                        values[input.name] = input.value
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
            let inputElement = formElement.querySelector(rule.selector)
            let parent = inputElement.closest(option.formGroupSelector)
            if (inputElement) {
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
            }
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
            errorMessage = currentRule[i](inputElement.value)

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
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector,
        check(value) {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email!'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector,
        check(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự!`
        }
    }
}

Validator.spacing = function (selector) {
    return {
        selector,
        check(value) {
            return value.includes(' ') ? 'Mật khẩu không được chứa khoảng trắng!' : undefined
        }
    }
}

Validator.isConfirmed = function (selector, message, getConfirmValue) {
    return {
        selector,
        check(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!'
        }
    }
}