import React, { useCallback, useState, useContext } from 'react';
import { useNuveiContext } from 'context/nuvei';
import { sdk } from 'sdk';
import { PaymentData, PaymentProvider } from './payment/types';

const CheckoutContext = React.createContext({});

export const useCheckout = () => {
  const [paymentData, setPaymentData] = useState<PaymentData | Partial<PaymentData>>({ type: 'nuvei' });
  const { dispatch, state } = useNuveiContext();

  const handleInitNuveiSimplyConnect = useCallback((data: any, orderNumber: string) => {
    dispatch({ type: 'setSessionToken', payload: data.sessionToken });
    dispatch({
      type: 'setPaymentData',
      payload: {
        orderId: data.orderId,
        amount: data.centAmount / 100,
        currency: data.currency,
        email: data.email,
        country: data.country,
        userId: data.userId,
      },
    });
    dispatch({ type: 'openModal' });
  }, []);
  //Call `useContext` here with your implemented provider
  return {
    paymentData,
    paymentDataIsValid: true,
    processing: false,
    setProcessing: () => {},
    getPaymentMethods: useCallback(
      async () => [
        { name: 'Credit Card', type: 'scheme', image: {} },
        { name: state.paymentMethodLabel, type: 'nuvei', image: {} },
      ],
      [state],
    ),
    makePayment: async () => {},
    makeKlarnaPayment: async () => {},
    setPaymentData,
    handleThreeDS2Action: async () => {},
    handleInitNuveiSimplyConnect,
    makeNuveiPayment: async (data: any) => {
      try {
        const result: any = await sdk.callAction({
          actionName: 'nuvei/makePayment',
          payload: data,
        });

        return result.data;
      } catch (err) {
        console.error('There was an error with the nuvei/makePayment action:');
        console.error(err);
      }
    },
  } as unknown as PaymentProvider;
};

const CheckoutProvider = ({ children }: React.PropsWithChildren) => {
  return <CheckoutContext.Provider value={{}}>{children}</CheckoutContext.Provider>;
};

export default CheckoutProvider;
