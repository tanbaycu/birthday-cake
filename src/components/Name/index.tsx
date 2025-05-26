import { SetStateAction, forwardRef, useCallback, useEffect } from "react";

interface InputProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  shareMode: boolean;
  playing: boolean;
  run: boolean;
}

export const Name: React.FC<React.HTMLProps<HTMLInputElement> & InputProps> =
  forwardRef(
    (
      { name, setName, shareMode, playing, run, ...rest }: InputProps,
      ref: React.LegacyRef<HTMLInputElement>
    ) => {
      const onChange = useCallback(
        (e: { target: { value: SetStateAction<string> } }) => {
          const { value } = e.target;
          const isEmpty = value === "";
          console.log("isEmpty", isEmpty);
          if (!isEmpty) {
            setName(e.target.value);
            window.history.pushState({}, "", `?name=${e.target.value}`);
          } else {
            setName("");
            // clear all query params
            window.history.pushState({}, "", window.location.pathname);
          }
        },
        [setName]
      );

      useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const nameParam = urlParams.get("name");
        if (nameParam !== null) {
          setName(nameParam);
        }
      }, [setName]);

      return (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            width: "100dvw",
            zIndex: 40,
          }}
        >
          <input
            id="name"
            {...{
              ref,
              style: {
                borderColor: "1px solid #f0e4d0",
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: "2rem",
                color: "black",
                padding: 8,
                opacity: 0.9,
                border: 0,
                outline: 0,
                backgroundColor: "white",
                width: 400,
                ...(shareMode || playing
                  ? {
                      appearance: "none",
                      backgroundColor: "transparent",
                      textAlign: "center",
                      display: name.length > 0 ? "block" : "none",
                    }
                  : {}),
              },
              value: name,
              onChange,
              disabled: shareMode || playing || run,
              readOnly: shareMode || playing || run,
              spellCheck: false,
              autoFocus: true,
              placeholder: "Enter your name",
              ...rest,
            }}
          />
        </div>
      );
    }
  );
