import type { ProgressInfo } from "electron-updater";
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
  Link,
} from "@nextui-org/react";
import "./update.css";

const Update = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string;
    okText?: string;
    onCancel?: () => void;
    onOk?: () => void;
  }>({
    onCancel: () => onClose(),
    onOk: () => {
      window.ipcRenderer.invoke("start-download");
    },
  });

  const checkUpdate = async () => {
    setChecking(true);
    /**
     * @type {import('electron-updater').UpdateCheckResult | null | { message: string, error: Error }}
     */
    const result = await window.ipcRenderer.invoke("check-update");
    setProgressInfo({ percent: 0 });
    setChecking(false);
    onOpen();
    if (result?.error) {
      setUpdateAvailable(false);
      setUpdateError(result?.error);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      setVersionInfo(arg1);
      setUpdateError(undefined);
      // Can be update
      if (arg1.update) {
        setModalBtn((state) => ({
          ...state,
          cancelText: "稍后更新",
          okText: "立即更新",
          onOk: () => {
            window.ipcRenderer.invoke("start-download");
            setIsDownloading(true);
          },
        }));
        setUpdateAvailable(true);
      } else {
        setUpdateAvailable(false);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
      setUpdateAvailable(false);
      setIsDownloading(false);
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
      setIsDownloading(false);
      setModalBtn((state) => ({
        ...state,
        cancelText: "稍后安装",
        okText: "立即安装",
        onOk: () => window.ipcRenderer.invoke("quit-and-install"),
      }));
    },
    []
  );

  useEffect(() => {
    // Get version information and whether to update
    window.ipcRenderer.on("update-can-available", onUpdateCanAvailable);
    window.ipcRenderer.on("update-error", onUpdateError);
    window.ipcRenderer.on("download-progress", onDownloadProgress);
    window.ipcRenderer.on("update-downloaded", onUpdateDownloaded);

    return () => {
      window.ipcRenderer.off("update-can-available", onUpdateCanAvailable);
      window.ipcRenderer.off("update-error", onUpdateError);
      window.ipcRenderer.off("download-progress", onDownloadProgress);
      window.ipcRenderer.off("update-downloaded", onUpdateDownloaded);
    };
  }, []);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="text-lg font-bold">检查更新</div>
              </ModalHeader>
              <ModalBody>
                {updateError ? (
                  <div>
                    <p>更新失败</p>
                    <p>{updateError.message}</p>
                  </div>
                ) : updateAvailable ? (
                  <div>
                    {progressInfo?.percent ? (
                      <div className="update__progress">
                        <Progress
                          aria-label="Update progress"
                          size="md"
                          value={progressInfo?.percent}
                          color="primary"
                          showValueLabel={true}
                          className="max-w-md"
                        />
                      </div>
                    ) : (
                      <div className="text-sm">
                        发现新版本v{versionInfo?.newVersion}
                        ，请及时更新，以获得更好的使用体验，访问
                        <Link
                          size="sm"
                          color="primary"
                          underline="always"
                          target="_blank"
                          href="https://changelog.flowm.cc"
                        >
                          更新日志
                        </Link>
                        查看更多
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="can-not-available">
                    当前已是最新版本: {process.env.PACKAGE_VERSION}
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
                    <Button
                      isLoading={isDownloading}
                      color="primary"
                      onPress={modalBtn.onOk}
                    >
                      {modalBtn.okText || "立即更新"}
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Button
        onPress={checkUpdate}
        color="primary"
        size="sm"
        radius="sm"
        isLoading={checking}
        variant="shadow"
        isDisabled={checking}
      >
        检查更新
      </Button>
    </>
  );
};

export default Update;
