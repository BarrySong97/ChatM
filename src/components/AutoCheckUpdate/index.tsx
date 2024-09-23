import { useCallback, useEffect, useState } from "react";
import {
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import type { ProgressInfo } from "electron-updater";
import { useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { isSettingOpenAtom } from "@/globals";

interface VersionInfo {
  update: boolean;
  version: string;
  newVersion: string;
}

interface ErrorType {
  message: string;
}

const AUTO_CHECK_INTERVAL = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

const AutoCheckUpdate = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string;
    okText?: string;
    onCancel?: () => void;
    onOk?: () => void;
  }>({
    onCancel: () => onClose(),
    onOk: () => window.ipcRenderer.invoke("start-download"),
  });

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
      setUpdateAvailable(false);
      setUpdateError(arg1);
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      setProgressInfo(arg1);
    },
    []
  );

  const onUpdateDownloaded = useCallback(
    (_event: Electron.IpcRendererEvent, ...args: any[]) => {
      setProgressInfo({ percent: 100 });
      setModalBtn((state) => ({
        ...state,
        cancelText: "Later",
        okText: "Install now",
        onOk: () => window.ipcRenderer.invoke("quit-and-install"),
      }));
    },
    []
  );
  const checkUpdate = async () => {
    const result = await window.ipcRenderer.invoke("check-update");
    setProgressInfo({ percent: 0 });
    if (result?.error) {
      setUpdateAvailable(false);
      setUpdateError(result?.error);
    }
  };
  const isSettingOpen = useAtomValue(isSettingOpenAtom);
  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      setVersionInfo(arg1);
      setUpdateError(undefined);
      if (arg1.update) {
        setModalBtn((state) => ({
          ...state,
          cancelText: "Later",
          okText: "Update",
          onOk: () => window.ipcRenderer.invoke("start-download"),
        }));
        setUpdateAvailable(true);
        if (!isSettingOpen) {
          onOpen(); // Open the modal when an update is available
        }
      } else {
        setUpdateAvailable(false);
      }
    },
    [onOpen]
  );

  useEffect(() => {
    const checkUpdateAndSetInterval = () => {
      checkUpdate();
      return setInterval(checkUpdate, AUTO_CHECK_INTERVAL);
    };

    const intervalId = checkUpdateAndSetInterval();

    window.ipcRenderer.on("update-can-available", onUpdateCanAvailable);
    window.ipcRenderer.on("update-error", onUpdateError);
    window.ipcRenderer.on("download-progress", onDownloadProgress);
    window.ipcRenderer.on("update-downloaded", onUpdateDownloaded);

    return () => {
      clearInterval(intervalId);
      window.ipcRenderer.off("update-can-available", onUpdateCanAvailable);
      window.ipcRenderer.off("update-error", onUpdateError);
      window.ipcRenderer.off("download-progress", onDownloadProgress);
      window.ipcRenderer.off("update-downloaded", onUpdateDownloaded);
    };
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="text-lg font-bold">软件有新版本</div>
            </ModalHeader>
            <ModalBody>
              {updateError ? (
                <div>
                  <p>更新失败</p>
                  <p>{updateError.message}</p>
                </div>
              ) : updateAvailable ? (
                <div>
                  <div>最新版本: v{versionInfo?.newVersion}</div>
                  <div className="new-version__target">
                    v{versionInfo?.version} -&gt; v{versionInfo?.newVersion}
                  </div>
                  {progressInfo?.percent ? (
                    <div className="update__progress">
                      <div className="progress__title">更新进度:</div>
                      <Progress
                        aria-label="Update progress"
                        size="md"
                        value={progressInfo?.percent}
                        color="primary"
                        showValueLabel={true}
                        className="max-w-md"
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="can-not-available">
                  你正在使用最新版本: {process.env.PACKAGE_VERSION}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {updateAvailable && (
                <>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      onClose();
                      window.ipcRenderer.invoke("abort-download");
                    }}
                  >
                    {modalBtn.cancelText || "取消"}
                  </Button>
                  <Button color="primary" onPress={modalBtn.onOk}>
                    {modalBtn.okText || "更新"}
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AutoCheckUpdate;
