import React, { FC } from "react";
import { Book } from "@db/schema";
import SettingWrapper from "../setting-wrapper";
export interface AboutProps {
  book?: Book;
}
const BookSetting: FC<AboutProps> = ({ book }) => {
  return (
    <SettingWrapper title={book?.name}>
      <div>2</div>
    </SettingWrapper>
  );
};

export default BookSetting;
