import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme";
import { useTheme } from "./ThemeContext";

type ToastType = "success" | "error" | "info";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  const showToast = useCallback(
    (msg: string, toastType: ToastType = "success") => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);
    },
    [],
  );

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return colors.earning;
      case "error":
        return colors.expense;
      default:
        return themeColors.surface;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={5000}
        wrapperStyle={{
          top: insets.top,
          bottom: undefined,
          zIndex: 9999,
        }}
        style={{
          backgroundColor: getBackgroundColor(),
        }}
        action={{
          label: "✕",
          textColor: "#fff",
          onPress: () => setVisible(false),
        }}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
}
