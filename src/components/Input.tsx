import { ReactNode } from "react";
import { View, TextInput, TextInputProps, ViewProps, Platform } from "react-native";
import clsx from "clsx";

import { colors } from "@/styles/colors";

type VariantType = "primary" | "secondary" | "tertiary";

type Props = ViewProps & {
    children: ReactNode;
    variant?: VariantType;
};

interface IFieldProps extends TextInputProps { }

interface IInputProps extends React.FC<Props> {
    Field: React.FC<IFieldProps>;
}

const Input: IInputProps = ({ children, variant = "primary", className, ...rest }) => {
    return (
        <View
            className={clsx(
                "min-h-16 max-h-16 h-16 flex-row items-center",
                {
                    "h-14 px-4 rounded-lg border border-zinc-800": variant !== "primary",
                    "bg-zinc-950": variant === "secondary",
                    "bg-zinc-900": variant === "tertiary"
                },
                className
            )}
            {...rest}
        >
            {children}
        </View>
    );
};

const Field = ({ ...rest }) => {
    return (
        <TextInput
            className="flex-1 text-zinc-100 text-lg font-regular mx-3"
            placeholderTextColor={colors.zinc[400]}
            cursorColor={colors.zinc[100]}
            selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined}
            {...rest}
        />
    );
};

Input.Field = Field;

export default Input;
