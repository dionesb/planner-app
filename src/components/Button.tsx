import { createContext, useContext } from "react";
import clsx from "clsx";

import {
    TouchableOpacity,
    TouchableOpacityProps,
    Text,
    TextProps,
    ActivityIndicator,
} from "react-native";

type Variant = "primary" | "secondary";

type ButtonProps = TouchableOpacityProps & {
    variant?: Variant;
    isLoading?: boolean;
};

const ThemeContext = createContext<{ variant?: Variant }>({});

const Button = ({
    children,
    variant = "primary",
    isLoading,
    className,
    ...rest
}: ButtonProps) => {
    return (
        <TouchableOpacity
            className={clsx(
                "h-11 flex-row items-center justify-center rounded-lg gap-2 px-2",
                {
                    "bg-lime-300": variant === "primary",
                    "bg-zinc-800": variant === "secondary",
                },
                className
            )}
            activeOpacity={0.7}
            disabled={isLoading}
            {...rest}
        >
            <ThemeContext.Provider value={{ variant }}>
                {isLoading ? <ActivityIndicator className="text-lime-950" /> : children}
            </ThemeContext.Provider>
        </TouchableOpacity>
    );
};

const TextButton = ({ children }: TextProps) => {
    const { variant } = useContext(ThemeContext);

    return (
        <Text
            className={clsx("text-base font-semibold", {
                "text-lime-950": variant === "primary",
                "text-zinc-200": variant === "secondary",
            })}
        >
            {children}
        </Text>
    );
};

Button.Text = TextButton;

export default Button;
