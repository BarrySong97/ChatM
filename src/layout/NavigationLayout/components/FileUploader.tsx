import React from "react";
import Dragger from "antd/es/upload/Dragger";
import { UploadChangeParam, UploadFile } from "antd/es/upload";

interface FileUploaderProps {
  onFileChange: (info: UploadChangeParam<UploadFile<any>>) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  return (
    <Dragger
      showUploadList={false}
      accept=".csv"
      multiple={false}
      onChange={onFileChange}
    >
      <p className="ant-upload-text">点击或者拖拽文件到此区域上传</p>
      <p className="ant-upload-hint">只支持csv文件</p>
    </Dragger>
  );
};

export default FileUploader;
