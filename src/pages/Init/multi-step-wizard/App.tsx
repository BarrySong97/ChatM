"use client";

import React, { useEffect, useState } from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";

import MultistepSidebar from "./multistep-sidebar";
import SelectLlm from "./select-llm";
import CompanyInformationForm from "./company-information-form";
import ChooseAddressForm from "./choose-address-form";
import ReviewAndPaymentForm from "./review-and-payment-form";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import InitBasicInfo from "./init-basic-info";
import { user } from "@nextui-org/react";
import { useUserService } from "@/api/hooks/user";
import InitApiKey from "./init-api-key";
import InitAssets from "./init-assets";
import InitLiability from "./init-lia";
import InitExpense from "./init-expense";
import InitIncome from "./init-income";
import Finish from "./finish";
import { useNavigate } from "react-router-dom";
import { UserService } from "@/api/services/user";

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

export default function InitMultiStepWizard() {
  const [[page, direction], setPage] = React.useState([0, 0]);

  const paginate = React.useCallback((newDirection: number) => {
    setPage((prev) => {
      const nextPage = prev[0] + newDirection;

      if (nextPage < 0 || nextPage > 8) return prev;

      return [nextPage, newDirection];
    });
  }, []);

  const onChangePage = React.useCallback((newPage: number) => {
    setPage((prev) => {
      if (newPage < 0 || newPage > 8) return prev;
      const currentPage = prev[0];

      return [newPage, newPage > currentPage ? 1 : -1];
    });
  }, []);

  const onBack = React.useCallback(() => {
    paginate(-1);
  }, [paginate]);
  const navigate = useNavigate();
  const { user, editUser } = useUserService();

  const onNext = React.useCallback(async () => {
    if (page === 7 && user) {
      await editUser({
        userId: user.id,
        userData: {
          isInitialized: 1,
        },
      });
      navigate("/");
    } else {
      paginate(1);
    }
  }, [paginate, navigate, page, user]);

  const content = React.useMemo(() => {
    let component = <InitBasicInfo />;

    switch (page) {
      case 1:
        component = <SelectLlm />;
        break;
      case 2:
        component = <InitApiKey />;
        break;
      case 3:
        component = <InitAssets />;
        break;
      case 4:
        component = <InitLiability />;
        break;
      case 5:
        component = <InitIncome />;
        break;
      case 6:
        component = <InitExpense />;
        break;
      case 7:
        component = <Finish />;
        break;
    }

    return (
      <LazyMotion features={domAnimation}>
        <m.div
          key={page}
          animate="center"
          className="col-span-12"
          custom={direction}
          exit="exit"
          initial="exit"
          transition={{
            y: {
              ease: "backOut",
              duration: 0.4,
            },
            opacity: { duration: 0.4 },
          }}
          variants={variants}
        >
          {component}
        </m.div>
      </LazyMotion>
    );
  }, [direction, page]);

  return (
    <MultistepSidebar
      currentPage={page}
      onBack={onBack}
      onChangePage={onChangePage}
      onNext={onNext}
    >
      <div className=" relative flex h-fit w-full flex-col pt-6 text-center lg:h-full justify-center lg:pt-0">
        {content}
        <MultistepNavigationButtons
          backButtonProps={{ isDisabled: page === 0 }}
          className="hidden justify-center lg:flex"
          nextButtonProps={{
            children: page === 7 ? "开始使用流记" : "继续",
          }}
          onBack={onBack}
          onNext={onNext}
        />
      </div>
    </MultistepSidebar>
  );
}
