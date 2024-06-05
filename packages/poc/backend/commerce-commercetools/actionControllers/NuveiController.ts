import { ActionContext, Request, Response } from '@frontastic/extension-types';
import { CartApi } from '../apis/CartApi';
import { getCurrency, getLocale } from '../utils/Request';
import { CartFetcher } from '../utils/CartFetcher';
import { Payment, PaymentStatuses } from '@Types/cart/Payment';
import { getFromProjectConfig } from '@Commerce-commercetools/utils/Context';

type ActionHook = (request: Request, actionContext: ActionContext) => Promise<Response>;

export const makePayment: ActionHook = async (request, actionContext) => {
  const cartApi = getCartApi(request, actionContext);
  let cart = await CartFetcher.fetchCart(cartApi, request, actionContext);

  const paymentRequest = JSON.parse(request.body);

  const payment: Payment = {
    ...paymentRequest,
    paymentProvider: 'nuvei',
    paymentStatus: PaymentStatuses.PENDING,
  };

  payment.amountPlanned.centAmount = payment.amountPlanned.centAmount ?? cart.sum.centAmount ?? undefined;
  payment.amountPlanned.currencyCode = payment.amountPlanned.currencyCode ?? cart.sum.currencyCode ?? undefined;

  cart = await cartApi.addPayment(cart, payment, request.sessionData?.anonymousId, request.sessionData?.userId);
  const order = await cartApi.order(cart, { orderNumber: paymentRequest.orderNumber, paymentState: 'Pending' });

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        action: { type: 'nuveiSimplyConnect' },
        resultCode: 'ChallengeShopper',
        sessionToken: order.payments[0]?.['custom']?.['fields']?.['sessionToken'],
        centAmount: order.payments[0]?.amountPlanned?.centAmount,
        currency: order.payments[0]?.amountPlanned?.currencyCode,
        email: order.email,
        country: order.billingAddress?.country,
        userId: request.sessionData?.anonymousId || request.sessionData?.userId,
        orderId: order.orderId
      },
      null,
      2,
    ),
  };

  return Promise.resolve(response);
};

export const getSettings: ActionHook = async (request: Request, actionContext: ActionContext) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            nuveiEnv: getFromProjectConfig('NUVEI_ENV', actionContext.frontasticContext),
            nuveiMerchantId: getFromProjectConfig('NUVEI_MERCHANT_ID', actionContext.frontasticContext),
            nuveiMerchantSiteId: getFromProjectConfig('NUVEI_MERCHANT_SITE_ID', actionContext.frontasticContext),
            nuveiGoogleMerchantId: getFromProjectConfig('NUVEI_GOOGLE_MERCHANT_ID', actionContext.frontasticContext),
            nuveiPaymentMethodLabel: getFromProjectConfig('NUVEI_PAYMENT_METHOD_LABEL', actionContext.frontasticContext),
        })
    };
};

function getCartApi(request: Request, actionContext: ActionContext) {
  return new CartApi(actionContext.frontasticContext, getLocale(request), getCurrency(request), request);
}
