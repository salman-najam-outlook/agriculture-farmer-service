/* eslint-disable */
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AQg0_sStegJDdn4y7X3F3SO8QpQBtegCld3pp42TbEIFnRLfmdM_DtCONxLQuXvviulx0k8kLdRf4m75',
  'client_secret': 'ENn68HNK7yuL2UyCNp5iXgOFd7piKk9SOU6Q9UGuIFFMfHnQ8Nmgk2TMb6ca_MPkiKkDujMUQepSnSIj'
});

module.exports = {
  paypal
}