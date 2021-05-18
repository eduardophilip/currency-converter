const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currenciesEl = document.querySelector('[data-js="currencies-container"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]');
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]');


const showAlert = errorMessage => {
    const divAlert = document.createElement('div');
    const buttonCloseAlert = document.createElement('button');


    divAlert.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
    divAlert.setAttribute('role', 'alert');
    divAlert.textContent = errorMessage.message

    buttonCloseAlert.classList.add('btn-close')
    buttonCloseAlert.setAttribute('type', 'button')
    buttonCloseAlert.setAttribute('aria-label', 'Close')

    const removeAlert = () => divAlert.remove() 
    buttonCloseAlert.addEventListener('click', removeAlert)

    divAlert.appendChild(buttonCloseAlert);
    currenciesEl.insertAdjacentElement('afterend', divAlert);


}

const state = (() => {
    let exchangeRate = {}

    return {
        getExchangeRates: () => exchangeRate,
        setExchangeRates: (newExchangeRate) => {
            if(!newExchangeRate.conversion_rates) {
                showAlert( {
                    message: 'objeto precisa ter uma propriedade convertion_rates'
                })
                return
            }

            exchangeRate = newExchangeRate
            return exchangeRate
        }  
    }
})()

const getUrl = currency => `https://v6.exchangerate-api.com/v6/dc937295badb49f0b06988c9/latest/${currency}`

const getErrorMessage = errorType => ({
    'unsupported-code': 'we don \'t support the supplied currency code (see supported currencies...).',
    'malformed-request': 'Some part of your request doesn\'t follow the structure shown above.',
    'invalid-key': 'your API key is not valid.',
    'inactive-account': 'your email address wasn\'t confirmed.',
    'quota-reached': 'Your account has reached the the number of requests allowed by your plan.'
})[errorType] || 'Don\'t possible get informations.'


const fetchExchangeRate = async (url) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Without internet! Communication error with the server')
        }

        const exchangeRateData = await response.json();

        if (exchangeRateData.result === 'error') {
            const errorMessage = getErrorMessage(exchangeRateData['error-type'])  

            throw new Error(errorMessage)
        }

        return state.setExchangeRates(exchangeRateData) 

    } catch (err) {
        showAlert(err)
    }
}

const getOptions = (selectedCurrency, conversion_rates) => {
    const setSelectAttribute = currency => 
        currency === selectedCurrency ? 'selected' : ''  

    const getOptionsAsArray = currency =>  `<option ${setSelectAttribute(currency)}>${currency}</option>`

    return Object.keys(conversion_rates)
            .map(getOptionsAsArray)
            .join('');
}

const showInitialInfo = ({conversion_rates}) => {

    currencyOneEl.innerHTML = getOptions('USD', conversion_rates);
    currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates);
    convertedValueEl.textContent = conversion_rates.BRL.toFixed(2)

    valuePrecisionEl.textContent = `1 USD = ${conversion_rates.BRL} BRL`
}

const init = async () => {

    const url = getUrl('USD');
    const exchangeRate = await fetchExchangeRate(url)

    if (exchangeRate && exchangeRate.conversion_rates) {  
        showInitialInfo(exchangeRate)
    }
}

const showUpdatedRates = ({conversion_rates}) => {
    convertedValueEl.textContent = (timesCurrencyOneEl.value * conversion_rates[currencyTwoEl.value]).toFixed(2);

    valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
}

const getNewUpdatedExchangeRate = () => {
    const getNewExchangeRate = state.getExchangeRates();
    showUpdatedRates(getNewExchangeRate)
}

timesCurrencyOneEl.addEventListener('input', getNewUpdatedExchangeRate);
currencyTwoEl.addEventListener('input', getNewUpdatedExchangeRate);
currencyOneEl.addEventListener('input', async e => {

    const url = getUrl(e.target.value);
    const newUpdatedExchangeRate = await fetchExchangeRate(url);

    showUpdatedRates(newUpdatedExchangeRate)

});

init()








