import { useEffect, useState } from "react";
import { Form, FormInstance } from "antd";

export const useFormError = (form: FormInstance) => {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const values = Form.useWatch([], form);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then((formValues) => {
        setIsSubmitDisabled(!Object.values(formValues).length); // check keys to handle init state
      })
      .catch(() => {
        setIsSubmitDisabled(true);
      });
  }, [values]);

  return { isSubmitDisabled };
};
