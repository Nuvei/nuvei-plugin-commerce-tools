import React, { createContext, useReducer, useEffect, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { sdk } from 'sdk';

const initialNuveiState: any = {
  env: '',
  merchantId: '',
  merchantSiteId: '',
  isModalOpened: false,
  sessionToken: '',
  paymentMethodLabel: 'Nuvei',
  payment: {
    orderId: '',
    amount: 0,
    currency: '',
    email: '',
    country: '',
    userId: '',
  },
};

const nuveiStateReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'setConfig':
      return {
        ...state,
        env: action.payload.env,
        merchantId: action.payload.merchantId,
        merchantSiteId: action.payload.merchantSiteId,
        paymentMethodLabel: action.payload.paymentMethodLabel,
      };
    case 'openModal':
      return { ...state, isModalOpened: true };
    case 'closeModal':
      return { ...state, isModalOpened: false };
    case 'setSessionToken':
      return { ...state, sessionToken: action.payload };
    case 'clearSessionToken':
      return { ...state, sessionToken: '' };
    case 'setPaymentData':
      return { ...state, payment: action.payload };
    default:
      return { ...state };
  }
};

export const NuveiContext = createContext(initialNuveiState);

export default function NuveiProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(nuveiStateReducer, initialNuveiState);
  const pathname = usePathname();

  const nuveiProviderValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  useEffect(() => {
    if (state.merchantId === '' || state.merchantSiteId === '') {
      sdk
        .callAction({
          actionName: 'nuvei/getSettings',
        })
        .then((result: any) => {
          dispatch({
            type: 'setConfig',
            payload: {
              env: result.data.nuveiEnv,
              merchantId: result.data.nuveiMerchantId,
              merchantSiteId: result.data.nuveiMerchantSiteId,
              googleMerchantId: result.data.nuveiGoogleMerchantId,
              paymentMethodLabel: result.data.nuveiPaymentMethodLabel,
            },
          });
        })
        .catch((error: any) => {
          console.error(error);
          dispatch({
            type: 'setConfig',
            payload: {
              env: '',
              merchantId: '',
              merchantSiteId: '',
              paymentMethodLabel: 'Nuvei',
            },
          });
        });
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'closeModal' });

    return () => {
      dispatch({ type: 'closeModal' });
    };
  }, [pathname]);

  return <NuveiContext.Provider value={nuveiProviderValue}>{children}</NuveiContext.Provider>;
}

export const useNuveiContext = () => {
  return useContext(NuveiContext);
};
