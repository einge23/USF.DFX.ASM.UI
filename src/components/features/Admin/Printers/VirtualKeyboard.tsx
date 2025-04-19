import React, { useState } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./keyboard.css";

interface VirtualKeyboardProps {
    show: boolean;
    onKeyPress: (button: string, e?: MouseEvent) => void;
    onClose?: () => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    show,
    onKeyPress,
}) => {
    const [keyboardLayout, setKeyboardLayout] = useState<"default" | "shift">(
        "default"
    );

    const handleKeyPress = (button: string, e?: MouseEvent) => {
        if (button === "{capslock}") {
            setKeyboardLayout((prev) =>
                prev === "default" ? "shift" : "default"
            );
            return;
        }
        onKeyPress(button, e);
    };

    return show ? (
        <div
            className="fixed inset-x-0 bottom-0 keyboard-container"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <Keyboard
                layout={{
                    default: [
                        "1 2 3 4 5 6 7 8 9 0",
                        "q w e r t y u i o p",
                        "a s d f g h j k l",
                        "{capslock} z x c v b n m {bksp}",
                        "{space} {enter}",
                    ],
                    shift: [
                        "1 2 3 4 5 6 7 8 9 0",
                        "Q W E R T Y U I O P",
                        "A S D F G H J K L",
                        "{capslock} Z X C V B N M {bksp}",
                        "{space} {enter}",
                    ],
                }}
                display={{
                    "{bksp}": "⌫",
                    "{enter}": "Done",
                    "{space}": "Space",
                    "{capslock}": "Caps",
                }}
                onKeyPress={handleKeyPress}
                theme="hg-theme-default hg-layout-default myTheme"
                buttonTheme={
                    keyboardLayout === "shift"
                        ? [
                              {
                                  class: "hg-special-button",
                                  buttons: "{bksp} {enter} {space} {capslock}",
                              },
                              {
                                  class: "hg-selected-caps",
                                  buttons: "{capslock}",
                              },
                          ]
                        : [
                              {
                                  class: "hg-special-button",
                                  buttons: "{bksp} {enter} {space} {capslock}",
                              },
                          ]
                }
                physicalKeyboardHighlight={false}
                preventMouseDownDefault={true}
                layoutName={keyboardLayout}
            />
        </div>
    ) : null;
};
