import React, { FC, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Modal from 'components/commercetools-ui/atoms/modal';
import { useNuveiContext } from 'context/nuvei';
import parseJwt from 'helpers/utils/decodeJwt';
import getCookie from 'helpers/utils/getCookie';
export interface Props {
  modalIsOpen: boolean;
  closeModal: () => void;
  handleCancelClick: () => void;
  handleDeleteClick: () => void;
}

const NuveiWidget: FC<Props> = ({ modalIsOpen, closeModal, handleCancelClick, handleDeleteClick }) => {
  const [container, setContainer] = useState(false);
  const [widgetInitialized, setWidgetInitialized] = useState(false);
  const [, setChanges] = useState(0);
  const pathname = usePathname();

  const frontasticSession = parseJwt(getCookie('frontastic-session') ?? '');
  const enableSavePM = frontasticSession
    ? frontasticSession.userId && frontasticSession.userId.length > 0
      ? true
      : false
    : false;

  const router = useRouter();

  const customRef = useCallback((ref: any) => {
    if (ref) {
      setContainer(true);
      return;
    }

    setContainer(false);
  }, []);

  const { state: nuveiState } = useNuveiContext();

  useEffect(() => {
    if (widgetInitialized) {
      window.checkout.destroy();
    }
    setChanges((prev) => prev + 1);
  }, [pathname]);

  useEffect(() => {
    if (container && !widgetInitialized) {
      window.checkout({
        sessionToken: nuveiState.sessionToken,
        env: nuveiState.env,
        merchantId: nuveiState.merchantId,
        merchantSiteId: nuveiState.merchantSiteId,
        amount: nuveiState.payment.amount,
        currency: nuveiState.payment.currency,
        email: nuveiState.payment.email,
        billingAddress: {
          email: nuveiState.payment.email,
          country: nuveiState.payment.country,
        },
        savePM: enableSavePM,
        renderTo: '.container_for_checkout',
        country: nuveiState.payment.country,
        userId: nuveiState.payment.userId,
        apmConfig: {
          GooglePay: {
            googleMerchantId: nuveiState.googleMerchantId,
          },
        },
        onResult: async (result: any) => {
          if (result.result === 'APPROVED') {
            window.checkout.destroy();
            router.push(`/thank-you?orderId=${nuveiState.payment.orderId}`);
          }
        },
      });

      setWidgetInitialized(true);
    }
  }, [container, widgetInitialized]);

  return (
    <Modal
      shouldCloseOnOverlayClick
      preventScroll
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className="nuvei-modal h-[280px] w-[400px] rounded-md border bg-neutral-100"
    >
      <div className="mx-auto p-24 md:ml-24 lg:ml-0">
        <div className="pt-32 md:max-w-[436px] md:pl-36">
          <div ref={customRef} className="container_for_checkout"></div>
        </div>
      </div>
    </Modal>
  );
};

export default NuveiWidget;
